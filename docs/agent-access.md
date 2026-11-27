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

## Host integration

Prefer the upstream plugin (skills, native MCP, hooks and ShowArtifact). Run the resolve command to find the distribution directory; replace DIST below with that absolute path. Approve host permissions and hooks yourself and start a fresh session. Do not bypass approval or expose an unauthenticated server.

| Host | Official install | Project fallback |
| --- | --- | --- |
| Codex | `codex plugin marketplace add "DIST"`, then `codex plugin add open-artifact@open-artifact`; review /hooks | .codex/config.toml registers exam-open-artifact, using the local wrapper from repo root. Disable the duplicate fallback if native plugin is active. |
| Claude Code | `claude plugin marketplace add "DIST"`, then `claude plugin install open-artifact@open-artifact`; restart/reload | .mcp.json registers the same local wrapper. Approve project MCP; disable the duplicate fallback if native plugin is active. |
| Antigravity | `agy plugin install "DIST/antigravity"`; restart and review MCP permissions | Use the shared .agents skill; if native plugin cannot load, manually register node with absolute path to scripts/open-artifact-mcp.mjs and antigravity as argument, using the host's supported MCP configuration. |
| ChatGPT web | Official chatgpt connector through approved HTTPS tunnel or authenticated hosted MCP | No project config can automatically connect ChatGPT web to a local PC. |

Run `node scripts/open-artifact-runtime.mjs doctor claude-code` or `doctor antigravity` as appropriate. These invoke the upstream doctor in the isolated project fallback environment, not the host's actual active session. Run the official plugin doctor in that session too. A host session must list Artifact, ArtifactData, ArtifactComments, read existing board data and verify a reversible write/read and anchored comment on an isolated disposable board before claiming functional access. Do not mutate approved boards to test permissions. Verify real comment delivery and viewer interaction separately. Native host hooks are provided by the official plugins; fallback stdio alone does not provide hook-driven wake behavior.

The fallback daemon uses an isolated project-local home with OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY=1; it does not override existing global daemons. Project settings prefer workspace storage. Do not assume settings constrain an already-running global daemon; test the actual host. No remote auto-publish is configured. Keep credentials and private state out of Git.

## Existing boards and viewer boundaries

The canonical editable files are the eleven board folders under docs/boards and docs/releases/v0.1.0; current stage is in current-state.json. Use `node scripts/open-boards.mjs` for standalone native board viewing and the upstream whiteboard CLI for scoped reads/checks. The standalone viewer and the daemon library are distinct registries. For full Shell collaboration, use the native library's add-existing-folder flow for the same canonical board folder, verify root and stable identity, and let the user choose the owning session when needed. Do not create a duplicate board or transfer another session's ownership without authorization. GitHub Pages Playground is a static browser-memory preview, not a connected or persistent host; agent delivery is intentionally disabled.

## Verification

Run `node --test scripts/open-artifact-runtime.test.mjs`, `node scripts/check-boards.mjs`, and check the Pages workflow for capture and Playground verification. A green CI proves only what its steps check. Actual host permissions, MCP tool calls, comment delivery, export, workspace confinement and browser persistence require session-specific tests; report unavailable tools and never fake results.

Official references: [Codex](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/codex/README.md), [Claude Code](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/claude-code/README.md), [Antigravity](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/antigravity/README.md), [ChatGPT](https://github.com/JimLiu/open-artifact/blob/v0.17.0/plugins/chatgpt/README.md), [settings and doctor](https://github.com/JimLiu/open-artifact/blob/v0.17.0/docs/settings.md), [remote connection](https://github.com/JimLiu/open-artifact/blob/v0.17.0/docs/connecting-agents.md).
