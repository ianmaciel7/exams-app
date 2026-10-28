terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

provider "google" {
  user_project_override = true
  billing_project       = var.project_id
}

# Manages the project that holds Firebase and the remote state of infra/prod.
# This stack keeps local state on purpose: it is applied once, before the bucket exists.
# With adopt_existing_project = true the project is imported instead of created, which
# keeps a project ID that already exists (project IDs can never be reused once taken).
import {
  for_each = var.adopt_existing_project ? toset([var.project_id]) : toset([])
  to       = google_project.this
  id       = each.key
}

resource "google_project" "this" {
  project_id      = var.project_id
  name            = var.project_name
  billing_account = var.billing_account
  org_id          = var.org_id
  folder_id       = var.folder_id

  # Blocks `terraform destroy` from deleting the production project.
  deletion_policy = "PREVENT"

  labels = {
    firebase = "enabled"
  }

  lifecycle {
    precondition {
      condition     = var.org_id == null || var.folder_id == null
      error_message = "Set org_id or folder_id, not both."
    }
  }
}

# Service Usage must be enabled first so other APIs can be enabled afterwards.
resource "google_project_service" "bootstrap" {
  for_each = toset([
    "serviceusage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudbilling.googleapis.com",
    "iam.googleapis.com",
    "storage.googleapis.com",
  ])

  project            = google_project.this.project_id
  service            = each.key
  disable_on_destroy = false
}

resource "google_storage_bucket" "tfstate" {
  project  = google_project.this.project_id
  name     = "${var.project_id}-tfstate"
  location = var.region

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # Versioning allows recovering the state after an accidental overwrite or deletion.
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 20
      with_state         = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.bootstrap]
}
