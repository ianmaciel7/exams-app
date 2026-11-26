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

### Open Artifact Whiteboard Tools & Architecture

All project whiteboards are powered by the Open Artifact Whiteboard runtime, persisted as granular files under `<board-dir>/db/`:
- **Data Persistence Architecture:**
  - `db/board/meta.json`: Core metadata (`id`, `title`, and `order`: an array of element IDs establishing strict layer order and render z-index).
  - `db/board/inks.json`: Palette definitions and custom stroke/fill swatches.
  - `db/elements/<element-id>.json`: One atomic JSON file per element, ensuring fine-grained Git tracking, conflict-free concurrent editing, and easy programmatic manipulation.

- **Available Native Tools & Elements:**
  - **Text (`type: "text"`) and native sticky notes (`type: "note"`):**
    - Properties: `x`, `y`, `text`, `size` (`small`, `body`, `large`, `title`), `color` (hex string).
    - Multi-line & word wrapping: for native text use the version-supported `wrap`/`width` property; for native `note` use `x`, `y`, `w`, `h`, `text`, a supported `color` and optional `tilt`. Do not substitute a free-text element for a native sticky note. Verify the installed schema.
    - Usage: Structural headings, section titles, metadata chips, note callouts, code blocks, and data labels.
  - **Hand-drawn Vector Linework & Pen Tool (`type: "stroke"`):**
    - Properties: `x`, `y`, `points` (flat coordinate array `[x0, y0, x1, y1, ...]` relative to `(x, y)`), `width` (native stroke thickness from 1.0 to 40; use the reusable marker-sketch preset (typically 1.8–3.4) for Sketch boards), `color` (hex string).
    - Usage: Loose paper-sketch polylines, arrows, borders, underline emphasis, dividers, and hand-drawn UI vector icons.
  - **Containers, Frames & Macro-Sections:**
    - Constructed using paired horizontal and vertical strokes (`_frame_t`, `_frame_b`, `_frame_l`, `_frame_r`).
    - Use macro-section frames and concise banners only when they help the owning stage communicate its purpose. A simple Sketch does not require multiple macro-sections, formal banners or specification panels. When a banner is useful, it may contain:
      1. Section tag (e.g. `SECTION 1 · APPLICATION SHELL`, size: `small`, accent color).
      2. Section title (e.g. `Application Workspace & Navigation`, size: `title`).
      3. Section subtitle / description (size: `body`, muted gray).
      4. Header divider stroke separating banner from content.
  - **Hand-Drawn UI Vector Iconography:**
    - Never substitute drawn UI icons with emojis or unicode text symbols.
    - Construct all icons as vector stroke primitives:
      - Terminals: `[> _]` (window outline + prompt chevron + cursor).
      - Briefcases: `[💼]` (rounded rectangular body + upper handle).
      - Home: `[☖]` (slanted roof lines + body rectangle).
      - Questions: `[?]` (circle outline + question mark arc + dot).
      - Settings: `[⚙]` (gear outline with central circular hole).
      - Theme: `[🌙]` (crescent moon curve).
      - Status: Segmented dashed circle (6 discrete diagonal arc strokes).
      - Share / Exit: Curved forward arrow with arched tail.
  - **Popover Menus & Elevated Cards:**
    - Enclosing card frame with directional pointer triangle pointing to the triggering anchor (e.g. user avatar).
    - Elevated internal items separated by divider strokes, with icon + text alignment and generous padding.
  - **Connectors, Dividers & Flow Arrows:**
    - Directed polylines connecting steps in user flows or separating structural card regions.

- **Layout, Baselines & Quality Gates:**
  - **Macro-baselines:** Align comparable section headers when multiple sections are actually needed. Do not impose production-level precision or extra section containers on exploratory Sketches.
  - **Padding & breathing room:** Leave enough visual clearance to prevent clipping and collisions. Exact production dimensions belong to later fidelity stages; the Sketch uses approximate spacing.
  - **Visual Verification Gate:** Always verify whiteboard changes with a browser subagent at both full-board overview (e.g. 16% zoom) and close-up detail (200% zoom) to guarantee zero clipped text, zero overlapping borders, and crisp visual hierarchy before committing.

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

### Sketch ink consistency

- Use the shared project-local `scripts/marker-sketch-ink.mjs` viewer pass when opening Sketch boards with `scripts/open-boards.mjs`. Treat all measurable native stroke paths consistently, including small icons and curved controls. Preserve topology, corner definition, endpoints, closed loops, semantic colors, hit paths and native editable geometry. Avoid periodic jitter and heavy double outlines. Native exports outside the launcher keep original geometry.
- Keep illustrative content abstract; retain recognizable essential controls and states. Use native `note` elements for design notes outside the interface, not free text posing as sticky notes. Keep the board at or below 800 elements for Open Artifact v0.16.3.
- Validate `node --test scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs scripts/check-boards.test.mjs` and `node scripts/check-boards.mjs`, then inspect real browser captures in Light and Dark. Confirm stroke coverage and small-icon styling, not just font availability. Report unvalidated behavior and export limits.

### Current workspace documentation alignment
- Keep current release decisions in the register and reconcile Markdown plus native IA, screen-inventory, user-flow and release-stage boards. Preserve historical references and distinguish proposed interaction from approved scope. The visible Questions subtitle is omitted beneath the competition heading; Questions remains the conceptual destination name. Avoid reintroducing the account popover, duplicate Settings, Commented key or separate Associated text control.

## Stage responsibilities and fidelity boundaries

Treat the following as this project's activity and artifact ownership contract, not a mandatory waterfall or a universal UX process. Select the smallest artifact that answers the current question. Activities can overlap, be revisited, or be skipped with a recorded reason; a stage never becomes complete just because a later artifact exists. Keep the release stage board, release index and actual artifacts aligned.

| Activity | Owns / expected output | Does not own |
| --- | --- | --- |
| 01 Product discovery | Problem, users, goals, scope, constraints, assumptions, evidence, decisions and success criteria. Release decision register. | Screen layout, detailed component design, production code. |
| 02 Information architecture | Destinations, content groups, hierarchy, terminology, relationships, navigation/findability. Concise destination map. | Screen-by-screen layout, detailed action sequences, exhaustive state matrices. |
| 03 Screen inventory | Required screens, surfaces/overlays, key states and coverage gaps; links to flows. | Full wireframes, component internals, final visual design or implementation. |
| 04 User flows | Task paths, entry/exit points, decisions, alternatives, error/recovery paths and outcomes. | Pixel-level layout, component catalog, final tokens or exhaustive event contracts. |
| 05 Sketch | Quick exploratory drawings of composition, hierarchy, approximate regions, recognizable controls, a few states/alternatives that clarify the hypothesis, and concise external native notes. | Taxonomy tables, exhaustive component/state catalogs, full content fixtures, detailed statistics specifications, trigger/consequence matrices, production dimensions/tokens, mockups or executable interaction. |
| 06 Low-fidelity wireframe | Selected structural layout: content priority, placement, hierarchy, essential controls and representative responsive/state variants. | Final styling, decorative polish, exhaustive technical interaction or implementation. |
| 07 Mid-fidelity wireframe | Refined layout, realistic representative content where needed, component placement, important responsive and state behavior, more precise spacing and hierarchy. | Final brand treatment, production-ready visuals, complete implementation. |
| 08 High-fidelity wireframe | Near-final structural and content detail, critical edge cases, consistent components and accessibility intent where relevant. | Mandatory final color/brand styling, working backend or proof of usability. |
| 09 Mockup | Visual design: final-intent typography, color, spacing, component variants, imagery and responsive visual decisions. | Working behavior, data persistence, backend or verified interaction merely from appearance. |
| 10 Interactive prototype | Executable or clickable representative tasks, transitions, state changes, feedback and recovery for validating hypotheses. Record what is simulated, test evidence and limits. | Production system guarantees, final data architecture or claimed accessibility/usability without testing. |

### Supporting work is not another mandatory stage

- Store research, historical captures, detailed example question formats, component anatomy/taxonomy, exhaustive state matrices, metric definitions, trigger/event/transition rules and exploratory technical contracts as clearly labeled supporting references or scoped interaction specifications. Place approved requirements in the decision register or the owning specification; link instead of duplicating. Interaction/component specifications, design-system documentation, accessibility review and usability testing can support multiple stages as needed. Production implementation and QA are separate from these design artifacts.
- Do not dump every reference into the active board. In Sketch, keep a screen or small set of thumbnails and short notes that directly answer the exploration question. Use abstract content and recognizable actions; retain only the essential state/overlay sketches that materially clarify the layout. Move out-of-stage material to a linked reference artifact (preserve original source and scope/status). Do not promote an exploratory reference into an approved requirement or mark a later stage as started just because reference material exists.
- For each change, verify the `dev` branch at the start and end, identify the owning stage and hypothesis, inspect the entire active board, remove or relocate non-owning content, preserve stable IDs and links where feasible, update the decision register and stage status, then verify board integrity and the relevant visual/interaction evidence. Review the full board, not just the edited crop. Do not create empty stage folders or force all fidelity levels when they add no value.
- Distinguish **Progress** (Not started, In progress, Baseline documented, Completed) from **Validation** (Pending, In progress, Passed, Not applicable). A static sketch or screenshot can establish appearance only; interaction, accessibility, official exam rules and usability need independent evidence. Explicitly record remaining uncertainty.

- Before adding a Sketch section, ask whether the drawing directly tests the current composition or essential state. If not, keep it as linked supporting material or in the responsible stage; do not add headings, legends, frames, catalogs or annotations merely to satisfy a generic board template. Prefer the existing release reference board for historical component studies.
