variable "project_id" {
  description = "ID of the project created by infra/bootstrap."
  type        = string
}

variable "region" {
  description = "Default region for Firebase, Functions, App Hosting and Storage."
  type        = string
  default     = "us-central1"
}

variable "firestore_location" {
  description = "Firestore location ID. It cannot be changed after the database is created."
  type        = string
  default     = "nam5"
}

variable "app_display_name" {
  description = "Display name of the Firebase web app and App Hosting backend."
  type        = string
  default     = "Exams App"
}

variable "app_hosting_backend_id" {
  description = "App Hosting backend ID. It becomes the Cloud Run service name."
  type        = string
  default     = "exams-app"
}

variable "github_owner" {
  description = "GitHub user or organization that owns the repository."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
}

variable "deploy_roles" {
  description = "Project roles for the GitHub deploy service account. Tighten after the first successful release."
  type        = list(string)
  default = [
    "roles/cloudfunctions.admin",
    "roles/developerconnect.viewer",
    "roles/developerconnect.readTokenAccessor",
    "roles/firebase.viewer",
    "roles/firebaseapphosting.admin",
    "roles/firebasedatabase.admin",
    "roles/firebaserules.admin",
    "roles/run.admin",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/storage.objectAdmin",
  ]
}

variable "workload_identity_pool_id" {
  description = "Workload Identity pool ID. Deleted pool IDs stay reserved for about 30 days, so change it after deleting the pool."
  type        = string
  default     = "github-actions-v2"
}

variable "owner_members" {
  description = "IAM members with the Owner role, for example [\"user:admin@example.com\"]. Set in terraform.tfvars."
  type        = list(string)
  default     = []
}

variable "firebase_developer_members" {
  description = "IAM members that manage Firebase without being Owner. Set in terraform.tfvars."
  type        = list(string)
  default     = []
}

variable "firebase_developer_roles" {
  description = "Project roles granted to firebase_developer_members."
  type        = list(string)
  default = [
    "roles/cloudfunctions.developer",
    "roles/firebase.admin",
    "roles/firebaseapphosting.admin",
    "roles/serviceusage.serviceUsageConsumer",
  ]
}

variable "extra_authorized_domains" {
  description = "Extra domains allowed for Firebase Authentication, such as a custom domain."
  type        = list(string)
  default     = []
}
