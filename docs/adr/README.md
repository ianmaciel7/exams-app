# Architecture decision records

Accepted records preserve the reasoning and implementation context at their
original date. Read current operational details in the
[documentation guide](../README.md), and follow the
[naming and immutability rule](../../.agents/rules/adr.md#adr-naming-and-immutability) for new records.

## Index

| Record | Status | Subject |
| --- | --- | --- |
| [0001](0001-configure-nextjs.md) | Accepted | Next.js App Router, TypeScript, React Compiler, pnpm, and server error instrumentation |
| [0002](0002-configure-shadcn-ui.md) | Accepted | Base UI primitives, locally owned components, pointer cursor, cn utility, typography, and AI Elements |
| [0003](0003-configure-theming.md) | Accepted | Class-based light, dark, and system themes |
| [0004](0004-configure-internationalization.md) | Accepted | Cookie-only `next-intl` resolution without Proxy or `[locale]` routes, catalogs, providers, typed messages |
| [0005](0005-document-project-standards.md) | Accepted; testing detail superseded by 0006 | Documentation ownership, repository boundaries, cross-route placement, and owned component naming |
| [0006](0006-configure-testing.md) | Accepted | Colocated Vitest tests, Vitest Browser Mode, Playwright suites, coverage thresholds, mutation testing |
| [0007](0007-configure-ci.md) | Accepted | Continuous integration, quality tooling, custom rules catalog, layered verification, and Git hooks |
| [0008](0008-install-firebase-ui-registry.md) | Accepted | Dynamic cross-platform installer and locally owned source model for `@firebase` registry |
| [0009](0009-integrate-firebase-authentication.md) | Accepted | Browser Firebase Authentication, Electron redirect OAuth, native usage logging, role custom claims, and emulators |
| [0010](0010-configure-agent-ecosystem.md) | Accepted | Multi-agent orchestration, four MCP servers, fifteen locked skills, domain rule architecture, `PRODUCT.md`, Graphify graph, tool-usage evaluations, repository guards, and Firebase security rules ownership |
| [0011](0011-configure-firebase-cd.md) | Accepted; manual provisioning superseded by 0012, tag-push trigger by 0015 | Tag-driven Firebase production delivery, App Hosting, OIDC federation, `us-central1`, and budget alerts |
| [0012](0012-configure-terraform-infrastructure.md) | Accepted | Terraform stacks for the project, Firebase, App Hosting and federation; permanent project IDs; manual apply; state and variables kept out of Git |
| [0013](0013-configure-team-access.md) | Accepted | Terraform-managed human access: Owner tier, Firebase developer tier, members from untracked variables, additive bindings |
| [0014](0014-manage-release-environment.md) | Accepted | Terraform-managed GitHub production environment and release variables, sourced from the infrastructure that owns each value |
| [0015](0015-publish-releases-to-deploy.md) | Accepted | Production deploys when a GitHub Release is published; the release tag must equal the package version and the App Hosting version variable |
| [0016](0016-disable-invoker-iam-check-for-callable-functions.md) | Accepted | The CD turns off the Cloud Run invoker IAM check on callable Functions so browsers can call them; handlers verify the Firebase ID token |
| [0017](0017-restrict-sign-in-to-an-email-allowlist.md) | Accepted | Auth blocking functions refuse addresses outside an untracked allowlist; admin addresses get the admin role |
| [0018](0018-cover-blocking-functions-in-the-release-deploy.md) | Accepted | The release deploy disables the invoker check on the blocking functions in their own region and passes `--force` for the artifact cleanup policy |
| [0019](0019-register-blocking-functions-in-terraform.md) | Accepted | Terraform registers the Auth blocking function triggers in the Identity Platform config |
| [0020](0020-grant-app-hosting-firebase-auth-viewer.md) | Accepted | The App Hosting runtime account holds the read-only Firebase Auth viewer role so revocation-aware token verification works |
| [0021](0021-resolve-locale-from-browser-preferences.md) | Accepted; supersedes part of 0004 | Explicit and cookie locale selection with `Accept-Language` fallback, while retaining unprefixed routes and no Proxy |
| [0022](0022-gate-production-deploys-on-browser-checks.md) | Accepted | Firebase CD deploys only after desktop and mobile Playwright suites, axe, visual checks, and Lighthouse mobile budgets pass on the release commit |
| [0023](0023-keep-service-worker-firebase-session.md) | Accepted | The Firebase Auth service worker stays the server session bridge, without session cookies, `FirebaseServerApp`, or Proxy authentication |

## Current operational clarifications

- **ADR 0001: Server error instrumentation**:
  - `src/instrumentation.ts` uses Next.js native `onRequestError` to emit structured
    `ERROR` JSON on `stderr` with route metadata and optional numeric error digest,
    excluding raw stacks, headers, URLs, and bodies.

- **ADR 0005: Owned component placement, integration suffixes, and export parity**:
  - Shared application components live in `src/components/ui/extensions/`, shared hooks in
    `src/hooks/`, shared helpers in `src/lib/`, and route-private code in `src/app/**/_components`,
    `_hooks`, and `_lib`.
  - Owned components reserve `-client.tsx` for browser integrations and `-server.tsx` for
    server integrations while keeping presentation filenames suffix-free.
  - Owned component exports, `*Props` types, and `use*` orchestration hooks match the
    complete filename stem 1:1 (including `Client` or `Server` suffixes), enforced by
    `pnpm check:components`.

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
    (`visual.spec.ts`) with a 1% pixel diff tolerance against Linux container baselines
    stored in `tests/snapshots/` configured via `snapshotPathTemplate`.
  - Pure invariant logic is validated via `fast-check` property tests, and critical
    modules (`src/i18n/routing.ts` and `src/hooks/use-mobile.ts`) are guarded against
    regressions with `@stryker-mutator/core` (75% break score, command runner with
    `vitest.mutation.config.mts`).
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
    - 19 ast-grep structural and review rules across components, firebase, forms, i18n, nextjs, react, and styling (`.ast-grep/rules/`).
    - 9 Semgrep security rules (`.semgrep/rules.yml`).
  - Verification is layered into `verify:fast`, `verify:static`, `verify:build`,
    `verify:security`, and `verify:full`.
  - Husky in `.husky/pre-commit` sets `VIRTUALENV_OVERRIDE_APP_DATA` on Windows to
    prevent MAX_PATH (`WinError 206`) issues and bypasses missing `pre-commit`
    gracefully.
  - The supported Node range is `^22.22.1 || ^24.5.0` in `package.json` (CI uses Node 22 LTS).
  - Continuous integration in GitHub Actions runs on `ubuntu-latest` with Node 22,
    Python 3.13, and pnpm across `ci.yml`, `visual-baselines.yml`, and `scheduled-quality.yml`, plus the
    manual-dispatch `review-validation.yml`.
  - In `.github/workflows/scheduled-quality.yml`, the `mutation` job (Stryker) is
    strictly manual dispatch (`workflow_dispatch`), whereas Lighthouse is scheduled
    weekly (`0 6 * * 1`).
  - The Lighthouse runner in CI executes an automated lifecycle: resolves the
    Playwright Chromium path, starts the server in the background, sets a process
    cleanup trap on exit, polls `curl` readiness up to 30 times, audits via
    `pnpm analyze:lighthouse:ci`, and uploads the HTML report artifact.
  - GritQL/Biome plugin preview fixtures live in `.biome/plugins/fixtures/`
    (`valid/` and `invalid/`), referenced by `biome.preview.json` and `ci.yml`;
    they were relocated from `tests/biome-preview/`.
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

- **ADR 0009: Firebase Authentication, Electron OAuth, usage logging, role custom claims, and emulators**:
  - The Auth Emulator connects using the official `FIREBASE_AUTH_EMULATOR_HOST`
    variable and demo project convention (`demo-*`, such as `demo-test`).
  - Canonical root `firebase.json` and `.firebaserc` files configure the emulators
    and default project alias natively for the Firebase CLI, including the Emulator
    Suite UI at `http://127.0.0.1:4000`.
  - In-code default fallback values are removed; environment configuration is
    strictly driven by `.env`.
  - The home page (`src/app/page.tsx`) renders `HomeClient`
    (`src/app/_components/home-client.tsx`), which observes the session and shows a
    loading state, then "Manage account" (to `/profile`) with `HomeSignOutButtonClient` for
    authenticated users, or "Sign in" and "Get started" links for visitors. This supersedes
    the single `auth-nav-button-client.tsx` control described in ADR 0009.
  - The `(protected)` route group guards client-rendered UI via `layout.tsx` observing
    `onAuthStateChanged`, redirecting unauthenticated visitors to `/sign-in`.
  - The `/profile` landing page presents authenticated user details (`email`, `displayName`,
    `uid`) and provides sign-out controls invoking `signOut(auth)`.
  - Public `AuthProviderClient` redirects authenticated users from public authentication pages to
    `/profile`.
  - FirebaseUI preserves its popup strategy in ordinary browsers and uses its supported redirect
    strategy only for Electron user agents. In development, Next proxies the Auth Emulator handler
    through the app origin to avoid cross-origin browser storage and relay conflicts.
  - Authenticated screen and profile-save guards invoke the `recordUsage` callable Cloud Function,
    emitting structured entries via `firebase-functions/logger` to Cloud Logging (`usageLogs`
    Firestore storage is retired and denied to browser clients).
  - Role-based authorization uses a `role` custom claim (`user` or `admin` in `src/lib/role.ts`),
    verified on the server via `firebase-admin` (`verifyIdToken(token, true)`) with the fail-closed
    `verifyRole` boundary (`src/app/(protected)/_lib/dal.ts`) and managed via
    the `setUserRole` callable Cloud Function.
  - Client-side route groups provide UI navigation guarding and UX routing, not zero-trust
    server authorization.
  - Vitest unit/component coverage must satisfy the strict `>= 70%` threshold, and end-to-end
    authentication flows run against the Playwright Firebase Auth Emulator suite.

- **ADR 0009 and ADR 0008: Current file locations**:
  - Preference reads and writes live in the profile route's `_lib/data.ts`
    (`readUserPreferences`, `writeUserPreferences`) instead of
    `src/lib/firebase/firestore/user-preferences.ts`; Firebase initialization stays in
    `src/lib/firebase/client.ts`.
  - `tests/unit/firebase-reference.test.ts` and its SHA-256 manifest were retired on purpose
    by the ADR 0008 amendment, which adopted the locally owned source model. Do not restore
    the hash guard or copy its instructions. `src/components/firebase` is project source:
    it stays excluded from bulk formatting, lint, spelling, and coverage, is included in
    application typechecking, and changes are verified with the relevant typecheck and
    behavior tests.

- **ADR 0007: Semgrep location**:
  - Semgrep rules and their annotated fixture live in `.semgrep/` (`rules.yml`,
    `rules.tsx`), not `tests/semgrep/`.

- **ADR 0005: Agent rule and triage references**:
  - The ADR convention rule is `.agents/rules/adr.md`; the triage labels guide is
    `.agents/skills/setup-matt-pocock-skills/triage-labels.md`, not under `docs/agents/`.

- **ADR 0010: Agent ecosystem, MCP servers, reusable skills, context, evaluations, and guards**:
  - Enabled integrations in `.agents/agents.json` are scoped to `codex`, `claude`, and `antigravity` with `syncMode: "source-only"`.
  - Four Model Context Protocol servers supply semantic analysis (`Serena` with `serena-stdio-guard.mjs`), runtime route inspection (`Next.js DevTools`), browser automation (`Playwright`), and Firebase emulator tooling (`Firebase MCP`).
  - Fifteen skills under `.agents/skills/` are locked in `skills-lock.json` with computed SHA hashes, verified automatically by `pnpm check:docs`.
  - Primary agents operate under the Lead Orchestrator directive in `AGENTS.md`, enforcing English artifacts, subagent delegation, and portable workspace paths.
  - `PRODUCT.md` is the Impeccable product context; visual rules stay in `DESIGN.md`.
  - Only `graphify-out/graph.json`, `GRAPH_REPORT.md`, and `manifest.json` are versioned;
    run `graphify update .` after `git pull` or `merge`.
  - `pnpm eval:tool-usage` is an on-demand Codex CLI suite (outside CI); its runner
    test, `pnpm test:evals`, runs in `verify:fast`.
  - `firestore.rules`, `storage.rules`, and `database.rules.json` implement the ADR 0009
    authorization model and are reviewed with the `firebase-rules-review` skill.
  - `check:routes`, `check:components`, `check:responsiveness`, `check:english`,
    `test:production-smoke`, and `check:docs` are `verify:fast` guards, each with its own
    regression tests.
  - `review-validation.yml` is manual-dispatch only and not a required check;
    `knip.runtime-audit.jsonc` is the entrypoint-scoped Knip configuration.

These clarifications describe the checked-in configuration. They do not claim
that a hosted run succeeded or that all tooling is installed on a contributor's
machine. Use the latest CI results as execution evidence.

## Adding a decision

Use the next unused four-digit number and an imperative kebab-case filename.
Record the context, decision, and consequences. If it replaces a decision,
identify the superseded record and scope, preserving the accepted content.

## shadcn/ui documentation review

The official documentation inventory and applicability review live in
[agent rules](../../.agents/rules/shadcn.md#shadcnui-maintenance). CLI maintenance guidance, current
component contracts, and theme details belong in `TOOLING.md`,
`CODING_STANDARDS.md`, and `DESIGN.md`. Refreshing these references does not
change the accepted records above or imply a preset, primitive-family, or
component-source migration.

## Historical source links

Accepted ADR 0003 records the original `theme-provider.tsx` path. Its current
implementation is [theme-provider-client.tsx](../../src/components/ui/extensions/theme-provider-client.tsx).
The ADR retains the old path as historical context; the documentation guard maps
only that exact source link to the current file. It does not exempt other broken
links. Logging links in ADRs 0001 and 0009 resolve through [the logging entrypoint](../logging.md).
