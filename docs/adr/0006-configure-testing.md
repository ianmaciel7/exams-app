# ADR 0006: Configure testing

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

The App Router template had no automated test runner, test configuration, or
test-file convention. Without an explicit boundary, a future contributor could
create competing global test directories, mix browser and DOM tests, or move
route code only to satisfy a test runner.

Modern web applications require a multi-tiered validation strategy: fast unit
and component feedback in a simulated DOM (`jsdom`), true browser rendering for
behavior dependent on real viewport and media queries, full end-to-end user
journey verification against production builds, automated accessibility audits
against WCAG standards, deterministic visual regression tracking, property-based
invariant testing, and mutation testing to gauge test suite resilience.

Next.js documents that test files may be colocated in the App Router, that
private `_components` and `_lib` folders are safe non-routable locations, and
that a route is exposed only by a `page` or `route` file. Its Vitest guide
recommends Vitest with React Testing Library and `jsdom`. Its testing guide
recommends E2E tests for asynchronous Server Components because unit-test
support for them is incomplete. Its Playwright guide uses a root `tests/`
directory and recommends exercising a production build.

The project must make consistent architectural choices about test placement,
runner responsibilities, coverage thresholds, browser prerequisites, and the
exact script interface.

## Decision

We adopt colocation for Vitest tests and reserve the root `tests/` directory
for Playwright specifications across functional, accessibility, and visual
regression layers:

1. **Test placement conventions**:
   - Unit tests for functions, utilities, hooks, and business logic use
     `*.test.ts` next to the module they verify.
   - React component and JSX integration tests use `*.test.tsx` next to the
     component or route-private module they verify.
   - Browser Mode component tests use `*.browser.test.tsx` next to the component
     they verify.
   - Route-specific tests remain beside the relevant code and preserve existing
     `_components` and `_lib` private-folder boundaries. Tests do not cause route
     directories or special files to move.
   - E2E specifications live in `tests/` with the `*.spec.ts` suffix. Shared
     E2E-only fixtures and helpers live under `tests/` only once they have
     active consumers.

2. **Vitest Multi-Project configuration (`vitest.config.mts`)**:
   - **`unit` project**: runs in `jsdom` with React Testing Library. It includes
     `src/**/*.test.{ts,tsx}` and configuration tests (`.biome/**/*.test.ts`),
     and explicitly excludes `src/**/*.browser.test.{ts,tsx}`. Aliases are
     resolved through Vite's native `tsconfigPaths: true`.
   - **`browser` project**: runs in a real Chromium browser via Vitest Browser Mode
     using `@vitest/browser-playwright` and `vitest-browser-react`. It includes
     `src/**/*.browser.test.{ts,tsx}` for components and hooks requiring real
     browser layout, viewport changes, focus transitions, or CSS media queries
     (e.g., `use-mobile.browser.test.tsx`).

3. **Strict code coverage thresholds (`@vitest/coverage-v8`)**:
   - Configured in `vitest.config.mts` using the `v8` provider.
   - Enforces a strict floor of 70% across all four metrics: `statements: 70`,
     `branches: 70`, `functions: 70`, and `lines: 70`.
   - Generates `text-summary`, `json`, and `json-summary` reports (the latter
     feeds GitHub Actions `$GITHUB_STEP_SUMMARY`).
   - Scopes coverage to application code (`src/**/*.{ts,tsx}`), excluding test
     files, stories, type declarations (`src/types/**`), vendored shadcn/ui
     components (`src/components/ui/*.tsx`), and AI Elements
     (`src/components/ai-elements/**`). Project-owned extensions
     (`src/components/ui/extensions/`) remain covered.

4. **Playwright test suites (`playwright.config.ts`)**:
   - Executes against a local production build server (`pnpm build && pnpm start`)
     serving on port 3000. Targets Chromium.
   - **Functional E2E** (`tests/home.spec.ts`): verifies root route availability,
     landmark roles, locale cookie persistence, and external link security.
   - **Accessibility audit** (`tests/a11y.spec.ts`): tagged `@a11y`, runs automated
     audits using `@axe-core/playwright` across WCAG 2.0, 2.1, and 2.2 Level A/AA
     standards (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) across
     both light and dark color schemes.
   - **Visual regression** (`tests/visual.spec.ts`): tagged `@visual`, asserts
     pixel-level stability using `toHaveScreenshot` with a strict tolerance of 1%
     (`maxDiffPixelRatio: 0.01` in `playwright.config.ts`). Baselines are committed
     per platform under `tests/snapshots/visual/` via `snapshotPathTemplate`
     (`home-light-chromium-linux.png`, `home-dark-chromium-linux.png`)
     and executed inside the pinned Playwright Docker container in CI (skipped
     locally unless `PLAYWRIGHT_VISUAL=1`).

5. **Property-based and mutation testing**:
   - **Property-based testing**: uses `fast-check` within Vitest unit tests (such as
     `src/i18n/routing.test.ts`) to test pure invariant logic (e.g., verifying
     `isLocale` against arbitrary strings and types).
   - **Mutation testing**: uses `@stryker-mutator/core` configured via
     `stryker.config.json` with a dedicated fast unit configuration
     (`vitest.mutation.config.mts`, bypassing Browser Mode). Configured with the
     `command` runner to ensure reliable mutant activation in Vitest 5, targeting
     core modules (`src/i18n/routing.ts` and `src/hooks/use-mobile.ts`), and
     enforcing a break threshold of 75% (`break: 75`, `low: 75`, `high: 85`).

6. **Host and environment prerequisites**:
   - Real Chromium binaries must be installed prior to running browser or E2E
     suites via:

     ```bash
     pnpm exec playwright install chromium
     ```

7. **Test scripts matrix in `package.json`**:
   - `test`: `vitest run --project unit` (fast unit tests in `jsdom`).
   - `test:watch`: `vitest --project unit` (interactive test watcher).
   - `test:coverage`: `vitest run --project unit --coverage` (enforces 70% threshold).
   - `test:browser`: `vitest run --project browser` (Vitest Browser Mode in Chromium).
   - `test:e2e`: `playwright test --grep-invert "@a11y|@visual"` (functional journeys).
   - `test:a11y`: `playwright test --grep @a11y` (axe-core accessibility scans).
   - `test:visual`: `playwright test --grep @visual` (visual comparison against baselines).
   - `test:visual:update`: `playwright test --grep @visual --update-snapshots` (updates baselines).
   - `test:mutation`: `stryker run` (runs mutation analysis).
   - Verification pipelines compose these scripts: `verify:fast` runs `pnpm test`,
     `verify:static` runs `pnpm test:coverage`, `verify:build` runs `pnpm test:browser`,
     `verify:e2e` runs `playwright test`, and `analyze:health` combines coverage with Fallow.

8. **Testing practices & boundaries**:
   - Test code verifies observable behavior. Use accessible queries (`getByRole`),
     mock collaborators only at owned boundaries, avoid testing library internals,
     and use snapshots only when small stable outputs represent the contract.
   - Asynchronous Server Components are tested via Playwright E2E rather than
     unstable unit-test shims.
   - MSW is not installed preemptively; it remains deferred until a demonstrated
     shared HTTP-mocking need emerges.

This ADR supersedes the historical "no automated test runner" consequence in
ADR 0005. ADR 0005 remains unchanged under the repository's immutable-ADR policy.

## Consequences

- **Positive**:
  - Tests stay close to the behavior they protect without creating a parallel
    application hierarchy or exposing private routes.
  - Vitest Multi-Project clearly delineates fast `jsdom` tests from real browser
    layout tests in Chromium.
  - Strict 70% coverage floor and 75% mutation break threshold protect critical
    code from silent regressions.
  - Comprehensive Playwright suite validates functional, accessibility (WCAG),
    and visual regression contracts against production builds.
  - Property-based testing eliminates blind spots in core validators and parsing logic.
- **Negative / Trade-offs**:
  - Requires Chromium binaries via `pnpm exec playwright install chromium` before
    browser and E2E suites can execute.
  - Stryker with the `command` runner executes tests once per mutant, taking several
    minutes and requiring manual invocation rather than running on every commit.
  - Visual regression testing requires identical container environments (Linux) to
    prevent false-positive font and antialiasing diffs.
  - Asynchronous Server Components must be tested via full E2E journeys rather than
    unit tests.

## References

- [Next.js testing overview](https://nextjs.org/docs/app/guides/testing)
- [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright guide](https://nextjs.org/docs/app/guides/testing/playwright)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Playwright accessibility testing with axe-core](https://playwright.dev/docs/accessibility-testing)
- [fast-check documentation](https://fast-check.dev/)
- [Stryker Mutator](https://stryker-mutator.io/)
