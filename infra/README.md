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
- Email and password sign-in and the authorized domains are managed here (`google_identity_platform_config`);
  add custom domains through `extra_authorized_domains`.
- Enable the Google provider once in the Firebase console (Authentication > Sign-in method). It needs an OAuth
  client secret that Terraform cannot create, and the console keeps that secret out of the state and the repository.
  Then set `NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED` to `"true"` in `apphosting.yaml` and publish a new release.
- Rules, indexes and Functions are still deployed by the CD workflow, not by Terraform.

## Team access

Human access is managed here (see [ADR 0013](../docs/adr/0013-configure-team-access.md)). Set the members in
the untracked `terraform.tfvars`:

```hcl
owner_members               = ["user:owner@example.com"]
firebase_developer_members = ["user:developer@example.com"]
```

Bindings are additive. To narrow a user who already has extra roles, remove them in the console as an Owner.
