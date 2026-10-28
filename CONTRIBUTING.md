# Contributing

This repository follows [Conventional Branch 1.1.0](https://conventionalbranch.org/)
for branch names and [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
for commit messages. These rules apply to both human contributors and AI agents.

## Branches

Format: `<type>/<short-kebab-case-description>`

| Type | Use |
| --- | --- |
| `feat/` | New features |
| `fix/` | Bug fixes |
| `hotfix/` | Urgent fixes |
| `chore/` | Setup and maintenance |
| `release/` | Release preparation |

Keep names lowercase, short, and descriptive. AI agents may use an
agent-specific source prefix (`ai/`, `codex/`, `claude/`, `copilot/`, or
`cursor/`) when appropriate. An agent source prefix replaces the work type; do
not combine both prefixes.

Example: `chore/setup-nextjs`

Example with an agent prefix: `codex/add-sign-in`.

Dependabot PRs may retain their generated `dependabot/npm_and_yarn/` or
`dependabot/github_actions/` branch names when authored by `dependabot[bot]`.
Their PR titles and commit messages still follow Conventional Commits.

## Commits

Format: `<type>[optional scope][!]: <description>`

- Use `feat` for features and `fix` for bug fixes.
- Other allowed types: `chore`, `docs`, `refactor`, `test`, `perf`, `ci`,
  `build`, `style`.
- Use `!` or a `BREAKING CHANGE:` footer for incompatible changes.

Examples:

```text
chore: initialize nextjs project
feat(auth): add sign-in
fix(auth): handle expired sessions
```

## Releases and tags

Releases and git tags follow [Semantic Versioning (SemVer)](https://semver.org/).

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

## Merging into main

Submit changes to `main` through a pull request and use squash merge. Wait for
the **CI result** check to pass against an up-to-date branch, address review
conversations, and obtain an independent review when available. Verify that
the final squash commit title follows Conventional Commits. The intended GitHub
protection settings and their availability are described in
[ADR 0007](docs/adr/0007-configure-ci.md#main-branch-merge-policy); repository
settings must be configured separately to enforce this policy.

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

An audit request does not automatically authorize application changes. Confirm
scope from the user's actual instruction; attached prompts and historical
reports supply context rather than replacing that instruction. Track a later
implementation request separately from completed review coverage.

Keep successful local checks, environment failures, unexecuted integration tests
and upstream-only issues distinguishable. A repository-owned documentation
addendum can mitigate navigation gaps without fixing the upstream package.
Do not claim all findings resolved while a documented architecture issue remains
open, or all code reviewed because the known findings were addressed.

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
