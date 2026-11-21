# Constraints

Last reviewed: 2026-10-01

This file is the non-regression quality contract. Checks may be tightened, but must
not be weakened merely to make a change pass.

## Floor (always enforced)

- No new checker suppressions such as `@ts-ignore`, `eslint-disable`, or
  `biome-ignore` merely to silence a finding.
- No unimplemented stubs, empty catches, or TODO placeholders in production source.
- No skipped or deleted tests, and no removed assertions, merely to obtain a pass.
- No secrets in source.
- No new exception without a documented owner, reason, and expiry.
- **Browser Baseline**: Supported browsers are Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+. No custom polyfills for `fetch`, `URL`, or `Object.assign` (handled automatically by Next.js); custom polyfills must load through client instrumentation or runtime feature checks.

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
| --- | --- | --- | --- |
| Types | Zero type errors | `pnpm run check:types` | task end |
| Lint | Zero Biome CI errors and warnings across project-owned application, script, eval, and configuration targets; registry-managed `src/components/ui/` is excluded by `biome.json` | `pnpm run check:lint` | task end |
| Conventions | Zero mechanical `CONVENTIONS.md` rule violations and a consistent Enforcement Index | `pnpm run check:conventions` | task end |
| Architecture | Zero dependency-cruiser violations | `pnpm run deps:check` | task end |
| RSC Boundaries | Zero server component boundary findings | `pnpm run check:rsc` | task end |
| Component Props | Zero invalid component prop interface findings | `pnpm run check:props` | task end |
| Component Naming | Zero application component files without an allowed role suffix | `pnpm run check:naming` | task end |
| UI Composition | Zero notes-app composition and dedicated-hook ownership findings | `pnpm run check:ui-pattern` | task end |
| Emojis | Zero emoji literals in project-owned source under `src/`; registry-managed `src/components/ui/` is excluded | `pnpm run check:emojis` | task end |
| i18n Strings | Zero hardcoded user-facing strings or forbidden copy in UI components | `pnpm run check:i18n` | task end |
| Duplication | At most 10% by configured jscpd threshold | `pnpm run check:duplication` | task end |
| Code health | Fallow health score, complexity findings (cyclomatic or cognitive above 10, CRAP above 30), and functions above 60 lines never regress past `scripts/guards/code-health-floor.json`; Biome also caps parameters at 5, cognitive complexity at 15, and function body length at 60 lines (the same limit Fallow tracks as a floor), and rejects nested ternaries, unbraced `if`/`else`, non-null assertions, enums, barrel files, `export *`, unused imports/variables, and `console` calls | `pnpm run check:health` | task end |
| Code health, new code | Zero Fallow complexity, size, dead-code, or duplication findings introduced since `origin/main` | `pnpm run check:health:changed` | push |
| Dependency audit | No high/critical package-manager advisories | `pnpm run check:security` | dependency/security review |
| Dependency vulnerability regression | No newly introduced known vulnerability | OSV-Scanner differential workflow | PR |
| Accessibility | Lighthouse accessibility score at least 0.90 | `pnpm run lighthouse` | relevant UI changes |
| Diff floor | Zero floor-guard findings | `pnpm run check:floor` | every task end |
| Coverage | ≥ 80% lines, functions, branches, and statements | `pnpm run test:coverage` | CI |
| Documentation drift | Zero repository documentation verifier errors | `pnpm run verify:docs` | CI |
| Harness evaluator | Deterministic evaluator tests pass | `pnpm run test:harness` | CI |
| Guard implementation | Deterministic floor-guard tests pass | `pnpm run test:guards` | CI |

## Measured, not yet enforced

| Metric | Current state | Direction | Measured by |
| --- | --- | --- | --- |
| Existing OSV baseline | Full scan reports existing known vulnerabilities without blocking | reduce the baseline and document explicit exceptions | `pnpm run check:osv` |
| Browser performance | Lighthouse performance is warning-only at 0.90 | measure before adopting a blocking target | `pnpm run lighthouse` |
| Browser best practices | Lighthouse best-practices is warning-only at 0.90 | preserve or improve before enforcing | `pnpm run lighthouse` |
| SEO | Lighthouse SEO is warning-only at 0.90 | informational until product surfaces exist | `pnpm run lighthouse` |

Behavioral agent success rates are measured by live eval runs but are not yet a blocking PR threshold. Establish a provider/model baseline before adopting a numeric regression floor.

## Exceptions

| Exception | Scope | Owner | Reason | Added | Expires |
| --- | --- | --- | --- | --- | --- |
| Biome `suspicious/noDocumentCookie` off | `src/lib/i18n/locale-sync.ts` and its test | Repository owner | The locale cookie is written on the client so next-intl can read it on the server, and the Cookie Store API is outside the supported browser baseline. | 2026-10-01 | 2027-04-01 |
| Biome `suspicious/noConsole` off | `scripts/**`, `.agents/**`, tests, stories, `e2e/**`, and `src/lib/error-capture/**` | Repository owner | CLI scripts and guards report through stdout/stderr, and the error-capture module deliberately forwards to the console. | 2026-10-05 | 2027-04-05 |
| Biome `complexity/noExcessiveLinesPerFunction` off | Tests, stories, and `e2e/**` | Repository owner | `describe` and story blocks group many cases and are not logic units. | 2026-10-05 | 2027-04-05 |
