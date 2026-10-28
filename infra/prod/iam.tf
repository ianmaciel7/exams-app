# --- Team access -----------------------------------------------------------------

# Members come from local variables (terraform.tfvars is not committed) because account
# identifiers stay out of the repository. These bindings are additive: they never remove
# a role that was granted elsewhere.
resource "google_project_iam_member" "owners" {
  for_each = toset(var.owner_members)

  project = var.project_id
  role    = "roles/owner"
  member  = each.key
}

resource "google_project_iam_member" "firebase_developers" {
  for_each = {
    for pair in setproduct(var.firebase_developer_members, var.firebase_developer_roles) :
    "${pair[0]}|${pair[1]}" => { member = pair[0], role = pair[1] }
  }

  project = var.project_id
  role    = each.value.role
  member  = each.value.member
}
