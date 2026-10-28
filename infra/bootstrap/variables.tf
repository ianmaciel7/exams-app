variable "project_id" {
  description = "ID of the new production project. Project IDs are global and cannot be reused after deletion."
  type        = string
}

variable "project_name" {
  description = "Display name of the project. It can be edited at any time, unlike the project ID."
  type        = string
  default     = "Exams App - Production"
}

variable "adopt_existing_project" {
  description = "Import the project instead of creating it. Set to true when project_id already exists."
  type        = bool
  default     = false
}

variable "billing_account" {
  description = "Billing account ID (XXXXXX-XXXXXX-XXXXXX) linked to the project."
  type        = string
}

variable "org_id" {
  description = "Organization ID that owns the project. Leave null for a project without an organization."
  type        = string
  default     = null
}

variable "folder_id" {
  description = "Folder ID that owns the project. Mutually exclusive with org_id."
  type        = string
  default     = null
}

variable "region" {
  description = "Location of the Terraform state bucket."
  type        = string
  default     = "us-central1"
}
