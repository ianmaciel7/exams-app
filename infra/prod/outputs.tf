output "firebase_web_config" {
  description = "Public NEXT_PUBLIC_FIREBASE_* values for apphosting.yaml. Not secrets."
  value = {
    NEXT_PUBLIC_FIREBASE_API_KEY        = data.google_firebase_web_app_config.web.api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    = data.google_firebase_web_app_config.web.auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID     = var.project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = google_storage_bucket.app.name
    NEXT_PUBLIC_FIREBASE_DATABASE_URL   = google_firebase_database_instance.default.database_url
    NEXT_PUBLIC_FIREBASE_APP_ID         = google_firebase_web_app.web.app_id
  }
}

output "github_actions_variables" {
  description = "Values for the GitHub repository variables used by firebase-cd.yml."
  value = {
    FIREBASE_PROJECT_ID               = var.project_id
    FIREBASE_APP_HOSTING_BACKEND_ID   = google_firebase_app_hosting_backend.app.backend_id
    GOOGLE_SERVICE_ACCOUNT            = google_service_account.github_deploy.email
    GOOGLE_WORKLOAD_IDENTITY_PROVIDER = google_iam_workload_identity_pool_provider.github.name
  }
}

output "github_connection_next_steps" {
  description = "If an action_uri is present, open it once to install the Firebase GitHub app."
  value       = google_developer_connect_connection.github.installation_state
}
