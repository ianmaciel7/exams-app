# Cross-Tool Session & Context Recovery

This memory documents the exact file system locations, index structures, databases, and retrieval strategies across Claude, OpenAI Codex, and Google Gemini. Use this when resuming interrupted tasks, tracing past decisions, finding conversation history, or cross-referencing work between AI tools.

---

## 1. Claude (Claude Code CLI, Desktop & Cloud)

### CLI Transcripts & History
- **Project-specific session transcripts**:
  - Path: `~/.claude/projects/<project-slug>/<session-id>.jsonl`
  - In Windows: `C:\Users\ianma\.claude\projects\<project-slug>\<session-id>.jsonl` (e.g., `C--Users-ianma-workspace-exams-app`).
  - Each line is a JSON record containing step index, role, user requests, tool executions, thinking, and assistant responses.
- **Global command history**:
  - Path: `~/.claude/history.jsonl`
  - Records user prompts and invocation timestamps across all sessions.

### Desktop App Cache & State (LevelDB & IndexedDB)
- **Session storage**:
  - `%LOCALAPPDATA%\Claude-Data\claude_pzs8sxrjxfjjc\claude-code-sessions\`
- **Local Storage & IndexedDB**:
  - `%LOCALAPPDATA%\Claude-Data\<profile>\Local Storage\leveldb\`
  - `%LOCALAPPDATA%\Claude-Data\<profile>\IndexedDB\`
- Stores UI state, workspace tabs, channel messages, and active conversation caches.

### Project Auto-Memory
- **Memory directory**:
  - `~/.claude/projects/<project-slug>/memory/MEMORY.md`
  - Specific topic memory files: `~/.claude/projects/<project-slug>/memory/<topic>.md`

### Cloud Branches & PRs
- Cloud web and remote agent runs push branches named:
  - `origin/claude/project-thread-*`
- Inspect pull requests and review comments using GitHub CLI:
  ```powershell
  gh pr list --state all
  gh pr view <pr-number> --comments
  ```

### PowerShell Search for Channel and Message IDs
```powershell
# Search for channel (chan_*) or message (cmsg_*) IDs across Claude project transcripts:
Get-ChildItem -Path "$env:USERPROFILE\.claude\projects" -Filter "*.jsonl" -Recurse | Select-String -Pattern "cmsg_"
Get-ChildItem -Path "$env:LOCALAPPDATA\Claude-Data" -Recurse -File | Select-String -Pattern "chan_"
```

---

## 2. OpenAI Codex (CLI & App)

### Session Transcripts & Archives
- **Daily rollout logs**:
  - `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`
  - Windows path: `C:\Users\ianma\.codex\sessions\YYYY\MM\DD\rollout-*.jsonl`
- **Archived sessions**:
  - `~/.codex/archived_sessions/`

### Session Index
- **Index file**:
  - `~/.codex/session_index.jsonl`
  - Each entry contains `{ "id": "...", "thread_name": "...", "updated_at": "..." }`, enabling fast lookups without scanning raw logs.

### Command History & SQLite State
- `~/.codex/history.jsonl` — Command history across runs.
- `~/.codex/state_5.sqlite` — Main SQLite state database.
- `~/.codex/thread_history_1.sqlite` — Thread interaction database storing conversation turns, tool messages, and session details.

### Isolated Worktrees
- `~/.codex/worktrees/`
- Contains isolated git worktrees created for parallel task runs.

---

## 3. Google Gemini (Antigravity & Gemini CLI)

### Conversation Transcripts
- **Transcript logs**:
  - Compact transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`
  - Full transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`
  - In Windows: `C:\Users\ianma\.gemini\antigravity\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`
  - Each line is a JSON record with `step_index`, `source`, `type` (`USER_INPUT`, `PLANNER_RESPONSE`), `thinking`, `tool_calls`, `status`, and timestamps.

### Project Memories via Serena MCP
- **Project memories**:
  - `.serena/memories/*.md` in the repository root (e.g. `archives-reuse-map.md`, `cross-tool-session-recovery.md`).
  - Shared knowledge base accessible across Gemini / Serena agent sessions.
