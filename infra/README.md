# Infrastructure (Terraform)

Two stacks, applied in order. Nothing here runs in CI; apply from a trusted machine.

| Stack | Purpose | State |
| --- | --- | --- |
| `bootstrap/` | Creates the GCP project, base APIs and the state bucket | local (applied once) |
| `prod/` | Firebase, Firestore, RTDB, Storage, App Hosting, deploy identity | GCS bucket from bootstrap |

## Prerequisites

- Terraform >= 1.9 and `gcloud`.
- `gcloud auth application-default login`.
- Permission to create projects and link the billing account.

## 1. Bootstrap

```bash
cd infra/bootstrap
cp terraform.tfvars.example terraform.tfvars   # fill project_id and billing_account
terraform init
terraform plan
terraform apply
```

Keep the local `terraform.tfstate` of this stack safe; it is ignored by git.

## 2. Production

```bash
cd infra/prod
printf 'bucket = "<tfstate_bucket output>"\n' > backend.hcl
cp terraform.tfvars.example terraform.tfvars   # fill project_id, github_owner, github_repo
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

If `github_connection_next_steps` shows an `action_uri`, open it once and install the Firebase GitHub app,
then apply again so the repository link and backend can finish.

## 3. After apply

- Copy `github_actions_variables` into the repository variables used by `.github/workflows/firebase-cd.yml`.
- Copy `firebase_web_config` into `apphosting.yaml` (public values, not secrets).
- Update `.firebaserc` with the new project ID.
- Enable the sign-in providers in the Firebase console (Google needs an OAuth client).
- Rules, indexes and Functions are still deployed by the CD workflow, not by Terraform.
