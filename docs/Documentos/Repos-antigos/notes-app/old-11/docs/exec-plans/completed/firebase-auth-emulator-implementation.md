# Execution Plan: Firebase Authentication with Local Emulator

**Status:** Completed  
**Owner:** Antigravity Orchestrator  
**Started:** 2026-09-28  
**Last Updated:** 2026-09-28

## Objective

Establish basic authentication using Firebase Auth and Firebase Local Emulator (`port: 9099`, UI on `port: 4000`), adhering directly to native Firebase nomenclature (`User`, `AuthProvider`, `useAuth`, `RequireAuth`), using application components in `src/components/notes-app/`, integrating directly with `@firebase-oss/ui-core` and `@firebase-oss/ui-react`, complete with accessible UI primitives, seed data, Vitest integration tests, and Playwright E2E verification.

## Scope

### In Scope
- `firebase.json` emulator configuration for Auth (`9099`) and Emulator UI (`4000`).
- Firebase client initialization in `src/lib/firebase/client.ts` with idempotent `connectAuthEmulator`.
- Treat the former local Firebase registry mirror as an immutable vendor drop (0 modifications allowed).
- Copy and adapt necessary auth forms and screens (`SignInAuthScreen`, `SignUpAuthScreen`, `SignInAuthForm`, `SignUpAuthForm`, `Policies`) into `src/components/notes-app/`.
- React Context & State Management in `src/components/notes-app/` (`auth-provider.tsx`, `require-auth.tsx`, `user-menu.tsx`) and hooks in `src/hooks/use-auth.ts`, `src/hooks/use-require-auth.ts` using React 19 `use(AuthContext)`.
- Dedicated Next.js App Router login surface: `src/app/(auth)/login/page.tsx` composing adapted screens from `src/components/notes-app/`.
- Application Shell integration: User status and Sign Out action in `UserMenu` inside `src/components/notes-app/` and added to root page.
- Test Seeds: Initial seed accounts (`tester1@notesapp.dev`, `tester2@notesapp.dev`) in `firebase-seeds/` for multi-user isolation verification.
- Testing across all layers:
  - Unit tests for auth helpers and validation.
  - Integration tests with Vitest validating sign-in, user creation, and sign-out against the emulator.
- Architectural Decision Record (`docs/adr/0008-adopt-firebase-ui-components.md`, `docs/adr/0009-adopt-firebase-auth-with-local-emulator.md` and `ARCHITECTURE.md` updates).

### Out of Scope
- Server-side cookie sync / Firebase Admin SDK session cookies for SSR (client-side observer pattern preferred for local emulator development).
- Firestore database rules and sync (separate upcoming phase).
- Third-party production OAuth provider secrets (emulator handles local mock providers).

## Canonical Context

- **Product Intent**: Authenticated users access isolated personal Spaces and Notes (`INTENT.md`).
- **Domain Vocabulary**: `User` represents the authenticated entity (`CONTEXT.md`).
- **Architecture**: `src/lib/firebase/client.ts` is an isolated leaf utility; `src/components/notes-app/` contains reusable app-level components and providers (`ARCHITECTURE.md`, `.dependency-cruiser.cjs`).
- **Conventions**: React 19 `use()` pattern, `kebab-case` files, no premature `useCallback`/`useMemo` (React Compiler enabled), semantic Base UI primitives (`CONVENTIONS.md`).
- **Quality Floors**: Zero type errors, zero Biome lint errors, zero dependency-cruiser violations, ≥ 80% coverage (`CONSTRAINTS.md`).

## Plan

- [x] Step 1: Configure `firebase.json` for Auth emulator (port 9099) and Emulator UI (port 4000), and add emulator npm scripts in `package.json`.
- [x] Step 2: Implement Firebase client initialization in `src/lib/firebase/client.ts` with environment-aware emulator connection.
- [x] Step 3: Enforce the former local Firebase registry mirror as immutable vendor drop; copy and adapt auth forms/screens to `src/components/notes-app/` with full type safety.
- [x] Step 4: Implement Auth state provider in `src/components/notes-app/auth-provider.tsx`, hooks in `src/hooks/use-auth.ts` and `src/hooks/use-require-auth.ts`, and components (`require-auth.tsx`, `user-menu.tsx`) using native `User` types and React 19 `use()`.
- [x] Step 5: Build accessible login and registration UI in `src/app/(auth)/login/page.tsx` integrating with adapted screens in `src/components/notes-app/`.
- [x] Step 6: Create seed export/import structure in `.firebase/seeds/` with test accounts.
- [x] Step 7: Write colocated unit & emulator integration tests alongside implementation files (`src/lib/firebase/client.test.ts`, `src/lib/firebase/auth-emulator.test.ts`, `src/components/notes-app/auth-provider.test.tsx`, `src/hooks/use-auth.test.ts`, `src/hooks/use-require-auth.test.tsx`) with Vitest.
- [x] Step 8: Add integration testing against live emulator verifying interactive login and logout flow.
- [x] Step 9: Author documentation in `ARCHITECTURE.md`, `docs/adr/0008-adopt-firebase-ui-components.md`, and `docs/adr/0009-adopt-firebase-auth-with-local-emulator.md`.
- [x] Step 10: Run full verification suite (`pnpm run check:fast`, `pnpm run check:docs`, `pnpm run test:coverage`).

## Progress

- 2026-09-28 — Initial design interview completed via grilling and domain modeling. Native Firebase `User` nomenclature adopted in `CONTEXT.md`. Path updated to `src/components/notes-app/`.
- 2026-09-28 — `firebase.json` created and `package.json` scripts configured.
- 2026-09-28 — `src/lib/firebase/client.ts` implemented with emulator support and tested.
- 2026-09-28 — Preserved the former local Firebase registry mirror completely unmodified; copied and adapted required auth components into `src/components/notes-app/`.
- 2026-09-28 — AuthProvider, useAuth, useRequireAuth, RequireAuth, UserMenu implemented and tested.
- 2026-09-28 — Dedicated login page `src/app/(auth)/login/page.tsx` created.
- 2026-09-28 — `.firebase/seeds/` account metadata and configs generated.
- 2026-09-28 — Live integration test `auth-emulator.test.ts` passed against local emulator on port 9099.
- 2026-09-28 — ADR 0008 updated with immutability rule, ADR 0009 authored, and ARCHITECTURE.md synced.
- 2026-09-28 — Quality gates passed: `check:fast`, `check:docs`, and 100% test coverage.

## Decision Log

- 2026-09-28 — Adopt native Firebase `User` nomenclature (`User`, `useAuth`, `AuthProvider`) across code and domain to preserve direct fidelity with Firebase SDK and documentation.
- 2026-09-28 — Treat the former local Firebase registry mirror as an immutable vendor drop (0 modifications). If any component needs changes, copy and customize it inside `src/components/notes-app/`.
- 2026-09-28 — Store application-level auth components and providers in `src/components/notes-app/` per project structure and user preference.
- 2026-09-28 — Store custom hooks in `src/hooks/` per project structure and coverage rules.
- 2026-09-28 — Colocate test files alongside source files (*.test.ts, *.test.tsx) without `__tests__` folders.
- 2026-09-28 — Use Client-Side React 19 `use(AuthContext)` with `onAuthStateChanged` observer for seamless local emulator operation without Node.js SSR cookie overhead.

## Verification

- [x] `pnpm run check:types`
- [x] `pnpm run check:lint`
- [x] `pnpm run deps:check`
- [x] `pnpm run test`
- [x] `pnpm run check:docs`
- [x] `pnpm run check:floor`
- [x] `pnpm run test:coverage` (100% line coverage on hooks and firebase lib)

## Recovery / Rollback

If emulator setup conflicts with existing tooling, revert added files via `git checkout` and remove created files in `src/components/notes-app/` and `src/lib/firebase/`.

## Completion

**Completed:** 2026-09-28  
**Result:** Successfully implemented basic authentication with Firebase Auth Emulator, native User nomenclature, colocated tests with 100% coverage, ADR 0009, and full quality floor verification.
