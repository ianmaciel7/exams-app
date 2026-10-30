# ADR 0020: Grant App Hosting the Firebase Auth viewer role

- **Status**: Accepted
- **Date**: 2026-10-30
- **Deciders**: ianmaciel7

## Context

The server verifies session ID tokens with `verifyIdToken(token, true)`, which checks
revocation. Revocation checking reads the user record from Firebase Auth. The App Hosting
runtime service account only held the App Hosting runner role, so verification failed with
a server fault in production and protected routes could not be served.

## Decision

Grant the runtime service account `roles/firebaseauth.viewer` in `infra/prod/main.tf`, and
make the backend depend on the binding. Prefer this read-only role over an Auth admin role.
The `check:app-hosting-auth-iam` guard fails when the binding is missing or replaced by a
broader role.

## Consequences

- Revocation-aware verification works without widening the account beyond read access.
- Apply the infrastructure change, then validate an authenticated protected route on the
  deployed service.
