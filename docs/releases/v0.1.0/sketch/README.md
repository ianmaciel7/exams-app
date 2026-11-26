# Sketch — v0.1.0

This document describes the design decisions, layout, and visual evidence behind the desktop questions-page sketch for Exam App v0.1.0, located in the editable [sketch whiteboard](./).

## Scope & Purpose
The questions sketch represents the primary workspace of the product, translating product discovery decisions and information architecture into a structural, preliminary visual sketch.

**Scope status:** This board is a static exploration, not a specification of implemented behavior. The user-approved decisions are recorded in [the release product history](../product.md): competition-scoped practice, filters beneath Questions, an auto-check/manual-verify choice, scrolling through multiple questions by default with quantity and single-question options, mock exams within Questions, and access to Performance through the account menu at the bottom of the sidebar. The detailed component variants, tools, states and interaction rules shown below are reference examples or proposals unless separately approved in that history. Their presence does not add them to v0.1.0.

Per project conventions, this sketch uses intentionally loose, procedurally curved linework (inspired by rough UI sketching and paper prototyping techniques) with editable text blocks, allowing rapid inspection before moving to higher-fidelity wireframes.

## Interface Regions & Decisions

### 1. Sidebar (Left Navigation)
- **Header Controls:** Anchored at the top right of the sidebar header (referenced directly from modern app shells such as ChatGPT, documented in `docs/references/assets/sidebar/2026-11-26-chatgpt-sidebar-collapse-button.png`):
  - **Search Button (`[🔍]`):** Dedicated icon button placed immediately adjacent to the collapse toggle to open quick search / command palette (`Cmd+K` / `Ctrl+K`).
  - **Collapsible Toggle (`[◨]`):** Dedicated sidebar toggle button to collapse the sidebar into the 70px icon rail.
- **States Explored:**
  - **Expanded Sidebar (Default):** Full 255px panel showing logo, `[🔍]` search and `[◨]` toggle buttons, and strictly the two active competition items as the sidebar body, with distinct icons per institution, and the bottom utility row.
  - **Collapsed Sidebar (Icon Rail):** 70px compact rail displayed adjacent to the main screen, presenting essential icon anchors (`[◨]` toggle, `[🔍]` search, `[>_]` DATAPREV terminal icon, `[💼]` PPSA briefcase icon, and `(•)` account avatar) with hover tooltips for label discovery.
- **Competition-Centric Sidebar (Distinct Institution Icons):** In strict accordance with the user's design direction ("na sidebar só deveria ter [os dois itens] tire navigation home,question" and "deixe icone dataprev diferente do pssa"), conventional menu items (`Navigation`, `Home`, `Questions`) are completely eliminated from the sidebar. Instead, the sidebar serves exclusively as a workspace switcher displaying the learner's active competitions with institution-tailored semantic iconography:
  1. `[>_] DATAPREV · 2026 · Anal…` (Active practiced competition card, featuring a software terminal window `[> _]` icon reflecting IT / Systems development).
  2. `[💼] PPSA · 2025 · Analista…` (Second saved competition card, retaining the corporate executive briefcase `[💼]` icon reflecting the state enterprise).
- **Account & Bottom Utility Controls:** Anchored along the **bottom of the sidebar** (referencing modern app shells such as the reference in `docs/references/assets/sidebar/2026-11-26-sidebar-footer-controls-reference.png`):
  - **Avatar / Profile icon & Menu Popover:** Compact silhouette button. Clicking opens an elevated popover menu with a single link to `Performance`, fulfilling decision `V010-02`. Mock exams are reached from the Questions header (V010-07); missed questions belong to Status filters and Performance (V010-05).
  - **Settings:** Dedicated gear shortcut in the footer, between the account and theme controls. Settings is available only from this footer shortcut; no duplicate account-menu entry. Footer icon centers follow a regular 36-board-unit pitch: profile, Settings, theme and status. Share remains independently right-aligned. The reference's Pro badge is intentionally excluded.
  - **Theme Toggle (Moon icon):** Dark / Light mode toggle switch.
  - **Status Indicator (6-Dash Segmented Circle):** System sync / status indicator matching the reference dashed circle.
  - **Exit / Share Action (Curved Arrow icon):** Right-aligned curved forward/exit action icon without a door frame, directly matching the reference screenshot.
  - Per product decision, subscription plan badges (e.g. Pro) are omitted from the interface. Aligns with historical sidebar prototypes documented in [Performance and account menu research](../../../references/2026-11-25-performance-and-account-menu-research.md).

### 2. Header & Action Area
- **Breadcrumb & Title:** Heading indicating the active competition and current view ("Questions").
- **View Controls:** List view (default) vs. single-question focus mode; per-page count selector.
- **Mock Exam Entry:** A compact `Mock exams` button at the right of the competition header, within Questions.

### 3. Filter Bar & Auto-Check
- Positioned immediately beneath the Questions title.
- **Filters:** Dropdown selectors for Subject (Disciplina) and Topic (Assunto), plus the "Errei" (Missed questions) filter.
- **Auto-Check Toggle:** Positioned as an inline toggle switch beside the filter selectors, letting the learner toggle between instant verification and manual "Verify" checking.

### 4. Question Cards & Provenance
- Inspired by the QConcursos structure recovered from the Exams Archive (documented in [QConcursos archive evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md)):
  - **Header:** Question number (`01`, `02`), question ID badge (`Q4445036`), and hierarchical `Subject › Topic` breadcrumbs.
  - **Source Provenance:** Explicit metadata displaying Year · Board (Banca) · Organization (Órgão) · Exam (Prova). Missing fields are never fabricated.
  - **Statement:** Main question text, with expandable associated text control (`+ Associated text`).
  - **Options:** Vertical lettered choices represented with radio controls. Question 1 illustrates a proposed answered state; the static sketch has no interactive controls.
  - **Footer Action Row:**
    - Left: `[ Answer ]` / `[ Responder ]` action button.
    - Inline Feedback (on answered question): `Correct answer`.
  - **Card Divider:** Clean horizontal divider separating the action area from question learning resources.
  - **Resource Tabs Strip (Approved for v0.1.0):**
    - `Commented key` (Gabarito Comentado: official and teacher solution explanation).
    - `Statistics` (Estatisticas: attempt accuracy and alternative selection distribution).
    - *Deferred features:* Community comments, video lesson catalog references, notebook management, personal notes editor, error reporting, and redundant floating tool docks (`Focus`, `Timer`, `Aa`, `Strike`) were evaluated and explicitly pruned. Focus mode is natively provided by collapsing the sidebar, strike action is positioned directly on choices, and timer belongs to the timed mock exam overlay.

## Structured Board Architecture (6 Macro-Sections)

To provide comprehensive design clarity and visual order across the wide canvas (`x: 50` to `x: 7020`), the entire whiteboard is organized into 6 clearly demarcated macro-sections, each bounded with dedicated section frames, header badges, titles, and functional descriptions:

1. **SECTION 1 · Application Workspace & Navigation (`x: 50..1650`):**
   - **1.A Primary Questions Workspace:** Expanded 230px sidebar with `[🔍]` search and `[◨]` collapse buttons, breadcrumbs, filter bar with auto-check toggle, question cards (01 & 02), and floating focus dock.
   - **1.B Collapsed Sidebar Rail:** Compact 70px icon rail with toggle, search anchor, competition selector, navigation icons, and avatar.
2. **SECTION 2 · Question Anatomy & Interactive Taxonomy (`x: 1680..2580`):**
   - Structural breakdown of question header, provenance, breadcrumbs, statement, options, actions, and tabs.
   - Comprehensive interactive taxonomy classifying static text, links, buttons, radio controls, badges, disclosures, and tooltips.
   - Legend and status convention pill mapping Confirmed, Reference, and Proposed scopes.
3. **SECTION 3 · Answer & Verification States Matrix (`x: 2610..3540`):**
   - 14 discrete lifecycle states from initial view and option selection to checking, feedback, retry, and alternative elimination.
4. **SECTION 4 · Content Variants & Real Exam Formats (`x: 3570..4660`):**
   - 16 real competition formats: 5 options (FGV), 4 options (Selecon), Certo/Errado (Cebraspe), long passage, code snippet, data table, and missing metadata degradation.
5. **SECTION 5 · Resource Tabs & Drawers (`x: 4690..5800`):**
   - Full expanded drawer specifications for the approved `Commented key` and `Statistics` tabs, with unified bounding frames and internal section dividers.
6. **SECTION 6 · Actions, Alerts & Behavioral Rules (`x: 5840..7020`):**
   - Trigger-consequence map, system feedback alerts, micro-interaction states, and verified interaction rules.

## Evolution

The Questions sketch is consolidated into a single active stage board, uniting screen-level composition and component-level states without fragmented sub-boards or duplicate data.

## Marker sketch preset (2026-11-26)

Native editable strokes use semantic ink colors with light/dark adaptation, weight tiers and bounded non-periodic gesture variation. Sparse rectangular paths are sampled along each edge to prevent the viewer smoothing corners into ovals. The launcher applies Excalifont (Latin subset, SIL OFL 1.1; pinned upstream revision) only to Sketch boards; it caches the font in the ignored launcher directory, with a system-font fallback when offline. Other boards retain their original typography. No product requirements or question text are removed.

Run `node scripts/marker-sketch.mjs` for a dry run, or `node scripts/marker-sketch.mjs docs/releases/v0.1.0/sketch --write` to apply the preset to native text and strokes. Run `node --test scripts/marker-sketch.test.mjs` to check contrast and geometry. Visual review in both color schemes is required; the sketch remains in progress. This is a structural UI sketch, not a functional prototype or pressure-sensitive handwriting engine.

References: [Excalidraw](https://github.com/excalidraw/excalidraw), [Open Artifact theme](https://github.com/JimLiu/open-artifact/blob/v0.16.3/packages/whiteboard-core/src/theme.ts), [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Component affordance refinement (2026-11-26)

The Questions workspace uses distinct visual signs for component roles: a selected rail for navigation, a grouped and anchored account popover, native chevrons at the trailing edge of selectors, a segmented List/One control, native radio outlines and selection marks, bounded Answer buttons, separate verification feedback, underlined links, and resource disclosure labels in a distinct footer strip. The layout and question content are unchanged; these are static interaction cues, not working application controls. Keep color supplementary to form and state. The board remains in progress and requires user review.


Competition switcher refinement: compact single-line rows with 32-unit height and 6-unit gaps, aligned 16-unit semantic icons, and a subtle rounded selection outline spanning the active row. No extra dividers or metadata lines. The label uses a static ellipsis in this editable sketch; runtime truncation/fade and full title on focus or hover are future behavior, not implemented. Full competition context is shown in the main heading. Reference: Capacities and Readwise archived captures plus shadcn sidebar demos.
