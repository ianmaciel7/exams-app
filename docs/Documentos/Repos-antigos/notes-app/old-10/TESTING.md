# Testing

## Current state

The repository uses two complementary test layers:

- **Node test + tsx** for pure domain logic and emulator-backed rule checks.
- **Playwright** for browser interaction, Server Action integration, Firebase Auth/Firestore flows, accessibility, responsive layout, and MCP HTTP integration.

Unit/integration files in `tests/*.test.ts` cover:
- grading for all four question formats;
- SM-2 scheduling, quality values, exam grace windows, rich-text flattening, schema validation;
- API-key generation, hashing, parsing, and retry-queue logic;
- sidebar and open-tab domain helpers;
- emulator seed expectations;
- Firestore's unauthenticated blanket-deny rule.

```bash
pnpm test
tsx --test tests/recall.test.ts
```

The Playwright suite in `tests/e2e/` covers:
- sign-up/sign-in UI state, Google popup wiring through the Firebase Auth Emulator, and sign-out;
- Space creation, switching, invitation, member access, reporting, and owner resolution;
- object creation, editing, dirty-draft cancellation, archiving/restoring, citations, backlinks, context details, and cross-Space isolation;
- single-choice, multiple-choice, fill-blank, and matching questions;
- practice grading, 0-5 self-grade, multi-question progression, results, restart, simulated exam, and expired-session fallback;
- command palette search/actions, sidebar collapse/resize/peek/mobile close, open tabs, and keyboard/focus restoration;
- optimistic-concurrency conflicts, one-Exam-per-user enforcement, and cross-Space link rejection;
- MCP API-key UI lifecycle and JSON-RPC HTTP behavior;
- route protection and tenant 404 behavior;
- WCAG 2.1 A/AA Axe checks;
- mobile/desktop overflow invariants plus screenshot render smoke for the primary routes and landing page.

```bash
pnpm test:e2e
pnpm exec playwright test collaboration-integrity.spec.ts
pnpm exec playwright test -g "multiple-choice"
```

`playwright.config.ts` starts Firebase Auth/Firestore emulators and `next dev` automatically.

## Writing a new test

- Write one test per behavior, not per implementation function.
- Prefer `node:test` for pure domain code.
- Prefer Playwright when behavior crosses React, Next.js routing, Server Actions, cookies, auth, Firestore, or browser focus.
- Avoid mocks for business rules when a real emulator-backed or browser path is practical.
- Keep selectors semantic: role, label, placeholder, or stable test id.
- Use `ensure()` from `tests/e2e/helpers.ts` for client handlers reached immediately after a cold Next.js navigation, because Turbopack hydration may lag behind server-rendered HTML.

## Pure domain testing

Pure algorithms and schemas belong in `src/domain/` and should stay independent of Firebase and Next.js. Use table-driven vectors for grading/scheduling rules and explicit boundary cases.

## Firebase emulators

```bash
pnpm emulators
```

Development uses:
- Auth emulator: `127.0.0.1:9099`
- Firestore emulator: `127.0.0.1:8080`
- project: `demo-recall`

`tests/firestore-rules.test.ts` verifies that an unauthenticated client cannot read Firestore. It skips only when the emulator is unavailable. CI runs `pnpm test` inside `firebase emulators:exec`, so the rule test executes rather than skipping.

The Firebase Auth Emulator is also used for the browser authentication suite, including the local provider page opened by Google `signInWithPopup`.

## Accessibility and responsive regression

`tests/e2e/accessibility.spec.ts` runs Axe against WCAG 2.1 A/AA rules on the primary authenticated surfaces and interaction states.

`tests/e2e/layout-regression.spec.ts` checks the supported mobile and desktop breakpoints for horizontal overflow across:
- Overview
- object list
- object detail
- Study
- Review
- Settings
- public landing page

It also captures in-memory screenshots and verifies that each rendered viewport produces a non-empty image with the expected dimensions, and asserts `expect(page).toHaveScreenshot()` (`maxDiffPixelRatio: 0.02`) for true pixel-diff visual regression. The object detail route's "Updated `<date>`" text is masked since it moves daily.

Baselines live in `tests/e2e/layout-regression.spec.ts-snapshots/`, generated locally with `playwright test tests/e2e/layout-regression.spec.ts --update-snapshots`, and are **gitignored, not committed** — Playwright encodes the OS/renderer into each filename (e.g. `*-chromium-win32.png` vs CI's `*-chromium-linux.png`), so a baseline from one OS is neither used nor valid on another. Until CI has its own step to generate and cache/commit Linux baselines, this spec's pixel-diff coverage is local-only: regenerate baselines on your machine before relying on a clean run to mean "no visual regression."

## CI quality gate

`.github/workflows/ci.yml` runs on pull requests and on pushes to `main` and `prototype`. `.github/workflows/prototype-validation.yml` runs the same gate again on every push to `prototype` alone, as a branch-specific safety net.

Both workflows run a single job, in order:
1. dependency install (`pnpm install --frozen-lockfile`);
2. Playwright's Chromium install;
3. Biome lint (`pnpm lint`);
4. unit/emulator-backed tests (`firebase emulators:exec --only auth,firestore ... "pnpm test"`);
5. the full Playwright E2E suite (`pnpm test:e2e`) against the local emulators and Next.js dev server;
6. production build (`pnpm run build`).

`ci.yml` also uploads the Playwright report as a build artifact on failure.

## E2E traps

**Use `localhost`, never `127.0.0.1`, for the browser app.** Next dev resources can be blocked as cross-origin when the page origin differs, leaving server-rendered HTML visible but client handlers inert. The configured Playwright base URL is `http://localhost:3000`.

**Saving an object navigates from one `/question/<id>` to another.** Waiting only for a matching pathname can immediately match the old object. `createObject()` waits until the URL actually changes.

**Cold route compilation can exceed the default navigation timeout.** The suite uses a 60-second navigation timeout and `ensure()` retries for hydration-sensitive controls.

**Tests are serial.** They share one emulator process, while each test creates isolated users/Spaces as needed. Do not enable parallel workers without first isolating emulator state.

## Test philosophy

The target is behavioral confidence rather than one test for every DOM node. A button is considered covered when a test exercises the user-visible behavior it owns. Shared primitives such as the generated shadcn/Base UI `Button` are not redundantly tested once their consuming flows are exercised.
