# .agents

Project-local standard for AGENTS.md + MCP + SKILLS.

## Quick workflow
- `agents status` to inspect enabled integrations and MCP state.
- `agents mcp add <url-or-name>` to add one server for all selected tools.
- `agents mcp test --runtime` to validate connectivity.
- `agents sync` to materialize generated configuration.
- `agents sync --check` for CI-safe drift detection.

## Source files (commit these)
- `agents.json`: selected integrations + MCP servers + workspace behavior
- `skills/*/SKILL.md`: project skills

## Root instruction file
- `../AGENTS.md`: canonical instruction document

## Local/private files (do not commit)
- `local.json`: machine-specific MCP overrides and secrets

## Generated files
- `generated/*`: renderer outputs used by `agents sync`
- `mcp_config.json`: Antigravity CLI workspace MCP config
- `generated/vscode.settings.state.json`: managed VS Code hide state

## Common materialized outputs
- `.codex/config.toml`
- `.gemini/settings.json`
- `.vscode/mcp.json`
- `.vscode/settings.json`
- `.cursor/mcp.json`
- `.agents/mcp_config.json`
- `opencode.json`
- `.windsurf/skills/`
- `~/.codeium/windsurf/mcp_config.json` (global)

## Serena MCP (Issue #117)

The shared source in `agents.json` now declares `serena` for Codex, Claude Code,
Claude Desktop, Gemini and Antigravity. Its command uses the locally installed
`serena` executable and activates this repository with `--project ${PROJECT_ROOT}`.
This is a **declaration**, not evidence that Serena is running on every Windows
client. Do not commit machine-specific absolute executable paths or credentials.

Serena's [official client guide](https://oraios.github.io/serena/02-usage/030_clients.html)
recommends a **client-specific context**, which the shared server entry cannot
express uniformly. In the target client's local configuration, use:

| Client | Recommended `--context` |
| --- | --- |
| Codex CLI / App | `codex` |
| Claude Code | `claude-code` |
| Claude Desktop | `desktop-app` |
| Antigravity | `antigravity` |
| Gemini CLI | `ide` |

Apply those overrides in the local client configuration after `agents sync`
and do not rewrite `agents.json` with machine-specific values. In clients that
use global configuration or cannot infer the workspace, explicitly activate
the Exam App project. On Windows, ensure `serena` can be resolved by the
application process (`Get-Command serena` in PowerShell). If it cannot, set
the actual local executable path in private configuration, not in Git.

### Validation required before closing #117

1. Run `agents sync`, then `agents sync --check`; the CI workflow validates
   **source-level synchronization** only.
2. Run `agents mcp test` and `agents mcp test --runtime` on the Windows machine;
   verify `fetch`, `filesystem`, `git` and `serena`, rather than assuming
   a registered server has started successfully.
3. Check Serena tool discovery and project activation in Codex, Claude Desktop
   and Antigravity after restarting each application. Record the command,
   context, tool-list result and any PATH/timeout error without secrets.
4. Update the planning board with **actual** runtime evidence and regenerate
   `BOARD.md`; do not fabricate passes or screenshots.

Official Serena documentation: [running the server](https://oraios.github.io/serena/02-usage/020_running.html)
and [client setup](https://oraios.github.io/serena/02-usage/030_clients.html).
