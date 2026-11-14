---
name: mcp-troubleshooting
description: Diagnose and fix MCP configuration/runtime issues across supported integrations using agents CLI checks.
---

When MCP servers are failing or not visible:

1. Run `agents status --fast` to inspect configured vs enabled integrations.
2. Run `agents mcp test` for schema/config validation.
3. Run `agents mcp test --runtime` to check integration CLI/runtime connectivity.
4. Run `agents doctor` for environment and binary diagnostics.
5. Apply the smallest safe fix, then run `agents sync` and verify with `agents sync --check`.

Troubleshooting priorities:
- Missing binaries or PATH issues.
- Invalid server names/transport fields.
- Missing required environment variables or secrets.
- Target mismatch (server not routed to expected integration).

Claude Code scope-parity rule:
- First inspect `claude mcp list` for `Conflicting scopes` and check which
  registrations are `user` versus `project`.
- Project work inherits global (`user`) servers. Never add project-scope
  copies of `serena`, `fetch`, `filesystem` or `git` to make the two
  scopes look alike; the **effective** MCP tools should match without duplicates.
- Serena for Claude Code belongs in the user scope with
  `--context claude-code --project-from-cwd`. The project may retain
  `.serena/project.yml` for workspace-specific language configuration.
- Correct `.agents/agents.json` (not just generated local files) when
  sync has recreated conflicting Claude Code registrations. Preserve other
  clients' targets and validate `claude mcp list` after `agents sync`.
