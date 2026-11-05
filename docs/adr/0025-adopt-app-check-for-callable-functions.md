# ADR 0025: Adopt App Check for callable functions

- **Status**: Accepted
- **Date**: 2026-11-05

## Context

The `recordUsage` callable (ADR 0009) checks the caller's Firebase ID token and
accepts only a closed list of events. Firebase's callable documentation also
recommends App Check, which proves that a request comes from the registered web
app rather than from a script that holds a stolen ID token. The project did not
use App Check, and registering the app needs a reCAPTCHA key in the Firebase
Console that only the owner can create.

## Decision

Support App Check in code, off by default, so no environment changes until the
owner enables it.

- **Client**: `getFirebaseFunctions` in `src/lib/firebase/client.ts` starts App
  Check with `ReCaptchaV3Provider` only when
  `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` is set. Token auto-refresh is on. In
  development it sets the SDK debug-token flag. The callable client then
  attaches the App Check token automatically.
- **Server**: `recordUsage` sets `enforceAppCheck` from `ENFORCE_APP_CHECK=true`
  in the Functions environment at deploy time (`usageCallableOptions` in
  `functions/usage-logs.cjs`). It stays `false` otherwise.
- **CSP**: the nonce policy already allows `https:` scripts under
  `'strict-dynamic'`, which covers the reCAPTCHA script; no change is needed.

## Enabling

1. Register the web app for App Check with reCAPTCHA v3 in the Firebase Console
   and create the site key.
2. Set `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` for the web build and deploy it.
3. Confirm in the App Check metrics that callable requests are verified.
4. Set `ENFORCE_APP_CHECK=true` in the Functions environment and deploy
   `recordUsage`.

Deploy the client first: with enforcement on, a client without a token is
rejected, and the usage guard then blocks profile saves (ADR 0009).

## Consequences

- Enforcement is a separate, reversible deploy step.
- Debug tokens must stay secret and are never committed (see
  `docs/agents/quality-standards.md`).
- `setUserRole` is not covered by this decision.
- The Auth emulator and CI use no App Check; the emulator does not verify it.
