# ADR 0012: Configure Terraform infrastructure

- **Status**: Accepted
- **Date**: 2026-10-28
- **Deciders**: ianmaciel7

## Context

[ADR 0011](0011-configure-firebase-cd.md) required privileged Google Cloud
configuration for Workload Identity Federation, the App Hosting backend, data
services, and budget alerts, and left that setup as manual steps. Doing it by
hand was slow and error-prone: the first releases failed one missing API or
permission at a time (Cloud Functions, Service Account User, Eventarc, Cloud
Build), and the App Hosting backend had no connected repository.

The production project was then deleted and restored, which showed three
properties of Google Cloud that the repository must respect. A project ID is
permanent and can never be reused once taken, so the ID cannot be treated as a
disposable value. A deleted Workload Identity pool or custom role keeps its ID
reserved for a period. And a deleted project loses its billing link.

## Decision

Describe the Google Cloud and Firebase infrastructure as Terraform in `infra/`,
in two stacks applied in order:

- `infra/bootstrap` manages the project, its base APIs, and the Terraform state
  bucket. It keeps local state because the bucket does not exist before its first
  apply. It can adopt an existing project (`adopt_existing_project`) instead of
  creating one.
- `infra/prod` manages Firebase, Firestore, the Realtime Database, Storage, the
  App Hosting backend with its Developer Connect repository link, the deployment
  service account, and the GitHub Workload Identity pool and provider. It stores
  state in the bucket created by `bootstrap`.

Keep the project name and the project ID as separate inputs. The name is a
display label that can change; the ID is permanent. Do not embed the
organization name in the ID, and avoid personal names, so the ID survives
organization renames. Generate or choose the ID once and treat it as permanent.

Run `terraform apply` manually from a trusted machine. Terraform is not part of
CI and CI holds no permission to change infrastructure. The release workflow
still deploys Functions, rules, indexes, and the App Hosting rollout; Terraform
owns the infrastructure those deployments target.

Never commit Terraform state, plans, variable files, backend configuration, or
credentials. Only `*.tfvars.example` files, `.terraform.lock.hcl`, and the
configuration itself are committed. The `.gitignore` rules and the
`detect-private-key` pre-commit hook defend this, and `pnpm check:adr` keeps the
decision record in step with `infra/`.

Pick a new ID for any pool or role deleted within the last reservation period,
instead of waiting for the old ID to be released.

## Considered options

- **Console and `gcloud` steps in documentation**: rejected because they are not
  reproducible and already caused repeated release failures.
- **Firebase CLI alone**: rejected because it does not own project, IAM, or
  Workload Identity configuration.
- **Applying Terraform from CI**: deferred. It would give CI broad permission over
  the project, which ADR 0011 deliberately avoided.
- **A single stack**: rejected because the state bucket must exist before a stack
  can use it as its backend.
- **Recreating the project under a new ID**: rejected when the original ID could be
  restored and adopted by `bootstrap`; IDs are permanent, so adoption preserves it.

## Consequences

- Infrastructure changes are reviewed in pull requests, and the project can be
  rebuilt from the repository plus a few local values.
- The first apply of each stack needs a human with project creation or Owner
  rights and access to the billing account. Applying as a least-privilege
  service account through impersonation is a possible later improvement.
- Local state of `bootstrap` must be preserved by the operator; losing it means
  re-importing the project and bucket.
- The Developer Connect GitHub installation is a one-time interactive step, so
  the first `prod` apply runs twice.
- This record supersedes the manual provisioning scope of ADR 0011. Its release,
  region, federation, and budget decisions remain in force.
