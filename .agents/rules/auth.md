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
- Never commit cloud credentials, private tokens, or API keys into tracked files (such as `.vscode/launch.json` or tool scripts). Launch configurations must reference Git-ignored local files via `envFile`. Staged files are guarded by Gitleaks in the pre-commit hook.
- Preserve safe post-auth navigation through `return-url.ts`.
- Follow [SECURITY.md](../../SECURITY.md) and the actual Firebase rules and token-verification implementation.
- Call `verifyRole` or `verifySession` inside every Server Function and Route Handler, and check resource ownership; the auth gate, the layout check, and React `cache` do not cover them. The service worker forwards tokens only on navigation and RSC requests, so extend it with any new endpoint type.
- `rejectInvalidBridgeSession` is a navigation check that tolerates a missing bridge. Never use it for authorization, and never give its redirect a protected return path.
- `AuthGateClient` owns the protected session subscription and sign-in redirect. Descendants use `useAuthenticatedUser`; do not subscribe or redirect again.
- Keep telemetry out of the gate and never let it delay protected content.
- Never read the session inside a `use cache` scope. Resolve it first, then pass only the user id to an unexported cached function; keep tokens and email addresses out of cache keys and tags.
- Authorize Admin SDK access in application code; it bypasses Firebase Security Rules.
- Do not add session cookies, Proxy auth checks, or `authInterrupts` without a new ADR; see [ADR 0009](../../docs/adr/0009-integrate-firebase-authentication.md).

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

Every rule in `firestore.rules`, `storage.rules`, and `database.rules.json`
needs a negative test in `tests/rules/` that runs on the emulators: another
user, an anonymous visitor, a forged `role` claim, and an unmatched path must
all be refused. A rule must never allow access unconditionally. Run
`pnpm test:rules` after a rules change; the `pnpm check:firebase-rules`
safeguard fails when a rules file has no test, a matched path is not named in
its test, or CI stops running them.
