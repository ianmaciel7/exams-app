# ADR 0031: Split the production Terraform stack by domain

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

[ADR 0012](0012-configure-terraform-infrastructure.md) defines the `bootstrap/` and
`prod/` stacks. `infra/prod/main.tf` had grown to about 400 lines that mixed APIs,
Firebase, App Hosting, Auth, IAM, and GitHub federation, which made a change hard
to review. Pull request #61 split it.

## Decision

- `infra/prod/` keeps one stack and one state, with files by domain: `apis.tf`,
  `firebase.tf`, `app_hosting.tf`, `auth.tf`, `iam.tf`, and `github_wif.tf`. `main.tf`
  keeps only the provider and backend setup.
- This is a file split, not Terraform modules, so resource addresses and state do
  not change and no `terraform state mv` is needed.
- Repository guards read every `infra/prod/*.tf` file, not only `main.tf`.
  `pnpm check:package-scripts` and `pnpm check:repo` cover the new layout.

## Consequences

- A review shows only the domain that changed.
- A new domain gets its own file, and an added resource needs no state migration.
- The layout is described in [infra/README.md](../../infra/README.md).
