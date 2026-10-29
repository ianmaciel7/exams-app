# ADR 0019: Register blocking functions in Terraform

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

[ADR 0017](0017-restrict-sign-in-to-an-email-allowlist.md) added the `restrictSignUp` and
`restrictSignIn` blocking functions. They deployed, but Identity Platform had no trigger
registered for them, so sign-in was not restricted. The Firebase CLI registers the
triggers only on the deploy that creates the functions, and that first deploy failed while
setting their invoker policy (ADR 0016, ADR 0018).

## Decision

Register the triggers in `google_identity_platform_config.default` with `blocking_functions`,
reading each function's URI from the deployed service
(`google_cloudfunctions2_function`). Terraform then owns the registration, so it survives
a deploy that does not recreate the functions.

## Consequences

- The functions must exist before `terraform apply`, so apply after the first deploy.
- The region is the `blocking_functions_region` variable, `us-east1`, the Firebase default.
