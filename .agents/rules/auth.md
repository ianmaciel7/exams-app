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
Profile hooks call `sendEmailChangeVerification` and `reloadFirebaseAuthUser` through
those modules, without a route-private gateway or direct SDK imports (ADR 0029).
`pending-sign-out.ts` shares the logout barrier without an auth/session import cycle.

## Protected access

- Authenticate identity and authorize the requested operation independently.
- Keep `dal.ts` as the boundary for sensitive/protected data access.
- Validate remotely supplied arguments and caller permissions on every Server Function and handler.
- Keep credentials and private resources on the server; context and optimistic UI grant no access.
- Never commit cloud credentials, private tokens, or API keys into tracked files (such as `.vscode/launch.json` or tool scripts). Launch configurations must reference Git-ignored local files via `envFile`. Staged files are guarded by Gitleaks in the pre-commit hook.
- Preserve safe post-auth navigation through `return-url.ts`.
- Follow [SECURITY.md](../../SECURITY.md) and the actual Firebase rules and token-verification implementation.
- Call `verifyRole` or `verifySession` inside every Server Function and Route Handler, and check resource ownership; React `cache` shares checks within a render pass.
- `src/app/(protected)/layout.tsx` calls `await verifySession()` in the Data Access Layer (DAL) to fail closed on unauthenticated requests before streaming protected routes.
- `SessionProviderClient` in the root layout owns the only client session subscription; client components read it with `useSession`.
- Route telemetry is fire-and-forget: `NavigationEvents` records screen usage in its own component, only for a signed-in user, and it never delays or fails protected content.
- Never read the session inside a `use cache` scope. Resolve it first, then pass only the user id to an unexported cached function; keep tokens and email addresses out of cache keys and tags.
- Authorize Admin SDK access in application code; it bypasses Firebase Security Rules.
- Session cookies (`__session`) are the server session transport per [ADR 0021](../../docs/adr/0021-adopt-official-nextjs-server-auth-dal.md). Do not add Proxy auth checks or expand `authInterrupts` without a new ADR. [ADR 0030](../../docs/adr/0030-constrain-http-status-helpers.md) enables native authorization interrupts without migrating existing session redirects.
- Create the session cookie (`syncSessionCookie`) before navigating from sign-in to a protected route. The server verifies the cookie, so navigating first redirects back to sign-in and drops the query string. `use-firebase-ui-return-navigation` guards the order.
- `syncSessionCookie` is a boolean barrier: it force-refreshes the ID token (`getIdToken(true)`) and resolves `true` only when `/api/auth/session` answers `response.ok`. When it resolves `false`, call `signOutUser()` instead of navigating, otherwise stale IndexedDB credentials and a revoked session ping-pong between `/sign-in` and the protected route. `POST /api/auth/session` deletes the stale cookie on failure. Guarded by `public-ui-provider-client.test.tsx`, `auth.test.ts`, and `route.test.ts`.
- The server DAL redirect knows only the route path, not its query string: `redirectToSignIn` returns to the path.
- A change to the authentication architecture updates `tests/firebase-auth.spec.ts` in the same pull request. The emulator E2E does not run in the cloud container, so CI is its only check, and `failOnFlakyTests` makes a flaky run fail.

## Token verification failures

- Map only token rejections (`auth/argument-error`, `auth/id-token-expired`, `auth/id-token-revoked`, `auth/user-disabled`, `auth/user-not-found`) to "unauthenticated".
- Let server faults (expired Admin credentials, network, `auth/internal-error`) propagate to the error boundary. A catch-all that returns "unauthenticated" redirects to sign-in, and the still-signed-in client navigates back to `next`, looping forever.
- Log the failure code and message, never the token.
- Test failure paths with mocks that carry the real SDK `code`; see [TESTING.md](../../TESTING.md#failure-path-mocks-regressions).
- When `verifyIdToken(token, true)` runs in Firebase App Hosting, provision the backend runtime account with `roles/firebaseauth.viewer` in `infra/prod/main.tf`. The `check:app-hosting-auth-iam` guard prevents the required least-privilege binding from being removed.
- In local development against a cloud Firebase project without Auth emulators, `verifyIdToken(token, true)` calls Google's Identity Toolkit API using Application Default Credentials (ADC). Google Cloud requires a quota project (`GOOGLE_CLOUD_QUOTA_PROJECT=<project-id>`), and the account authenticated via `gcloud auth application-default login` must have IAM authorization on that project (such as `roles/serviceusage.serviceUsageConsumer` or Editor/Owner). If missing, Firebase Admin Auth throws `auth/internal-error` with status 403.

See [data.md](data.md) for persistence taxonomy and [boundaries.md](boundaries.md)
for runtime imports and serialization.

## Development environment separation

- Keep emulator hosts out of `.env.local`. Next.js automatically loads `.env.local` for `next dev`; placing emulator endpoints there causes offline development to fail with connection errors whenever emulators are not running.
- Use `.env.local` for default cloud development with `GOOGLE_CLOUD_QUOTA_PROJECT`.
- Use `.env.emulator.local` strictly for emulator-backed development (`pnpm dev:emulator` and VS Code emulator profiles).
- Use `.env.production.local` for production testing (`pnpm dev:prod`) to explicitly clear emulator hosts.

## Local emulator identities

Use the isolated `demo-test` Firebase project for local emulator work. Auth seed
accounts must use fictional `@example.test` addresses, display names, and include
at least one `google.com` identity for interactive provider testing. The
`pnpm check:emulator-snapshot` safeguard enforces this contract.

## Firebase security rules

Every rules file referenced by `firebase.json`
needs a negative test in `tests/rules/` that runs on the emulators: another
user, an anonymous visitor, a forged `role` claim, and an unmatched path must
all be refused. A rule must never allow access unconditionally. Run
`pnpm test:rules` after a rules change; the `pnpm check:firebase-rules`
safeguard fails when a rules file has no test, a matched path is not named in
its test, a configured file is missing, or CI stops running them. The guard
and emulator helper read paths from `firebase.json`; do not duplicate rules
filenames in scripts. Text matching is a structural hint, not behavioral
coverage. Keep allow/deny assertions in the emulator tests.
