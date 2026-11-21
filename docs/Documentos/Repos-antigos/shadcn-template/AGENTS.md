<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Mission
Deliver correct, maintainable changes with minimal risk.

## Scope
- Respect repository architecture and conventions.
- Keep edits focused; avoid unrelated refactors.
- Never commit secrets.

## Engineering Rules
- Validate changes with relevant checks before final delivery.
- Surface assumptions and edge cases explicitly.
- Prefer reversible changes and deterministic outputs.

## MCP & Skills
- MCP server definitions: `.agents/agents.json`
- Local MCP overrides/secrets: `.agents/local.json`
- Project skills: `.agents/skills/*/SKILL.md`

## MCP & Skills workflow
1. Add or update MCP entries in `.agents/agents.json`.
2. Keep reusable instructions in `.agents/skills/*/SKILL.md`.
3. Run `agents sync` after changes.
4. Use `agents sync --check` in CI or before opening a PR.
5. Use `agents mcp test --runtime` when introducing new servers.

## Workflow
1. Plan briefly.
2. Implement minimal viable change.
3. Validate (lint/tests/build/smoke as needed).
4. Report results and residual risks.

## Project documentation
- `docs/README.md`: documentation ownership and maintenance guide.
- `DESIGN.md`: implemented tokens, typography, and component design reference.
- `ARCHITECTURE.md`: repository layout and application boundaries.
- `CODING_STANDARDS.md`: conventions for TypeScript, React, Next.js, UI, and i18n.
- `TOOLING.md`: package manager, commands, and configuration ownership.
- `TESTING.md`: required validation and test strategy.
- `SECURITY.md`: vulnerability reporting and secure contribution practices.
- `CONTRIBUTING.md`: branch, commit, release, and pull-request conventions.
- `GLOSSARY.md`: agreed domain terminology; preserve its pending status until
  product-specific terms are resolved.
- `DER.md`: entity-relationship diagram; preserve its pending status until a
  database and persistence model are adopted.
- `.agents/rules/adr-naming.md`: naming and immutability policy for future
  architecture decision records.

Accepted ADRs are historical records; use `docs/adr/README.md` and current
configuration to identify later operational changes. The five installed skills
and two configured MCP servers are indexed in `.agents/README.md`.

Read the documentation relevant to the change before editing it. Keep these
documents and the relevant ADR current when a durable project practice changes.

## Agent skills

### Issue tracker
GitHub issues via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs
Single-context (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
