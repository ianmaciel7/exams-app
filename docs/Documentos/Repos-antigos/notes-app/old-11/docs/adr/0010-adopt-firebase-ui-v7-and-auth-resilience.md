# 0010. Adopt FirebaseUI v7 Canonical Architecture and Resilient Auth Fallback

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed a resilient, standardized client authentication architecture capable of handling OAuth popup blocks, cross-origin iframe restrictions, and Firebase emulator environment limitations without user disruption or custom form state duplication.

## Decision Outcome

We adopted the modular FirebaseUI v7 (`@firebase-oss/ui-react` and `@firebase-oss/ui-core`) architecture with centralized provider initialization and resilient popup-to-redirect fallback. We wrap the application in `FirebaseUIProvider` via `AuthProvider` in `src/app/layout.tsx` and delegate authentication flows directly to canonical screen components (`SignInAuthScreen` and `SignUpAuthScreen` in `src/components/notes-app/`), avoiding custom form state duplication. When popup sign-in fails for a recoverable reason (`auth/popup-blocked`, `auth/popup-closed-by-user`, `auth/operation-not-supported-in-this-environment`, or the code-less `No matching frame` emulator iframe failure), client login automatically falls back to `signInWithRedirect` and `getRedirectResult`. Failures that cannot be recovered, including a failed redirect, are captured through `captureError` and surfaced as a translated error alert rather than swallowed.

### Positive Consequences

- Eliminates auth flow failures caused by iframe blocks or popup blockers in emulator/local environments.
- Centralizes auth provider setup inside `AuthProvider` without duplicating state management.
- Leverages canonical FirebaseUI v7 screen components maintained under `src/components/notes-app/`.

### Negative Consequences

- Redirect fallback flow causes a full page reload, which must be handled gracefully by the client router.

## Architectural Rules and Invariants

- `AuthProvider` must initialize `FirebaseUIProvider` at the application root layout.
- Authentication operations must implement resilient fallback logic from popup to redirect authentication methods.

## Related References and Control Documents

- Architecture decision context: [`ARCHITECTURE.md`](../../ARCHITECTURE.md), Sections 3–4.
- Vendor component boundary: see [ADR 0008](./0008-adopt-firebase-ui-components.md).
- Authentication foundation: see [ADR 0009](./0009-adopt-firebase-auth-with-local-emulator.md).
