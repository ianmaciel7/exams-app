# ADR 0018: Cover blocking functions in the release deploy

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

The first release with the sign-in blocking functions ([ADR 0017](0017-restrict-sign-in-to-an-email-allowlist.md))
failed in two places. Blocking functions deploy to `us-east1` by default, so the Firebase
CLI created them there and could not make them public, because the organization policy
blocks `allUsers` ([ADR 0016](0016-disable-invoker-iam-check-for-callable-functions.md)).
The deploy of a new region also stops in non-interactive mode when no artifact cleanup
policy exists.

## Decision

- The step that disables the Cloud Run invoker check also covers `restrictsignup` and
  `restrictsignin`, each in its own region.
- `firebase deploy` runs with `--force`, so the CLI sets the artifact cleanup policy for
  the new region instead of failing.

## Consequences

- Moving a function to another region means updating the service list in the workflow.
- `--force` also lets a deploy delete functions that were removed from the source.
