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
