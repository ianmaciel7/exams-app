# ADR 0016: Disable the invoker IAM check for callable Functions

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

After the production rebuild, every protected page showed "Unable to record access" and
`/profile` never finished loading. The browser blocked the call to the `recordUsage`
callable with a CORS error. The Functions are Cloud Run services whose invoker policy was
empty, and Cloud Run rejects an unauthenticated request, including the CORS preflight that
browsers send without credentials, before the function runs. The Firebase ID token cannot
help: Cloud Run's check expects a Google identity, and only the handler verifies the
Firebase token.

Granting `roles/run.invoker` to `allUsers` was tried and refused: the organization policy
`iam.allowedPolicyMemberDomains` (domain restricted sharing) rejects `allUsers`.

## Decision

Turn off the Cloud Run invoker IAM check on the callable Functions that browsers call
(`recordusage`, `setuserrole`) with `gcloud run services update --no-invoker-iam-check`.
Google documents this as the recommended way to make a service public when domain
restricted sharing applies, and it creates no IAM binding, so the policy does not block it.

The CD workflow runs the command after `firebase deploy`. It is idempotent and restores the
setting if a deploy resets it. The deploy service account already holds `roles/run.admin`.

The Functions are not anonymous. Each handler verifies the Firebase ID token and rejects
callers without one, and `setUserRole` also checks the caller's role. `helloWorld` stays
private.

## Considered options

- **`allUsers` as invoker**: refused by the organization policy.
- **An exception to the organization policy**: rejected because it changes a policy owned by
  the organization and is not needed.
- **Proxy the calls through the Next.js server**: rejected as a larger change with no gain,
  since the handlers already authenticate callers.
- **Manage the setting in Terraform**: rejected because `firebase deploy` creates and
  updates these services, so Terraform would conflict with it.

## Consequences

- Adding a callable Function means adding its Cloud Run service name to the workflow step.
- The setting is applied on each release, not at the moment a service is created.
- Access control for these Functions lives only in their handlers.
