# Execution Plan: Playwright End-to-End Testing Setup & Firebase Auth E2E Flow

**Status:** Completed  
**Owner:** Antigravity Orchestrator  
**Started:** 2026-09-28  
**Last Updated:** 2026-09-28

## Objective

Establish an automated end-to-end (E2E) testing foundation with `@playwright/test`, configuring `playwright.config.ts` to manage Next.js dev server and Firebase Auth emulator environments, authoring an E2E authentication flow specification in `e2e/auth-flow.spec.ts`, and wiring npm scripts for `pnpm test:e2e` execution.

## Scope

### In Scope
- Installation of `@playwright/test` and Playwright browser binaries.
- Creation of `playwright.config.ts` supporting `webServer` configuration for Next.js web application and Firebase Auth emulator integration.
- Authoring `e2e/auth-flow.spec.ts` testing user sign-up, sign-in, protected route navigation, and sign-out flows against the local Firebase Auth emulator.
- Integration of `test:e2e` script in `package.json`.
- Verification of test suite execution via `pnpm test:e2e`.

### Out of Scope
- Visual regression testing or cross-browser matrix beyond Chromium/Firefox/WebKit standard Playwright configurations.
- CI/CD GitHub Actions workflow configuration.

## Canonical Context

- **Product Intent**: Authenticated users access isolated personal spaces (`INTENT.md`).
- **Domain Vocabulary**: `User` represents the authenticated entity (`CONTEXT.md`).
- **Architecture**: Next.js App Router UI (`src/app/(auth)/login/page.tsx`), Firebase Auth local emulator on port `9099` (`ARCHITECTURE.md`).
- **Testing Strategy**: E2E testing using Playwright validating critical user journeys against running app and local emulator (`TESTING.md`).
- **Quality Floors**: Zero absolute machine paths, zero Biome lint errors, 100% English documentation (`CONSTRAINTS.md`).

## Plan

- [x] Milestone 1: Dependencies & Configuration (`@playwright/test`, `playwright.config.ts`)
  - [x] Step 1.1: Install `@playwright/test` dev dependency.
  - [x] Step 1.2: Create `playwright.config.ts` with Next.js webServer (`http://127.0.0.1:3000`) and Firebase Auth emulator orchestration.
  - [x] Step 1.3: Configure `test:e2e` script in `package.json`.
- [x] Milestone 2: E2E Test Suite (`e2e/auth-flow.spec.ts`)
  - [x] Step 2.1: Create `e2e/auth-flow.spec.ts`.
  - [x] Step 2.2: Implement end-to-end tests for registration/sign-up, login with seeded/new account, protected route access (`RequireAuth`), and sign-out.
- [x] Milestone 3: Verification & Execution (`pnpm test:e2e`)
  - [x] Step 3.1: Execute E2E test suite via `pnpm test:e2e` against local Next.js server and Firebase Auth emulator.
  - [x] Step 3.2: Verify zero linter or doc verification regressions (`pnpm check:fast`, `pnpm check:docs`).

## Progress

- 2026-09-28 — Authored initial active execution plan for Playwright E2E testing setup and Firebase Auth E2E flow in `docs/exec-plans/completed/playwright-e2e-setup.md`.
- 2026-09-28 — Installed Playwright Chromium binary, created `playwright.config.ts`, authored `e2e/auth-flow.spec.ts`, and verified 3/3 tests passing clean via `pnpm test:e2e`.

## Decision Log

- 2026-09-28 — Store E2E test files in root-level `e2e/` directory to separate browser-level specifications from Vitest unit and integration tests under `src/`.
- 2026-09-28 — Configure `playwright.config.ts` to launch local Firebase Auth emulator prior to starting tests if not already running.

## Verification

- [x] `pnpm test:e2e` passes clean against local app and Firebase Auth emulator.
- [x] `pnpm check:docs` passes with zero path portability or documentation issues.
- [x] `pnpm check:fast` passes.

## Recovery / Rollback

If Playwright dependencies or configuration cause conflicts, revert changes via `git checkout` on `package.json`, `pnpm-lock.yaml`, and remove `playwright.config.ts` and `e2e/` directory.

## Completion

**Completed:** 2026-09-28  
**Result:** Successfully setup Playwright end-to-end testing with Chromium, configured `playwright.config.ts` to run local Next.js dev server and Firebase Auth emulator, authored `e2e/auth-flow.spec.ts`, and verified clean execution of all E2E tests.
