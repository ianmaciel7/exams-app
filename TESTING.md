# Testing

## Validation commands

Run the checks relevant to a change before opening a pull request. See
[TOOLING.md](TOOLING.md) for every command and the tools behind them.

| Command | Use it for |
| --- | --- |
| `pnpm verify:fast` | Code changes: Biome CI, typecheck, unit tests, logging regressions, ast-grep structural rules, route-entrypoint guard, owned-component naming/boundary guard, UI feedback guard (`check:ui-state`), and responsiveness guard (`check:responsiveness`). Browser suites run separately. |
| `pnpm verify:full` | Before a pull request: `verify:static` (adds coverage thresholds, architecture, unused code, duplication, ast-grep structural checks, route/component/responsiveness guards, spelling, Markdown, complexity, React diagnostics) plus `verify:build` (browser tests, production build with size budgets, Ladle build). |
| `pnpm verify:e2e` | Changes that affect pages or visual output: functional, accessibility, and visual Playwright specs. |
| `pnpm verify:security` | Dependency or configuration changes: Semgrep rule tests and scan, Gitleaks, workflow lint, `pnpm audit`, and the separate Functions lockfile audit. Needs the host tools in [TOOLING.md](TOOLING.md#host-prerequisites). |
| `pnpm audit:functions` | Separate dependency audit of the deployed Cloud Functions npm lockfile; part of security verification and CI. |
| `pnpm eval:tool-usage` | On-demand evaluation of Codex tool selection. Requires authenticated Codex plus configured MCP/plugin tools; saves JSONL traces and a report under ignored `reports/tool-usage-evals/`. It is intentionally outside CI because agent results and external tool availability are non-deterministic. |

For documentation-only changes, run `pnpm check:markdown` and
`pnpm check:spelling`, then verify relative links, referenced paths, and
commands against the repository. These checks do not replace CI; the pull
request still runs the configured jobs. Markdown lint and spelling include owned rules and agent entrypoints. External
skill bodies remain excluded; `check:docs` checks the skill index against the
versioned entrypoints. Accepted ADRs preserve their historical text.

`pnpm verify:fast` runs the unit Vitest project, logging
regressions, and structural ast-grep checks, including migrated route rules for
client directives, hooks, and JSX event handlers. Browser, end-to-end, visual,
and mutation suites run separately.

Vitest Browser Mode binds its local API on port 4174. Keep this separate from
the Playwright production E2E server on 4173 and outside Windows' commonly
reserved high-port range; Vite may advance to the next available port if needed.

`pnpm check:ui-state` runs positive and negative AST fixtures, then scans
application TypeScript and TSX for direct `String(error|cause|err)` coercion
that reaches JSX, React Hook Form error sinks, or toast payloads. It runs in
`verify:fast` and `verify:static`, so the CI `static` job enforces the same
contract. This narrow syntax guard does not replace behavioral tests, error
classification review, or accessibility checks.

For a manual smoke test, run `pnpm dev` and verify the affected route in a
browser, including its loading, error, and localized states where applicable.

## Production server startup

The ordinary Playwright suite runs `pnpm build && pnpm start --port 4173` and
always starts its own server. It must not reuse an already-running local server:
that can silently test a stale build. Browser base URLs and locale-cookie setup
use the same isolated port. Its five-minute
`webServer.timeout` covers both the production build and the readiness check;
it is separate from individual test timeouts. The Firebase emulator development
server retains its two-minute startup limit. Build output is piped into the
job log so a startup failure can be distinguished from a failed browser test.
The E2E job remains bounded by its existing 20-minute job limit and Playwright's
12-minute global timeout. Home smoke tests check the project title in every
supported locale against the package name.

## Agent evaluations

`pnpm eval:tool-usage` runs the five core scenarios defined in
`evals/tool-usage/cases.json` through `codex exec --json` with a read-only
sandbox. The runner checks both trace tool calls and the schema-constrained
final receipt, so a tool merely named in prose does not pass. Its unit tests
are `scripts/evals/run-tool-usage-evals.test.mjs`; run them with
`node --test scripts/evals/run-tool-usage-evals.test.mjs` when changing the
runner or cases. The test suite verifies the general
rubric, manual review, and failure follow-up.

## Acceptance journeys and independent verification

A green unit-test suite or coverage percentage does not prove that a user can
finish a workflow. Critical journeys are tested against the running application
with the Firebase Auth, Firestore, and Functions emulators. Their assertions
must verify **observable outcomes** and, where applicable, persisted records
rather than only mocked calls or navigation.

| Journey / security boundary | Executable evidence | Required outcome |
| --- | --- | --- |
| Registration and persisted login | `tests/firebase-auth.spec.ts` | Register in the browser and retain an authenticated session |
| Guest protected deep link to sign-in | `tests/firebase-auth.spec.ts` | Preserve the requested protected path and query after login |
| Profile preferences and identity | `tests/firebase-auth.spec.ts` | Save via the browser, read Firestore independently, reload, sign out and sign in again |
| Cross-account preference isolation | `tests/firebase-auth.spec.ts` | Owner can read/write; a different user cannot read/write; anonymous access is denied |
| Password recovery | `tests/firebase-auth.spec.ts` | Emulator issues a recovery code and the UI handles network failure |
| Google sign-in | `tests/firebase-auth.spec.ts` | Emulated popup/redirect flows complete; production OAuth is a separate risk |
| Google popup cancellation and retry | `tests/firebase-auth.spec.ts` | Closing an unauthenticated popup returns to usable sign-in and permits a second attempt |
| Protected session and server token verdicts | `tests/firebase-auth.spec.ts` | First load without the worker, forwarded token, failed refresh, rejected tokens, no redirect loop, sign-out, and account switch |
| Role claims in Security Rules | `tests/firebase-auth.spec.ts` | A refreshed token gains and loses access; an issued token keeps its claim in Rules until it expires |
| Responsive, visual, and a11y | `tests/*.spec.ts` | Assert defined layouts and detectable issues; these are not substitutes for a completed journey |

Playwright uses `failOnFlakyTests` in CI: a test that fails before passing on
retry must fail the job. Investigate traces and classify the root cause rather
than treating retries as proof of reliability. The official Playwright option
is supported by the installed version and preserves failure artifacts.

The `auth-emulator` GitHub Actions job is a required CI gate and executes these
journeys with actual emulator services. The ordinary mobile and responsive suites
may skip authentication-only controls when Firebase configuration is unavailable;
those skips must not be interpreted as proof of functional authentication.
Investigate skipped test counts and emulator-job failures before merging.

These tests deliberately do not claim production OAuth compatibility, a complete
screen-reader audit, all browsers, or 100% defect detection. Add one regression
scenario for each newly confirmed user-facing defect. Prefer independent
acceptance criteria from product requirements and bug reports over deriving
expected results exclusively from the current code. Do not update snapshots,
relax assertions, or introduce `test.skip` to hide a defect.

## Stateful user journeys and model-based acceptance

When adding or changing a user-facing asynchronous or multi-step feature, first
model its **observable states, events, transitions, and recovery guarantees**.
This is a risk-based contract, not a claim that every theoretical input sequence
can be exhaustively tested. Do not derive the expected behavior solely from the
current implementation.

1. Identify the user's goal and its independently expected outcome.
2. List the reachable states (for example, idle, in progress, completed,
   cancelled, failed, and recovered), including where the UI can become stuck.
3. Enumerate meaningful events (submit, close, cancel, retry, navigate, reload,
   duplicate action, network loss, authorization failure, session change).
4. Build a state-transition matrix for the feature. Select critical
   transitions and pairs of transitions using likelihood, user impact, and
   regression history; justify exceptions instead of inventing cases.
5. Test success **and** applicable interruption, cancellation, failure and
   recovery paths in a browser or appropriate integration layer.
6. Assert the final user-visible state, ability to retry, and independent
   persistence or authorization outcomes. A click, a mock invocation, a
   screenshot or a generic visible page is not an acceptance oracle.
7. Keep the model and regression scenario with the owning suite. When an
   external dependency cannot be reproduced, record the limitation and retain
   a deterministic contract/integration test for the application-owned part.
8. Treat unexpected skips, unfinished transitions, and required tests that
   fail on the CI emulator as a **blocked release**, not green coverage.
   Do not repair a failing test by deleting it, skipping it, relaxing the
   requirement, or increasing timeouts without diagnosis.

### OAuth popup transition contract

The current example is `/sign-in` with Google OAuth. Its minimum model is:

| Initial state | Event | Expected observable state | Verification |
| --- | --- | --- | --- |
| Idle | Open Google popup | Authentication pending; window appears | Playwright popup event |
| Pending | Authenticate in popup | Signed-in destination shown | Emulator-backed browser E2E |
| Pending | Close popup without authenticating | Sign-in is usable again; no indefinite spinner | Emulator-backed browser E2E |
| Recovered after cancellation | Try Google again | A second popup can open, then cancel cleanly | Emulator-backed browser E2E |
| Pending | Popup blocked, provider error or network failure | Recoverable error and usable controls | Add targeted tests when failure can be simulated reliably |

The required cancellation/retry regression lives in
`tests/firebase-auth.spec.ts`. The `auth-emulator` CI job runs it through
`pnpm exec playwright test --project=auth-emulator`. Failing this acceptance
test is evidence of a defect or an unresolved test-environment issue; it must
not be ignored. Firebase's emulator does **not** prove production-provider
compatibility, so real Google OAuth needs separate, safe verification.

**Enforcement:** `pnpm test:auth` locally and the required
`auth-emulator` CI job execute the behavioral regression. The model and this
policy guide test creation; no static analyzer can establish all relevant
human-experience transitions automatically. Reviewers must compare the
transition matrix with the feature's requirements and actual UX.

### Protected session transition contract

The route gate owns these transitions. An emulator suite cannot reproduce every
one, so the last column names the layer that does.

| Initial state | Event | Expected observable state | Verification |
| --- | --- | --- | --- |
| Loading | Session resolves signed in | Protected content, one subscription | `auth-gate-client.test.tsx`, emulator E2E |
| Loading | Session resolves signed out | One redirect that keeps path and query | `auth-gate-client.test.tsx`, emulator E2E |
| Loading | Firebase fails | Alert with a retry control, no redirect | `auth-gate-client.test.tsx` |
| Signed in | Sign-out | Content hidden; history cannot restore it | Emulator E2E |
| Signed in | Account changes | Subtree remounts with no prior account data | Component test, emulator E2E |
| Signed in, worker active | Token refresh fails | Navigation continues on the client session | Emulator E2E |
| Signed in | Server rejects the token | Sign-in, then home; the route is requested once | Emulator E2E |
| Any | Admin SDK infrastructure fault | Error boundary, no sign-in redirect | `server.test.ts`, `dal.test.ts` only: the emulator cannot fail on demand |

`verifySession`, `verifyRole`, 401/403 responses, and resource ownership on a
server operation have no production caller, so they are unit-tested only. Do not
add endpoints to exercise them. Ownership and anonymous access are verified against
Firestore Rules.

## Test layers

| Layer | Location and name | Runner | Command | Use for |
| --- | --- | --- | --- | --- |
| Unit and hook | `src/**/*.test.ts(x)` next to the source | Vitest `unit` project, `jsdom` | `pnpm test` | Functions, utilities, hooks, and business logic. |
| Property-based | Inside unit tests, with `fast-check` | Vitest `unit` | `pnpm test` | Pure logic with a large input space, such as `isLocale`. |
| Browser component | `src/**/*.browser.test.tsx` | Vitest `browser` project, Chromium | `pnpm test:browser` | Behavior that needs a real browser: responsive breakpoints, container queries (`@container`), focus, real events. |
| End-to-end / Responsiveness | `tests/*.spec.ts`, `tests/responsive.spec.ts` | Playwright | `pnpm test:e2e` | User journeys and responsive layout against a production build. `tests/responsive.spec.ts` covers multi-viewport matrix (320px, 390px, 768px, 1280px), horizontal overflow prevention (`scrollWidth <= clientWidth`), and WCAG 2.2 SC 2.5.8 touch target compliance. |
| Mobile device | `tests/mobile.spec.ts` | Playwright `mobile` project (Pixel 7: `isMobile`, `hasTouch`, coarse pointer) | `pnpm test:mobile` | Real mobile emulation of `/`, `/sign-in`, `/register`, and `/forgot-password`: meta viewport and manifest, axe WCAG A/AA, one `h1`, no horizontal scroll in portrait and landscape, WCAG 1.4.12 text spacing, 44x44px touch targets (Apple HIG, WCAG 2.5.5), form fields of at least 16px so iOS does not zoom, autofill tokens (WCAG 1.3.5), and `prefers-reduced-motion`. |
| Platform best practices | `tests/best-practices.spec.ts` | Playwright | `pnpm test:e2e` | Security headers from the Next.js `headers` guide, the nonce CSP (fresh nonce per request, nonce on every script, no violations on public routes), no `X-Powered-By`, the web app manifest, `lang`, charset, and meta description. |
| Lighthouse mobile budgets | `scripts/checks/check-lighthouse.mjs` | Lighthouse (default mobile profile) | `pnpm check:lighthouse` | Fails `/` or `/sign-in` below accessibility 95, best practices 90, SEO 90, performance 40 (a regression floor), CLS above 0.1, or a home LCP above 4 s. Reports go to `reports/lighthouse/`. |
| Accessibility | `tests/a11y.spec.ts`, titled `@a11y` | Playwright and axe-core | `pnpm test:a11y` | Automated WCAG 2.0, 2.1, and 2.2 A/AA scans (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) across desktop (`1280x800`) and mobile (`390x844`) viewports in light and dark mode. |
| Visual regression | `tests/visual.spec.ts`, titled `@visual` | Playwright screenshots (CI only) | `pnpm test:visual` | Layout and theme changes in rendered pages. |
| Firebase Auth and profile | `tests/firebase-auth.spec.ts` | Playwright with Firebase Auth, Firestore and Functions emulators | CI `auth-emulator` job | Sign-in, registration, recovery, profile, and authenticated axe checks, including the `recordUsage` callable guard. Not included in ordinary `verify:e2e`. |
| Sign-in allowlist | `functions/access-policy.test.cjs` | `node:test` | `pnpm test:logging` | Allowed and refused addresses, role claim, verified-email rule, fail-closed empty list, and the open emulator. The auth-emulator E2E runs with no list, so it exercises only the open path. |
| CSP profile photos | `src/lib/csp.test.ts` | Vitest | `pnpm test`, `pnpm verify:static` | `img-src` must list exactly `'self'`, `blob:`, `data:`, Firebase Storage, and Google account photos, plus the Storage emulator in development only. Removing one fails the test, so profile photos cannot silently stop loading. |
| Cloud Functions public surface | `functions/public-surface.test.cjs` | `node:test` | `pnpm test:logging`, `pnpm verify:static` | `functions/index.js` must not use `onRequest`: only callables and blocking triggers, which verify the caller. |
| Mutation | `stryker.config.json` | Stryker | `pnpm test:mutation` | Command-runner mutation testing. Manual CI run until a hosted-run success is confirmed; see [TOOLING.md](TOOLING.md#known-limitations). |

Choose the lightest layer that can fail for the right reason. Keep a behavior
in `jsdom` when a stub is enough, and move it to Browser Mode only when the real
browser matters (for example, `use-mobile.browser.test.tsx` uses a real viewport
instead of a stubbed `matchMedia`).

## Test placement and scope

The review regressions in `prompt-input.test.tsx` and `speech-input.test.tsx`
run in the existing unit project despite the registry's coverage exclusions.
They verify newer edits, attachment ownership, resource cleanup, and obsolete
async callbacks. Profile tests verify that session changes stop later writes.
The seed CLI tests use a child process and mocked fetch/environment-file loading
to assert actual exit status without contacting Firebase. Maintain these
behavioral assertions when changing related `_hooks`, `_components`, `_lib`,
or shared service code; do not replace them with source-text assertions.

- Place Vitest unit tests for functions, utilities, hooks, and business logic
  next to their source module with `*.test.ts`.
- Place React component and JSX integration tests next to their source module
  with `*.test.tsx`. Use `*.browser.test.tsx` for Browser Mode tests.
- Place Playwright specifications in root `tests/` with `*.spec.ts`. Keep E2E
  fixtures and helpers there only when they are E2E-specific and shared.
- Do not create empty test directories or placeholder tests. Do not create a
  global `unit/`, `components/`, or `integration/` directory, nor a
  `__tests__/` folder for every component.
- Preserve App Router organization: colocating a test does not make a route
  public, and `_components` and `_lib` remain suitable private locations.
- Do not write a test only to make a tool report success. When a tool has no
  suitable subject yet, leave it unused and say so.

Seven Vitest suites verify configuration rather than application behavior:
`src/messages/messages.test.ts` checks locale catalog keys and ICU arguments,
alongside the 6 rule-configuration suites (`.biome/rules/nextjs/rules.test.ts`,
`.biome/rules/dom/rules.test.ts`, `.biome/rules/nextjs/app-router-imports.test.ts`,
`.biome/rules/react/native-rules.test.ts`, `.biome/rules/complexity/native-rules.test.ts`,
and `.ast-grep/rules/react/hook-module-scope.test.ts`):
`.biome/rules/nextjs/rules.test.ts` and `.biome/rules/dom/rules.test.ts`
verify valid and invalid Grit fixtures.
`.biome/rules/nextjs/app-router-imports.test.ts` verifies the native App
Router import policy and exclusions.
`.biome/rules/react/native-rules.test.ts` verifies native React diagnostics,
allowed React 19 patterns, and explicit UI phase flags. The earlier
`prefer-is-error` Grit policy remains removed; use the project's named flags
when a component exposes loading, hidden, or error state.
`.biome/rules/complexity/native-rules.test.ts` verifies cognitive complexity,
function length, and callback nesting depth limits.
`.ast-grep/rules/react/hook-module-scope.test.ts` verifies private hook module
scope and path exclusions.
Semgrep rules are tested with `semgrep --test` (`pnpm check:security:rules`) and
ast-grep rules with `ast-grep test`.

Use Vitest with React Testing Library for synchronous units, components, and
integrations. Favor `getByRole` and other accessible queries. Test observable
behavior, not external-library internals; keep feature-specific mocks and
fixtures local until there is actual reuse. Use small snapshots only when their
output is the contract.

Use Playwright for browser journeys and asynchronous Server Components. Vitest
does not currently support async Server Components completely, so do not build
testing workarounds for them. Add MSW only when a shared network-mocking need
exists (ADR 0006).

At minimum, new tests should be deterministic, independent of external
services, and safe to run in CI. Mock network and clock dependencies where
needed. Do not store production credentials or personal data in test fixtures.

## Responsiveness testing and 2026 best practices

The repository enforces modern responsive web design standards and WCAG
accessibility requirements across three layers: static AST enforcement,
Vitest Browser Mode component tests, and Playwright end-to-end specifications.

### 1. Static responsiveness guard (`pnpm check:responsiveness`)

`scripts/checks/check-responsiveness.mjs` runs in `pnpm verify:fast` and `pnpm verify:static`
to catch responsive anti-patterns and accessibility regressions before runtime:

- **Viewport scalability (WCAG 1.4.4 Resize Text)**: The root layout (`src/app/layout.tsx`)
  must export a `viewport` configuration (or `generateViewport`) declaring
  `width: 'device-width'` and `initialScale: 1`. Disabling zoom via `userScalable: false`,
  `maximumScale: 1`, or string `user-scalable=no` is strictly prohibited.
- **Rigid pixel width prevention (WCAG 1.4.10 Reflow)**: Flags fixed pixel widths
  greater than 320px (`w-[...px]`, `min-w-[...px]`, or inline `style={{ width: ... }}`)
  when used without responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `@*`) or fluid
  wrappers (`max-w-full`, `max-w-screen`, `max-w-[100%]`).
- **Touch target minimums (WCAG 2.2 SC 2.5.8 Target Size)**: Flags interactive
  elements (`<button>`, `<a>`, `<Link>`, or elements with `role="button"` / `onClick`)
  with dimensions below 24x24px that lack hit-area padding (`p-2`, `p-[6px]`), explicit
  minimum constraints (`min-h-6 min-w-6`), or pseudo-element expanders (`after:-inset-2`).

### 2. Browser component testing (colocated `*.browser.test.tsx`)

Vitest Browser Mode executes tests in real headless Chromium via Playwright,
colocated alongside their respective UI components:

- **Tailwind CSS v4 Container Queries (`@container`)**: Tests components utilizing
  `@container`, `@xs:`, `@sm:`, and `@md:` variants (such as `card.browser.test.tsx`
  for `@container/card-header` and responsive metric grids) in a real layout engine that
  computes CSS container contexts accurately, which `jsdom` cannot replicate.
- **Breakpoint reflow**: Validates that components adapt smoothly when viewport
  dimensions shift between mobile (390px), tablet (768px), and desktop (1280px)
  (such as `button.browser.test.tsx` and `use-mobile.browser.test.tsx`).
- **Interactive touch targets**: Validates bounding box dimensions (`getBoundingClientRect()`)
  for interactive buttons and actions in rendered DOM trees (e.g. `button.browser.test.tsx`).

### 3. End-to-end responsiveness and reflow suite (`tests/responsive.spec.ts`)

Playwright verifies production builds across a representative viewport matrix:

| Viewport name | Dimensions | Focus |
| --- | --- | --- |
| `reflow-320` | 320x568 | WCAG 1.4.10 Reflow standard at 320 CSS pixels. Verifies horizontal overflow prevention (`scrollWidth <= clientWidth + 1`) and zero two-dimensional scrollbars. |
| `mobile-390` | 390x844 | Modern mobile device layout, vertical button stacking, touch target sizing, and fluid hero sections. |
| `tablet-768` | 768x1024 | Intermediate tablet viewport reflow and layout transitions. |
| `desktop-1280` | 1280x800 | Full desktop multi-column layouts, side-by-side action alignment, and wide content containers. |

- **Zero horizontal scrollbar**: Each route (`/`, `/sign-in`, `/register`) is verified
  to ensure content fits within the client viewport without horizontal overflow.
- **Touch target compliance**: Iterates over all interactive controls (`button`, `a`,
  `[role='button']`, `[role='link']`) to verify computed bounding boxes meet or exceed
  24x24px (with subpixel tolerance `>= 23.5px`).
- **Component reflow behavior**: Proves that interactive layouts (such as hero action
  links) stack vertically on small viewports and align horizontally on desktop viewports.

### 4. Accessibility across viewports (`tests/a11y.spec.ts`)

Axe scans run across both desktop (`1280x800`) and mobile (`390x844`) viewports in
light and dark color schemes, ensuring responsive layout adaptations and DOM
reordering do not introduce contrast, landmark, or accessibility violations.

## Visual regression workflow

Baselines are Linux screenshots, generated and compared in CI inside the pinned
Playwright container, so they never depend on your machine. Locally, the
`@visual` specs are skipped (set `PLAYWRIGHT_VISUAL=1` to run them anyway).

1. Open a pull request or push. The **End-to-end, accessibility and visual** job
   compares screenshots and uploads the `playwright-report` artifact; open it to
   see the expected, actual, and diff images.
2. If the change is not intentional, fix the code.
3. If it is intentional, run the **Update visual baselines** workflow (Actions
   tab, or `gh workflow run visual-baselines.yml --ref <branch>`), then download
   and review the images and commit them:

   ```bash
   gh run download <run-id> --name visual-baselines --dir tests/snapshots
   ```

Differences up to 1% of pixels are tolerated (`maxDiffPixelRatio` in
`playwright.config.ts`). Never update baselines just to silence a failure.

## Component workbench

Write a colocated `*.stories.tsx` next to a component to review it in isolation:

```bash
pnpm ladle         # serve the workbench
pnpm ladle:build   # production build in reports/ladle
```

`.ladle/components.tsx` uses `NextIntlClientProvider` with English messages,
plus the application's theme and tooltip providers. It imports `.ladle/ladle.css`,
which loads `src/app/globals.css`; the async application `IntlProvider` is not
used in the browser workbench.
Cover the variants and states a reviewer needs to see, not every prop.

## Coverage, complexity, and size

- `pnpm test:coverage` writes `coverage/`. It measures application code and
  leaves out the vendored `src/components/ui/*.tsx` and
  `src/components/ai-elements`; `src/components/ui/extensions` is measured.
- `vitest.config.mts` sets a coverage floor of 70% (statements, branches,
  functions, lines). Actual coverage comes from the latest run. Raise it as
  application code grows; never lower it to pass a run. `json-summary` feeds
  the CI step summary.
- `pnpm analyze:health` runs coverage and feeds it to Fallow so CRAP scores
  reflect real tests; `pnpm analyze:fallow` reuses an existing `coverage/`. Add a test before accepting a complex, untested function.
- `pnpm analyze:size` builds the app and fails when generated client JavaScript or
  CSS exceeds the gzip budgets in `.size-limit.json`. Raise a budget only with a
  reason in the pull request.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests, pushes to `main`, and manual
`workflow_dispatch`. Jobs run in parallel:

| Job | Runs | Local equivalent |
| --- | --- | --- |
| `static` | Biome 2.5, isolated Biome 2.6 plugin pilot, typecheck, coverage, architecture, Knip, jscpd, ast-grep, route/component/responsiveness guards, CSpell, markdownlint, Fallow, React Doctor | `pnpm verify:static` plus CI-only pilot |
| `build` | Vitest Browser Mode, production build with size budgets, Ladle production build | `pnpm verify:build` |
| `e2e` | Playwright functional, desktop and mobile (Pixel 7) projects, accessibility, and visual specs, then the Lighthouse mobile budgets, in the pinned Playwright container with a placeholder Firebase web config so the auth forms render | `pnpm verify:e2e && pnpm check:lighthouse` |
| `auth-emulator` | Local demo Firebase Auth, Firestore, and Functions; auth/profile Playwright E2E and authenticated axe checks | `pnpm test:auth` after `npm ci --prefix functions --ignore-scripts` (with emulator environment variables) |
| `security` | Semgrep rule tests and scan (`--error`), Gitleaks, actionlint, zizmor, `pnpm audit`, pre-commit | `pnpm verify:security` |
| `pr-title` | Conventional Commit PR title (pull requests only) | `echo "feat: title" \| pnpm exec commitlint` |
| `ci-result` | Aggregates all six jobs, including `auth-emulator`; any required failure blocks the PR | n/a |

Pull-request runs cancel superseded runs (including when the title is edited,
which re-runs the title check); pushes to `main` each get their own
concurrency group and are never cancelled. The
coverage report and the Playwright report and `test-results` are uploaded as
artifacts for seven days, with a separate auth-emulator Playwright report
when available. Coverage and job results are summarized on the run page. Run `pnpm check:workflows` after editing a workflow, and keep
actions and the Playwright container pinned by commit SHA or digest.

Dependabot opens weekly grouped updates for npm and GitHub Actions
(`.github/dependabot.yml`); review each one, there is no auto-merge. It does not
update the workflow container directly: the Docker mirror receives proposed
image updates, which must be copied into both workflows. Keep the image tag and
digest aligned with `@playwright/test` and regenerate baselines with the
`Update visual baselines` workflow.

### Adapting the tests in a generated project

Reusable checks: the Vitest and Playwright configs, axe scan, and
`tests/home.spec.ts` smoke tests for a successful `/` response, page landmarks,
configured locale cookies and safe new-tab links. These tests no longer depend
on the starter headline, document title or starter link labels. They are smoke
tests, not proof that each locale's translated UI text is correct; add
behavior-specific localization tests for the derived application, including
translated text and the document language. The current root layout fixes
`html lang` to `en`; the cookie smoke tests do not validate that attribute.

Template-specific fixtures: `home-*` visual baselines capture the starter
home page. Replace them after changing the UI, and regenerate reviewed
screenshots through the manual `Update visual baselines` workflow. If your
application removes the home page or its primary heading, adapt the smoke test
to your app rather than disabling E2E or automatically accepting new baselines.

### Firebase emulator regression coverage

The standalone `auth-emulator` job starts Auth, Firestore, and Functions in
an isolated `demo-test` project. It installs the Functions dependencies
from `functions/package-lock.json` with `npm ci --prefix functions` (the
separate, upstream Firebase Functions package). Browser Firebase SDK endpoints are explicit public
development configuration, not server secrets. The suite runs against `next dev`, which compiles a route on its first request, so a
`beforeAll` hook requests every route once before the tests; without it the first test to
reach a route intermittently exceeded the 30 s budget on 2 vCPU runners. The tests must establish a
ready authenticated profile before inspecting form fields, theme, locale, or
accessibility. A successful redirect or URL match alone does not prove the
profile rendered. Match selectors to the current visible and accessible
labels rather than guessing from old screenshots or component names.

**Resolved emulator setup issue (2026-10-23):** Run
[39970721905](https://github.com/ianmaciel7/shadcn-firebase-template/actions/runs/39970721905)
failed profile email, locale, and authenticated accessibility scenarios
because the Functions Emulator was missing while the protected guard awaited
the `recordUsage` callable. The Google popup scenario also required a retry.
After starting Auth, Firestore, and Functions together and installing the
Functions dependencies, run
[39973720187](https://github.com/ianmaciel7/shadcn-firebase-template/actions/runs/39973720187)
passed **all required CI jobs**. Preserve this three-emulator setup and
keep watching for intermittent popup/browser regressions; one passing run
does not establish the absence of flakiness.

### Automated accessibility limits

axe-core detects only a subset of WCAG failures. It does not verify keyboard
operation, focus order, screen-reader output, or content quality, so passing
scans do not mean WCAG compliance. Test those manually.

### Scheduled and manual checks

`.github/workflows/scheduled-quality.yml` runs Lighthouse weekly (Mondays
06:00 UTC); manual dispatch also starts the Stryker mutation job:

- `mutation`: **manual dispatch only** until its behavior is verified on a
  hosted runner; it fails below the `break` score in `stryker.config.json`
  and uploads the HTML report.
- `lighthouse`: builds and serves the app, then runs
  `pnpm analyze:lighthouse` and uploads the report. It is report-only: it
  fails only when the audit cannot run, because no score threshold is set.

Fallow and React Doctor already run in the `static` job. The Lighthouse job's
runner setup (Playwright Chromium with `--no-sandbox`) was verified locally but
not yet on a hosted runner; check the first scheduled run.

### Known limitations

- The `braces` advisory exception in `pnpm-workspace.yaml` is documented there;
  **every generated project must reassess it** against its own dependency tree.
  Remove the suppression when the affected dependency chain is no longer present.
- `pnpm check:security` must run inside a Git work tree; Semgrep stalls on
  Windows when the directory is not a repository.
- Dependabot cannot read workflow `container:` images or tool pins, so
  `.github/dependabot-mirror/` holds a Dockerfile and a `requirements.txt` that
  receive those bumps. Copy a Playwright image bump into `ci.yml` and
  `visual-baselines.yml` by hand. Gitleaks and actionlint versions stay manual.
- Firebase CD runs the `browser-checks` job (`pnpm verify:e2e` and
  `pnpm check:lighthouse`) and then `pnpm verify:fast` before a stable tag
  deploys Functions, security rules, and an App Hosting rollout. Configure its protected inputs as
  described in [Firebase continuous delivery](docs/firebase-cd.md); local and
  CI emulator suites remain isolated from production.
- On Windows, set `PYTHONUTF8=1` when running Semgrep locally, or it can exit
  with code 2 on an output encoding error.

## First-time setup

For browser authentication journeys, install the Firebase CLI and Chromium,
install the Functions dependencies with `npm --prefix functions ci`, then run
`pnpm test:auth`. This starts the Auth, Firestore, and Functions emulators with the local project
and settings configured in `.env` (such as `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
and `NEXT_PUBLIC_FIREBASE_PROJECT_ID=local-test`) and a development server on port 3100.
Ports 9099, 8080, 5001, and 3100 must be free. The auth test server receives
`NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST` (default `127.0.0.1:5001`) so
protected-screen and profile-save usage guards call the local Functions emulator.
Set that variable when using a custom Functions emulator endpoint.
The test configuration supplies non-production Web
SDK values; no Firebase account or production credentials are needed. This
suite is separate from the production-build Playwright suite and requires the
Firebase CLI on PATH. It tests the emulator, not actual Google consent or email
delivery. The production build's existing registry type errors remain a separate
validation failure.

Install the browser binaries once per environment:

```bash
pnpm exec playwright install chromium
```

Playwright starts the application itself (`pnpm build && pnpm start`), reusing a
server on port 3000 when one is already running outside CI.

## Pull request evidence

In the pull request description, state the commands run and the relevant
manual checks. Call out deliberately untested behavior, the reason it could
not be exercised, and any known baseline validation failure.

## shadcn/ui update verification

For a documentation refresh, use the documentation checks above and validate
the source inventory against the recorded upstream revision. Compare stated
configuration and commands with the local files and CLI help. A fetched source
inventory establishes documentation coverage, not a passing application build.

When component source changes, run `pnpm verify:fast`, `pnpm check:structure`,
and the relevant browser suites. Check label/control associations, invalid and
disabled states, focus entry and return, keyboard operation, and loading/error
feedback through accessible roles. Verify styled navigation remains a link,
submit and sign-out remain separate actions, and Base UI Select values reach
the form correctly. Inspect light/dark, responsive, long-text, and localized
states in Ladle or the application; visual baselines change only through the
existing reviewed workflow.

Do not infer accessibility from the component name, generated source, or an axe
pass alone. Use browser interaction checks for focus, portals, and keyboard
behavior. Add regression tests for changed application behavior, rather than
mirroring third-party implementation details.

## Compound component guard regression tests

`pnpm check:components` runs the naming/profile safety tests and the general
composition regression suite, then scans all owned components. New cases cover
valid named families in both directive-free and client-boundary modules, simple
components without invented parts, unrelated exports, static compound mutation,
renamed primitive imports and bindings, forwarded/rest props, extracted
children/className, type-only imports, and async Server Components. Async
client-component diagnostics belong to Biome's native
`noNextAsyncClientComponent`; the custom suite verifies that responsibility is
not duplicated. Keep valid counterexamples alongside rejected cases.

The [coverage contract](CODING_STANDARDS.md#composition-guard-coverage) records
what the guard can prove. It does not resolve arbitrary component anatomy or
transitive RSC imports; builds and behavior tests still validate those paths.

## Responsiveness guard regression tests

`pnpm check:responsiveness` executes `scripts/checks/check-responsiveness.test.mjs` before scanning
application files. The suite tests both valid implementations and rejected anti-patterns:

- **Path classifiers**: Confirms discrimination between owned application components, App
  Router entry points, and third-party vendor trees (`src/components/firebase`,
  `src/components/ai-elements`, and preinstalled `src/components/ui/*.tsx`).
- **Root layout viewport metadata (WCAG 1.4.4)**: Confirms valid static `viewport` exports
  and dynamic `generateViewport` functions with `width: 'device-width'` and `initialScale: 1`.
  Rejects missing viewport exports on root layout, invalid dimensions, and zoom restrictions
  (`userScalable: false`, `maximumScale: 1`, or meta string `user-scalable=no`).
- **Rigid pixel widths (WCAG 1.4.10)**: Verifies rejection of fixed pixel widths greater than
  320px in JSX classes, standalone string constants, and inline styles (`style={{ width: ... }}`)
  when lacking responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `@*`) or fluid wrappers
  (`max-w-full`). Allows widths `<= 320px` and fluid constraints.
- **Touch target minimums (WCAG 2.2 SC 2.5.8)**: Verifies rejection of interactive elements
  (`<button>`, `<a>`, `<Link>`, or `role="button"`) with dimensions below 24x24px lacking
  hit-area padding, minimum sizing, or pseudo-element touch expanders, while allowing child icons
  and non-interactive elements.

The [responsiveness standards](CODING_STANDARDS.md#responsive-design-and-layout-contracts) record
the enforced contracts and modern responsive practices.

## Next.js documentation and framework verification

For a complete documentation refresh, require non-truncated inventories for
both upstream `docs/` and `errors/`, pin source revisions, retrieve every body,
and verify Git blob hashes. Compare the installed stable version with the
current documentation before adopting changed APIs. Record failures explicitly;
a URL index or a successful Context7 query alone is not complete coverage.
See [the Next.js maintenance rule](.agents/rules/cache.md).

The App Router import policy uses native Biome diagnostics. Its colocated
configuration regression suite tests invalid imports, valid App Router APIs,
re-exports, each owned code area, UI extensions, and the vendor exclusion.
It runs in the existing `unit` project; `verify:fast` and CI already include it.
Next.js build remains responsible for its own RSC and rendering diagnostics.

For changes to request APIs, caching, metadata, or navigation, use a production
build and Playwright in addition to relevant unit tests. Verify request-specific
content, Suspense fallbacks, direct navigation, client navigation, back/forward
state, and mutation consistency. Test different users/locales when cache keys
could cross those boundaries. A development-only success or a mocked router
does not prove production prerendering or cache isolation.

Async Server Components remain E2E subjects; do not add jsdom rendering
workarounds for unsupported Vitest behavior. Server mutation/API introductions
need authorization and invalid-input tests at the new boundary. Cookie-based
translations and static `html lang` are separate contracts; a language-attribute
change must cover accessibility and Cache Components rendering behavior.

Local missing native bindings, blocked external lookups, and unavailable MCP
runtime sessions are environment limitations, not successful checks. Keep CI
requirements and coverage thresholds intact while reporting those limitations.

## React rules and lifecycle verification

Protected-route lifecycle tests must verify that a repeated Firebase Auth session
emission records route usage at most once per user and path and does not replace
visible content with a loading or telemetry-error state.

The native React configuration suite lives in
`.biome/rules/react/native-rules.test.ts`. It verifies blocking diagnostics for
hook order/dependencies, nested component identity, direct prop assignment,
and the existing ref convention using actual project configuration. Valid
counterparts include conditional React `use` and React 19 ref props. Owned
route/component/hook areas, UI extensions, and the new policies' registry
exclusions are exercised. Run it with the existing `unit` Vitest project.

For lifecycle changes, test user-visible state and owned resources across
setup, cleanup, replacement, and reveal. Use a Strict Mode wrapper when it can
expose missing cleanup; do not assert that an Effect or ref callback always
runs exactly once. Verify unsubscribe/release behavior and that obsolete async
results cannot overwrite the current user or resource. Activity and Suspense
can tear down Effects while preserving other state, so permanent unmount is
not the only cleanup case.

Keep real viewport/media/focus behavior in Browser Mode, and hydration,
framework navigation, async Server Components, and production cache behavior
in Playwright. RTL/hook tests and isolated Ladle renders do not reproduce the
entire Next.js renderer or prove Compiler optimization. Profile only with an
actual running app; do not infer performance gains from a memoization diff.

Prefer React Testing Library and supported `act` integration. If a manual
flush is needed, use `await act(async () => ...)` from `react`; do not introduce
`react-dom/test-utils` or deprecated `react-test-renderer` as a new test stack.
Avoid hiding act warnings with blanket suppression. Keep async user actions
awaited and make assertions after observable completion.

For a complete React reference refresh, inventory all Markdown/MDX beneath
`react.dev`'s content tree, retrieve every body at its pinned revision, and
verify blob hashes. The versioned runtime error catalog is a separate source
from the narrative error guides. Record source scope, installed API support,
and actual behavior-test results separately, following
[the React rules](.agents/rules/react.md).

## Integration naming regressions

`pnpm check:components` verifies browser/server integration suffixes, required
boundaries and presentation filenames without suffixes. Regression cases cover interactive UI
and form-context hooks without integration suffixes, browser storage, Firebase,
server requests, transitive helper imports, type-only imports, and composition
of integration children. Full source scans exercise the same classifier.
The naming rule documents syntax limits; Next.js still validates module graphs.

## Application logging validation

Logging changes need both the colocated Vitest guard/instrumentation tests and
`pnpm test:logging` for callable authentication, event
validation, and identity handling. Both `verify:fast` and `verify:static` include
this command, so the existing CI static job runs the callable tests. A production
Next.js build and a deployed Cloud Logging smoke test remain separate checks; mocked logger tests do not
prove provider ingestion or IAM configuration. Native SWC loading failures can
prevent Next.js type generation and leave `LayoutProps` unresolved in TypeScript;
report the environment failure rather than treating those checks as passed.

`pnpm check:app-hosting-auth-iam` statically validates the Terraform binding that permits the App Hosting runtime account to read Firebase Auth users for revocation-aware token verification. Its Node test fixtures cover the intended Viewer binding and reject both a missing binding and the broader Admin role. The check runs in `verify:fast` and `verify:static`; after an infrastructure apply, validate an authenticated protected route against the deployed service.

## Review finding regressions

The unit project resolves the `server-only` marker to Next.js's bundled empty server implementation for direct provider-contract tests. This alias applies only to unit tests; it does not relax production or browser import boundaries. The provider tests verify request-owned props and preservation of the global console.

AI Elements regressions exercise full-content token cache identity, asynchronous SDK schema conversion, pricing distribution, accessible names, shared primitive IDs and keyboard operation. Browser cases cover attachment focus visibility and Media Chrome activation without a second keyboard-event owner. Run these in the existing unit and browser projects; isolated Chromium checks do not replace Next.js production tests.

Cookie resolution is covered by `src/i18n/request.test.ts`: all supported
cookies load their catalogs, missing/invalid values fall back to English, and
explicit server translation overrides remain supported. Navigation tests keep
public paths unchanged without root-parameter or Proxy mocks. The ordinary home E2E verifies the language in the original server HTML and
requires exactly one root HTML element for each supported locale.

The cache regressions use installed Shiki with equal-length text whose beginning
and ending match but whose middle differs, including concurrent requests. Schema
regressions use real SDK conversion with a narrowly mocked code renderer; they
cover lazy, pending, rejected and obsolete results. Pricing tests use the real
installed catalog with fixed model cases, including cache writes and missing
uncached-token detail. This tests integration contracts without claiming every
library behavior is covered.

Browser tests count actual media request events for click, Enter and Space,
including seek offsets and disabled controls, and inspect attachment focus
visibility. A system Chromium executable was used through an uncommitted local
launch configuration; no machine-specific browser path is required by the
committed project config. Browser launch/server binding failures are environment
failures, not passed tests or reasons to remove cases.

Historical audit reports are not included in this checkout. Use the current
suite output and CI run as revision-specific evidence rather than importing
old report counts or unresolved-status claims.

## Failure-path mocks regressions

A mocked dependency must fail the way the real one does. Mocking an SDK
rejection with a bare `new Error("auth/...")` lets code that swallows every
error pass, because the test never carries the `code` the real SDK sets. Give
failure mocks the real error shape and cover both outcomes of any
classification: the expected rejection and an unexpected fault.
`src/lib/firebase/server.test.ts` does this for token verification: invalid
tokens map to "unauthenticated" and infrastructure faults (`app/*`,
`auth/internal-error`) must propagate, because reporting them as
unauthenticated makes the server redirect to sign-in while the signed-in
client bounces back, looping forever. This is a review-time judgement, not a
mechanical lint.

## Documentation integrity regressions

`pnpm check:docs` runs dependency-free Node regression tests and the current
repository link/inventory scan. Tests cover valid and missing files, local and
cross-file anchors, external URLs and code samples, a narrowly mapped historical
ADR link, and missing or obsolete skill-index entries. The command runs in
`verify:fast`, `verify:static`, and manual **Review Validation**. That workflow
checks the current checkout and no longer assumes 1214 archived audit reports.

## Private hook support placement regressions

`pnpm check:structure` runs the `no-module-support-in-hooks-ts` and `-tsx`
ast-grep fixtures. Negative cases cover ordinary/exported functions, arrow and
function-expression helpers, constants, context objects, destructuring, mixed
hook/helper declarations and non-function values disguised with a hook name.
Positive cases retain imports, types, direct hook declarations and callbacks or
constants inside hook bodies.

`.ast-grep/rules/react/hook-module-scope.test.ts` invokes the installed ast-grep executable
on temporary source trees. It verifies root and nested private hook directories
are scanned while `_lib`, shared/vendor directories and test/spec/story files
are excluded. It runs in the existing unit project without adding a scanner or
changing CI entry points. `profile/_lib/avatar.test.ts` preserves preview priority,
missing-photo behavior, versioned URL query parameters and upload limits after
extracting the support declarations. Existing profile component tests exercise
the same context singleton from its `_lib` owner.

## Function complexity and orchestration regressions

`.biome/rules/complexity/native-rules.test.ts` runs the installed Biome CLI against
the actual project config. Tests verify inclusive cognitive 8, body length 40 and
callback depth 2 limits, the immediately failing value for each, ignored blank
lines, TS/TSX functions, owned hooks, route `_lib`, shared modules and UI extensions.
Test/spec/story and copied registry exclusions are checked separately. Passing
with `--only` is not equivalent: that flag enables selected rules even where
normal configuration disables them, so these regressions use normal lint rules.

Auth-provider tests cover initialization errors, first-session loading, safe
post-auth redirects, locale updates without resubscribing, and cleanup ignoring
late callbacks. Auth gate regressions preserve the single redirect, the pending
sign-out, subscription cleanup, and account-switch remounting. Profile defaults
tests cover stored/default preferences, lifecycle cancellation and a changed user;
profile save tests keep session rechecks after every asynchronous write boundary.
Home component tests preserve signed-in/out presentation after composing smaller
header/logo parts. Budgets supplement these behavior tests rather than replacing
them with assertions about implementation call counts.

Do not run source-wide scans while configuration regression tests have temporary
invalid fixtures inside `src/`. Finish the unit process and its cleanup before
running Biome, ast-grep, dependency or component scans against the source tree.

The native complexity regression locations explicitly include every current hook
directory: shared hooks, root App Router hooks, protected and profile hooks, public
hooks, and the sign-in, register and forgot-password hook directories. The
configured `src/**` scope also covers future owned directories and support modules.
After hook changes, finish with a full source scan after fixture cleanup; checking
one orchestrator or only staged files does not verify the rest of the hook tree.
