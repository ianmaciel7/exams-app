# ADR 0012: Configure Terraform infrastructure

- **Status**: Accepted; incorporates former ADRs 0013, 0014, 0019, 0020, 0031
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

## Incorporated decisions

The following records were merged into this one on 2026-11-01 at the maintainer's direction. Their text is kept as written, with the original number, status, and date, so the history stays traceable. The earlier files remain in Git history.

### Former ADR 0013: Configure team access

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0013)

The production project had human access granted ad hoc in the console. One user
held Owner plus several administrative roles (IAM, service accounts, Workload
Identity, billing), which is more than day-to-day Firebase work needs and means
the same identity can change the project's security boundary. The release identity
and its permissions are already defined in Terraform
([ADR 0012](0012-configure-terraform-infrastructure.md)), but human access was not.

#### Decision (former ADR 0013)

Describe human access to the production project in Terraform, in two tiers:

- **Owners** hold `roles/owner`. They are the only people who change IAM, billing,
  and the project itself.
- **Firebase developers** hold a fixed set of roles for managing Firebase without
  Owner: `roles/firebase.admin`, `roles/firebaseapphosting.admin`,
  `roles/cloudfunctions.developer`, and `roles/serviceusage.serviceUsageConsumer`.
  Project-wide `roles/iam.serviceAccountUser` is not part of the set, because it
  allows acting as any service account.

Take the members from the local variables `owner_members` and
`firebase_developer_members` in an untracked `terraform.tfvars`. Account
identifiers stay out of the repository. The bindings are additive, so applying
them never removes a role granted elsewhere; narrowing an existing user is a
separate, deliberate step.

#### Considered options (former ADR 0013)

- **Console grants**: rejected because they are not reviewed or reproducible.
- **Authoritative bindings** (`google_project_iam_binding`): rejected for now. They
  would remove Owner from the user who runs `terraform apply` and lock out the
  only person able to apply until an Owner takes over.
- **Groups instead of individual users**: deferred until the team has more than a
  few people.

#### Consequences (former ADR 0013)

- Access changes are reviewed in pull requests, and the role set is explicit.
- Removing the extra roles from an existing user is manual, and applying Terraform
  afterwards needs an Owner.
- Whoever runs `terraform apply` needs permission to change IAM, so that person
  stays an Owner or applies through an Owner-controlled identity.

### Former ADR 0014: Manage the release environment with Terraform

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0014)

The release workflow reads its target project, App Hosting backend, release branch,
deploy service account, and Workload Identity provider from variables of the GitHub
`production` environment ([ADR 0011](0011-configure-firebase-cd.md)). They were created
by hand and copied from Terraform outputs. The copy drifted: after the infrastructure
was rebuilt, two values pointed at resources that no longer existed, and a variable
added to the workflow later was missing, so releases failed on configuration rather than
on code.

#### Decision (former ADR 0014)

Manage the `production` environment and its release variables in `infra/prod` with the
`integrations/github` Terraform provider. Every value comes from the resource that owns
it, so the environment cannot disagree with the infrastructure:

- the project ID, the App Hosting backend ID and location, the deploy service account
  email, and the Workload Identity provider name;
- the release branch, from the variable `release_branch` (default `main`).

Authenticate the provider with `GITHUB_TOKEN` or the token of the logged in `gh` CLI. No
token is stored in the repository or in the Terraform state. The variables hold
identifiers, not secrets; secrets stay out of this environment.

Adopt the environment and variables that already exist with `import` blocks rather than
recreating them.

#### Considered options (former ADR 0014)

- **Keep copying the outputs by hand**: rejected because it already caused failed
  releases.
- **Set the variables from the release workflow**: rejected because it would give the
  workflow permission to change its own configuration.
- **A GitHub App instead of a token**: deferred; the logged in CLI is enough for a single
  maintainer.

#### Consequences (former ADR 0014)

- A variable the workflow needs becomes a line in `infra/prod/main.tf`, reviewed with the
  workflow change.
- Applying Terraform needs a GitHub token with write access to the repository's
  environments and variables, in addition to Google credentials.
- A value edited in the GitHub UI is overwritten on the next apply.

### Former ADR 0019: Register blocking functions in Terraform

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0019)

[ADR 0009](0009-integrate-firebase-authentication.md) added the `restrictSignUp` and
`restrictSignIn` blocking functions. They deployed, but Identity Platform had no trigger
registered for them, so sign-in was not restricted. The Firebase CLI registers the
triggers only on the deploy that creates the functions, and that first deploy failed while
setting their invoker policy (ADR 0011, ADR 0011).

#### Decision (former ADR 0019)

Register the triggers in `google_identity_platform_config.default` with `blocking_functions`,
reading each function's URI from the deployed service
(`google_cloudfunctions2_function`). Terraform then owns the registration, so it survives
a deploy that does not recreate the functions.

#### Consequences (former ADR 0019)

- The functions must exist before `terraform apply`, so apply after the first deploy.
- The region is the `blocking_functions_region` variable, `us-east1`, the Firebase default.

### Former ADR 0020: Grant App Hosting the Firebase Auth viewer role

- **Original status**: Accepted
- **Original date**: 2026-10-30

#### Context (former ADR 0020)

The server verifies session ID tokens with `verifyIdToken(token, true)`, which checks
revocation. Revocation checking reads the user record from Firebase Auth. The App Hosting
runtime service account only held the App Hosting runner role, so verification failed with
a server fault in production and protected routes could not be served.

#### Decision (former ADR 0020)

Grant the runtime service account `roles/firebaseauth.viewer` in `infra/prod/main.tf`, and
make the backend depend on the binding. Prefer this read-only role over an Auth admin role.
The `check:app-hosting-auth-iam` guard fails when the binding is missing or replaced by a
broader role.

#### Consequences (former ADR 0020)

- Revocation-aware verification works without widening the account beyond read access.
- Apply the infrastructure change, then validate an authenticated protected route on the
  deployed service.

### Former ADR 0031: Split the production Terraform stack by domain

- **Original status**: Accepted
- **Original date**: 2026-11-01

#### Context (former ADR 0031)

[ADR 0012](0012-configure-terraform-infrastructure.md) defines the `bootstrap/` and
`prod/` stacks. `infra/prod/main.tf` had grown to about 400 lines that mixed APIs,
Firebase, App Hosting, Auth, IAM, and GitHub federation, which made a change hard
to review. Pull request #61 split it.

#### Decision (former ADR 0031)

- `infra/prod/` keeps one stack and one state, with files by domain: `apis.tf`,
  `firebase.tf`, `app_hosting.tf`, `auth.tf`, `iam.tf`, and `github_wif.tf`. `main.tf`
  keeps only the provider and backend setup.
- This is a file split, not Terraform modules, so resource addresses and state do
  not change and no `terraform state mv` is needed.
- Repository guards read every `infra/prod/*.tf` file, not only `main.tf`.
  `pnpm check:package-scripts` and `pnpm check:repo` cover the new layout.

#### Consequences (former ADR 0031)

- A review shows only the domain that changed.
- A new domain gets its own file, and an added resource needs no state migration.
- The layout is described in [infra/README.md](../../infra/README.md).
