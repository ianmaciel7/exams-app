<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AI Tooling

`AGENTS.md` is the shared source of truth for AI coding agents in this repository.

### Mandatory Tooling Enforcement & Tool Use Cases

All AI coding agents MUST strictly enforce and utilize this specialized toolchain according to these explicit scenarios:

#### 1. Serena Toolchain (AST Navigation, Symbol Edits & Project Memory)
- **`activate_project`**: Call when Serena reports no active project before running symbol or memory tools.
- **`list_memories` / `read_memory` (MANDATORY PRE-CHECK)**: MUST ALWAYS be checked before analyzing complex subsystems, scouting prior art, or writing new documentation/memories, to verify if memory of the information already exists. Never re-investigate or duplicate information already captured in project memory.
- **`write_memory`**: MUST be used to store persistent project context, architectural decisions, discovered patterns, skill inventories, or lessons learned across agent sessions (e.g., `write_memory(memory_name, content)`). **Deduplication invariant**: Agents MUST call `list_memories` first to verify no existing memory covers the topic; edit/update existing memories (`edit_memory`) instead of creating redundant duplicates, and never duplicate memories into `.agents/docs/` or parallel markdown files.
- **`find_symbol` / `get_symbols_overview` / `find_referencing_symbols` / `find_implementations`**: Use for precise symbol navigation, inspecting signatures, and finding call sites. Do NOT scan full source files when symbol tools apply.
- **`replace_symbol_body` / `insert_after_symbol` / `insert_before_symbol`**: Use for targeted, surgical edits to functions, classes, or types without modifying unrelated file content.

#### 2. Graphify Knowledge Graph (`graphify`)
- **`query_graph`**: MUST be queried first for repository architecture, module dependencies, component relationships, or conceptual questions whenever `graphify-out/graph.json` exists.
- **`get_node` / `shortest_path`**: Use to trace dependencies or paths between specific architectural components across communities.
- **`graphify update .`**: MUST be run after modifying code or documentation files in a session to update the knowledge graph (AST & document nodes) deterministically.

#### 3. Context7 (`ctx7`)
- **`npx ctx7@latest library <name>` / `npx ctx7@latest docs <id>`**: MUST be called whenever inquiring about or implementing external frameworks, libraries, APIs, SDKs, or CLI tools (Next.js, React, Tailwind, Prisma, Firebase, etc.) to fetch up-to-date documentation. Never rely on pre-training assumptions.

#### 4. RTK (`rtk`)
- **`rtk <command>`**: MUST prefix all supported terminal commands (`rtk git status`, `rtk pnpm ...`, `rtk rg`, etc.) to compress output and eliminate context token waste.
  - If `rtk` cannot be started by the current shell (notably the WinGet shim on Windows), resolve the installed executable with `Get-Command rtk`, read its `Target`, and invoke that target directly.

#### 5. Repomix (`repomix` / `repomix-explorer`)
- **Shoogle (MANDATORY for UI Components)**: MUST search and download existing shadcn/ui components, blocks, and templates via Shoogle (`search_registry_items` MCP or `rtk pnpm dlx shadcn@latest search @shoogle`) before creating UI from scratch.
- **Repomix Explorer (MANDATORY for Codebase Exploration)**: MUST be used whenever analyzing repository structure, performing codebase overviews, discovering patterns across multiple files, or generating repo snapshots (`npx repomix@latest` or `repomix-explorer` skill). Use Serena AST tools for targeted single-symbol lookups and surgical file edits.

#### 6. Targeted Retrieval Policy
- Strictly avoid reading whole files or large repository sections when targeted retrieval via Serena, Graphify, or RTK is possible.

### Proactive Context Efficiency & Anti-Patterns

Agents must proactively eliminate token waste and context bloat:
- **No Indiscriminate Reads**: Do not read entire files just to inspect a type definition, function signature, or component prop; use Serena AST tools.
- **No Unfiltered Diffs/Logs**: Avoid dumping raw diffs or deep logs into context; use `rtk git diff` or `rtk git log -n <limit>`.
- **No Repeated Exploration**: Do not repeatedly search the directory tree for concepts Graphify already indexes; query the graph first.
- **Focused Documentation**: Keep Context7 queries strictly scoped to a single concept rather than pulling multi-topic references.
- **No Repetitive File Reads**: Reuse recently read context within the conversation rather than re-reading unchanged files.
- **No Duplicate Memories & Re-analysis**: Always inspect existing Serena memories (`list_memories`) before initiating broad subsystem exploration, scouting, or writing new memories. Never create parallel or duplicate memory files for concepts already captured.

### Token Observability & Harness Audits (On-Demand Only)

- **RTK Savings Metrics**: Run `rtk gain` or `rtk gain --history` to inspect terminal token compression and diagnose verbosity during performance reviews (never after every command).
- **Context-Budget & Structure Audits**: Use `repomix` / `repomix-explorer` for structured repository analysis, pattern discovery, and token-budget audits.
- **Harness Engineering Audits**: Use the `measure-ai-proficiency` skill (`.agents/skills/measure-ai-proficiency/SKILL.md` or `uvx measure-ai-proficiency .`) on-demand to audit AI context maturity, primitive discipline, and harness drift. Do not execute automatically during standard coding tasks.

### Deterministic Safety & Optimization Hooks

Mechanical enforcement is decoupled from semantic instructions. The policy lives in exactly three scripts, shared across every connected agent:

- **Command Safety** (`.agents/hooks/command-safety.ps1`): Destructive commands (`git reset --hard`, `git clean -fd`, `rm -rf`, force-pushes) require explicit user confirmation before running. Fires on `PreToolUse`/`BeforeTool`.
- **RTK Gatekeeper** (`.agents/hooks/enforce-rtk.ps1`): Commands supported by RTK are intercepted before execution; bypassing RTK is denied, with the exact optimized command suggested. Fires on `PreToolUse`/`BeforeTool`.
- **Post-Edit Check** (`.agents/hooks/post-edit-check.ps1`): After any tool call touching a `.ts`/`.tsx` file, runs `biome check --write` (format + safe lint fixes) then an incremental `tsc --noEmit`, feeding remaining lint/type issues back to the model as `additionalContext` where the host tool supports it. Fires on `PostToolUse`/`AfterTool`. **Antigravity exception**: its `PostToolUseResponse` accepts no fields at all (must return exactly `{}`), so on Antigravity this script only applies the write-through biome fix — it cannot surface lint/type feedback there.

Each script auto-detects which tool invoked it (Antigravity's `toolCall.name`/`args.CommandLine`/`args` shape, or the `tool_name`/`tool_input` shape shared by Claude Code, Codex and Gemini CLI — disambiguated by `hook_event_name`) and replies in that tool's expected output format. `@agents-dev/cli` does not manage hooks at all (no schema key, no subcommand, confirmed against its own docs) — this wiring is hand-maintained, one native config entry per tool, all pointing at the same three scripts:

| Tool | Wired via | Pre-event name | Post-event name | Tracked in git |
| --- | --- | --- | --- | --- |
| Antigravity | `.agents/hooks.json` | `PreToolUse` | `PostToolUse` | yes |
| Claude Code | `.claude/settings.json` | `PreToolUse` | `PostToolUse` | yes |
| Gemini CLI | `.gemini/settings.json` | `BeforeTool` | `AfterTool` | yes |
| Codex | `.codex/config.toml` (appended after the `agents-sync managed MCP` block) | `PreToolUse` | `PostToolUse` | **no** — `.codex/` is gitignored as an `agents-dev/cli`-materialized directory; re-add this block by hand after any fresh `agents connect`/`init --force` on a new machine |

Note: Gemini CLI's `BeforeTool` hook output has no "ask" tier (only `allow`/`deny`), so a destructive command that would prompt for confirmation elsewhere is hard-denied there instead.

### Primitive Discipline (Cheapest Primitive First)

Agents must choose the most cost-effective primitive for each task:
- **Always-on Rules (`AGENTS.md`)**: Reserved for universal, compact constraints (zero procedural bloat).
- **Skills (`.agents/skills/`)**: Use for multi-step procedures, runbooks, and specialized knowledge loaded on demand.
- **Hooks (`.agents/hooks/*.ps1`, wired per-tool — see below)**: Use for deterministic, mechanically verifiable guardrails.
- **Subagents**: Use only when context isolation, parallel execution, or specialized roles are required.
- **MCP Tools**: Use for semantic code intelligence (Serena AST, Graphify graph, Context7 docs).
- **Repomix (`repomix-explorer`)**: Mandatory for repository structure analysis, multi-file pattern discovery, and context/token audits; use Serena for targeted symbol edits.

### Tool-specific configuration

Agent-specific integration files may extend these shared instructions:

- `.agents/rules/graphify.md` — Antigravity Graphify integration.
- `.agents/rules/rtk.md` — Antigravity RTK integration.
- `.agents/rules/shadcn.md` — shadcn/ui composition rules for this repo's `base-nova`/Base UI configuration, condensed from `.agents/skills/shadcn/`.
- `.agents/rules/shoogle.md` — Shoogle discovery and registry download preferences over scratch creation.
- `GEMINI.md` — Antigravity-specific instructions generated by integrations when required.
- `CLAUDE.md` — Claude Code adapter to this `AGENTS.md`.
- `.claude/settings.json` — Claude Code's own hook wiring (see Deterministic Safety & Optimization Hooks above). Not a duplicate of `AGENTS.md` content.
- `.gemini/settings.json` — belongs to **Gemini CLI specifically** (`geminicli.com`), a different product from Antigravity despite the shared `.gemini/` folder name; holds its own permissions and hook wiring.
- `.agents/agents.json` / `.agents/local.json` — `@agents-dev/cli`'s own scaffold (MCP server sync across tools + skill materialization). Regenerate/extend via the `agents` CLI (`agents doctor`, `agents sync --check`), not by hand, except for the hooks block manually appended to `.codex/config.toml` (that tool has no native hooks support in `@agents-dev/cli`).

Do not duplicate shared rules across agent-specific configuration files unless required by that tool.
