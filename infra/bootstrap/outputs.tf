output "project_id" {
  value = google_project.this.project_id
}

output "project_number" {
  value = google_project.this.number
}

output "tfstate_bucket" {
  description = "Bucket to pass to `terraform init -backend-config` in infra/prod."
  value       = google_storage_bucket.tfstate.name
}
