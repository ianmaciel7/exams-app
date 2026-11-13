# Agent instructions

Exam App: study app for exams (certifications and Brazilian public-service exams).

> [!IMPORTANT]
> ### Regra Obrigatória de Sincronização com Claude Cloud
> Todo agente trabalhando neste repositório DEVE OBRIGATORIAMENTE sincronizar com a sessão remota do Claude Cloud:
> - **Link do projeto/thread:** https://claude.ai/code/project/chan_013qMDV6HM5kW8Z4atVzkN6s?thread=cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu
> 
> **Procedimento:**
> 1. Sempre execute `git fetch origin` antes de iniciar qualquer trabalho e verifique as branches remotas (`origin/claude/project-thread-*` e `origin/dev`).
> 2. Verifique qual dos dois lados está desatualizado (o repositório local/dev ou o Claude remoto).
> 3. Ambos os lados PRECISAM SEMPRE estar sincronizados. Se o Claude remoto enviou commits novos, faça o merge imediatamente em `dev`. Se você fizer alterações na `dev`, faça o push ou abra/atualize o PR correspondente para que o Claude remoto tenha o código atualizado.

## Run the prototype (any tool)

The prototypes are static HTML. No build step, no dependencies beyond Python 3.

```bash
npm run dev          # or: python -m http.server 8765 --directory prototypes
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

