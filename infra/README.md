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

- The `production` environment variables used by `.github/workflows/firebase-cd.yml` are managed here (see [ADR 0012](../docs/adr/0012-configure-terraform-infrastructure.md)); applying needs `GITHUB_TOKEN` or a logged in `gh` CLI.
- Copy `firebase_web_config` into `apphosting.yaml` (public values, not secrets).
- Update `.firebaserc` with the new project ID.
- Email and password sign-in and the authorized domains are managed here (`google_identity_platform_config`);
  add custom domains through `extra_authorized_domains`.
- Enable the Google provider once in the Firebase console (Authentication > Sign-in method). It needs an OAuth
  client secret that Terraform cannot create, and the console keeps that secret out of the state and the repository.
  Then set `NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED` to `"true"` in `apphosting.yaml` and publish a new release.
- Rules, indexes and Functions are still deployed by the CD workflow, not by Terraform.
- The App Hosting runtime account receives `roles/firebaseauth.viewer`, which is required for the server's revocation-aware Firebase Admin ID-token verification. Run `pnpm check:app-hosting-auth-iam` before applying infrastructure changes; after an apply, validate an authenticated protected route in the deployed application.

## Layout (`prod/`)

The production stack is organized into domain-scoped files:

| File | Purpose |
| --- | --- |
| `main.tf` | Required versions, providers, backend configuration, and root project data |
| `apis.tf` | Google Cloud API service activations |
| `firebase.tf` | Firebase project, web app, Firestore Native, Realtime Database, and Storage |
| `app_hosting.tf` | App Hosting backend, service accounts, and Developer Connect GitHub link |
| `auth.tf` | Identity Platform configuration and Auth blocking function triggers |
| `iam.tf` | Additive team access bindings (owners and Firebase developers) |
| `github_wif.tf` | Workload Identity Federation for GitHub Actions and release secrets |
| `outputs.tf` | Web configuration and environment outputs |
| `variables.tf` | Input variable declarations |

## Team access

Human access is managed here (see [ADR 0012](../docs/adr/0012-configure-terraform-infrastructure.md)). Set the members in
the untracked `terraform.tfvars`:

```hcl
owner_members               = ["user:owner@example.com"]
firebase_developer_members = ["user:developer@example.com"]
```

Bindings are additive. To narrow a user who already has extra roles, remove them in the console as an Owner.

## Sign-in allowlist

Only the addresses in the untracked `terraform.tfvars` can sign up or sign in (see
[ADR 0009](../docs/adr/0009-integrate-firebase-authentication.md)). Admin addresses are allowed implicitly and
get the `admin` role:

```hcl
allowed_user_emails = ["user@example.com"]
admin_user_emails   = ["admin@example.com"]
```

Terraform stores them as the `ALLOWED_USER_EMAILS` and `ADMIN_USER_EMAILS` secrets of the `production` GitHub
environment. The release workflow must write them to `functions/.env.<project id>` before `firebase deploy`, or the
Functions refuse everyone. Apply Terraform before the first release that ships the blocking functions.
