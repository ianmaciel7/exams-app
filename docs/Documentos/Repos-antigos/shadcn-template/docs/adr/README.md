# Architecture decision records

Accepted records preserve the reasoning and implementation context at their
original date. Read current operational details in the
[documentation guide](../README.md), and follow the
[naming and immutability rule](../../.agents/rules/adr-naming.md) for new records.

## Index

| Record | Status | Subject |
| --- | --- | --- |
| [0001](0001-configure-nextjs.md) | Accepted | Next.js App Router, TypeScript, Biome, React Compiler, pnpm |
| [0002](0002-configure-shadcn-ui.md) | Accepted | Base UI, locally owned components, typography, AI Elements |
| [0003](0003-configure-theming.md) | Accepted | Class-based light, dark, and system themes |
| [0004](0004-configure-internationalization.md) | Accepted | next-intl, locale catalogs, providers, typed messages |
| [0005](0005-document-project-standards.md) | Accepted; testing detail superseded by 0006 | Documentation ownership and repository standards |
| [0006](0006-configure-testing.md) | Accepted | Colocated Vitest tests, Vitest Browser Mode, Playwright suites, coverage thresholds, mutation testing |
| [0007](0007-configure-ci.md) | Accepted | Continuous integration, quality tooling, custom rules catalog, layered verification, and Git hooks |

## Current operational clarifications

- **ADR 0006: Testing layers and standards**:
  - Vitest runs a multi-project configuration: `unit` project in `jsdom` (including
    `.biome/**/*.test.ts` rule tests) and `browser` project in real Chromium via
    Vitest Browser Mode (`@vitest/browser-playwright`).
  - Code coverage is enforced at a strict 70% threshold across all metrics via
    `@vitest/coverage-v8`, writing `text-summary`, `json`, and `json-summary`
    (for GitHub Actions `$GITHUB_STEP_SUMMARY`).
  - Playwright suites in `tests/` cover functional journeys (`home.spec.ts`),
    automated WCAG 2.0/2.1/2.2 A/AA accessibility audits in light and dark modes
    via `@axe-core/playwright` (`a11y.spec.ts`), and visual regression tests
    (`visual.spec.ts`) with a 1% pixel diff tolerance against Linux container baselines.
  - Pure invariant logic is validated via `fast-check` property tests, and critical
    modules are guarded against regressions with `@stryker-mutator/core` (75% break
    score, command runner with `vitest.mutation.config.mts`).
  - Real browser suites require `pnpm exec playwright install chromium`.
  - See [TESTING.md](../../TESTING.md) for full testing workflows and commands.

- **ADR 0007: Continuous integration, quality tooling, and verification**:
  - Quality analysis includes Fallow (`.fallowrc.json`) for complexity, CRAP scores,
    and Git hotspots; React Doctor (`doctor.config.json`) for React AST diagnostics;
    Ladle (`.ladle/`) for isolated component development; and workflow linting via
    actionlint and zizmor (`check:workflows`).
  - The custom rule registry maintains:
    - GritQL DOM rule (`no-document-write.grit`).
    - 3 GritQL Next.js rules (`prefer-page-props.grit`, `prefer-layout-props.grit`, `prefer-route-context.grit`).
    - 4 ast-grep rules (`no-dynamic-tailwind-class`, `no-hardcoded-ui-attribute`, `no-manual-memoization-ts`, `no-manual-memoization-tsx`).
    - 9 Semgrep security rules (`tests/semgrep/rules.yml`).
  - Verification is layered into `verify:fast`, `verify:static`, `verify:build`,
    `verify:security`, and `verify:full`.
  - Husky in `.husky/pre-commit` sets `VIRTUALENV_OVERRIDE_APP_DATA` on Windows to
    prevent MAX_PATH (`WinError 206`) issues and bypasses missing `pre-commit`
    gracefully.
  - The supported Node range is `^22.19.0 || ^24.5.0` in `package.json` (CI uses Node 22 LTS).
  - Continuous integration in GitHub Actions runs on `ubuntu-latest` with Node 22,
    Python 3.13, and pnpm across `ci.yml`, `visual-baselines.yml`, and `scheduled-quality.yml`.
  - In `.github/workflows/scheduled-quality.yml`, the `mutation` job (Stryker) is
    strictly manual dispatch (`workflow_dispatch`), whereas Lighthouse is scheduled
    weekly (`0 6 * * 1`).
  - The Lighthouse runner in CI executes an automated lifecycle: resolves the
    Playwright Chromium path, starts the server in the background, sets a process
    cleanup trap on exit, polls `curl` readiness up to 30 times, audits via
    `pnpm analyze:lighthouse:ci`, and uploads the HTML report artifact.
  - `pnpm exec playwright install --with-deps chromium` is mandatory in both
    `build` (for Vitest Browser Mode) and `lighthouse` jobs.
  - Python CI tools (`semgrep`, `zizmor`, `pre-commit`) are pinned in
    `.github/dependabot-mirror/ci-python/requirements.txt` for clean Dependabot updates.
  - The `ci-result` aggregation job uses `jq -e` and `$GITHUB_STEP_SUMMARY` to act
    as the single required status check for branch protection, correctly treating
    the `skipped` status of `pr-title` as successful on pushes to `main`.

- **ADR 0004: Routing and localization**:
  - Locale helpers in ADR 0004 do not create localized routes. Current requests
    resolve a locale from an explicit value or cookie; the application has no
    locale route segment or request proxy. See
    [Architecture](../../ARCHITECTURE.md#internationalization).

These clarifications describe the checked-in configuration. They do not claim
that a hosted run succeeded or that all tooling is installed on a contributor's
machine. Use the latest CI results as execution evidence.

## Adding a decision

Use the next unused four-digit number and an imperative kebab-case filename.
Record the context, decision, and consequences. If it replaces a decision,
identify the superseded record and scope, preserving the accepted content.
