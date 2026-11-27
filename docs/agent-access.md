# Open Artifact agent access

## Pinned runtime and setup

The canonical distribution is Open Artifact v0.17.0 (commit 0f6079853c8b0d2f4e9bddf5465ddbda722ce5a9). Node.js >=22.18 and tar.exe on Windows or unzip on Unix are required. From the repository root:

```sh
node scripts/open-artifact-runtime.mjs install
node scripts/open-artifact-runtime.mjs resolve
node scripts/open-artifact-runtime.mjs doctor codex
node scripts/open-boards.mjs
```

The installer verifies the published SHA-256 before extracting. It never updates shared/global plugins. The local cache is ignored by Git. An explicit absolute OPEN_ARTIFACT_SKILL_DIR or canonical OPEN_ARTIFACT_WHITEBOARD_CLI may be used only when the runtime version and all nine types match. The official type registry and project CLI use the same version as the Playground. Do not treat presence of files as a successful connection.

## Host integration — official plugin first

Use the upstream plugin (skills, native MCP, hooks and ShowArtifact) as the normal interactive integration. Run resolve to locate the pinned distribution; for a permanent marketplace install keep the official extracted distribution in a stable user-owned location outside disposable worktrees and use that path as DIST. The project does not auto-register a second MCP server. Approve host permissions and hooks yourself and start a fresh session. Do not bypass approval or expose an unauthenticated server.

| Host | Official install | Project fallback |
| --- | --- | --- |
| Codex | `codex plugin marketplace add "DIST"`, then `codex plugin add open-artifact@open-artifact`; review /hooks | Explicit opt-in only: see fallback below. |
| Claude Code | `claude plugin marketplace add "DIST"`, then `claude plugin install open-artifact@open-artifact`; restart/reload | Explicit opt-in only: see fallback below. |
| Antigravity | `agy plugin install "DIST/antigravity"`; restart and review MCP permissions | Use the shared .agents skill; if native plugin cannot load, manually register node with absolute path to scripts/open-artifact-mcp.mjs and antigravity as argument, using the host's supported MCP configuration. |
| ChatGPT web | Official chatgpt connector through approved HTTPS tunnel or authenticated hosted MCP | No project config can automatically connect ChatGPT web to a local PC. |

Run `node scripts/open-artifact-runtime.mjs doctor claude-code` or `doctor antigravity` as appropriate. These invoke the upstream doctor in the isolated project fallback environment, not the host's actual active session. Run the official plugin doctor in that session too. A host session must list Artifact, ArtifactData, ArtifactComments, read existing board data and verify a reversible write/read and anchored comment on an isolated disposable board before claiming functional access. Do not mutate approved boards to test permissions. Verify real comment delivery and viewer interaction separately. Native host hooks are provided by the official plugins; fallback stdio alone does not provide hook-driven wake behavior.

Do not mix official and fallback MCP registrations in one session. If the official plugin cannot load, prefer deterministic CLI reads/checks. For an MCP-only environment, register the absolute path to scripts/open-artifact-mcp.mjs with node and the correct harness argument under a local server name; do not enable both. The repository deliberately does not commit an active duplicate MCP server.

The fallback daemon uses an isolated project-local home with OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY=1; it does not override existing global daemons. Project settings prefer workspace storage. Do not assume settings constrain an already-running global daemon; test the actual host. No remote auto-publish is configured. Keep credentials and private state out of Git.

## Existing boards and viewer boundaries

The canonical editable files are the eleven board folders under docs/boards and docs/releases/v0.1.0; current stage is in current-state.json. Use `node scripts/open-boards.mjs` for standalone native board viewing and the upstream whiteboard CLI for scoped reads/checks. The standalone viewer and the daemon library are distinct registries. For full Shell collaboration, the owner may run the following from their own terminal with the official native daemon running:

```sh
node scripts/open-artifact-library.mjs catalog
node scripts/open-artifact-library.mjs status
node scripts/open-artifact-library.mjs register --apply
```

The catalog lists the eleven canonical paths. The status command is read-only. Registration calls the official local Library API for existing folders, checks runtime version, refuses conflicts and automatic cloud publishing, and is idempotent by canonical root. It never transfers ownership. The daemon assigns its own native IDs; it cannot be forced to reuse project preview IDs through its supported add API. The command returns the native mapping; the standalone viewer/Pages links use the stable preview IDs, and are not assumed to work unchanged in the shared native Shell. Use the native library navigation until an explicit, validated link strategy exists. Machine-local `.artifact.json` markers are ignored; do not commit them. The owner can choose the owning session in Ask. Do not create a duplicate board or transfer another session's ownership without authorization. GitHub Pages Playground is a static browser-memory preview, not a connected or persistent host; agent delivery is intentionally disabled.

## Verification

Run `node --test scripts/open-artifact-runtime.test.mjs`, `node scripts/check-boards.mjs`, and check the Pages workflow for capture and Playground verification. The separate Open Artifact agent access workflow tests actual stdio MCP with three harness labels, all nine types, cross-session reads, a real write and stale-write rejection, outside-workspace denial, actual hook command output for the three dialects, owner-only request delivery and anchored comment creation/reply/resolution on disposable folders, on Linux and Windows. The same workflow exercises owner-operated library registration on isolated copies of all eleven existing boards, checking explicit approval, idempotence, native record lookup, Shell boot and board-order verification, unowned records and unchanged source content. These are protocol and library probes, not evidence that the three installed host applications or their hooks were approved. A green CI proves only what its steps check. Actual host permissions, MCP tool calls, comment delivery, export, workspace confinement and browser persistence require session-specific tests; report unavailable tools and never fake results.

Official references: [Codex](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/codex/README.md), [Claude Code](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/claude-code/README.md), [Antigravity](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/antigravity/README.md), [ChatGPT](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/chatgpt/README.md), [settings and doctor](https://github.com/JimLiu/open-artifact/blob/v0.17.0/docs/settings.md), [remote connection](https://github.com/JimLiu/open-artifact/blob/v0.17.0/docs/connecting-agents.md).
