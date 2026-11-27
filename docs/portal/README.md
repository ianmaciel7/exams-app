# Native board preview (experimental)

The existing GitHub Pages screenshot portal is the stable view. The optional native preview uses the upstream Open Artifact Playground v0.17.0, pinned to commit `0f6079853c8b0d2f4e9bddf5465ddbda722ce5a9`. See [upstream deployment documentation](https://github.com/JimLiu/open-artifact/blob/v0.17.0/website/README.md#deploy).

The Pages workflow builds the screenshot portal first using its existing v0.16.3 runtime. The isolated native build reads the same committed board snapshot, uses the upstream Shell and whiteboard editor, and tests the exact persisted element IDs for all ten boards at a repository subpath before making the preview available. No original board, state screenshot, or plugin installation is migrated. The optional step is allowed to fail: if it fails, the stable portal is still published without a native preview link.

When available, the portal header links to `playground/`. Edits and new comments in this preview are temporary browser-memory changes, not synchronized to GitHub. The simulated agent is disabled. Private/local runtime comments and history are deliberately excluded. Native rendering may differ from the project-specific v0.16.3 screenshot styling; visual parity, existing anchored comment display, mobile interactions and user approval remain separate review gates before replacing the stable view.

Rollback: remove the optional workflow step; the screenshot portal continues to work. Do not replace the stable portal until the owner approves the native preview.
