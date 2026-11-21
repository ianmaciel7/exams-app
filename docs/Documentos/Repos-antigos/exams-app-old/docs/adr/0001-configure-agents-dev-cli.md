# ADR 0001: Configure @agents-dev/cli

## Status
Accepted

## Date
2026-11-09

## Context
As the repository adopts AI-assisted development across different workflows, we require a single source of truth for agent behavior, instructions (`AGENTS.md`), and Model Context Protocol (MCP) server definitions. `@agents-dev/cli` was introduced to manage these configurations across multiple agent runtimes.

By default, `@agents-dev/cli` supports numerous IDE and CLI targets (such as Cursor, Windsurf, GitHub Copilot, Gemini Code Assist, Devin, etc.). Allowing unmanaged or unnecessary integrations creates unwanted adapter files, pollutes `.gitignore`, and complicates prompt context management.

## Decision
1. **Restrict Enabled Integrations**:
   Configure `.agents/agents.json` to enable exclusively the following toolchains:
   - `antigravity`: Google Antigravity environment.
   - `claude`: Claude Code CLI.
   - `codex`: Codex CLI.

2. **Prune Unused Tool Configurations**:
   Remove default settings and hidden paths for tools not actively in use (e.g., Cursor, Copilot CLI) to keep `.agents/agents.json` concise.

3. **Deterministic Sync Enforcement**:
   Enforce that all changes to `.agents/agents.json` must be materialized through `npx @agents-dev/cli sync` (`agents sync`), supporting reproducible synchronization locally; CI has not been configured.

4. **Installation & Reproducibility Recipe**:
   To reproduce this setup in a new project:
   ```bash
   # 1. Install CLI globally if not already installed
   pnpm add -g @agents-dev/cli

   # 2. Initialize project scaffolding
   agents init

   # 3. Connect exclusively supported agent runtimes
   agents connect --llm antigravity,claude,codex

   # 4. Synchronize tool adapter files
   agents sync
   ```

## Consequences

- **Positive**:
  - Central configuration for three enabled agent runtimes, without requiring generated adapter directories to be committed.
  - Minimized token overhead in agent system prompts.
  - Predictable synchronization across all team machines.
- **Negative / Operational**:
  - If a team member introduces a new agent runtime, it must be explicitly declared in `.agents/agents.json` and resynced before use.

---

## Implementation audit — 2026-11-11

- **Commit parity:** Atomic commit `feat(agents): configure @agents-dev/cli integrations (ADR 0001)`.
- **Current configuration:** `.agents/agents.json` enables `antigravity`, `claude`, `codex`, uses `syncMode: "source-only"`, and contains no configured MCP servers.
- **Verification boundary:** Agent synchronization remains a local operation via `agents sync`; configurations are verified locally without requiring remote CI.
- **Related implementation:** [ADR 0002](0002-add-basic-skills.md).
