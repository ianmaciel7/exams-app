# 0009. Adopt Firebase Authentication with Local Emulator

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed local development, automated testing, and isolated user identity without external cloud dependencies or real credentials.

## Decision Outcome

We adopted Firebase Authentication with the local Firebase Auth Emulator (`port: 9099`, UI on `port: 4000`), integrating native Firebase `User` nomenclature with client-side React 19 `use(AuthContext)` (context in `src/lib/auth-context.ts`, provider in `src/components/notes-app/auth-provider.tsx`) and custom hooks in `src/hooks/use-auth.ts`, supported by pre-seeded test accounts in `.firebase/seeds/` and dedicated login routes in `src/app/(auth)/login/`.

### Component Customization Boundary

In accordance with [ADR 0008](./0008-adopt-firebase-ui-components.md), the application consumes `@firebase-oss/ui-core` and `@firebase-oss/ui-react` directly. Application-owned authentication cards, forms, field groups, and policy surfaces live in `src/components/notes-app/`; the former local Firebase registry mirror has been removed.

### Positive Consequences

- Enables fully offline local development and deterministic automated auth testing using pre-seeded test accounts.
- Avoids reliance on live Firebase production/staging environments during development.
- Provides consistent auth state management via `AuthProvider` and `use(AuthContext)`.

### Negative Consequences

- Requires developers and test runners to ensure the Firebase Auth Emulator is running during local integration testing.

## Architectural Rules and Invariants

- Client authentication state must be accessed via `AuthProvider` or `useAuth` hooks.
- Auth screens and forms used by application routes must be imported from `src/components/notes-app/`, adhering to [ADR 0008](./0008-adopt-firebase-ui-components.md).

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions) & Section 4 (Runtime State & Data Flow)
- [ADR 0008](./0008-adopt-firebase-ui-components.md) - Adopt Firebase Open Source Auth UI Components
- FirebaseUI resilience follow-up: see [ADR 0010](./0010-adopt-firebase-ui-v7-and-auth-resilience.md).
