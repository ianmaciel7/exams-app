---
name: version-manager
description: Manage, query, and audit release stages, artifacts, and fidelity boundaries across Exam App releases. Use when checking stage boundaries, answering questions about what belongs in each UX/UI stage, auditing release documentation, or validating stage integrity.
---

# Version Manager

The `version-manager` skill governs release stage progression, artifact ownership, fidelity boundaries, and compliance audits across Exam App releases (`docs/releases/*` and `docs/boards/*`).

---

## 1. Stage Responsibilities and Fidelity Boundaries

Every UX/UI activity has strict ownership boundaries. Select the smallest artifact necessary to answer the design hypothesis. An activity never becomes complete simply because a downstream artifact exists.

| Activity / Stage | Owns / Expected Output | Does NOT Own / Prohibited |
| :--- | :--- | :--- |
| **01 Product discovery** | Problem definition, primary personas, goals, functional scope, constraints, explicit assumptions, empirical evidence, and success criteria. Release decision register (`docs/releases/<version>/product/README.md`). | Screen layout, detailed UI component design, production code, visual styling. |
| **02 Information architecture** | Primary destinations, content groupings, taxonomic hierarchy, official terminology, relationship models, and navigation findability maps. | Screen-by-screen layout, detailed action sequences, exhaustive state matrices. |
| **03 Screen inventory** | Required screens, functional surfaces, modal/drawer overlays, key interface states, and coverage gap tracking linked to user flows. | Full wireframes, internal component architectures, final visual design, production implementation. |
| **04 User flows** | Task progression paths, entry/exit points, decision branches, alternative paths, error/recovery branches, and user outcomes. | Pixel-level layout, component catalogs, design tokens, low-level event contracts. |
| **05 Sketch** | Quick exploratory drawings of workspace composition, structural hierarchy, approximate UI regions, recognizable essential controls, minimal states/alternatives clarifying hypotheses, and concise external native notes (`type: "note"`). Keep elements abstract and native geometry clean. Max 800 elements in Open Artifact boards. | Taxonomy tables, exhaustive component/state catalogs, full content fixtures, detailed statistics specifications, trigger/consequence matrices, production dimensions/tokens, mockups or executable interaction. Unicode glyph icons or emojis prohibited. |
| **06 Low-fidelity wireframe** | Selected structural layout, content prioritization, placement hierarchy, essential controls, and representative responsive/state variations. | Final brand styling, decorative polish, exhaustive technical interaction, production code. |
| **07 Mid-fidelity wireframe** | Refined interface layout, realistic representative content fixtures, component placement, critical responsive behaviors, and precise spacing hierarchy. | Final brand aesthetic treatment, production-grade visuals, complete functional code. |
| **08 High-fidelity wireframe** | Near-final structural and content detail, critical edge case handling, consistent component library usage, and accessibility intent. | Mandatory final brand color schemes, functional backend integrations, claims of usability without empirical testing. |
| **09 Mockup** | Visual design specifications: final-intent typography, color palettes, spacing systems, component variants, iconography, and responsive visual treatments. | Working interactive behavior, persistent state storage, backend integrations. |
| **10 Interactive prototype** | Executable or clickable flows validating representative tasks, state transitions, dynamic feedback, and error recovery. Must document simulations and limits. | Production architectural guarantees, production data persistence, claims of verified usability or accessibility without user testing. |

### Supporting Work Is Not a Separate Stage
Supporting activities (technical research, UX audits, competitive benchmarks, whiteboard canvases, reference collection) do **not** constitute independent release stages. They must be linked directly to the relevant stage artifact or cataloged under `docs/references/` prefixed with `YYYY-MM-DD`.

---

## 2. Strict Project Conventions

All artifacts, whiteboards, documentation, code comments, and scripts across releases must adhere to:
1. **English Language**: All project-authored content must be written in English.
2. **Prohibition of Emojis and Pseudo-Emoji Unicode Icons**: No emojis or bracketed glyphs (such as `[◨]`, `[☷]`, `[✎]`, `[📊]`, `[📁]`). Drawn icons on boards must use native vector primitives (`stroke`, `path`, or semantic geometry).
3. **Open Artifact Whiteboard Limits**: Boards must contain 800 or fewer elements (`MAX_BOARD_ELEMENTS = 800`).
4. **Zero Orphaned or Contradictory Statements**: Updating one artifact requires cascade verification across companion files (decision register, screen inventory, IA, flows, README).
5. **Distinct Whiteboard Titles**: Release boards must be named `<Artifact Name> — v<release>` to guarantee clear browser tab and canvas identity.

---

## 3. Execution Modes

### Mode 1: Question Answering (Advisory)
Use this mode when a user or agent asks:
- "Where does this artifact belong?"
- "Can I add detailed statistics tables to the sketch stage?"
- "What are the boundaries of Stage 05 (Sketch)?"
- "Is dark mode toggle approved in v0.1.0?"

**Procedure:**
1. Consult the Stage Responsibilities table above and the target release decision register (`docs/releases/<version>/product/README.md`).
2. Cite the exact stage contract. If prohibited (e.g., detailed tables or mockups in sketch), state clearly why it violates stage fidelity boundaries and recommend the appropriate stage (e.g., Stage 07 Mid-fidelity wireframe or Stage 09 Mockup).
3. If checking release scope, verify approved decisions vs. unprioritized ideas.

### Mode 2: Full Audit (Default)
When invoked without arguments or to verify project-wide release health:
1. Scan all active release folders under `docs/releases/*` and stage boards under `docs/boards/*`.
2. Run the audit script:
   ```bash
   node .agents/skills/version-manager/scripts/audit-release.mjs
   ```
3. Inspect the report for:
   - Stage fidelity violations (e.g., mockups or tables in sketch directories).
   - Board element limits (> 800 elements in `db/board/meta.json`).
   - Broken arrow references or unlisted board elements.
   - Prohibited emoji and pseudo-emoji glyphs in markdown files and board elements.
   - Stale or contradictory scope terms (e.g., dark mode toggle or account popover in v0.1.0).
4. Review companion files to ensure atomic cascade synchronization.

### Mode 3: Targeted Audit
When targeting a specific release version (e.g., `v0.1.0`) or a specific stage path (e.g., `docs/releases/v0.1.0/sketch`):
1. Execute the audit script on the target:
   ```bash
   node .agents/skills/version-manager/scripts/audit-release.mjs v0.1.0
   ```
   or:
   ```bash
   node .agents/skills/version-manager/scripts/audit-release.mjs docs/releases/v0.1.0/sketch
   ```
2. Check for localized compliance against the release decision record and board schema.
3. Validate board integrity using `scripts/check-boards.mjs`.

---

## 4. Helper Tooling Reference

The companion script `.agents/skills/version-manager/scripts/audit-release.mjs` provides automated structural auditing:
```bash
# Audit specific release
node .agents/skills/version-manager/scripts/audit-release.mjs v0.1.0

# Audit specific stage or directory
node .agents/skills/version-manager/scripts/audit-release.mjs docs/releases/v0.1.0/sketch

# Check boards integrity across all boards
node scripts/check-boards.mjs
```
