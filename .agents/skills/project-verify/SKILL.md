---
name: project-verify
description: Run the smallest repository verification tier that covers the current git diff and report failures with their owning command. Use when the user asks to verify, validate, or check changes before a commit or pull request.
metadata:
  disable-model-invocation: true
---

# Verify the current diff

Pick the tier from `git status --short` and `git diff --name-only`, run it, and
report results. The tiers are defined in [TESTING.md](../../../TESTING.md) and
[TOOLING.md](../../../TOOLING.md); do not invent new commands.

| Changed paths | Run |
| --- | --- |
| Only `*.md` | `pnpm check:markdown` and `pnpm check:spelling`, then verify links and referenced paths |
| `src/**`, `functions/**`, config | `pnpm verify:fast` |
| `src/app/**` pages or visual output | `pnpm verify:fast`, then `pnpm verify:e2e` |
| Before a pull request | `pnpm verify:full` |
| `package.json`, lockfiles, workflows, `.env*` | `pnpm verify:security` (needs the host tools in TOOLING.md) |
| `.agents/**` | `agents sync --check` |

## Rules

- Run independent checks sequentially and stop at the first failing command
  unless the user asks for the full list.
- Report each failure with the command, the file and line, and the owning tool
  (see `TOOLING.md`).
- State plainly which tiers were skipped and why. Never claim a host tool
  (Semgrep, Gitleaks, actionlint, the Agents CLI) passed if it was unavailable.
- Do not edit code to make a check pass unless the user asks.
