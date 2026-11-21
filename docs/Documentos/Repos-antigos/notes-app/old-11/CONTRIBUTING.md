# Contributing Guidelines

This file owns the **human contribution workflow**. Code rules live in
`CONVENTIONS.md`, verification strategy in `TESTING.md`, security policy in
`SECURITY.md`, and blocking quality floors in `CONSTRAINTS.md`.

## 1. Environment Setup

- Use pnpm 11.20.0, pinned by `packageManager` in `package.json`.
- Use Node.js 22.19.0, pinned by `.node-version`.
- Command examples use RTK; direct execution is the fallback only under the conditions
  documented in `RTK.md`.

```bash
rtk git clone <repository-url>
rtk pnpm install
rtk pnpm dev
```

The install step initializes repository Husky hooks through the package `prepare`
script. Pre-commit runs `lint-staged`, which applies Biome plus the conventions guard
only to staged files; `commit-msg` runs commitlint; and pre-push runs
`rtk pnpm check:push`, which checks committed changes plus affected tests. Use
`rtk pnpm check:fast` at task end/handoff. The full deterministic gate remains
`rtk pnpm check:ci`, which CI treats as authoritative.

## 2. Branches

- `main` is the primary branch.
- Branch names use lowercase kebab-case.
- Use a short conventional prefix such as `feat/`, `fix/`, `docs/`,
  `refactor/`, or `chore/` when it improves intent.
- Do not rewrite shared branch history unless the repository owner explicitly asks.

## 3. Commits

Use Conventional Commits:

```text
<type>(<optional-scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`,
`chore`, `build`, and `ci`.

Keep commits focused and do not bypass hooks with `--no-verify` merely to obtain a
commit.

### Agent Session Commit Scope

When an agent is asked to commit changes within an active session:
- **Multiple active sessions**: The agent must always ask the user whether to commit only the changes made in that current session or all changes across all open sessions.
- **Single active session**: If only one session exists, the agent may commit all uncommitted changes directly.
- Canonical execution procedure is defined in `.agents/skills/git-commit/SKILL.md`.

## 4. Pre-PR Checklist

Before opening a PR:

- [ ] The requested change is complete and the final diff contains no unrelated edits.
- [ ] `rtk pnpm check:ci` passes.
- [ ] Additional checks required by `TESTING.md`, `SECURITY.md`, and
      `CONSTRAINTS.md` were run for the change's risk area.
- [ ] `rtk pnpm build` passes when runtime/build behavior is affected.
- [ ] GitHub Actions changes pass `rtk pnpm lint:actions` and the security review
      required by `SECURITY.md`.
- [ ] UI changes include appropriate visual verification and screenshots/recordings
      when useful for review.
- [ ] Every changed rule/fact was updated in its canonical documentation owner.

Agent/MCP/skill configuration changes follow the workflows routed by `AGENTS.md`;
do not copy those procedures into this contributor guide.

When multiple agents work concurrently, give each agent its own branch/worktree. Do not let independent agents share one mutable worktree.

### Documentation Language Standard

All documentation, architectural records, execution plans, specs, comments, and PR descriptions MUST be written in English by default, unless the user explicitly requests another language.

## 5. Pull Requests

- Explain what changed and why.
- Keep the PR narrowly scoped.
- Call out migrations, risk, follow-up work, or known limitations explicitly.
- Include before/after visual evidence for user-visible UI changes.
- Prefer squash merging for a focused feature/fix branch unless preserving commit
  history serves a clear purpose.
