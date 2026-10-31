# ADR 0024: Separate the bridge navigation check from session verification

- **Status**: Accepted
- **Date**: 2026-10-30
- **Deciders**: ianmaciel7

## Context

`verifySession()` could return without a verified identity when the service
worker did not control the tab. That matched the first-load need of the protected
layout, but the name promises what the Next.js authentication guide shows: a
verification that yields an identity. A server caller could have taken it for an
authorization check.

The protected flow also held overlapping layers. A server wrapper existed only to
call that function, and the route guard and the profile each subscribed to
Firebase Auth and redirected on sign-out, so the profile's redirect could drop the
return path. Usage telemetry lived in the guard. The layout check redirected a
rejected token with a return path to `/profile`, and a client that still held a
session would be sent straight back.

[ADR 0023](0023-keep-service-worker-firebase-session.md) keeps the service worker
and is unchanged by this decision.

## Decision

- `verifySession()` always fails closed and returns the verified identity.
  `verifyRole()` builds on it.
- `rejectInvalidBridgeSession()` is the separate navigation check for the protected
  layout. It tolerates a missing bridge, and it redirects a rejected token to
  sign-in with a return to home, so it cannot loop a signed-in client.
- `AuthGateClient` is the single owner of the session subscription and the sign-in
  redirect for protected routes. Descendants read the user from context instead of
  subscribing, and a change of `uid` remounts the subtree.
- Usage telemetry is a separate `RouteUsageClient`.

The `Client` suffix is a repository naming rule, not a Next.js convention.

## Consequences

- Nothing can mistake the tolerant check for authentication, but a future
  server-rendered protected page cannot render on a first load without the worker.
  [ADR 0023](0023-keep-service-worker-firebase-session.md) already names this as
  the trigger to revisit the session mechanism.
- `verifySession()` and `verifyRole()` have no production caller yet, because no
  protected route reads server data. Their contract is covered by unit tests.
- A client whose token keeps failing verification lands on the home page instead
  of the protected route, and the server log holds the reason.
- Current guidance lives in [docs/auth.md](../auth.md).
