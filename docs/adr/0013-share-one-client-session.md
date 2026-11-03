# ADR 0013: Share one client session

- **Status**: Accepted; amends the subscription owner in ADR 0009 (former ADR 0025)
- **Date**: 2026-11-03
- **Deciders**: ianmaciel7

## Context

[ADR 0009](0009-integrate-firebase-authentication.md) made `AuthGateClient` the
single owner of the session subscription for protected routes. The home page
needed the same session, so the `useAuthSession` hook was called by both the gate
and the home client, and each call opened its own Firebase Auth subscription.
The hook asked callers to "pass the user down, do not subscribe again", but
nothing outside the protected subtree could do that.

The profile route also named its form state `useSession` and `SessionContext`,
although it holds locale, theme, and avatar values rather than the
authentication session.

The Next.js Cache Components authentication guide recommends creating the
session value once, sharing it through a context provider, and reading it with
a hook.

## Decision

- `SessionProviderClient` in the root layout owns the only client Firebase Auth
  subscription for the UI. It keeps the existing on-demand Firebase loading and
  the pending sign-out hold.
- Client components read the session with `useSession()` from
  `src/hooks/use-session.ts`. `useAuthSession` is removed.
- `AuthGateClient` reads `useSession()` and remains the single owner of the
  protected sign-in redirect, the recoverable error, and the `uid`-keyed user
  context that `useAuthenticatedUser` reads.
- The Firebase Auth service worker bridge keeps its own subscription. Sign-out
  waits for the worker to acknowledge `uid: null`, while `useSession` holds the
  signed-out state until sign-out completes, so the bridge reading `useSession`
  would deadlock sign-out.
- The sign-in flow's return navigation keeps its direct subscription, because it
  reacts to the sign-in event inside `AuthProviderClient`.
- The profile form state is renamed to `useProfile`, `ProfileContext`, and
  `useProfileContext`.

Server authentication is unchanged: `verifySession()`, `verifyRole()`, and
`rejectInvalidBridgeSession()` remain the boundaries in `dal.ts`.

## Considered options

- **Keep one subscription per surface**: rejected because every new client
  surface would add another subscription and repeat the loading and error state.
- **Have the worker bridge read the shared session**: rejected because of the
  sign-out acknowledgement deadlock described above.
- **Pass a server-resolved user promise through context**: deferred; the client
  still needs Firebase Auth for the Client SDK, and the server session depends on
  the worker bridge, which is absent on the first load.

## Consequences

- One subscription serves the home page and protected routes, and a new client
  surface reads `useSession()` instead of subscribing.
- `useSession()` throws outside `SessionProviderClient`, so tests render the
  provider around the gate or the home client.
- The provider grants no access; authorization stays in `dal.ts` and Security
  Rules.
