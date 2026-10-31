---
trigger: model_decision
description: "Read when changing identity, session cookies/tokens, protected access, or post-auth navigation."
---

# Authentication and authorization

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing identity, session cookies/tokens, protected access, or post-auth navigation.

Authentication helpers remain flat modules under `src/lib`: use `auth.ts`,
`session.ts`, and `return-url.ts`. Do not create `src/lib/auth/` for these
modules; `auth.ts` owns authentication operations, `session.ts` owns the
active Firebase session, and `return-url.ts` owns safe post-auth navigation.

## Protected access

- Authenticate identity and authorize the requested operation independently.
- Keep `dal.ts` as the boundary for sensitive/protected data access.
- Validate remotely supplied arguments and caller permissions on every Server Function and handler.
- Keep credentials and private resources on the server; context and optimistic UI grant no access.
- Preserve safe post-auth navigation through `return-url.ts`.
- Follow [SECURITY.md](../../SECURITY.md) and the actual Firebase rules and token-verification implementation.
- Call `verifyRole` or `verifySession` inside every Server Function and Route Handler, and check resource ownership; the auth gate, the layout check, and React `cache` do not cover them. The service worker forwards tokens only on navigation and RSC requests, so extend it with any new endpoint type.
- `rejectInvalidBridgeSession` is a navigation check that tolerates a missing bridge. Never use it for authorization, and never give its redirect a protected return path.
- `AuthGateClient` owns the protected session subscription and sign-in redirect. Descendants use `useAuthenticatedUser`; do not subscribe or redirect again.
- Keep telemetry out of the gate and never let it delay protected content.
- Never read the session inside a `use cache` scope. Resolve it first, then pass only the user id to an unexported cached function; keep tokens and email addresses out of cache keys and tags.
- Authorize Admin SDK access in application code; it bypasses Firebase Security Rules.
- Do not add session cookies, Proxy auth checks, or `authInterrupts` without a new ADR; see [ADR 0023](../../docs/adr/0023-keep-service-worker-firebase-session.md).

## Token verification failures

- Map only token rejections (`auth/argument-error`, `auth/id-token-expired`, `auth/id-token-revoked`, `auth/user-disabled`, `auth/user-not-found`) to "unauthenticated".
- Let server faults (expired Admin credentials, network, `auth/internal-error`) propagate to the error boundary. A catch-all that returns "unauthenticated" redirects to sign-in, and the still-signed-in client navigates back to `next`, looping forever.
- Log the failure code and message, never the token.
- Test failure paths with mocks that carry the real SDK `code`; see [TESTING.md](../../TESTING.md#failure-path-mocks-regressions).
- When `verifyIdToken(token, true)` runs in Firebase App Hosting, provision the backend runtime account with `roles/firebaseauth.viewer` in `infra/prod/main.tf`. The `check:app-hosting-auth-iam` guard prevents the required least-privilege binding from being removed.

See [data.md](data.md) for persistence taxonomy and [boundaries.md](boundaries.md)
for runtime imports and serialization.

## Local emulator identities

Use the isolated `demo-test` Firebase project for local emulator work. Auth seed
accounts must use fictional `@example.test` addresses, display names, and include
at least one `google.com` identity for interactive provider testing. The
`pnpm check:emulator-snapshot` safeguard enforces this contract.
