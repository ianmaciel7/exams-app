# Agent instructions

Exam App: study app for exams (certifications and Brazilian public-service exams).

## Mandatory synchronization with Claude Cloud & Live Artifact

All agents working in this repository must keep the codebase and the live Claude artifact synchronized with the active remote Claude Cloud session:

- **Active project thread:** https://claude.ai/code/project/chan_013qMDV6HM5kW8Z4atVzkN6s?thread=cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu
- **Remote tracking branch:** `origin/claude/project-thread-6zihkn` (and other `origin/claude/project-thread-*` branches).
- **Live prototype artifact:** https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC (slug: `a728ae48-3fa2-4dbf-9092-0392c90b58f7`).

### Synchronization procedure:
1. **Fetch & Align Git Branches**:
   - Always run `git fetch origin` before starting and inspect remote branches.
   - If Claude pushed new commits remotely, merge/rebase them into `dev`.
   - If changes are committed to `dev`, push them back to `origin/claude/project-thread-6zihkn` to keep the cloud thread up to date.
2. **Sync the Live Claude Artifact (Zero-Token CLI & Automated Hooks)**:
   - **Automated Git Hooks:** Git hooks are configured in `.githooks/` (`post-commit` and `post-merge`). Whenever `prototypes/exam-app-0.1.1/index.html` is committed or merged/pulled on `dev`, the hook runs `sync:artifact` automatically. Enable in any clone with:
     ```bash
     npm run setup:hooks # or: git config core.hooksPath .githooks
     ```
   - **Automated CI (GitHub Actions):** `.github/workflows/sync-artifact.yml` runs on push to `dev` whenever `prototypes/exam-app-0.1.1/index.html` changes. If `CLAUDE_ARTIFACT_TOKEN` is set in GitHub repository secrets, CI deploys the artifact automatically on merge.
   - **Manual deploy command:**
     ```bash
     npm run sync:artifact
     ```
   - *How it works:* Uses `claude-artifact-cli` (`uvx --from claude-artifact-cli claude-artifact publish --mode patch --url https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC prototypes/exam-app-0.1.1/index.html`).
   - *Why it's critical:* It calls Anthropic's direct frame deploy API (`/api/frame/deploy/direct`) using the local machine's existing Claude login token. It requires **zero model generation tokens**, **no paid API keys**, and **bypasses the 5-hour chat rate limit** completely.
   - *Verify status:*
     ```bash
     uvx --from claude-artifact-cli claude-artifact status --url https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC prototypes/exam-app-0.1.1/index.html
     ```

## Planning board and memory preservation

- **Mandatory rule:** All information, visual references, screenshots, discoveries, UX decisions, and cross-session memories must always be recorded and preserved in the Planning Board (`prototypes/board-exam-app/board.json` / `BOARD.md` and `assets/`).
- `board.json` is the source of truth; never edit `BOARD.md` by hand. Regenerate it with `npm run board`.
- No architectural decision, UX finding, or implementation progress should be lost between AI assistant sessions.

## Run the prototype (any tool)

The prototypes are static HTML. No build step, no dependencies beyond Python 3.

```bash
npm run dev          # or: python -m http.server 8765 --directory prototypes
npm run sync:artifact # publishes 0.1.1 directly to the live Claude artifact
```

Then open:

- Current prototype: http://localhost:8765/exam-app-0.1.1/index.html
- Previous version: http://localhost:8765/exam-app-0.1.0/index.html
- Planning board viewer: http://localhost:8765/board-exam-app/index.html

Do not open `index.html` with `file://`: the app fetches PDFs and JSON, which needs HTTP.

## Edit the prototype

- The app is a single file: `prototypes/exam-app-0.1.1/index.html` (HTML + CSS + JS inline, about 380 KB). Search it by section instead of reading it whole.
- Data: `prototypes/exam-app-0.1.1/data/dataprev-2026-tipo1.json`. Source PDFs: `.../pdfs/`.
- App state (reading position, zoom, theme, spaces) is kept in the browser's `localStorage`, so it is per browser and per port.
- After an edit, reload the page and check the browser console for errors.

## Planning board

- Read `prototypes/board-exam-app/BOARD.md` (text). `board.json` is the source of truth; never edit `BOARD.md` by hand. Regenerate it with `npm run board`.

## Claude Artifact Sync (Zero-Token CLI)

- The live Claude artifact at `https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC` can be updated directly from `prototypes/exam-app-0.1.1/index.html` without burning model tokens, prompts, or waiting for 5-hour rate limits:
  ```bash
  npm run sync:artifact
  ```
- This uses `uvx --from claude-artifact-cli claude-artifact publish --mode patch` which uses the machine's cached Claude OAuth token to patch the artifact via Anthropic's direct frame deploy API (`/api/frame/deploy/direct`).

## Other

- Design and planning material: `prototypes/README.md`.
- Archived legacy code is in `docs/archives/` (see `docs/archives/REUSE-MAP.md` on the `chore/project-tooling` branch).

## Recovering context and session history across AI agents

When continuing work across different AI agents or recovering context from past discussions, check these locations:

### Claude (Claude Code CLI, Desktop & Cloud)
- **CLI transcripts**:
  - `~/.claude/projects/<project-slug>/<session-id>.jsonl` — Full per-session logs (prompts, tool calls, thinking, outputs).
  - `~/.claude/history.jsonl` — Global command history.
- **Desktop App state & cache (LevelDB/IndexedDB)**:
  - `%LOCALAPPDATA%\Claude-Data\claude_pzs8sxrjxfjjc\claude-code-sessions\`
  - `%LOCALAPPDATA%\Claude-Data\...\Local Storage\leveldb\`
  - `%LOCALAPPDATA%\Claude-Data\...\IndexedDB\`
- **Project auto-memory**:
  - `~/.claude/projects/<project-slug>/memory/MEMORY.md` and related topic markdown files (e.g. `cross-tool-session-recovery.md`).
- **Cloud branches & PRs**:
  - Cloud sessions push branches named: `origin/claude/project-thread-*`.
  - Active Cloud Thread: [chan_013qMDV6HM5kW8Z4atVzkN6s](https://claude.ai/code/project/chan_013qMDV6HM5kW8Z4atVzkN6s?thread=cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu) (message ID: `cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu`).
  - Check PRs and review comments via GitHub CLI:
    ```powershell
    gh pr list --state all
    gh pr view <num> --comments
    ```
- **Searching session messages/IDs with PowerShell**:
  ```powershell
  # Search transcripts or Desktop cache for a specific channel (chan_*) or message (cmsg_*) ID:
  Get-ChildItem -Path "$env:USERPROFILE\.claude\projects" -Filter "*.jsonl" -Recurse | Select-String -Pattern "cmsg_"
  Get-ChildItem -Path "$env:LOCALAPPDATA\Claude-Data" -Recurse -File | Select-String -Pattern "chan_"
  ```

### OpenAI Codex (CLI & App)
- **Session transcripts**:
  - `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` — Full timestamped session logs.
  - `~/.codex/archived_sessions/` — Compressed / archived past sessions.
- **Session index**:
  - `~/.codex/session_index.jsonl` — Quick index containing `id`, `thread_name`, and `updated_at`.
- **History & SQLite state**:
  - `~/.codex/history.jsonl` — Command history.
  - `~/.codex/state_5.sqlite` — Main application state.
  - `~/.codex/thread_history_1.sqlite` — Thread interaction database.
- **Isolated worktrees**:
  - `~/.codex/worktrees/` — Working copies and checkouts managed by Codex.

### Google Gemini (Antigravity & Gemini CLI)
- **Conversation transcripts**:
  - Compact transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`
  - Full transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`
- **Project memories via Serena MCP**:
  - `.serena/memories/*.md` (e.g. `.serena/memories/cross-tool-session-recovery.md`, `archives-reuse-map.md`)

