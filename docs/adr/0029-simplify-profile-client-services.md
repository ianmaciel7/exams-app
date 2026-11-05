# ADR 0029: Simplify profile client services

- **Status**: Accepted; amends ADRs 0027 and 0028

## Context

The profile Server Action already owns data reads and saves. Its remaining
browser gateway forwards only email verification and session user reloads.
A context, provider, adapter and lookup hook add wiring without another runtime
implementation. The email dialog already owns its pending, failure, retry and
cancellation behavior.

## Decision

- Remove `ProfileGateway` and its context, provider, adapter and lookup hook.
- Keep the page server-rendered and compose `Card` and `ProfileForm` directly.
- Call `reloadSessionUser` from `@/lib/session` after a successful save.
- Call `sendEmailChangeVerification` from `@/lib/auth` in the email dialog hook.
  Require a session, await the usage event, then call Firebase verification.
- Expose client telemetry as `trackEvent` instead of `recordUsage` and
  `withUsageGuard`. Preserve the deployed callable name `recordUsage`, its
  authentication requirement and its 15-second timeout.
- Share the pending logout promise in `src/lib/pending-sign-out.ts` to avoid
  circular imports between auth, session and telemetry. Keep
  `getPendingSignOut` available through the auth module for existing consumers.
- Name the browser integration `ProfileEmailDialogClient` and its matching hook
  and test according to the component naming rules.
- Mock canonical service modules in profile tests. Retain restrictions against
  importing Firebase SDKs directly from route hooks or components.

## Consequences

The route loses its forwarding infrastructure while preserving Server Action
authorization, email confirmation, dialog recovery and sign-out synchronization.
Telemetry remains client-reported usage, not an authorization guard or proof of
success. Navigation ignores telemetry failures; email changes await telemetry
and surface failures through the existing retry flow. Server profile saves keep
their existing authorization and persistence behavior.

This replaces only the browser gateway scope of ADRs 0027 and 0028. Their
server-side data access and presentational form decisions remain in force.
