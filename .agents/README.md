# Agent configuration

Project-local instructions, MCP configuration, and reusable skills.

## Configured integrations

`.agents/agents.json` enables Codex, Claude, and Antigravity, with
`syncMode` set to `source-only`.

| MCP server | Command | Purpose |
| --- | --- | --- |
| Serena | `node .agents/scripts/serena-stdio-guard.mjs serena start-mcp-server --project-from-cwd --context=codex` | Project-local semantic symbol analysis; closes Serena's process tree when the stdio client disconnects |
| Next.js DevTools | `pnpm exec next-devtools-mcp` | Runtime diagnostics and route inspection |
| Playwright | `pnpm dlx @playwright/mcp@0.0.83` | Browser automation for verifying UI changes |
| Firebase | `pnpm dlx firebase-tools@15.34.1 mcp` | Firebase project, security rules, and emulator tooling |

These are configured servers, not a statement that the executables are
installed or that runtime connectivity has been verified. Serena and the
Agents CLI are host tools; `next-devtools-mcp` is a project dependency.

## Installed skills

The repository contains fifteen skills: `ask-matt`, `code-review`, `context7-cli`,
`emulator-test`, `firebase-basics`, `firebase-auth-basics`, `firebase-rules-review`,
`impeccable`, `vercel-react-best-practices`, `project-new-component`, `project-save`,
`setup-matt-pocock-skills`, `shadcn`, `retro`, and `project-verify`. See the
[skill inventory](skills/README.md) for entrypoints and provenance.

Persistent rules are indexed in [rules/README.md](rules/README.md), covering language,
ADR history, component contracts, component composition, compound forms,
data modules, route entrypoints, Next.js maintenance, React implementation,
shadcn/ui maintenance, and Serena external-research memory.
[shadcn/ui rules](rules/shadcn.md) record upstream coverage and Base UI boundaries.

## Source and local files

- `agents.json`: enabled integrations, MCP servers, and workspace behavior.
- `skills/*/SKILL.md`: reusable skill instructions and supporting references.
- `rules/README.md`: persistent guidance for coding agents.
- [AGENTS.md](../AGENTS.md): canonical repository instructions.
- `local.json`: private machine-specific overrides and secrets; do not commit.

## Maintenance workflow

Use the externally provided Agents CLI when changing configuration or reusable
skill instructions:

```bash
agents status
agents sync
agents sync --check
```

When introducing a server, also run `agents mcp test --runtime`. Do not add
unrequested servers or approve package-provided agent skills (ADR 0007).

Generated tool configuration and local state must remain untracked. The
selected integrations and sync mode determine the materialized outputs; use
`agents status` instead of assuming every supported output exists.

## Agent-neutral by default

Several coding agents share this repository (Codex, Claude, and Antigravity are
enabled in `agents.json`). Put every rule, skill, MCP server, and instruction in
the neutral sources above: `AGENTS.md`, `.agents/rules/`, `.agents/skills/`, and
`.agents/agents.json`. Do not create or edit tool-specific files such as
`.claude/`, `CLAUDE.md`, `.cursor/`, or `.gemini/`. They are generated or
machine-local, and `.gitignore` keeps them out of Git. A tool-specific need is
expressed through `agents.json` options, not by hand-editing its output.

The [Next.js maintenance rule](rules/cache.md) connects the version-matched
installed docs in `node_modules/next/dist/docs/` to the topic rules.
Use that reference for App Router, Cache Components, and framework diagnostic
ownership; existing route and component rules retain their stricter scope.

The [React maintenance rules](rules/react.md) link current official sources to
installed runtime/Compiler support and canonical guidance. The rules contain
focused implementation constraints. Source catalogs, API selection, version
applicability, and review checklists live in [agent references](../docs/agents/README.md).
