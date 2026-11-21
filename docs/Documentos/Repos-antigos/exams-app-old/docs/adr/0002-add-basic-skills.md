# ADR 0002: Add Basic Skills (agents-cli, ask-matt, code-review, domain-modeling, gh, git-adr-sync, grill-with-docs, prompt, save)

## Status
Accepted

## Date
2026-11-09 (Updated 2026-11-11 for git-adr-sync v2 & remote equalization)

## Context
Following the configuration of `@agents-dev/cli` (ADR 0001), the project needed a set of reusable, actionable skills to assist developers and agents in planning, architecture design, and CLI operations.

During experimentation with `skills.sh` (`mattpocock/skills`), multiple sub-skills (such as `grilling` and `domain-modeling`) were installed. However, exposing too many fragmented or overlapping sub-skills directly in `.agents/skills/` adds cognitive load and bloats agent prompt context.

Furthermore, while IDEs like Antigravity provide native slash commands for continuous learning (`/learn`), headless CLI runtimes like Claude Code (`claude`) and Codex CLI (`codex`) lack built-in mechanisms to persist user corrections, constraints, and project conventions across sessions without ceremonial overhead.

We needed a clean, focused selection containing the core foundational skills required for our development and learning workflows.

## Decision

We establish nine dedicated project skills under `.agents/skills/`:

1. **`agents-cli`**:
   - **Role**: Operational reference and manual for `@agents-dev/cli`.
   - **Purpose**: Provides agents with explicit procedures for managing MCP servers, checking schema integrity (`agents doctor`), synchronizing tool definitions (`agents sync`), and handling environment secrets.

2. **`ask-matt`**:
   - **Role**: Workflow navigation router and phase boundary guide.
   - **Purpose**: Acts as the conversational starting point for the development lifecycle. It routes the developer or agent to the right phase (exploration, prototyping detours, spec generation, implementation, or retrospective). It also bundles `PHASE-BOUNDARIES.md` to guide decisions on when to continue, clear, handoff, delegate to subagents, or compact context.

3. **`code-review`**:
   - **Role**: Two-axis code review workflow (Standards & Spec).
   - **Purpose**: Reviews branch or PR diffs along two independent axes: Standards (checking standards, using `CODING_STANDARDS.md` if it exists) and Spec (verifying acceptance criteria from the originating issue). Executes parallel reviewer subagents and presents findings side-by-side.

4. **`domain-modeling`**:
   - **Role**: Ubiquitous language and domain model sharpening.
   - **Purpose**: Guides agents and developers in challenging fuzzy terminology, optionally creating/maintaining `GLOSSARY.md` as domain concepts emerge, and recording hard-to-reverse decisions as ADRs.

5. **`gh`**:
   - **Role**: GitHub CLI automation patterns.
   - **Purpose**: Provides structured patterns for querying and manipulating pull requests, issues, repo metadata, and API calls via the GitHub CLI (`gh`) directly from coding agents.

6. **`git-adr-sync`**:
   - **Role**: Atomic ADR and Git history synchronization driver (v2).
   - **Purpose**: Provides a safe, deterministic, non-interactive workflow for synchronizing Architecture Decision Records (ADRs) directly into their implementing Git commits, maintaining clean chronological progression without post-hoc fixup commits.
   - **Architecture & Invariants (v2)**:
     - **Mandatory Worktree Selection**: Before any repository inspection, script execution, or history modification, the agent must ask the user whether to run in an isolated worktree (`New worktree`) or directly in the current workspace (`Current worktree`). Never assume or default.
     - **Progressive Disclosure**: Organized into `SKILL.md` (invariants and execution rules), `references/git-workflows.md` (HEAD amend, fixup + autosquash, multi-ADR squashes, merge/root commit handling), `references/safety-and-recovery.md` (backup refs, reflog, portable bundles, `--force-with-lease`), `scripts/adr_sync.py`, `scripts/test_adr_sync.py`, and `evals/evals.json`.
     - **Deterministic Python 3 CLI (`scripts/adr_sync.py`)**: Built strictly with Python 3 standard library (`subprocess`, `pathlib`, `os`, `sys`, `json`, `argparse`). Provides read-only `plan` (with `--no-optional-locks`, NUL-delimited status parsing, ancestry verification) and mechanical `verify` (bit-for-bit non-ADR tree invariance, clean working tree check, range-diff comparison).
     - **Automated Test Suite (`scripts/test_adr_sync.py`)**: 28 automated unit tests using isolated temporary Git repositories, verifying all clean/dirty, historical, merge, conflict, upstream tracking, and recovery edge cases.
     - **Remote Equalization & Local Cleanup Protocol**: Detects upstream tracking branches (`upstreamBranch`, `upstreamSha`, `remoteSyncRequired`) in `adr_sync.py plan`. Post-verification steps enforce safe remote synchronization via `--force-with-lease=refs/heads/<branch>:<remote-sha>` to prevent divergence (`ahead N, behind N`), followed by automatic pruning of temporary local backup references (`backup/<branch>-before-sync-*`) and isolated worktrees.
     - **Existing ADR Priority Guardrail**: When updating, syncing, or recording architectural decisions, the agent must **always update the existing governing ADR** (e.g., this ADR 0002 for skills) rather than creating new redundant ADRs. Creating a new ADR is prohibited unless the user explicitly requests a new ADR or no existing ADR owns the domain.
     - **Artifact & Cache Ignore Policy**: Session deliverables (`/docs/artifacts/`) and Python bytecode caches (`__pycache__/`, `*.py[cod]`) are ignored in `.gitignore` to prevent working tree pollution and ensure clean synchronization.
     - **Safety Invariants**: Immutable timestamped backup refs (`backup/<branch>-before-sync-*`), strict ancestor checks (`git merge-base --is-ancestor`), and push-with-lease protection (`--force-with-lease=refs/heads/<branch>:<remote-sha>`).

7. **`grill-with-docs`**:
   - **Role**: Stateful architecture interview and documentation driver.
   - **Purpose**: Runs a structured interview to stress-test requirements and assumptions before coding. It automatically captures domain terminology in `GLOSSARY.md` and hard-to-reverse design choices as Architecture Decision Records (ADRs in `docs/adr/`).

8. **`prompt`**:
   - **Role**: Context-dense, boilerplate-free AI task handoff prompt generator.
   - **Purpose**: Generates high-precision, destination-focused handoff prompts for another AI session or subagent to execute code changes, refactorings, or bug fixes cleanly. Enforces concrete final implementation code ("Como Vai Ficar"), repository mechanical guardrails, zero generic boilerplate, executable verification commands, branch/PR workflows, and knowledge persistence via `/save`.

9. **`save`**:
   - **Role**: Anemic / lightweight rule and procedure persistence driver.
   - **Purpose**: Provides Claude Code, Codex, and Antigravity with a zero-ceremony equivalent of `/learn` (invoked as `/save`). It extracts invariants and user corrections from interactions, persisting guardrails directly to `AGENTS.md` and multi-step procedures to `.agents/skills/` without ceremonial artifact bloat.

### Excluded Skills
- Standalone copy of `grilling` is excluded from direct installation as its interview practices are orchestrated directly through `grill-with-docs`, keeping the project directory uncluttered.

### Documentation & Discovery
- `.agents/skills/README.md` documents active skills and provides template conventions for authoring new skills.

### Dependency Management & Synchronization
- **Installation & Lockfile**: External skills from GitHub (`mattpocock/skills` and `cli/cli`) are installed via `npx skills add <source> --skill <name>` and strictly tracked with provenance and SHA-256 hashes in `skills-lock.json`:
  ```bash
  # Install external skills
  npx skills add mattpocock/skills --skill ask-matt code-review domain-modeling grill-with-docs -y
  npx skills add cli/cli --skill gh -y
  agents sync
  ```
- **Synchronization**: Running `npx @agents-dev/cli sync` (`agents sync`) materializes tool-specific configurations whenever skills are added, removed, or modified.

## Consequences

- **Positive**:
  - High-signal, non-redundant skill catalog: clear entrypoint (`ask-matt`), domain modeling (`domain-modeling`), two-axis review and standards enforcement (`code-review`), deep design interview (`grill-with-docs`), GitHub CLI automation (`gh`), atomic ADR commit synchronization (`git-adr-sync`), context-dense AI handoff prompts (`prompt`), continuous lightweight learning and rule persistence (`save`), and tool management (`agents-cli`).
  - Cross-agent capability parity: brings portable `/save` (or `/learn`) functionality to headless environments like Claude Code and Codex without heavy ceremony.
  - Minimized prompt overhead across supported LLM environments (`antigravity`, `claude`, `codex`).
  - Reproducible skill provenance locked in version control via `skills-lock.json`.
  - Refactored `git-adr-sync v2` with deterministic Python CLI, 28 automated unit tests, remote equalization safeguards, and strict existing-ADR priority guardrails.
- **Negative / Operational**:
  - Adding future skills requires reviewing overlap with existing workflows before committing and updating `skills-lock.json`.

---

## Implementation audit — 2026-11-11

- **Commit parity:** Atomic commit `feat(skills): add basic skills - agents-cli, ask-matt, code-review, domain-modeling, gh, git-adr-sync, grill-with-docs, prompt, save (ADR 0002)`.
- **Verified files:** Nine directories under `.agents/skills/` contain a `SKILL.md`, and `skills-lock.json` records five externally sourced skills. `CODING_STANDARDS.md` and `GLOSSARY.md` do **not** currently exist in the repository root; do not claim that those artifacts are implemented.
- **History policy:** `git-adr-sync` (v2, Python CLI) enforces 1:1 atomic parity between ADRs and their introducing commits, maintaining clean chronological progression without post-hoc fixup commits. When modifying existing capabilities, updates are merged into their existing governing ADR rather than spawning redundant ADRs.
- **Verification boundary:** Agent skills and synchronization were inspected as files, with external skill dependencies tracked in `skills-lock.json`.
