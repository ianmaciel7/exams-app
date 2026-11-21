# Testing

## Validation commands

Run the checks relevant to a change before opening a pull request. See
[TOOLING.md](TOOLING.md) for every command and the tools behind them.

| Command | Use it for |
| --- | --- |
| `pnpm verify:fast` | Code changes: Biome CI, typecheck, and unit tests. Browser suites run separately. |
| `pnpm verify:full` | Before a pull request: `verify:static` (adds coverage thresholds, architecture, unused code, duplication, spelling, Markdown, complexity, React diagnostics) plus `verify:build` (browser tests, production build with size budgets, Ladle build). |
| `pnpm verify:e2e` | Changes that affect pages or visual output: functional, accessibility, and visual Playwright specs. |
| `pnpm verify:security` | Dependency or configuration changes: Semgrep rule tests and scan, Gitleaks, workflow lint, and `pnpm audit`. Needs the host tools in [TOOLING.md](TOOLING.md#host-prerequisites). |

For documentation-only changes, run `pnpm check:markdown` and
`pnpm check:spelling`, then verify relative links, referenced paths, and
commands against the repository. These checks do not replace CI; the pull
request still runs the configured jobs. Markdown lint intentionally excludes
agent files and ADRs 0001–0005, so review those manually when applicable.

`pnpm verify:fast` must stay fast. It runs only the `unit` Vitest project; browser,
end-to-end, visual, and mutation tests are deliberately outside it.

For a manual smoke test, run `pnpm dev` and verify the affected route in a
browser, including its loading, error, and localized states where applicable.

## Test layers

| Layer | Location and name | Runner | Command | Use for |
| --- | --- | --- | --- | --- |
| Unit and hook | `src/**/*.test.ts(x)` next to the source | Vitest `unit` project, `jsdom` | `pnpm test` | Functions, utilities, hooks, and business logic. |
| Property-based | Inside unit tests, with `fast-check` | Vitest `unit` | `pnpm test` | Pure logic with a large input space, such as `isLocale`. |
| Browser component | `src/**/*.browser.test.tsx` | Vitest `browser` project, Chromium | `pnpm test:browser` | Behavior that needs a real browser: viewport and media queries, focus, real events. |
| End-to-end | `tests/*.spec.ts` | Playwright | `pnpm test:e2e` | User journeys against a production build. |
| Accessibility | `tests/a11y.spec.ts`, titled `@a11y` | Playwright and axe-core | `pnpm test:a11y` | Automated WCAG 2.0, 2.1, and 2.2 A/AA scans (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) in light and dark mode. |
| Visual regression | `tests/visual.spec.ts`, titled `@visual` | Playwright screenshots (CI only) | `pnpm test:visual` | Layout and theme changes in rendered pages. |
| Mutation | `stryker.config.json` | Stryker | `pnpm test:mutation` | Command-runner mutation testing. Manual CI run until a hosted-run success is confirmed; see [TOOLING.md](TOOLING.md#known-limitations). |

Choose the lightest layer that can fail for the right reason. Keep a behavior
in `jsdom` when a stub is enough, and move it to Browser Mode only when the real
browser matters (for example, `use-mobile.browser.test.tsx` uses a real viewport
instead of a stubbed `matchMedia`).

## Test placement and scope

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

Three Vitest suites verify configuration rather than application behavior:
`src/messages/messages.test.ts` checks that every locale catalog has the same
keys and ICU arguments as the default locale and no empty messages, and
`.biome/rules/nextjs/rules.test.ts` and `.biome/rules/dom/rules.test.ts` lint
fixtures to prove each Grit rule reports invalid code and accepts valid code.
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
   gh run download <run-id> --name visual-baselines --dir tests/visual.spec.ts-snapshots
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
| `static` | Biome, typecheck, unit tests with coverage thresholds, architecture, Knip, jscpd, ast-grep, CSpell, markdownlint, Fallow, React Doctor | `pnpm verify:static` |
| `build` | Vitest Browser Mode, production build with size budgets, Ladle production build | `pnpm verify:build` |
| `e2e` | Playwright functional, accessibility, and visual specs in the pinned Playwright container | `pnpm verify:e2e` |
| `security` | Semgrep rule tests and scan (`--error`), Gitleaks, actionlint, zizmor, `pnpm audit`, pre-commit | `pnpm verify:security` |
| `pr-title` | Conventional Commit PR title (pull requests only) | `echo "feat: title" \| pnpm exec commitlint` |
| `ci-result` | Aggregates the jobs above; use it as the single required status check | n/a |

Pull-request runs cancel superseded runs (including when the title is edited,
which re-runs the title check); pushes to `main` each get their own
concurrency group and are never cancelled. The
coverage report and the Playwright report and `test-results` are uploaded as
artifacts for seven days, and coverage plus the job results are summarized on
the run page. Run `pnpm check:workflows` after editing a workflow, and keep
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
  `pnpm analyze:lighthouse:ci` and uploads the report. It is report-only: it
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
- Deployment is intentionally absent; add provider-specific CD in the derived
  project.
- On Windows, set `PYTHONUTF8=1` when running Semgrep locally, or it can exit
  with code 2 on an output encoding error.

## First-time setup

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
