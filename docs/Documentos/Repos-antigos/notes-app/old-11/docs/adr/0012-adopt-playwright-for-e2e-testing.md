# 0012. Adopt Playwright for End-to-End (E2E) Browser Testing

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

As application complexity grows across Next.js App Router navigation, locale routing, and Firebase Authentication workflows, unit and component tests (Vitest and Ladle) alone cannot verify end-to-end user journeys in real browser engines. We require a robust cross-browser end-to-end (E2E) testing framework capable of executing full user flows, validating client-side page transitions, and interacting directly with local Firebase Auth emulator instances.

## Decision Outcome

We adopt `@playwright/test` as the standard end-to-end browser testing framework for the repository:

1. **Test Location & Scoping**: All end-to-end test specifications reside strictly in the dedicated `e2e/` root directory (e.g., `e2e/*.spec.ts`), keeping them cleanly isolated from unit/component tests in `src/`.
2. **Server Lifecycle Management**: Playwright is configured via `playwright.config.ts` using the `webServer` option to automatically spawn and manage the Next.js development server during E2E test runs.
3. **Local Emulator Integration**: E2E tests interact with local Firebase Auth emulator daemons (`127.0.0.1:9099`) to perform real user authentication flows (sign in, sign up, sign out, guest access) in isolation without making calls to live Firebase cloud infrastructure.
4. **Role Boundary**: Playwright E2E tests validate complete user journeys and browser integration, complementing—rather than replacing—Vitest for unit/integration logic tests and Ladle for isolated component UI rendering.

### Positive Consequences

- Provides reliable cross-browser execution across Chromium, Firefox, and WebKit engines.
- Enables deterministic verification of full user authentication flows against the local Firebase Auth emulator.
- Automated server management via `webServer` simplifies CI/CD execution and local test invocation.
- Keeps test concerns clear by separating unit/component tests (`src/`) from full browser E2E tests (`e2e/`).

### Negative Consequences

- Running full browser E2E test suites increases local and CI execution time relative to Vitest unit tests.
- Requires maintenance of Playwright browser binaries and local emulator availability during E2E test runs.

## Architectural Rules and Invariants

- All E2E test files must be placed under the `e2e/` root directory with the `.spec.ts` suffix.
- E2E tests must execute against local Firebase Auth emulator instances and must never hit live production/staging Firebase endpoints.
- Playwright E2E tests must complement and not replace Vitest unit/integration tests or Ladle UI component stories.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions) & Section 6 (Architectural Decision Records)
- [`TESTING.md`](../../TESTING.md) - Section 2 (Toolchain) & Section 3 (Commands)
- Firebase Auth prerequisite: see [ADR 0009](./0009-adopt-firebase-auth-with-local-emulator.md).
