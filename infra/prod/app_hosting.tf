# --- App Hosting & Developer Connect ----------------------------------------

resource "google_service_account" "app_hosting" {
  project      = var.project_id
  account_id   = "firebase-app-hosting-compute"
  display_name = "Firebase App Hosting compute"

  depends_on = [google_project_service.apis]
}

resource "google_project_iam_member" "app_hosting_runner" {
  project = var.project_id
  role    = "roles/firebaseapphosting.computeRunner"
  member  = google_service_account.app_hosting.member
}

# Revocation-aware Admin SDK token verification reads the Firebase Auth user record.
resource "google_project_iam_member" "app_hosting_firebase_auth_viewer" {
  project = var.project_id
  role    = "roles/firebaseauth.viewer"
  member  = google_service_account.app_hosting.member
}

# The profile Server Action writes with the Admin SDK (ADR 0028): it updates the
# user's display name and photo, merges preferences into `users/{uid}` and uploads
# the avatar. The Admin SDK bypasses the security rules, so the action itself
# checks that the caller owns the data.
resource "google_project_iam_member" "app_hosting_firebase_auth_admin" {
  project = var.project_id
  role    = "roles/firebaseauth.admin"
  member  = google_service_account.app_hosting.member
}

resource "google_project_iam_member" "app_hosting_datastore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = google_service_account.app_hosting.member
}

resource "google_storage_bucket_iam_member" "app_hosting_avatar_objects" {
  bucket = google_firebase_storage_default_bucket.default.bucket[0].bucket_id
  role   = "roles/storage.objectAdmin"
  member = google_service_account.app_hosting.member
}

# Cloud Build runs as the default compute account in new projects and needs this role
# to build Functions and App Hosting backends.
resource "google_project_iam_member" "compute_cloudbuild" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${data.google_project.this.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_project_service.apis]
}

resource "google_project_service_identity" "developer_connect" {
  provider = google-beta
  project  = var.project_id
  service  = "developerconnect.googleapis.com"

  depends_on = [google_project_service.apis]
}

resource "google_project_iam_member" "developer_connect_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.admin"
  member  = google_project_service_identity.developer_connect.member
}

resource "google_developer_connect_connection" "github" {
  project       = var.project_id
  location      = var.region
  connection_id = "github"

  github_config {
    github_app = "FIREBASE"
  }

  depends_on = [google_project_iam_member.developer_connect_secrets]
}

resource "google_developer_connect_git_repository_link" "app" {
  project                = var.project_id
  location               = var.region
  parent_connection      = google_developer_connect_connection.github.connection_id
  git_repository_link_id = var.github_repo
  clone_uri              = "https://github.com/${var.github_owner}/${var.github_repo}.git"
}

resource "google_firebase_app_hosting_backend" "app" {
  project          = var.project_id
  location         = var.region
  backend_id       = var.app_hosting_backend_id
  app_id           = google_firebase_web_app.web.app_id
  display_name     = var.app_display_name
  serving_locality = "GLOBAL_ACCESS"
  service_account  = google_service_account.app_hosting.email
  environment      = "prod"

  codebase {
    repository     = google_developer_connect_git_repository_link.app.name
    root_directory = "/"
  }

  depends_on = [
    google_project_iam_member.app_hosting_runner,
    google_project_iam_member.app_hosting_firebase_auth_viewer,
  ]
}

# --- Firebase Web API key secret ---------------------------------------------
# apphosting.yaml references this secret (`secret: firebase-web-api-key`) instead of
# carrying the key, so no key-shaped literal lives in the repository. Terraform creates
# the container and the access; the value is added out of band, see infra/README.md.

resource "google_secret_manager_secret" "firebase_web_api_key" {
  project   = var.project_id
  secret_id = "firebase-web-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# The backend reads it at runtime; Cloud Build (the default compute account) reads it
# at build time because NEXT_PUBLIC_* values are inlined into the client bundle.
resource "google_secret_manager_secret_iam_member" "firebase_web_api_key_runtime" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_web_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.app_hosting.member
}

resource "google_secret_manager_secret_iam_member" "firebase_web_api_key_build" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_web_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.this.number}-compute@developer.gserviceaccount.com"
}

# Resolving the `latest` alias at build time also needs `secretmanager.versions.get`, so
# `secretAccessor` alone fails the build with `fah/misconfigured-secret`. The default compute
# account (the build), the App Hosting runtime account and the App Hosting service agent each
# get `viewer`; the service agent also gets `secretAccessor`.
resource "google_secret_manager_secret_iam_member" "firebase_web_api_key_viewer" {
  for_each = {
    build         = "serviceAccount:${data.google_project.this.number}-compute@developer.gserviceaccount.com"
    runtime       = google_service_account.app_hosting.member
    service_agent = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com"
  }

  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_web_api_key.secret_id
  role      = "roles/secretmanager.viewer"
  member    = each.value
}

resource "google_secret_manager_secret_iam_member" "firebase_web_api_key_service_agent" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_web_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com"
}
