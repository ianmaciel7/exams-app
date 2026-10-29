terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.12"
    }
  }

  # Bucket comes from `terraform init -backend-config=backend.hcl` (see README).
  backend "gcs" {
    prefix = "prod"
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}

provider "google-beta" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}

data "google_project" "this" {
  project_id = var.project_id
}

locals {
  apis = [
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "developerconnect.googleapis.com",
    "eventarc.googleapis.com",
    "firebase.googleapis.com",
    "firebaseapphosting.googleapis.com",
    "firebasedatabase.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "firestore.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "identitytoolkit.googleapis.com",
    "pubsub.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "securetoken.googleapis.com",
    "sts.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.apis)

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# --- Firebase ---------------------------------------------------------------

resource "google_firebase_project" "this" {
  provider = google-beta
  project  = var.project_id

  depends_on = [google_project_service.apis]
}

resource "google_firebase_web_app" "web" {
  provider        = google-beta
  project         = var.project_id
  display_name    = var.app_display_name
  deletion_policy = "DELETE"

  depends_on = [google_firebase_project.this]
}

data "google_firebase_web_app_config" "web" {
  provider   = google-beta
  project    = var.project_id
  web_app_id = google_firebase_web_app.web.app_id
}

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  delete_protection_state = "DELETE_PROTECTION_ENABLED"
  deletion_policy         = "ABANDON"

  depends_on = [google_firebase_project.this]
}

# Realtime Database needs a short wait after its API is enabled.
resource "time_sleep" "wait_for_rtdb_api" {
  create_duration = "60s"

  depends_on = [google_project_service.apis]
}

resource "google_firebase_database_instance" "default" {
  provider    = google-beta
  project     = var.project_id
  region      = var.region
  instance_id = "${var.project_id}-default-rtdb"
  type        = "DEFAULT_DATABASE"

  depends_on = [
    google_firebase_project.this,
    time_sleep.wait_for_rtdb_api,
  ]
}

# The firebase CLI deploys Storage rules to the default bucket, so use it instead of a custom one.
resource "google_firebase_storage_default_bucket" "default" {
  provider = google-beta
  project  = var.project_id
  location = var.region

  depends_on = [google_firebase_project.this]
}

# --- App Hosting ------------------------------------------------------------

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

  depends_on = [google_project_iam_member.app_hosting_runner]
}

# --- GitHub Actions deploy identity (Workload Identity Federation) -----------

resource "google_service_account" "github_deploy" {
  project      = var.project_id
  account_id   = "github-deploy"
  display_name = "GitHub Actions deploy"

  depends_on = [google_project_service.apis]
}

resource "google_project_iam_member" "github_deploy" {
  for_each = toset(var.deploy_roles)

  project = var.project_id
  role    = each.key
  member  = google_service_account.github_deploy.member
}

# The Functions runtime account must be impersonable by the deployer (iam.serviceAccounts.ActAs).
resource "google_service_account_iam_member" "deploy_acts_as_compute" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${data.google_project.this.number}-compute@developer.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.github_deploy.member
}

# Firebase Functions deploys also act as the App Engine default account.
resource "google_service_account_iam_member" "deploy_acts_as_appspot" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.project_id}@appspot.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.github_deploy.member
}

# App Hosting rollouts start a build that runs as the backend service account.
resource "google_service_account_iam_member" "deploy_acts_as_app_hosting" {
  service_account_id = google_service_account.app_hosting.name
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.github_deploy.member
}

resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = var.workload_identity_pool_id
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub"

  # Only tokens issued for this repository can use the provider.
  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}'"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_wif" {
  service_account_id = google_service_account.github_deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_owner}/${var.github_repo}"
}
