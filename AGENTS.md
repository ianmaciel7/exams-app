# Agent instructions

## Language and writing style

- Write project-authored content in English, including file and directory names, documentation, board content, and code comments. Preserve imported references and source evidence in their original language when appropriate.
- Prohibit emojis and pseudo-emoji Unicode symbols across all project deliverables, documentation, board artifacts, UI sketches, wireframes, code, and commit messages. Never insert decorative or conversational emojis. Never substitute drawn UI icons with text characters, unicode glyphs, or bracketed symbols (such as `[◨]`, `[☷]`, `[✎]`, `[📊]`, `[📁]`). All interface icons in whiteboards, sketches, and mockups must be explicitly constructed as hand-drawn vector primitives (`stroke`, `path`, or semantic geometry) using the whiteboard's native drawing capabilities.
- Prohibit AI slop, conversational filler, sycophancy, hollow buzzwords, puffery, and boilerplate pleasantries. Keep all writing direct, concise, factual, and strictly grounded in empirical evidence.

## Boards and project memory

- When in doubt about the project, consult the `exams-archive-native` (Exams Archive) plugin and its relevant skills whenever its historical Exam App or Notes App decisions, interfaces, screenshots, code, research, or prior context could help. This includes archived references to other products, such as QConcursos, and their captured interface states. Inspect the actual source or image before relying on it; an indexed path or filename alone does not establish its contents. Treat findings as historical evidence, verify their source and applicability to the current release, and do not turn reference features into approved requirements without a decision. If the archive is unavailable, say so rather than inventing its contents.
- Store project-wide boards in `docs/boards/`, each in its own descriptively named directory. Store release-specific boards alongside the relevant stage under `docs/releases/<version>/`.
- Give every whiteboard a distinct, descriptive name. Also verify that its browser tab title identifies the board: a unique board name inside the canvas does not guarantee a unique tab title. If the viewer displays a generic title such as `Whiteboard`, report the limitation rather than claiming it is fixed, and investigate the viewer's title handling before changing shared plugin code.
- Use `docs/boards/overview/` for the overall project. Create additional boards when a topic, flow, or investigation needs its own space.
- Use `docs/boards/release-stages/` to track releases and link to their stage artifacts; `docs/releases/` holds the actual release-specific records and boards.
- Whenever a stage progresses, a decision changes, or an artifact is created, update the relevant release-stage card, status, links, boards, and related documentation in the same task. Check for stale statements before finishing; distinguish a documented baseline from work validated with users.
- Record important information, decisions, findings, and references on the relevant board; preserve visual evidence and associated files too.
- Store reference materials under `docs/references/`; when the source date is known, prefix their filenames with `YYYY-MM-DD`. Keep original reference contents intact and distinguish claims and proposals from verified project decisions.
- Keep links or paths to related sketches, wireframes, prototypes, and versions to make navigation easier.
- Preserve each board's content and native format. Do not replace a visual board with a Markdown document.
- For UI sketches, use `especialista-ui-ux:sketch-de-interface` when available; for wireframes, use the relevant UI/UX plugin skill. Distinguish sketch, low-, mid-, and high-fidelity wireframes, mockups, and interactive prototypes. For editable Open Artifact sketches, also follow the whiteboard skill.

## Wireframes, prototypes, and versions

- Store release-specific sketches and wireframes under `docs/releases/<version>/`, grouped by stage or topic. Keep reusable, cross-release material separate from release-specific artifacts.
- Reserve `prototypes/<prototype-name>/` for actual prototypes, including interactive prototypes used to validate experiences.
- When versions need to remain accessible side by side for comparison, use subdirectories such as `v1/` and `v2/`; record their purpose and main differences on the relevant board.
- For small changes that do not need to coexist, prefer Git history over duplicating directories.
- Do not remove existing versions, evidence, or decisions without authorization.
- Preserve release-specific product discovery and decisions in `docs/releases/<version>/product.md` (lowercase). Keep the root `PRODUCT.md` as evolving product context; append dated decisions and note superseded assumptions in the relevant release record instead of rewriting its history. Reference each stage's actual output and status on the release board, and mark proposed or missing artifacts clearly.
- Keep each release's information architecture, screen inventory, user flows, sketches, wireframes, and mockups under `docs/releases/<version>/` in descriptively named stage folders. Create folders when an artifact exists, not as empty placeholders. Interactive application prototypes belong under `prototypes/` and should be referenced from the release record.

## Hierarchical multi-agent orchestration

### Orchestration model
- Adopt a hierarchical **Orchestrator-Workers** model based on the official guidelines and best practices of Anthropic Claude Code, OpenAI Codex, and Google Antigravity.
- Use native platform capabilities rather than reinventing existing multi-agent primitives.
- Structure agent roles dynamically across five levels:
  1. **Orchestrator / Coordinator:** Primary agent responsible for understanding goals, retrieving context, decomposing tasks, delegating, tracking progress, handling blockers, integrating results, and running acceptance validation. Preserves context by delegating heavy operational work.
  2. **Worker Sessions / Threads:** Independent focused sessions executing defined work scopes.
  3. **Subagents:** Specialized on-demand agents for research, code exploration, implementation slices, or domain tools.
  4. **Agent Teams / Swarms:** Collaborative teams for problems requiring shared state and inter-agent communication.
  5. **Evaluators / Verifiers:** Independent validation agents responsible for review, automated tests, UI/UX audit, accessibility, and quality verification. Implementation agents must not be the sole validation source.

### Architectural patterns
Select dynamically the simplest pattern adequate for the problem:
- **Single Agent:** Simple, atomic tasks.
- **Orchestrator-Workers:** Dynamic decomposition and task delegation.
- **Parallelization:** Independent concurrent tasks.
- **Prompt Chaining:** Sequential dependent stages.
- **Routing:** Directing tasks to domain specialists (e.g., UI/UX specialist, historical archive research).
- **Agent Teams / Swarm:** Distributed collaboration on complex interconnected challenges.
- **Evaluator-Optimizer:** Iterative refinement against explicit quality gates.
- **Manager Pattern:** Centralized coordination of multiple specialized subagents.

### Model selection for delegation
- Use a capable coordinator for planning, integration, and final review. Keep small or sequential tasks in the main agent when delegation adds no value.
- When the platform and session permit model selection, choose a lighter model for bounded, low-risk work, and a more capable or vision-specialized model when the task requires it. A specialist may be more capable than the coordinator.
- Prefer capability-based choices over fixed model names; availability, quality, cost, and latency vary across providers and sessions. Respect higher-priority instructions and platform restrictions, and do not claim a model override occurred without verifying it.
- If model selection is unavailable or subagents inherit the coordinator's model, use the available default and report that limitation when it matters. Model assignments and agent capabilities must be configured through each platform's supported native mechanisms; this guidance alone does not enforce them.
- The coordinator remains accountable for checking delegated findings against evidence and the user's requirements, regardless of the model used.

### Delegation contract
Every delegated activity must specify:
- **Identifier:** Short unique task ID.
- **Goal:** Clear, actionable objective.
- **Context & Scope:** Relevant background, explicit inclusions, and exclusions.
- **Ownership:** Exact files, directories, or modules assigned to the agent.
- **Tools & Permissions:** Minimum necessary privileges (e.g., read-only vs. write).
- **Acceptance Criteria & Validation:** Concrete, verifiable success conditions and the independent verification procedure.
- **Return Format:** Structured, synthesized summary pointing to generated artifacts rather than raw conversational logs.

### Context management and isolation
- Maintain independent context windows across agents; share only relevant inputs and summarize outputs.
- Never flood the coordinator with raw command dumps or bulk file reads.
- Use Git Worktrees when multiple agents perform concurrent edits to avoid file contention.
- Monitor token and resource consumption; avoid uncontrolled recursive agent spawns.

### Platform-native capabilities
- **Anthropic Claude Code:** Claude Projects, Coordinator, Project Threads, Project Memory, Subagents, Agent Teams, Git Worktrees, Skills, Hooks, and `CLAUDE.md`.
- **OpenAI Codex:** Subagents, Parallel Agent Workflows, Agent Threads, Custom Agents, Git Worktrees, `AGENTS.md`, and Agent Skills.
- **Google Antigravity:** Custom Subagents (`invoke_subagent`), Background Tasks, Asynchronous Execution, `/swarm`, Dynamic Workflows (`run_workflow`), Git Worktrees, Skills, Rules, and Hooks.

### Independent validation and quality gates
- Separate implementation from verification. Employ automated test suites, accessibility checks, visual inspections, and independent agent reviews before signing off on deliverables.
- Record findings, decisions, and evidence in project whiteboards (`docs/boards/`, `docs/releases/`) and documentation.
