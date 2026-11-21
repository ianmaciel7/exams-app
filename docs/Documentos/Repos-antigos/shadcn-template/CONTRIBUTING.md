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
decision changes. Keep current operational details in the root guides.

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
