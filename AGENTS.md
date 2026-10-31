# Agent instructions

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

## Tool selection

`TOOLING.md` is the operational inventory for this repository. Before choosing
an implementation, diagnosis, research, or verification approach, read the
relevant inventory and command entry. Prefer the installed or configured tool
whose stated purpose covers the task; do not recreate its checks, scripts, or
external lookups ad hoc.

- **Serena MCP (Symbolic exploration, refactoring & memory)**:
  - Prerequisite: Ensure the project is active (`activate_project(project="exams-app")`).
  - Check local memory first (`list_memories`, `read_memory("core")`) before initiating external research or rediscovering known quirks.
  - For code inspection and editing, prefer semantic tools (`find_symbol`, `get_symbols_overview`, `replace_symbol_body`, `rename_symbol`, `safe_delete_symbol`) over whole-file reads and ad hoc string replacements.
  - Batch independent tool calls in a single turn to eliminate unnecessary round-trips.
- **Graphify MCP (Knowledge graph & codebase relationships)**:
  - For architectural overview, community detection, dependencies, or impact analysis, use `query_graph`, `get_node`, `get_neighbors`, and `shortest_path`.
  - Always provide `project_path="."` (or absolute workspace path) when querying the Graphify MCP server so it locates `graphify-out/graph.json`. Do not resort to broad terminal grep or directory traversals when the graph covers the query.
- **Context7 MCP (Upstream documentation & APIs)**:
  - For library, framework, SDK, API, CLI, or cloud-service documentation, use the native Context7 plugin (`resolve-library-id`, then `query-docs`) when it is available. Otherwise use the installed `context7-cli` skill.
  - Query a single scoped concept per `query-docs` call; never combine distinct concepts in one query.
  - Use web research only to complement Context7 or for material outside its corpus.
  - Cache non-trivial, reusable research into Serena memory under `research/<topic>` with retrieval date, source, and version bounds.
- **Playwright MCP (Browser verification)**:
  - Use Playwright tools (`browser_navigate`, `browser_snapshot`, `browser_console_messages`, `browser_take_screenshot`) for browser verification, DOM state checking, and visual inspection.
- **Verification & Scoped Checks**:
  - Use the project `project-verify` skill for scoped validation. Treat the `Purpose` and `Source of truth` columns in `TOOLING.md` as the decision guide. If a listed tool is unavailable, say so clearly and use the smallest safe fallback; never claim that its check or lookup ran.

## MCP & Skills workflow

1. Add or update MCP entries in `.agents/agents.json`.
2. Keep reusable instructions in `.agents/skills/*/SKILL.md`.
3. Run `agents sync` after changes.
4. Use `agents sync --check` in CI or before opening a PR.
5. Use `agents mcp test --runtime` when introducing new servers.

## Workflow

1. **Pre-flight & Memory Check**: Check Serena memory (`list_memories`, `read_memory("core")`) and codebase graph (Graphify) before starting research or modifications.
2. **Plan briefly**: Formulate an action plan and select appropriate tools.
3. **Implement minimal viable change**: Use semantic tools for symbol edits and targeted file changes.
4. **Validate**: Run relevant verification tiers (`project-verify`, `verify:fast`, `verify:static`, `verify:e2e`, or auth emulator).
5. **Persist Knowledge**: Cache newly discovered library quirks or research in Serena memory (`write_memory`), and promote stabilized conventions to canonical docs via `/save` (`project-save`).
6. **Report results and residual risks**.

## Project documentation

- `docs/README.md`: documentation ownership and maintenance guide.
- `docs/agents/coverage.md`: documentation ownership and the limits of the coverage audit.
- `DESIGN.md`: implemented tokens, typography, and component design reference.
- `ARCHITECTURE.md`: repository layout and application boundaries.
- `CODING_STANDARDS.md`: conventions for TypeScript, React, Next.js, UI, and i18n.
- `TOOLING.md`: package manager, commands, and configuration ownership.
- `TESTING.md`: required validation and test strategy.
- `SECURITY.md`: vulnerability reporting and secure contribution practices.
- `CONTRIBUTING.md`: branch, commit, release, and pull-request conventions.
- `GLOSSARY.md`: agreed domain terminology; preserve its pending status until
  product-specific terms are resolved.
- `DER.md`: pending product entity-relationship diagram and the existing
  technical Firebase persistence boundary.
- `.agents/rules/README.md`: agent rule topic index (including ADR naming
  and immutability, Serena cache-first policy, component architecture, forms,
  data layer, and framework boundaries).

Accepted ADRs are historical records; use `docs/adr/README.md` and current
configuration to identify later operational changes. The installed skills
and four configured MCP servers are indexed in `.agents/README.md`.

Read the documentation relevant to the change before editing it. For changes
to tooling, checks, or conventions, update the executable config, positive
and negative tests, `TOOLING.md`, and the owning agent rule together.
Recheck `TESTING.md` whenever a job or test suite changes. Accepted ADRs
retain historical decisions; amend their current guidance by linking a
new decision when necessary, not by silently editing history.

## Rule reading map

Use [.agents/rules/README.md](.agents/rules/README.md) to select the context needed
for the task. Do not read every rule for every change.

- All changes: `language.md`; documentation ownership: `docs.md`; ADRs: `adr.md`.
- Owned components: `components.md` and `composition.md`; UI registry work: `shadcn.md`.
- Custom hooks: `hooks.md`; state changes: `state.md`; external lifecycle work: `effects.md`.
- Forms: `forms.md`; persistence: `data.md`; protected access/session: `auth.md`.
- Stateful user workflows and acceptance tests: `testing.md` and `TESTING.md`.
- User-visible async states and recovery: `ui-state.md` and `docs/ui-state-feedback.md`.
- Routes, metadata, viewport, navigation: `routes.md`; runtime graphs: `boundaries.md`.
- Touch targets, form-field text, autofill, motion, mobile layout: `mobile.md`.
- Streaming and invalidation: `cache.md`; images and fonts: `assets.md`.
- React correctness: `react.md`; rendering: `rendering.md`; browser integration: `dom.md`.
- Compiler changes: `compiler.md`; external lookups: `research.md`.

Names above are relative to `.agents/rules/`. Read
[agent references](docs/agents/README.md) only for the current workflow. In particular,
use [React review](docs/agents/react-review.md) during review, not every unrelated task.

## Agent skills

### Issue tracker

GitHub issues via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.

## shadcn/ui documentation workflow

Before UI work, read `.agents/rules/shadcn.md` and load the installed
`.agents/skills/shadcn/SKILL.md`. The project uses Base UI (`base-nova`), not
the API of another primitive family. Current CLI commands belong in
`TOOLING.md`; component contracts belong in `CODING_STANDARDS.md`; theme and
composition details belong in `DESIGN.md`.

The installed `.agents/skills/shadcn/SKILL.md` skill and [agent rules](.agents/rules/shadcn.md#shadcnui-maintenance)
record official shadcn/ui guidance, component contracts, and Base UI boundaries. Use the installed CLI and
current component documentation before changing copied source. Report
unavailable network lookups or host tools without claiming they passed.

When `/save` is requested, use `.agents/skills/project-save/SKILL.md` to persist verified
knowledge in its canonical document. Preserve accepted ADRs and local changes;
document a new architectural decision in a new ADR when one is actually made.

## Composition applies across runtime boundaries

Apply the [compound component contract](CODING_STANDARDS.md#compound-components-and-serverclient-boundaries) to all
owned components, both Server and Client. Composition and runtime are separate
axes; a missing `"use client"` directive does not classify a shared module's
complete import graph. `pnpm check:components` enforces the documented subset
with regression cases for both boundary and directive-free modules.

## Next.js documentation workflow

Before Next.js changes, read [agent rules](.agents/rules/cache.md)
and the relevant installed `node_modules/next/dist/docs/` guide, consulting Context7 (`/vercel/next.js`)
for verified upstream documentation. Match guidance to installed
Next.js 16.4.3, App Router, Cache Components, and Partial Prefetching.
See [Next.js sources](docs/agents/nextjs-sources.md) and
[Next.js versions](docs/agents/nextjs-versions.md).

Use native Next.js, TypeScript, and Biome diagnostics before adding custom
rules. Keep the existing thin-route and component policies distinct from
framework requirements. Save verified findings in the canonical guides;
upstream documentation does not authorize dependency upgrades, new agent
skills, hosting configuration, or migration to another rendering model.

## React documentation workflow

For React changes, read [agent rules](.agents/rules/README.md)
and select only the applicable React context. Verify installed
React/React DOM 19.3.1 and Compiler 1.0.0 support before adopting live examples.
Keep React's rules distinct from stricter repository orchestration conventions.
Use native Biome diagnostics, the existing guards, and appropriate lifecycle /
browser tests; do not claim coverage of every upstream ESLint or Compiler rule.
Persist verified findings with the [save skill](.agents/skills/project-save/SKILL.md)
in their canonical guide, preserving accepted ADRs and local changes.

The [React implementation and review rules](.agents/rules/react.md)
link the applicable implementation guidance: hooks, components, React DOM
rendering, forms, server boundaries, Compiler, lint, identity, legacy APIs,
Fragment refs, experiments, version context, feature selection, and the
implementation checklist. Official documentation is indexed in `docs/agents/react-sources.md`.
