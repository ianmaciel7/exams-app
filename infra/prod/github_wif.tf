# --- GitHub release environment ---------------------------------------------------

# The release workflow reads these as `vars.*`. Managing them here keeps the environment in
# step with the infrastructure instead of copying the outputs by hand. None is a secret.
locals {
  github_environment_variables = {
    FIREBASE_APP_HOSTING_BACKEND_ID   = google_firebase_app_hosting_backend.app.backend_id
    FIREBASE_PROJECT_ID               = var.project_id
    FIREBASE_RELEASE_BRANCH           = var.release_branch
    GOOGLE_SERVICE_ACCOUNT            = google_service_account.github_deploy.email
    GOOGLE_WORKLOAD_IDENTITY_PROVIDER = google_iam_workload_identity_pool_provider.github.name
  }
}

# Adopt the environment and variables that were created by hand.
import {
  to = github_repository_environment.production
  id = "${var.github_repo}:production"
}

import {
  for_each = toset(keys(local.github_environment_variables))
  to       = github_actions_environment_variable.release[each.key]
  id       = "${var.github_repo}:production:${each.key}"
}

resource "github_repository_environment" "production" {
  repository  = var.github_repo
  environment = "production"
}

resource "github_actions_environment_variable" "release" {
  for_each = local.github_environment_variables

  repository    = var.github_repo
  environment   = github_repository_environment.production.environment
  variable_name = each.key
  value         = each.value
}

# --- Sign-in allowlist -------------------------------------------------------------

# The release workflow writes these secrets into the Functions parameters file at deploy time
# (ADR 0009). They are secrets, not variables, so the addresses stay masked in workflow logs.
# Terraform skips an empty list because GitHub rejects empty secrets.
resource "github_actions_environment_secret" "allowed_user_emails" {
  count = length(nonsensitive(var.allowed_user_emails)) > 0 ? 1 : 0

  repository      = var.github_repo
  environment     = github_repository_environment.production.environment
  secret_name     = "ALLOWED_USER_EMAILS"
  plaintext_value = join(",", var.allowed_user_emails)
}

resource "github_actions_environment_secret" "admin_user_emails" {
  count = length(nonsensitive(var.admin_user_emails)) > 0 ? 1 : 0

  repository      = var.github_repo
  environment     = github_repository_environment.production.environment
  secret_name     = "ADMIN_USER_EMAILS"
  plaintext_value = join(",", var.admin_user_emails)
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
