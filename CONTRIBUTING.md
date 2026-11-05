# Contributing

This repository follows [Conventional Branch 1.1.0](https://conventionalbranch.org/)
for branch names and [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
for commit messages. These rules apply to both human contributors and AI agents.

## Branches

The repository maintains two persistent branches:

- **`main`**: The production branch and canonical source of truth. It contains stable,
  deployable code. Production deployments trigger when a GitHub Release is published
  against `main` (see [Firebase continuous delivery](docs/firebase-cd.md#release-procedure)).
  Direct pushes are blocked; changes arrive only via pull requests from `dev` (feature
  promotions) or `hotfix/` branches (urgent production fixes).
- **`dev`**: The active development and integration branch. All day-to-day work branches
  off `dev` and merges back into `dev` through pull requests once validated by CI. Direct
  pushes to `dev` are also blocked.

### Working branches

Working branches are short-lived branches created off `dev` (or off `main` for `hotfix/`).

Format: `<type>/<short-kebab-case-description>`

| Type       | Base Branch | Target Branch | Use                                                           |
| ---------- | ----------- | ------------- | ------------------------------------------------------------- |
| `feat/`    | `dev`       | `dev`         | New features and capabilities                                 |
| `fix/`     | `dev`       | `dev`         | Bug fixes for active development                              |
| `hotfix/`  | `main`      | `main`        | Urgent production fixes; back-merged into `dev` after release |
| `chore/`   | `dev`       | `dev`         | Tooling, dependencies, and repo maintenance                   |
| `release/` | `dev`       | `main`        | Release preparation and stabilization                         |

Keep names lowercase, short, and descriptive. AI agents may use an
agent-specific source prefix (`ai/`, `codex/`, `claude/`, `copilot/`, or
`cursor/`) when appropriate. An agent source prefix replaces the work type; do
not combine both prefixes.

Example: `chore/setup-nextjs`

Example with an agent prefix: `codex/add-sign-in`.

Dependabot PRs may retain their generated `dependabot/npm_and_yarn/` or
`dependabot/github_actions/` branch names when authored by `dependabot[bot]`.
Their PR titles and commit messages still follow Conventional Commits and target `dev`.

## Commits

Format: `<type>[optional scope][!]: <description>`

- Use `feat` for features and `fix` for bug fixes.
- Other allowed types: `chore`, `docs`, `refactor`, `test`, `perf`, `ci`,
  `build`, `style`.
- Use `!` or a `BREAKING CHANGE:` footer for incompatible changes.
- Never commit secrets, cloud credentials, or private API keys. Launch configurations must use `envFile` with local `.env*` files. Staged changes are automatically scanned by Gitleaks during the `pre-commit` hook.

Examples:

```text
chore: initialize nextjs project
feat(auth): add sign-in
fix(auth): handle expired sessions
```

## Releases and tags

Releases and git tags follow [Semantic Versioning (SemVer)](https://semver.org/).
A production deploy starts when a GitHub Release is published, not when a tag is
pushed; see [Firebase continuous delivery](docs/firebase-cd.md#release-procedure).

## Before opening a pull request

For a documentation-only change, run `pnpm check:markdown` and
`pnpm check:spelling`, verify relative links and script names, and follow the
full validation guidance in [TESTING.md](TESTING.md). Accepted ADRs describe
decisions at their original date; preserve them and use a new ADR when a
decision changes. Write the ADR in the same change as the work that introduces
an architectural, tooling, or infrastructure choice, before opening the pull
request, and run `pnpm check:adr`. Keep current operational details in the root
guides, and never put project, billing, or account identifiers in tracked files.

Run the checks in [TESTING.md](TESTING.md), keep changes focused, title the
pull request as a Conventional Commit (CI validates it and squash merges use
it as the commit message), and update
architecture or security documentation when the change affects those concerns.

## Merging into dev

Submit day-to-day feature, fix, and maintenance changes against `dev` through a
pull request and use squash merge. Wait for the **CI result** check to pass against
an up-to-date branch, address review conversations, and obtain an independent
review when available. Verify that the final squash commit title follows Conventional
Commits.

The repository deletes the head branch when a pull request merges
(`delete_branch_on_merge`) and allows auto-merge. Prefer
`gh pr merge <number> --squash --auto` once the checks are green, so no merged
branch is left on the remote. A branch whose pull request closed without
merging is deleted by hand.

## Merging into main

Promote accumulated and tested changes from `dev` to `main` through a pull
request when preparing a production release. Wait for the **CI result** check
to pass, review diffs, and merge into `main` using squash merge.

Direct pushes, force pushes, and branch deletion are blocked on both `main` and `dev`.
The intended GitHub protection settings and their availability are described in
[ADR 0010](docs/adr/0010-configure-ci.md#main-branch-merge-policy); repository
settings must be configured separately to enforce this policy.

After merging into `main`, publish a GitHub Release with the corresponding Semantic
Version tag (e.g. `v0.1.0`), which triggers the automated production deployment
pipeline in [Firebase continuous delivery](docs/firebase-cd.md). When a `hotfix/`
is merged into `main`, back-merge or rebase `dev` against `main` to ensure `dev`
incorporates the hotfix immediately.

## shadcn/ui documentation and source changes

Use [the shadcn/ui rules](.agents/rules/shadcn.md#shadcnui-maintenance) to identify the correct
primitive family and source revision. Keep upstream findings in their canonical
guide, update the source inventory when refreshing the full reference, and
distinguish official APIs from project-specific guards. Do not rewrite accepted
ADRs or external skill references to make them match a new release.

For a component update, include the registry/ref, reviewed CLI diff, preserved
local adaptations, and behavior verification in the pull request. Documentation
updates alone do not imply component, dependency, preset, or AI Elements
migrations. Preserve unrelated working-tree changes and stage only the intended
files or hunks.

## Next.js documentation and framework changes

Use [the Next.js maintenance rule](.agents/rules/cache.md) before changing
routing, cache scopes, metadata, or server boundaries. Report the installed
version and source revision, the applicable rendering model, and the checks
actually run. Keep framework requirements distinct from repository policies.

A documentation refresh alone does not upgrade Next.js, run migration codemods,
install suggested agent skills, select hosting, or alter Firebase persistence.
For an authorized upgrade, review the release notes, installed CLI support,
configuration migrations, package/lockfile diff, and production behavior in a
focused change. Preserve accepted ADRs and unrelated working-tree changes.

## React documentation and runtime changes

Use [the React rules](.agents/rules/react.md) to distinguish current
reference material, installed React/React DOM APIs, Compiler support, and
optional/experimental features. Document the source revision and actual
verification when refreshing guidance or changing behavior.

Keep native diagnostic configuration and its valid/invalid regression cases
together. A framework/library recommendation does not automatically install
ESLint, replace React Hook Form, enable another renderer, remove all manual
memoization, or upgrade dependencies. Review runtime, DOM, framework, type,
and Compiler compatibility together when an upgrade is explicitly requested.
Preserve accepted ADRs, external skill provenance, and unrelated local edits.

## Review scope and delivery claims

Before inspecting or changing code, resolve the requested branch to a commit
and check the checkout and worktree state. Record that source ref in the review
or PR. A supplied file path does not establish which branch is being inspected;
do not substitute the default branch for an explicitly requested `dev` branch.
Use native Git ref/status checks, or the connector's resolved ref and commit,
and recheck the expected head before publishing or merging.

An audit request does not automatically authorize application changes. Confirm
scope from the user's actual instruction; attached prompts and historical
reports supply context rather than replacing that instruction. Track a later
implementation request separately from completed review coverage.

Keep successful local checks, environment failures, unexecuted integration tests
and upstream-only issues distinguishable. A repository-owned documentation
addendum can mitigate navigation gaps without fixing the upstream package.
Do not claim all findings resolved while a documented architecture issue remains
open, or all code reviewed because the known findings were addressed.

A local edit, feature-branch push, or PR targeting `dev` is not an integration
into `dev`. Report the actual PR merge state and verified target head. When
asked to synchronize `main` and `dev`, follow the normal promotion PR workflow
and wait for the required CI result on the current head. After merging, compare
the remote Git tree SHAs (or run `git diff --exit-code origin/main origin/dev`
after fetching both refs), and verify package and App Hosting version metadata.
Matching version labels alone do not prove matching source. Squash merges may
produce different commit SHAs with identical trees; preserve history rather
than force-pushing to make the SHAs match. This is a delivery check for a
requested synchronization, not a requirement that ongoing development can
never advance beyond `main`.

## Commit hook environment failures

When a package-manager wrapper fails before a hook can run, diagnose that setup
failure separately from a failing project check. In this session, staged-file
checks and commit-message validation were run through the installed executables;
the Python host hook tool was unavailable. Any invocation-local hook bypass must
be disclosed together with the checks actually executed. Do not weaken shared
hooks or label skipped checks as passing.

After an authorized push, distinguish a clean worktree from a verified remote
update. Preserve existing history when correcting a published architecture
change; use a follow-up commit and an explicit ADR supersession rather than
silently rewriting an accepted decision or force-pushing it away.
