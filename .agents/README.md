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

## Claude Code: global MCPs apply inside projects (scope parity)

The effective Claude Code MCP set in the Exam App must match the MCPs already
configured in the Claude Code `user` scope. A globally registered MCP is
available inside this workspace automatically; **do not duplicate it at the
`project` scope** to achieve parity. Duplicated Serena entries with different
commands/contexts cause `Conflicting scopes` diagnostics.

`.agents/agents.json` keeps `claude` as an enabled integration, but deliberately
excludes the `claude` target from `fetch`, `filesystem`, `git`, and `serena`.
Claude Code has built-in file, shell and Git tools, and the existing global
Serena supplies semantic code navigation. Other clients' MCP targets stay
unchanged. Keep `claudeScope: "project"` for any *future* explicitly
project-specific servers; switching it to `user` would unexpectedly publish
project-specific MCP definitions globally.

Recommended global Serena command for Claude Code (already installed on the
developer workstation; **not** installed by this repository):

```powershell
claude mcp add --scope user serena -- serena start-mcp-server --context claude-code --project-from-cwd
```

For a workspace with older project-scope entries, remove only those stale
entries (without removing the existing global registrations):

```powershell
claude mcp remove fetch --scope project
claude mcp remove filesystem --scope project
claude mcp remove git --scope project
claude mcp remove serena --scope project
claude mcp list
claude mcp get serena
```

`inspo`, `codegraph`, and the official `figma` plugin are managed through
their own global/plugin installers, not by this repository. Authenticate the
Figma plugin interactively when its MCP reports `Needs authentication`.
Do not copy global credentials or machine-specific paths into source control.

After `agents sync` and `agents sync --check`, check that Claude Code still
inherits the user-scoped tools and does not acquire duplicate project-scoped
MCPs. These source declarations are **not** proof of runtime connectivity.

## Serena MCP (Issue #117)

The shared source in `agents.json` declares `serena` for Codex,
Claude Desktop, Gemini and Antigravity. Claude Code inherits the separately
configured global Serena instead of receiving a project-scope duplicate. Its command uses the locally installed
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
   verify `fetch`, `filesystem`, `git` and `serena` on clients where they are
   targeted; in Claude Code, verify the global `serena` plus native file/Git
   tools without expecting redundant project-scoped MCPs.
3. Check Serena tool discovery and project activation in Codex, Claude Desktop
   and Antigravity after restarting each application. Record the command,
   context, tool-list result and any PATH/timeout error without secrets.
4. Update the planning board with **actual** runtime evidence and regenerate
   `BOARD.md`; do not fabricate passes or screenshots.

Official Serena documentation: [running the server](https://oraios.github.io/serena/02-usage/020_running.html)
and [client setup](https://oraios.github.io/serena/02-usage/030_clients.html).
