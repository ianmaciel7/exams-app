# Agent instructions

## Language and writing style

- Write project-authored content in English, including file and directory names, documentation, board content, and code comments. Preserve imported references and source evidence in their original language when appropriate.
- Prohibit emojis and pseudo-emoji Unicode symbols across all project deliverables, documentation, board artifacts, UI sketches, wireframes, code, and commit messages. Never insert decorative or conversational emojis. Never substitute drawn UI icons with text characters, unicode glyphs, or bracketed symbols (such as `[◨]`, `[☷]`, `[✎]`, `[📊]`, `[📁]`). All interface icons in whiteboards, sketches, and mockups must be explicitly constructed as hand-drawn vector primitives (`stroke`, `path`, or semantic geometry) using the whiteboard's native drawing capabilities.
- Prohibit AI slop, conversational filler, sycophancy, hollow buzzwords, puffery, and boilerplate pleasantries. Keep all writing direct, concise, factual, and strictly grounded in empirical evidence.

## Mandatory proactive gap review and advance notification

- Before starting any design, planning, documentation, implementation, or revision task, proactively inspect the current artifact and its related requirements for missing essential states, interactions, edge cases, dependencies, contradictions, and decisions. Do not wait for the product owner to discover or request an obvious omission.
- Before implementing or omitting a material state or making an unapproved product decision, explicitly notify the product owner of the gap, its impact, and the proposed treatment. Communicate concrete findings, not generic progress. For newly discovered gaps during work, notify the owner as soon as discovered and before proceeding with the affected decision. If a gap was missed, acknowledge it, identify the cause, and correct the applicable coverage checklist.
- For each screen or flow, review the relevant lifecycle and interaction states: default, selection and active states, pending/loading, successful and unsuccessful outcomes, empty/no-results, errors and recovery, disabled/unavailable states, and responsive or accessibility variants where applicable. For questions specifically, always consider unanswered, selected before evaluation (if applicable), correct and incorrect responses, and the distinction between the user's selected answer and the correct answer. Do not silently omit essential feedback.
- Record applicable states, justified exclusions, and unresolved decisions in the owning artifact or linked state inventory. Sketch the essential visual variants side by side in the same screen row; keep exhaustive technical matrices in their appropriate supporting artifacts. This review is mandatory even for simple or early sketches, but does not authorize scope expansion or invent requirements. Continue independent approved work while decisions remain open.
- Before declaring work complete, cross-check state coverage against the initial review and the user's instructions; explicitly report remaining gaps, blockers, unverified states, and decisions that still require the owner's approval. Never present an incomplete artifact as fully validated.

- **Mandatory anchored review comments:** For sketches, wireframes, and other visual boards, use native sticky notes for explanatory context and native open comment threads anchored to the relevant element for material unresolved decisions, questions, or review findings. Review existing threads before creating duplicates. Keep threads open until the product owner confirms the decision; then synchronize the owning artifacts and resolve the thread. Do not simulate threads with text or notes. If the runtime or host cannot create or validate native comments, report that limitation explicitly rather than claiming success. Do not create decorative comments when no meaningful review question exists.

- **Evidence-first clarification:** Before asking the owner a question, review the current reduced release scope and previously recorded decisions, including historical ExamTopics and QConcursos research in Exams Archive when relevant. Reuse supported decisions; distinguish observed behavior from recommendations. Ask only material unresolved questions affecting the current work, not out-of-scope future features. If evidence is inaccessible, disclose the gap rather than inventing a finding.

## Cross-file dependency and cascade synchronization

- **Mandatory interrelated file identification:** Whenever any file (documentation, design artifact, planning board, data model, component, test, or code) is created, modified, or deleted, the agent must proactively identify all related, downstream, upstream, and referenced files that share that domain, concept, or dependency.
- **Atomic cascade update in the same task:** The agent must inspect and update all identified interrelated files within the exact same task. Never leave partial updates for a future turn. Stale statements, broken references, divergent specifications, and out-of-sync documentation across interrelated files are strictly prohibited.
- **Zero orphaned or contradictory statements:** Prohibit updating an isolated file while leaving contradictory or obsolete statements in companion artifacts (for example, updating a screen layout or interaction while leaving superseded references in the screen inventory, information architecture, user flows, decision register, or planning boards).
- **Scope and dependency perimeter verification:** Before concluding any change, review the full dependency perimeter across markdown records, visual canvas boards, schemas, contracts, and code to guarantee mutual consistency and complete conceptual alignment.

## Boards and project memory

- When in doubt about the project, consult the `exams-archive-native` (Exams Archive) plugin and its relevant skills whenever its historical Exam App or Notes App decisions, interfaces, screenshots, code, research, or prior context could help. This includes archived references to other products, such as QConcursos, and their captured interface states. Inspect the actual source or image before relying on it; an indexed path or filename alone does not establish its contents. Treat findings as historical evidence, verify their source and applicability to the current release, and do not turn reference features into approved requirements without a decision. If the archive is unavailable, say so rather than inventing its contents.
- Store project-wide boards in `docs/boards/`, each in its own descriptively named directory. Store release-specific boards alongside the relevant stage under `docs/releases/<version>/`.
- Give every whiteboard a distinct, descriptive name. Also verify that its browser tab title identifies the board: a unique board name inside the canvas does not guarantee a unique tab title. If the viewer displays a generic title such as `Whiteboard`, report the limitation rather than claiming it is fixed, and investigate the viewer's title handling before changing shared plugin code.
- Use `docs/boards/overview/` as the project-wide Ideas Board; it is the only populated planning board after the 2026-11-26 reset. Existing empty board directories are intentional restart placeholders, not evidence of stage progress. New release work requires explicit selection from the Ideas Board. Prior work is preserved at `archive/v0.1.0-before-reset-20261126`. Create additional boards when a topic, flow, or investigation needs its own space.
- Use `docs/boards/release-stages/` to track releases and link to their stage artifacts; `docs/releases/` holds the actual release-specific records and boards.
- Whenever a stage progresses, a decision changes, or an artifact is created, update the relevant release-stage card, status, links, boards, and related documentation in the same task. Check for stale statements before finishing; distinguish a documented baseline from work validated with users.
- Record important information, decisions, findings, and references on the relevant board; preserve visual evidence and associated files too.
- Store reference materials under `docs/references/`; when the source date is known, prefix their filenames with `YYYY-MM-DD`. Keep original reference contents intact and distinguish claims and proposals from verified project decisions.
- Keep links or paths to related sketches, wireframes, prototypes, and versions to make navigation easier.
- Preserve each board's content and native format. Do not replace a visual board with a Markdown document.
- For UI sketches, use `especialista-ui-ux:sketch-de-interface` when available; for wireframes, use the relevant UI/UX plugin skill. Distinguish sketch, low-, mid-, and high-fidelity wireframes, mockups, and interactive prototypes. For editable Open Artifact sketches, also follow the whiteboard skill.

### Open Artifact whiteboards and token-efficient execution

Before creating or changing any project whiteboard, read [whiteboard guidelines](docs/boards/whiteboard-guidelines.md) and the applicable whiteboard skill. Those requirements apply to project-wide and release-specific boards.

- **Token efficiency and native Open Artifact APIs:**
  - Never dump, iterate, or re-read hundreds of atomic JSON files (`db/elements/*.json`) into conversation transcripts or terminal logs.
  - Use native Open Artifact CLI operations:
    - `write-db <dir> <json|file>`: Apply atomic batch mutations (`[{op: "set"|"update"|"delete", path, data}]`) in a single payload rather than rewriting individual files piecemeal.
    - `read-db <dir> [path]`: Query specific documents or collections targetedly.
    - `context <dir>`: Inspect the viewer's active viewport, zoom level, and selected elements directly without launching heavy browser subagents.
    - `comments <dir>` / `wait <dir>`: Read comment threads and user requests submitted from the canvas via "Send to agent".
    - `check <dir>` and `node scripts/check-boards.mjs`: Validate schema and board integrity in one step.
  - Use native high-level elements: use `type: "note"` for multi-line sticky notes and text wrapping properties rather than decomposing sentences or cards into dozens of separate stroke and text files. Avoid micro-element explosion (e.g., separate files for individual underlines or dots).
- **Interactive canvas collaboration over blind coordinate guessing:**
  - The live board is served locally and viewed directly by the user in their browser. Do not spawn browser subagents for routine visual checks or coordinate exploration; use `context <dir>`, read user comments, and allow the user to make or review visual adjustments directly on the canvas.
- **Spacious composition and prevention of spatial congestion:**
  - Never trap distinct interface states or artboards (such as an expanded workspace and a collapsed rail) inside a single suffocating bounding box.
  - Separate distinct representations with generous whitespace (150px to 250px gap).
  - Avoid tight outer section frames. Give ample padding (80px to 120px) around content, and place external design notes comfortably beneath workspaces without crowding the interface borders.

## Wireframes, prototypes, and versions

- Store release-specific sketches and wireframes under `docs/releases/<version>/`, grouped by stage or topic. Keep reusable, cross-release material separate from release-specific artifacts.
- Reserve `prototypes/<prototype-name>/` for actual prototypes, including interactive prototypes used to validate experiences.
- When versions need to remain accessible side by side for comparison, use subdirectories such as `v1/` and `v2/`; record their purpose and main differences on the relevant board.
- For small changes that do not need to coexist, prefer Git history over duplicating directories.
- Do not remove existing versions, evidence, or decisions without authorization.
- Preserve release-specific product discovery and decisions in `docs/releases/<version>/product/README.md`. Keep the root `PRODUCT.md` as evolving product context; append dated decisions and note superseded assumptions in the relevant release record instead of rewriting its history. Reference each stage's actual output and status on the release board, and mark proposed or missing artifacts clearly.
- Keep each release's information architecture, screen inventory, user flows, sketches, wireframes, and mockups under `docs/releases/<version>/` in descriptively named stage folders. Create folders when an artifact exists, not as empty placeholders. Interactive application prototypes belong under `prototypes/` and should be referenced from the release record.

## Hierarchical multi-agent orchestration

### Orchestration model and mandatory delegation
- The coordinator/primary agent is strictly an orchestrator. It must preserve its context for planning, integration, and user communication rather than exhausting it on operational chores.
- **Prohibition of coordinator monopolization:** The coordinator MUST NOT execute heavy operational work directly in the coordinator session. Specifically, the coordinator must not perform multi-file code modifications, write or execute scripts for data manipulation or board mutations, perform deep repository or archive explorations, or execute batch refactoring. All operational implementation, exploratory code/archive research, and board modifications MUST be delegated to specialized worker subagents via platform-native delegation (`invoke_subagent`).
- **Mandatory parallel decomposition and fan-out:** Whenever a task spans multiple independent domains, screens, modules, files, research avenues, or deliverables (e.g., editing multiple screens, updating documentation alongside implementation, concurrent architectural studies, or testing separate component slices), the coordinator MUST decompose the objective and dispatch multiple specialized worker subagents concurrently in parallel.
- **Prohibition of single-worker serial bottlenecking:** Confining execution to a single worker dispatched serially across multiple independent tasks or workstreams is strictly forbidden. Serial bottlenecking exhausts turns, introduces unnecessary latency, and undermines multi-agent capabilities. All independent slices of work must run in parallel subagents simultaneously.
- **Strict separation of implementation and verification:** The coordinator and the worker agent MUST NEVER be the sole verifiers of their own work. Every implementation task MUST have an independent evaluator/verifier subagent validate the results (running test suites, integrity checks, diff inspections, and verifying alignment with requirements) before the coordinator accepts the deliverable. Self-certification and unverified completion claims are strictly forbidden.
- Use native platform capabilities rather than reinventing existing multi-agent primitives.
- Structure agent roles dynamically across five levels:
  1. **Orchestrator / Coordinator:** Primary agent responsible for understanding goals, retrieving high-level context, decomposing tasks, delegating via formal contracts, tracking progress, handling blockers, integrating results, and routing deliverables to independent verifiers. Never performs heavy operational execution or self-validation.
  2. **Worker Sessions / Threads:** Independent focused sessions executing defined work scopes.
  3. **Subagents:** Specialized on-demand agents for research, code exploration, implementation slices, or domain tools.
  4. **Agent Teams / Swarms:** Collaborative teams for problems requiring shared state and inter-agent communication.
  5. **Evaluators / Verifiers:** Independent validation agents responsible for review, automated tests, UI/UX audit, accessibility, and quality verification. Implementation agents must not be the sole validation source.

### Architectural patterns
Select dynamically the simplest pattern adequate for the problem while strictly respecting the delegation mandate:
- **Single Agent:** Restricted strictly to trivial, single-step questions (e.g., answering a factual question from existing context without code edits or board mutations). Any multi-step task, file editing, script execution, or board change requires orchestrator-worker delegation.
- **Orchestrator-Workers:** Default pattern for all non-trivial tasks. The coordinator decomposes work and delegates to concurrent worker subagents, followed by an evaluator subagent.
- **Parallel Fan-Out (Mandatory):** Independent concurrent tasks dispatched across parallel worker subagents. Whenever a task spans multiple files, screens, architectural areas, or artifacts, parallel dispatch is required.
- **Prompt Chaining:** Sequential dependent stages strictly reserved for situations where the output of one worker directly gates or feeds the contract of the next; never use prompt chaining for independent work that can run concurrently.
- **Routing:** Directing tasks to domain specialists (e.g., UI/UX specialist, historical archive research).
- **Agent Teams / Swarm:** Distributed collaboration on complex interconnected challenges.
- **Evaluator-Optimizer:** Iterative refinement against explicit quality gates, pairing a worker with an independent verifier.
- **Manager Pattern:** Centralized coordination of multiple specialized subagents.

### Model selection for delegation
- Use a capable coordinator for planning, integration, and final review. Delegate operational work, multi-file edits, and board updates to workers rather than doing them in the coordinator session.
- When the platform and session permit model selection, choose a lighter model for bounded, low-risk work, and a more capable or vision-specialized model when the task requires it. A specialist may be more capable than the coordinator.
- Prefer capability-based choices over fixed model names; availability, quality, cost, and latency vary across providers and sessions. Respect higher-priority instructions and platform restrictions, and do not claim a model override occurred without verifying it.
- If model selection is unavailable or subagents inherit the coordinator's model, use the available default and report that limitation when it matters. Model assignments and agent capabilities must be configured through each platform's supported native mechanisms; this guidance alone does not enforce them.
- The coordinator remains accountable for checking delegated findings against evidence and the user's requirements, regardless of the model used.
- Route by risk and uncertainty, not task size alone: bounded reversible work can use a lighter tier; ordinary implementation needs adequate capability; security, data integrity, concurrency, irreversible changes, or repeated failure warrant escalation or independent review. Reassess and de-escalate routine work after new evidence.
- Model selection is host-dependent: use an authorized available tier, never bypass access or silently incur additional paid usage, and disclose unsupported routing or fallback when it affects the task. Do not claim the coordinator model switched automatically.
- Evaluate choices using acceptance outcomes and observable model, effort, latency, and usage where available; do not invent measurements or log private prompts or credentials. Keep scope and verification proportionate to risk.

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
- Reuse verified findings while their sources are unchanged. Retrieve the smallest relevant source section; read each applicable skill's required instructions, then open only references needed for the task.
- Process large logs, board JSON and search results locally; return concise findings with source paths and enough evidence for verification. Request focused browser state or screenshots; avoid full accessibility trees for large canvases when not needed.
- Fan out independent work across parallel subagents to maximize throughput and isolation. Give each worker only the context it needs; avoid duplicating the same investigation. Respect platform and user instructions governing delegation and model choice.
- Batch independent reads and checks when safe. Rerun validation when changed inputs, failures, or uncertainty justify it; choose coverage and independent verification proportionate to risk and the applicable quality gates.
- Use Git worktrees when concurrent edits would conflict. Do not force worktrees for read-only or isolated work.
- Treat context compaction and prompt caching as host-managed. Do not claim cache hits or savings without measurements, and do not use arbitrary token caps that compromise required work.
- Record durable decisions and evidence once in their authoritative location and link to them from the relevant board. Avoid copying transcripts or repeating unchanged material.

### Platform-native capabilities
- **Anthropic Claude Code:** Claude Projects, Coordinator, Project Threads, Project Memory, Subagents, Agent Teams, Git Worktrees, Skills, Hooks, and `CLAUDE.md`.
- **OpenAI Codex:** Subagents, Parallel Agent Workflows, Agent Threads, Custom Agents, Git Worktrees, `AGENTS.md`, and Agent Skills.
- **Google Antigravity:** Custom Subagents (`invoke_subagent`), Background Tasks, Asynchronous Execution, `/swarm`, Dynamic Workflows (`run_workflow`), Git Worktrees, Skills, Rules, and Hooks.

### Independent validation and quality gates
- Strictly separate implementation from verification. Employ automated test suites, accessibility checks, visual inspections, and independent evaluator subagents before signing off on deliverables.
- Neither the implementing subagent nor the coordinator may sign off on work without independent verification. The coordinator must dispatch an evaluator/verifier subagent to run verification steps (such as `node scripts/check-boards.mjs`, test suites, and requirements compliance checks) and report findings.
- Record findings, decisions, and evidence in project whiteboards (`docs/boards/`, `docs/releases/`) and documentation.

### Sketch ink consistency

- Use the shared project-local `scripts/marker-sketch-ink.mjs` viewer pass when opening Sketch boards with `scripts/open-boards.mjs`. Treat all measurable native stroke paths consistently, including small icons and curved controls. Preserve topology, corner definition, endpoints, closed loops, semantic colors, hit paths and native editable geometry. Avoid periodic jitter and heavy double outlines. Native exports outside the launcher keep original geometry.
- Keep illustrative content abstract; retain recognizable essential controls and states. Use native `note` elements for design notes outside the interface, not free text posing as sticky notes. Keep the board at or below 800 elements for Open Artifact v0.16.3.
- Validate `node --test scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs scripts/check-boards.test.mjs` and `node scripts/check-boards.mjs`, then inspect real browser captures in Light and Dark. Confirm stroke coverage and small-icon styling, not just font availability. Report unvalidated behavior and export limits.

### Current workspace documentation alignment
- Keep current release decisions in the register and reconcile Markdown plus native IA, screen-inventory, user-flow and release-stage boards. Preserve historical references and distinguish proposed interaction from approved scope. Previous UI decisions are candidates only after the 2026-11-26 reset; do not treat them as current restrictions.

## Stage responsibilities and fidelity boundaries

Treat the following as this project's activity and artifact ownership contract, not a mandatory waterfall or a universal UX process. Select the smallest artifact that answers the current question. Activities can overlap, be revisited, or be skipped with a recorded reason; a stage never becomes complete just because a later artifact exists. Keep the release stage board, release index and actual artifacts aligned.

| Activity | Owns / expected output | Does not own |
| --- | --- | --- |
| 01 Product discovery | Problem, users, goals, scope, constraints, assumptions, evidence, decisions and success criteria. Release decision register. | Screen layout, detailed component design, production code. |
| 02 Information architecture | Destinations, content groups, hierarchy, terminology, relationships, navigation/findability. Concise destination map. | Screen-by-screen layout, detailed action sequences, exhaustive state matrices. |
| 03 Screen inventory | Required screens, surfaces/overlays, key states and coverage gaps; links to flows. | Full wireframes, component internals, final visual design or implementation. |
| 04 User flows | Task paths, entry/exit points, decisions, alternatives, error/recovery paths and outcomes. | Pixel-level layout, component catalog, final tokens or exhaustive event contracts. |
| 05 Sketch | Quick exploratory drawings of composition, hierarchy, approximate regions, recognizable controls, all essential visual states/alternatives applicable to the hypothesis, with other applicable states tracked in the linked inventory, and concise external native notes. | Taxonomy tables, exhaustive component/state catalogs, full content fixtures, detailed statistics specifications, trigger/consequence matrices, production dimensions/tokens, mockups or executable interaction. |
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

## Screen and variant layout convention

Arrange distinct screens/destinations vertically, one row per screen. Arrange states, scroll positions, responsive variants and alternative versions of the same screen horizontally within its row. Align the top of comparable artboards and leave clear spacing; do not imply a separate route just because a state has its own artboard. A page's pagination footer at the end of scroll is a horizontal variant of that same page, not a separate destination. Apply this convention to future UI sketch and wireframe boards unless the product owner specifies otherwise.

## Impeccable and design documentation synchronization

- Read root `PRODUCT.md`, provisional `DESIGN.md`, and the owning release records before visual work. Apply the UI/UX Specialist and Impeccable guidance when available; report any missing executable or unavailable reference. Never infer final tokens or approval from a Sketch.
- After any accepted scope change or exploratory visual refinement, review all active documentation and companion board notes (Product, Information Architecture, Screen Inventory, User Flows, Sketch, Release Stages, glossary, root context and documentation index). Update affected files together; retain historical references and unrelated agent/runtime records. Mark proposals, verified evidence and open decisions distinctly. During a running capture, use independent permitted time to investigate outstanding Pages publication issues rather than repeatedly polling alone.

## Shared wireframe component consistency

For repeated workspace variants, define shared shell controls and geometry once and generate their native board elements from a common source. Verify common controls are present in every applicable state, regardless of data or answer lifecycle; exceptions must be documented. For Mid-Fidelity, use `node scripts/sync-mid-fidelity.mjs --write` to synchronize managed elements and `node scripts/check-boards.mjs` to reject drift. Preserve editable native output and review captures in both board themes. Extend the shared source incrementally to repeated component families rather than introducing production UI prematurely.

## Current release contract and optical alignment gate

For v0.1.0, keep `docs/releases/v0.1.0/current-state.json`, the nine active status summaries (root Product/Design, docs index, release record and five release-stage READMEs), the four planning-board notes and Release Stages synchronized. Historical Sketch and Low-Fidelity remain immutable design snapshots; label their old review status as historical. Run `node scripts/check-boards.mjs`, which checks the current release contract as well as native board integrity. Do not merely append a new note below a contradictory current status. Review the Ideas Board's current-scope caption and preserve unselected candidates.

For shared components, align actual rendered icon and text optical centers, not just their bounding boxes. Check normal/selected/hover padding, header and Ghost trigger, multiline option alignment, feedback and pagination boundary states. The source of truth is the shared native-element generator where applicable; capture and visually inspect every affected variant in both board themes before declaring the alignment fixed. Structural checks do not establish visual or functional approval.

For collapsed navigation, distinguish control reveal from automatic panel peek. Keep the expand glyph visible at desktop pointer rest without a button background; add hover/focus feedback without reflow, retain the visible trigger on no-hover devices, and require explicit activation. In wireframes, illustrate default, hover, pressed, disabled, focus and pending as distinct states. Preserve control dimensions and avoid decorative motion; do not claim a static board implements effects. Check current-state.json, planning notes and linked documents when updating these contracts.

Use a single clear focus indicator where the surrounding surface permits sufficient contrast. Match the shape to the component, reserve space without reflow, and compare default/focused states on the actual same background; never simulate an outline with nested filled shapes that introduce unrelated edges. Respect WCAG 2.2 focus visibility and non-text contrast; distinguish AAA Focus Appearance guidance from AA requirements. Retain keyboard/touch alternatives, verify forced colors and no obscuration during prototype testing. Current native capture review remains mandatory.

## Planning boards must remain populated

The Project Hub, Ideas Board, Release Stages, Product, Information Architecture, Screen Inventory and User Flows are active navigation and planning artifacts, not empty placeholders or title-only summaries. Keep native links, current scope, stage statuses and structured content synchronized with current-state.json and the release documents. Preserve the approved historical Sketch and Low-Fidelity boards. Validate actual captures of all registered boards, not only the current wireframe states; CI must reject incomplete planning boards. Do not invent later-stage work to fill a blank board.

For planning boards, measure native element dimensions before arranging links, captions, notes and headings. Follow the planning-board spacing rules in `docs/boards/whiteboard-guidelines.md`; structural consistency rejects crowded link cards and Project Hub captions. Verify visible spacing in actual captures rather than relying solely on element counts.

## Canonical release projections and capture provenance

Update `docs/releases/v0.1.0/current-state.json` first; run `node scripts/sync-release-state.mjs --write` to project stages, inventory, decisions, flows, board notes, hub links and generated documents. Do not edit generated fields independently. `node scripts/check-boards.mjs` checks projection drift and actual variant IDs. Distinguish last successful capture (manifest SHA), last recorded visual review and owner approval. CI checks out the event SHA and verifies manifest provenance. Open decisions remain explicitly open until approved; historical records are immutable evidence. Do not infer review or approval from a successful build.

## Owner decision gate

Before closing each stage, audit the decision register. Ask only for unresolved product decisions whose alternatives materially affect behavior, with a recommended choice and trade-off. Do not ask for technical details that can be resolved from standards and evidence. Record owner answers in the canonical release state; remove resolved entries from pendingDecisions and retain technical validation separately. Synchronize native boards, generated documentation, and relevant studies before claiming completion. Do not treat owner decisions as visual approval or tested implementation.

## Evidence-based fidelity progression gate

Each design stage must answer a distinct unresolved question. Similar layouts are acceptable when they preserve approved composition; changing the rendering style, increasing pixel precision or multiplying variants alone does not demonstrate progress. Before starting or closing a stage, record its question, inherited decisions/invariants, new evidence or detail needed, smallest useful representative scenarios, review/test method, findings, limits and next question. Reference the preceding artifact rather than recreating its entire state matrix. Essential lifecycle coverage remains mandatory; the screen inventory and flows own the complete state coverage, and the visual stage selects the states needed to test its hypothesis. Component studies are supporting evidence, not additional routes or a reason to duplicate every screen. Preserve approved historical snapshots. Do not close a stage on structural CI success alone; visual approval and functional evidence remain separate.

- Sketch: explore alternative compositions and approximate regions/essential controls; avoid precise measurements.
- Low-Fidelity: test selected structure, hierarchy, navigation, grouping and representative structural states; abstract content where appropriate.
- Mid-Fidelity: test realistic content, density, wrapping, controls and critical responsive states; use provisional geometry, not final tokens or exhaustive implementation specs.
- High-Fidelity Wireframe: resolve remaining structural precision, dimensions, overflow and edge-case specifications; only undertake a separate pass if it answers a new structural question. Do not merge or skip a formal stage without owner approval.
- Mockup: resolve final-intent visual appearance, typography, iconography, colors and component styles.
- Interactive Prototype: test representative operable actions, transitions, recovery and accessibility behavior; document simulations and limits.
- Usability Testing: record observed user-task evidence, findings and iterations. Test early whenever useful; the formal stage does not prohibit earlier testing.

Source: [shared UX design activities and progression gate](https://github.com/ianmaciel7/exams-app-archive/blob/main/docs/references/ui-ux-research-sources/ux-design-activities-2026-11-25.md). This is a project convention, not a universal linear process.

## Non-regression gate between fidelity stages

Fidelity increases must preserve approved semantic content, functionality, controls, states, responsive behavior, locale and accessibility intent. A smaller representative scenario set is acceptable only when every inherited obligation is explicitly mapped to a complete workspace, a supporting component specimen, or a traceable approved source with a justified stage-appropriate deferral. A link to the prior board alone is not evidence that a currently applicable state is visually represented. Do not use fewer artboards or green structural CI as proof of completeness.

Before creating a new stage, read the approved baseline at its immutable SHA and derive a coverage ledger from the inventory, flows, decisions and component/state contracts. For every requirement record stable ID, predecessor evidence, current target element IDs or artifact, status (represented, missing, deferred), reason and validation evidence. Verify complete representative screens (no unexplained missing options, controls or content); distinguish intentional viewport clipping of scrollable content from missing source. Check desktop and phone, collapsed/open overlay, default/selected/evaluated/locked/pending/error/recovery/empty/loading, pagination boundaries, long text, keyboard focus/hover/pressed/disabled and localization when applicable. Reuse the same source geometry and question content for companion states, including the background beneath a drawer.

Run structural coverage checks and inspect real captures at useful zoom in both board themes, comparing with the approved baseline. Record every gap before presenting a new artifact as ready. A stage may be committed and published as work in progress with a visible gap ledger; approval/closure/advancement is blocked while required coverage or native visual review is missing. Never ask the owner to discover an unreported omission. A legitimate change to approved behavior requires explicit owner approval; preserve the prior board and its history. This rule does not require duplicate matrices or prematurely implementing later-stage behavior.
