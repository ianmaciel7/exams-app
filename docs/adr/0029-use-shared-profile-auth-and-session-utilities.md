# ADR 0029: Use shared profile auth and session utilities

- **Status**: Accepted; supersedes the browser Gateway scope of ADRs 0027 and 0028

## Context

The profile already receives server-loaded values and an authenticated Server
Action. Its route-specific Gateway, context, provider and access hook now only
forward email verification and browser-user reload operations. The accessible
email dialog introduced in PR 129 should retain its validation, focus handling,
retry state and protection against late responses after reopening.

## Decision

- Remove the profile Gateway layer. The Server Component page directly composes
  its Card and `ProfileForm`, retaining the injected `updateProfile` Action and
  server-only persistence with per-operation session verification.
- `src/lib/auth.ts` owns `sendEmailChangeVerification`; `src/lib/session.ts`
  owns `reloadSessionUser`. Profile hooks call these shared browser utilities,
  and tests mock those module boundaries instead of injecting a route provider.
- Rename the browser usage function to `trackEvent` and remove `withUsageGuard`.
  This is a project API, not a built-in Next.js analytics function. Keep the
  callable name `recordUsage`, timeout, event schema and server allowlist intact.
  Email verification awaits telemetry and rechecks user identity before sending.
  Screen events remain best-effort; server profile writes keep their existing
  authorization and persistence behavior.
- Keep the sign-out promise barrier in the session module. Auth registers its
  persistence promise there; session observers wait for settlement. Session no
  longer imports auth, avoiding a cycle through auth, telemetry and session.
- Extend the form filename exception to a `*-dialog.tsx` that composes `Dialog`
  and a form. It still declares `"use client"`; dialogs without a form retain
  the normal integration suffix policy. Direct Firebase and server-private
  imports in route UI remain prohibited; a provider suffix grants no exception.

## Consequences

No new route authentication modules or providers are needed. Required data,
validation, avatar and form-state modules remain cohesive with their existing
responsibilities. Reload failures are logged without undoing a successful server
save or creating an unhandled rejection. Root session subscription ownership and
sign-out ordering remain unchanged.

Core tests cover telemetry ordering/failure, missing and changed identities,
reload outcomes and sign-out persistence. Existing profile and Chromium tests
cover dialog interaction without a Gateway provider. Biome import regressions,
component naming regressions and dependency-cruiser protect the new boundaries.
