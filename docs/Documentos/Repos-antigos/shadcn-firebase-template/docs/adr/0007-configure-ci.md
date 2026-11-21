# ADR 0007: Configure CI

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

The template requires a comprehensive, reproducible code quality and continuous
integration (CI) architecture that operates seamlessly across both ultra-fast
local feedback loops (developer workstation, lint-staged, Husky) and remote
cloud orchestration (GitHub Actions). This architecture must function
immediately after "Use this template" without dependencies on paid external
services, third-party SaaS accounts, or secret tokens.

The existing project adopts strict TypeScript, Biome with project GritQL rules,
Vitest with React Testing Library, and Playwright. ADR 0006 establishes test
placement, multi-project execution, coverage floors, and explicitly defers
Mock Service Worker (MSW) until a shared HTTP-mocking need is demonstrated.
Those decisions remain in force.

To maintain long-term code health, maintainability, determinism, and security
across both local development and remote pipelines, the toolchain must address:
code complexity, React architectural anti-patterns, component visualization in
isolation, structural patterns, sensitive data exposure, GitHub Actions workflow
security and syntax validity, reproducible containerized visual regressions, and
aggregation of distributed parallel CI jobs into a single required status check
for branch protection.

## Decision

1. **Package manager and runtime**:
   - Pnpm is the sole JavaScript package manager (pinned to `pnpm@12.11.2` via
     `packageManager` in `package.json`).
   - Supported Node.js runtimes are Node 22 LTS and Node 24 (engines range
     `^22.19.0 || ^24.5.0` in `package.json`; CI pipelines run on Node 22 LTS).
   - All verification scripts and CI pipelines enforce deterministic installs
     via frozen-lockfile installs (`pnpm install --frozen-lockfile`).

2. **Biome as primary linter and formatter**:
   - Retain Biome as the sole formatter and primary linter. Do not add ESLint or
     Prettier.
   - Enforce existing Next.js, React, import-organization, and accessibility rules.
   - Deprecated DOM APIs (`document.write`, `document.writeln`,
     `window.document.write`, and `window.document.writeln`) are strictly banned
     via custom GritQL rule `.biome/rules/dom/no-document-write.grit` tested in
     Vitest (`.biome/rules/dom/rules.test.ts`), with secondary protection in
     Semgrep (`no-unsafe-html-sinks`).

3. **Specialized local analysis and quality tooling**:
   - **Knip** (`knip.jsonc`): detects unused files, unused exports, and unlisted or
     orphaned dependencies (`pnpm check:unused`).
   - **dependency-cruiser** (`.dependency-cruiser.cjs`): validates architectural
     boundaries, module visibility rules, and bans dependency cycles (`pnpm check:architecture`).
   - **jscpd** (`.jscpd.json`): detects meaningful copy-paste duplication across
     source code (`pnpm check:duplicates`).
   - **CSpell** (`cspell.json`) and **markdownlint-cli2** (`.markdownlint-cli2.jsonc`):
     maintain spelling integrity and Markdown formatting standards (`pnpm check:spelling`,
     `pnpm check:markdown`).
   - **Fallow** (`.fallowrc.json`): analyzes codebase complexity, cyclomatic
     complexity, CRAP scores (Change Risk Anti-Patterns, correlating complexity
     with unit coverage from `coverage/coverage-final.json`), and Git hotspots
     (`pnpm analyze:fallow`, `pnpm analyze:health`). Excludes `.ladle/**`,
     `**/*.stories.tsx`, and vendored `src/components/ui/*.tsx` and
     `src/components/ai-elements/**`.
   - **React Doctor** (`doctor.config.json`): performs AST-level static diagnostics
     on React code, identifying performance anti-patterns, hook dependencies, and
     correctness issues (`pnpm analyze:react`), invoked with
     `--no-score --no-telemetry --no-supply-chain`. Ignores vendored UI components,
     `.next/`, `coverage/`, and `reports/`.
   - **Workflow linting** (`check:workflows`): runs **actionlint** to validate
     GitHub Actions workflow syntax and expressions, and **zizmor** to perform
     static security audits on `.github/workflows`, identifying privilege
     escalation, expression injection, and secret leakage.
   - **Security scanning**: **Semgrep** for custom AST security rules
     (`pnpm check:security`), **Gitleaks** (`gitleaks git --no-banner --redact`)
     for secret detection in commit history (`pnpm check:secrets`), and **pnpm audit**
     for dependency vulnerability scanning (`pnpm audit`).
   - **Bundle and performance analysis**: Size Limit (`.size-limit.json`) fails builds
     when JS/CSS budgets are exceeded (`pnpm analyze:size`), and Lighthouse audits
     performance and accessibility (`pnpm analyze:lighthouse`, `pnpm analyze:lighthouse:ci`).

4. **UI component workbench (Ladle)**:
   - **Ladle** (`.ladle/`): provides a lightweight, fast, Vite-powered component
     workbench as a Storybook alternative (`pnpm ladle`, `pnpm ladle:build`).
   - Renders `src/**/*.stories.tsx` files inside isolated preview containers
     configured in `.ladle/components.tsx` with application providers
     (`ThemeProvider`, `TooltipProvider`, `NextIntlClientProvider`) and
     `.ladle/ladle.css`.
   - Output builds to `reports/ladle/` and production artifacts are verified in
     `verify:build` alongside Size Limit budgets.

5. **Custom rule catalog**:
   Where native Biome rules, TypeScript compiler diagnostics, or specialized tools
   do not cover architectural conventions, custom rules are implemented and
   maintained:
   - **GritQL DOM rule** (executed by Biome plugin, tested in `.biome/rules/dom/rules.test.ts`):
     - `no-document-write` (`.biome/rules/dom/no-document-write.grit`): `error`;
       bans deprecated and unsafe `document.write` and `document.writeln` calls.
   - **GritQL Next.js rules** (executed by Biome plugin, tested in `.biome/rules/nextjs/rules.test.ts`):
     - `prefer-page-props` (`.biome/rules/nextjs/prefer-page-props.grit`): `error`;
       enforces Next.js generated `PageProps<"/route">` helper instead of manual
       `params` type definitions on page components.
     - `prefer-layout-props` (`.biome/rules/nextjs/prefer-layout-props.grit`): `error`;
       enforces Next.js generated `LayoutProps<"/route">` helper instead of manual
       `{ children: ReactNode }` on layout components.
     - `prefer-route-context` (`.biome/rules/nextjs/prefer-route-context.grit`): `error`;
       enforces Next.js generated `RouteContext<"/route">` helper instead of manual
       `params` on Route Handlers (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - **ast-grep structural and review rules** (`sgconfig.yml`, tested via `ast-grep test` against `.ast-grep/rule-tests/` snapshots):
     - 18 rules across domain categories under `.ast-grep/rules/`:
       - `components/`: `require-button-props`, `require-component-props`, `require-component-props-parameter`.
       - `firebase/`: `no-direct-auth-current-user` (restricts direct `auth.currentUser` access in favor of `getSessionUser()`).
       - `forms/`: `require-field-data-invalid`, `require-form-provider`.
       - `i18n/`: `no-hardcoded-ui-attribute` (flags hardcoded user-facing attribute text).
       - `nextjs/`: `no-client-route-entrypoint`, `no-route-jsx-event-handlers`, `review-route-special-files-logic`, `review-route-test-sdk-mock`.
       - `react/`: `no-manual-memoization-ts`, `no-manual-memoization-tsx`, `no-module-support-in-hooks-ts`, `no-module-support-in-hooks-tsx`, `review-effect-custom-hook`, `review-redundant-state-effect`, `review-stateful-component-hook`.
       - `styling/`: `no-dynamic-tailwind-class` (flags dynamic class string template concatenation).
   - **Semgrep security rules** (`tests/semgrep/rules.yml`, tested against `tests/semgrep/rules.tsx` via `pnpm check:security:rules`):
     1. `no-process-env-in-client-components`: `ERROR`; prevents referencing `process.env`
        in `"use client"` modules unless prefixed with `NEXT_PUBLIC_` or `NODE_ENV`.
     2. `no-dynamic-code-execution`: `ERROR`; prevents `eval`, `window.eval`,
        `new Function`, and string-based timers (`setTimeout("...", ...)`).
     3. `no-unsafe-html-sinks`: `ERROR`; prevents direct assignment to `innerHTML`,
        `outerHTML`, `insertAdjacentHTML`, and `document.write`/`document.writeln`.
     4. `no-dangerously-set-inner-html`: `ERROR`; restricts raw HTML injection via
        `dangerouslySetInnerHTML` outside reviewed vendored UI components.
     5. `no-secret-in-public-env`: `ERROR`; blocks sensitive keywords (secret, password,
        passkey, token, private) inside public `NEXT_PUBLIC_` environment variables.
     6. `no-server-only-in-client-components`: `ERROR`; forbids importing `server-only`
        within Client Components.
     7. `no-server-api-in-client-components`: `ERROR`; forbids importing `next/headers`
        within Client Components.
     8. `session-cookie-must-be-http-only`: `ERROR`; enforces `httpOnly: true` and
        `secure: true` flags on session, token, or authentication cookies.
     9. `no-ignored-build-errors`: `ERROR`; forbids setting `typescript.ignoreBuildErrors: true`
        in Next.js configurations or code.

6. **Git hooks, Windows mitigations, and pre-commit fallback**:
   - **Husky** (`.husky/`): owns Git hook lifecycle execution.
   - **lint-staged**: runs `biome check --write --no-errors-on-unmatched` on staged
     files during pre-commit.
   - **Commitlint**: validates commit messages against Conventional Commits via
     `commit-msg` hook (`@commitlint/cli` and `@commitlint/config-conventional`).
   - **Windows path mitigation**: on Windows environments, `.husky/pre-commit` sets
     `export VIRTUALENV_OVERRIDE_APP_DATA="${VIRTUALENV_OVERRIDE_APP_DATA:-$HOME/.virtualenv-cache}"`
     to bypass MAX_PATH length limitations (`WinError 206`) when Python is
     installed via the Microsoft Store or AppData directories.
   - **Graceful bypass for `pre-commit`**: `pre-commit` is treated as an optional
     host tool for local file integrity. `.husky/pre-commit` verifies its presence
     (`if command -v pre-commit >/dev/null 2>&1; then pre-commit run --hook-stage pre-commit; else ... fi`).
     If not installed, it emits a non-fatal warning and continues, ensuring commits
     are never blocked on contributor machines. Strict repository-integrity checks
     are guaranteed in CI.
   - Line endings are strictly normalized to LF via `.gitattributes` to guarantee
     uniform tool behavior across Windows, macOS, and Linux.

7. **Layered verification script architecture in `package.json`**:
   Project verification is organized into focused, layered commands:
   - `verify:fast`: `pnpm lint:ci && pnpm typecheck && pnpm test` — rapid loop
     checking Biome CI, TypeScript compilation, and fast unit tests (seconds).
   - `verify:static`: `pnpm lint:ci && pnpm typecheck && pnpm test:coverage && pnpm check:architecture && pnpm check:unused && pnpm check:duplicates && pnpm check:structure && pnpm check:spelling && pnpm check:markdown && pnpm analyze:fallow && pnpm analyze:react` — comprehensive static analysis, code coverage thresholds (70%), architectural boundaries, complexity, and React health. Maps to CI `static` job.
   - `verify:build`: `pnpm test:browser && pnpm analyze:size && pnpm ladle:build` —
     runs Vitest Browser Mode in real Chromium, verifies production Next.js build
     against Size Limit budgets, and validates the Ladle production build. Maps to CI `build` job.
   - `verify:security`: `pnpm check:security:rules && pnpm check:security && pnpm check:secrets && pnpm check:workflows && pnpm audit` —
     Semgrep security rules and scan, Gitleaks history scan, actionlint/zizmor
     workflow linting, and dependency audit. Maps to CI `security` job.
   - `verify:full`: `pnpm verify:static && pnpm verify:build` — full local
     verification combining static analysis and build/browser tests prior to pull requests.
   - Complementary commands: `verify:e2e` (`playwright test`) executes full E2E,
     accessibility, and visual regression suites. Maps to CI `e2e` job.

8. **Workflows and trigger topology in GitHub Actions**:
   Continuous integration is orchestrated across three dedicated workflows:
   - `ci.yml`: triggers on pull requests (`opened`, `synchronize`, `reopened`, `edited`),
     pushes to `main`, and manual dispatch (`workflow_dispatch`).
   - `visual-baselines.yml`: manual-only workflow (`workflow_dispatch`) to regenerate
     and publish Linux visual baselines inside the pinned container.
   - `scheduled-quality.yml`: scheduled weekly on Mondays at 06:00 UTC (`cron: "0 6 * * 1"`)
     and manually dispatchable. The weekly cron schedule executes only the `lighthouse`
     job. The `mutation` job (Stryker) is strictly gated on manual dispatch
     (`if: ${{ github.event_name == 'workflow_dispatch' }}`) to avoid recurring
     heavy compute overhead on derived repositories until hosted performance is validated.
   Deployment workflows remain out of scope for the template; derived projects
   add their own provider-specific CD.

9. **Standardized runner environment and parallel CI jobs**:
   Pipelines run on `ubuntu-latest` with standardized runtimes:
   - Node 22 LTS (`actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`)
     with pnpm store caching (`cache: pnpm`).
   - Pnpm installed via `pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0`.
   - Python 3.13 (`actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0`)
     in the `security` job.
   - In `ci.yml`, execution is split into specialized, parallel jobs:
     - `static`: runs `pnpm verify:static` with `fetch-depth: 0` for Fallow Git
       hotspot analysis, appends a unit coverage summary table to `$GITHUB_STEP_SUMMARY`,
       and uploads `coverage/` as an artifact (7-day retention).
     - `build`: installs system Chromium via `pnpm exec playwright install --with-deps chromium`,
       then runs `pnpm verify:build` (Vitest Browser Mode in real Chromium, Next.js
       production build with Size Limit budgets, and Ladle production build).
     - `e2e`: runs `pnpm verify:e2e` (Playwright functional journeys, axe-core
       accessibility audits, and visual screenshot comparisons) inside the pinned
       container (`mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf`).
       Uploads `playwright-report/` and `test-results/` artifacts (7-day retention).
     - `pr-title`: validates pull request titles against Conventional Commits using
       Commitlint (`echo "$PR_TITLE" | pnpm exec commitlint`). Runs only on
       `pull_request` events, passing the title safely via the `PR_TITLE` environment
       variable rather than inline script interpolation to prevent command injection.
     - `security`: checks out full history (`fetch-depth: 0`), installs pinned Python
       tools via `pip install -r .github/dependabot-mirror/ci-python/requirements.txt`,
       installs Gitleaks and actionlint with SHA-256 verification, and executes:
       Semgrep rule tests (`check:security:rules`), Semgrep AST scan (`check:security`),
       Gitleaks secret scan (`check:secrets`), workflow linting with actionlint and
       zizmor (`check:workflows` with read-only `GH_TOKEN`), dependency audit (`pnpm audit`),
       and repository-integrity hooks (`pre-commit run --all-files`).
     - `ci-result`: aggregates all preceding jobs into a single required status check.

10. **CI security hardening and version management**:
    - Least privilege: top-level `permissions: { contents: read }` across all workflows.
    - Action pinning: third-party GitHub Actions are pinned by immutable 40-character
      commit SHAs with version comments.
    - Token protection and Git hook isolation: `persist-credentials: false` on checkouts
      and `HUSKY: "0"` in the runner environment.
    - Binary verification: Gitleaks (`v8.30.1`) and actionlint (`v1.7.12`) are downloaded
      and verified against hardcoded SHA-256 checksums before execution.
    - Python dependencies: security tools (`semgrep==1.178.0`, `zizmor==1.31.1`,
      `pre-commit==4.6.2`) are mirrored in `.github/dependabot-mirror/ci-python/requirements.txt`
      and installed via `pip install -r`, allowing Dependabot to manage version updates.
    - Ecosystem updates: Dependabot tracks npm packages, GitHub Actions, Docker images,
      and Python dependencies without auto-merge.

11. **Status aggregation logic (`ci-result`)**:
    - Configured with `if: ${{ always() }}` and `needs: [static, build, e2e, security, pr-title]`.
    - Ingests the JSON status matrix via `NEEDS: ${{ toJSON(needs) }}`.
    - Renders a markdown table of job results to `$GITHUB_STEP_SUMMARY`:

      ```bash
      {
        echo "### CI result"
        echo
        echo "| Job | Result |"
        echo "| --- | --- |"
        echo "$NEEDS" | jq -r 'to_entries[] | "| \(.key) | \(.value.result) |"'
      } >> "$GITHUB_STEP_SUMMARY"
      ```

    - Enforces overall pass/fail status using `jq -e`:

      ```bash
      echo "$NEEDS" | jq -e 'to_entries | all(.value.result == "success" or (.key == "pr-title" and .value.result == "skipped"))' > /dev/null
      ```

    - Correctly treats `skipped` for `pr-title` as valid during pushes to `main` and
      manual runs (where no PR title exists), while requiring every other job to be
      `success`. Any job failure, cancellation, or unexpected skip fails `ci-result`.

12. **Lighthouse runner choreography in CI**:
    The `lighthouse` job in `scheduled-quality.yml` uses an automated lifecycle:
    - Resolves the Playwright-installed Chromium path:
      `CHROME_PATH="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")"`
      and exports `CHROME_PATH`.
    - Starts the Next.js production server in the background, redirecting stdout
      and stderr: `pnpm start > "$RUNNER_TEMP/next.log" 2>&1 &` and saving `server_pid=$!`.
    - Registers a shell trap to guarantee cleanup: `trap 'kill "$server_pid" 2>/dev/null || true' EXIT`.
    - Polls readiness: executes up to 30 attempts with `sleep 2` testing
      `curl -sf -o /dev/null http://127.0.0.1:3000` before continuing.
    - Runs `pnpm analyze:lighthouse:ci` (`--headless --no-sandbox`), outputting
      `reports/lighthouse/report.html`.
    - On audit failure, dumps `$RUNNER_TEMP/next.log` to console.
    - Uploads `reports/lighthouse/` as artifact `lighthouse-report` (7-day retention).

13. **Concurrency and visual determinism**:
    - Pull-request runs share a concurrency group per ref and cancel superseded runs
      (`cancel-in-progress: ${{ github.event_name == 'pull_request' }}`). Pushes to
      `main` each receive an independent group keyed by commit SHA and are never cancelled.
    - Visual baselines are pinned to the Linux Playwright Docker image tag and digest.
      `visual-baselines.yml` is never cancelled mid-run.

14. **Governance, agent integrations, and deferred tooling**:
    - Agent integrations: add only Serena and Next.js DevTools MCP servers through
      `.agents/agents.json`. Do not approve third-party build scripts or unrequested
      agent skills.
    - MSW (Mock Service Worker): deferred per ADR 0006 until a demonstrated
      HTTP-mocking requirement emerges across suites.
    - Ephemeral artifacts: generated reports (`reports/`), coverage (`coverage/`),
      Ladle builds, and temporary analysis artifacts remain ignored in `.gitignore`.

## Main branch merge policy

The following policy extends this decision; it is a desired GitHub repository
configuration, not evidence that the remote settings are already enforced.
Repository administrators must configure and periodically verify it:

- Require changes to `main` to arrive through a pull request. Block direct
  pushes, force pushes, and branch deletion; do not grant routine bypasses,
  including to administrators or automation.
- Allow only squash merges into `main`. Configure the ruleset's allowed merge
  method accordingly, or disable merge commits and rebase merging in repository
  settings while retaining squash merging. Linear history alone is insufficient
  because it also permits rebase merging.
- Require the GitHub Actions check **CI result** (`ci-result`) to pass, and
  require the branch to be up to date with `main` before merging. Select GitHub
  Actions as the expected check source when available. The aggregate depends on
  static, build, end-to-end, security, and pull request title jobs; investigate
  failures and do not bypass a missing or failing check.
- Require review by at least one other contributor when an independent reviewer
  is available, dismiss stale approvals on new commits, and resolve review
  conversations before merging. A solo repository needs another eligible
  reviewer before enabling mandatory approvals; do not represent self-review
  as independent review.
- Use the Conventional Commit pull request title as the default squash commit
  title, and verify the final title before merging. GitHub permits editing that
  message, so the pull request title check alone cannot enforce the final text.
- Protect changes to workflows and branch rules with appropriate repository
  permissions and review. Keep exceptions exceptional, documented, and limited
  to authorized maintainers.

Ruleset availability depends on repository visibility and GitHub plan. If the
required protection is unavailable, the policy remains a manual convention,
not an enforced gate. Confirm the actual rules and merge settings in GitHub
before relying on them. If a merge queue is introduced, add and validate the
`merge_group` workflow trigger before requiring CI in the queue.

See [GitHub's ruleset documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
and [protected branch documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Consequences

- **Positive**:
  - Fast local feedback via `verify:fast` with deep static, architectural, security,
    and build verifications layered progressively.
  - Comprehensive custom rule suite catches domain-specific bugs (Next.js props,
    Tailwind dynamic classes, XSS/cookie security) without introducing ESLint.
  - Fallow and React Doctor provide visibility into maintainability, cyclomatic
    complexity, CRAP scores, and React component performance.
  - Ladle offers isolated component development without the heavy footprint of
    Storybook.
  - Git hooks are resilient cross-platform: Windows path issues are mitigated and
    missing optional host tools fail gracefully without blocking commits.
  - Parity between local quality gates and CI ensures pull requests are thoroughly
    validated before merge.
  - Parallel jobs keep CI feedback within minutes while isolating dependencies and
    container environments.
  - Branch protection requires only a single status check (`ci-result`), which
    transparently surfaces failure summaries in `$GITHUB_STEP_SUMMARY`.
  - Python tool dependencies are maintainable and automated via Dependabot
    requirements mirroring.
  - No secrets or paid third-party accounts are required; the template operates
    fully on free GitHub Actions resources.
- **Negative / Trade-offs**:
  - Additional analysis tools (Semgrep, Gitleaks, actionlint, zizmor) require host
    prerequisites for local execution (though fully automated in CI).
  - Deep analysis (`verify:full`, `verify:static`) takes several minutes and is
    reserved for pre-PR checkpoints rather than every commit.
  - Complex custom rule sets require maintenance and regression testing
    (`.biome/rules/**/*.test.ts`, `.ast-grep/rule-tests/`, `tests/semgrep/rules.tsx`).
  - Both `build` and `lighthouse` jobs incur runner overhead installing Chromium
    dependencies (`playwright install --with-deps chromium`).
  - Dependabot cannot update workflow container digests directly; updates to
    `.github/dependabot-mirror/` must be manually reflected into `ci.yml` and
    `visual-baselines.yml`.
  - Stryker mutation testing remains an on-demand manual workflow due to extensive
    execution time (~10-40 minutes).

## Alternatives considered

- Add ESLint and Prettier: rejected because Biome already owns overlapping
  linting, formatting, and import organization with far superior performance.
- Adopt ESLint with `@typescript-eslint` and `eslint-plugin-deprecation` for
  DOM API deprecations: rejected because it violates ADR 0005 and ADR 0007,
  duplicates Biome responsibilities, and introduces substantial performance
  overhead. Native Biome GritQL enforces this at sub-millisecond speeds in
  `lint-staged` and CI, whereas `tsc --noEmit` omits suggestion diagnostics
  (`TS6387`), and Semgrep serves as a secondary CI safety net.
- Install Storybook: rejected in favor of Ladle due to Ladle's instant Vite-native
  startup, minimal configuration, and lightweight bundle footprint.
- Block local commits when `pre-commit` is missing: rejected to avoid onboarding
  friction for contributors without Python environments; CI acts as the definitive gate.
- Monolithic single-job CI: rejected due to excessive runtime, lack of job-level
  concurrency, and inability to isolate the containerized Playwright environment.
- Using `pull_request_target`: rejected due to security risks regarding untrusted
  code execution and secret leakage.
- Paid CI or quality SaaS integrations: rejected to keep the template 100% free,
  self-contained, and vendor-neutral.
- Early adoption of Mock Service Worker (MSW): rejected / deferred per ADR 0006
  until shared HTTP-mocking needs are demonstrated across tests.

## References

- [Next.js TypeScript](https://nextjs.org/docs/app/api-reference/config/typescript)
- [Biome configuration](https://biomejs.dev/reference/configuration/)
- [ast-grep documentation](https://ast-grep.github.io/)
- [Semgrep documentation](https://semgrep.dev/docs/)
- [Fallow complexity and CRAP analysis](https://github.com/fallow-rs/fallow)
- [React Doctor](https://react.doctor/)
- [Ladle documentation](https://ladle.dev/)
- [actionlint](https://github.com/rhysd/actionlint)
- [zizmor](https://docs.zizmor.sh/)
- [Knip configuration](https://knip.dev/reference/configuration)
- [Husky documentation](https://typicode.github.io/husky/)
- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
- [Playwright continuous integration](https://playwright.dev/docs/ci)
- [Playwright Docker images](https://playwright.dev/docs/docker)
