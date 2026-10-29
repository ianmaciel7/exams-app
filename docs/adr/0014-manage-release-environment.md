# ADR 0014: Manage the release environment with Terraform

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

The release workflow reads its target project, App Hosting backend, release branch,
deploy service account, and Workload Identity provider from variables of the GitHub
`production` environment ([ADR 0011](0011-configure-firebase-cd.md)). They were created
by hand and copied from Terraform outputs. The copy drifted: after the infrastructure
was rebuilt, two values pointed at resources that no longer existed, and a variable
added to the workflow later was missing, so releases failed on configuration rather than
on code.

## Decision

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

## Considered options

- **Keep copying the outputs by hand**: rejected because it already caused failed
  releases.
- **Set the variables from the release workflow**: rejected because it would give the
  workflow permission to change its own configuration.
- **A GitHub App instead of a token**: deferred; the logged in CLI is enough for a single
  maintainer.

## Consequences

- A variable the workflow needs becomes a line in `infra/prod/main.tf`, reviewed with the
  workflow change.
- Applying Terraform needs a GitHub token with write access to the repository's
  environments and variables, in addition to Google credentials.
- A value edited in the GitHub UI is overwritten on the next apply.
