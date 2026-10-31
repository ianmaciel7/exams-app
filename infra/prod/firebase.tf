# --- Firebase Core & Web App ------------------------------------------------

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

# --- Firestore Native Database -----------------------------------------------

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  delete_protection_state = "DELETE_PROTECTION_ENABLED"
  deletion_policy         = "ABANDON"

  depends_on = [google_firebase_project.this]
}

# --- Realtime Database -------------------------------------------------------

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

# --- Cloud Storage -----------------------------------------------------------

# The firebase CLI deploys Storage rules to the default bucket, so use it instead of a custom one.
resource "google_firebase_storage_default_bucket" "default" {
  provider = google-beta
  project  = var.project_id
  location = var.region

  depends_on = [google_firebase_project.this]
}
