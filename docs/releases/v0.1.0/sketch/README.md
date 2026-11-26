# Sketch — v0.1.0

This document describes the design decisions, layout, and visual evidence behind the desktop questions-page sketch for Exam App v0.1.0, located in the editable [sketch whiteboard](./).

## Scope & Purpose
The questions sketch represents the primary workspace of the product, translating product discovery decisions and information architecture into a structural, preliminary visual sketch.

**Scope status:** This board is a static exploration, not a specification of implemented behavior. The user-approved decisions are recorded in [the release product history](../product.md): competition-scoped practice, filters beneath Questions, an auto-check/manual-verify choice, scrolling through multiple questions by default with quantity and single-question options, mock exams within Questions, and access to Performance through the account menu at the bottom of the sidebar. The detailed component variants, tools, states and interaction rules shown below are reference examples or proposals unless separately approved in that history. Their presence does not add them to v0.1.0.

Per project conventions, this sketch uses intentionally loose, procedurally curved linework (inspired by rough UI sketching and paper prototyping techniques) with editable text blocks, allowing rapid inspection before moving to higher-fidelity wireframes.

## Interface Regions & Decisions

### 1. Sidebar (Left Navigation)
- **Collapsible Toggle:** A dedicated sidebar toggle button anchored at the top right of the sidebar header (referenced from modern AI and productivity apps such as ChatGPT, documented in `docs/references/assets/2026-11-26-chatgpt-sidebar-collapse-button.png`).
- **States Explored:**
  - **Expanded Sidebar (Default):** Full 255px panel showing logo, active competition selector with clean dropdown caret (`Dataprev 2026 ▾`), primary navigation items with hand-drawn vector icons (`Home`, `Questions`, `Mock exams`, and `Missed (Errei)`), and bottom utility row with account avatar.
  - **Collapsed Sidebar (Icon Rail):** 70px compact rail displayed adjacent to the main screen, presenting essential icon anchors (`Sidebar Toggle` toggle, active exam, questions, mock exams, and account avatar) with hover tooltips for label discovery.
- **Competition Context:** Minimal top selector displaying the active competition name directly (`Dataprev 2026 ▾`) without verbose redundant labels (`Active Exam`, `TI — Software`, or `Change exam`).
- **Primary Destinations:** `Home`, `Questions`, `Mock exams`, and `Missed (Errei)`. In strict alignment with decision `V010-02`, `Performance` is accessed via the bottom avatar popover menu rather than occupying a top-level item in the main navigation list.
- **Account & Bottom Utility Controls:** Anchored along the **bottom of the sidebar** (referencing modern app shells such as the reference in `docs/references/assets/sidebar/2026-11-26-sidebar-footer-controls-reference.png`):
  - **Avatar / Profile icon & Menu Popover:** Compact silhouette button. Clicking opens an elevated popover menu with links to `Performance` and `Settings`, fulfilling decision `V010-02`.
  - **Settings (Gear icon):** Shortcut to application preferences and configuration.
  - **Theme Toggle (Moon icon):** Dark / Light mode toggle switch.
  - **Status Indicator (6-Dash Segmented Circle):** System sync / status indicator matching the reference dashed circle.
  - **Exit / Share Action (Curved Arrow icon):** Right-aligned curved forward/exit action icon without a door frame, directly matching the reference screenshot.
  - Per product decision, subscription plan badges (e.g. Pro) are omitted from the interface. Aligns with historical sidebar prototypes documented in [Performance and account menu research](../../../references/2026-11-25-performance-and-account-menu-research.md).

### 2. Header & Action Area
- **Breadcrumb & Title:** Heading indicating the active competition and current view ("Questions").
- **View Controls:** List view (default) vs. single-question focus mode; per-page count selector.
- **Mock Exam Entry:** Button to initiate a mock exam session from within the questions environment.

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

## Question — States & Variants Exploration

To provide comprehensive design clarity for the atomic `Question` component before advancing to wireframes, all states and variants are unified within this single board, positioned cleanly to the right of the main questions screen (spanning `x: 1680` to `x: 7000`).

The exploration is organized across 9 structural groups:
1. **Question Anatomy (Baseline & Labels):** Labeled structural breakdown of header, provenance metadata, breadcrumbs, statement, options, action controls, divider, and the 2 approved tabs (`Commented key` and `Statistics`).
2. **Interactive Elements Taxonomy:** Systematic representation of distinct UI control types.
3. **Answer States Matrix (14 States):** Discrete cards illustrating Default, Selected option, Disabled/Enabled answer buttons, Loading spinner, Correct answer, Incorrect answer (with error in red and key in green), Previously answered attempt, Struck/Restored alternatives, Annulled question alert, and Outdated question warning.
4. **Content Variants (16 Variants):** 4 alternatives, 5 alternatives, True/False format, short/long statements, code snippets, math formulas, tables, and graceful metadata degradation.
5. **Expanded Resource Tabs Drawers:** Complete visual drawer content for the 2 approved footer tabs:
   - **Commented Key:** Teacher written resolution and video solution reference.
   - **Statistics:** Percentage accuracy, option distribution bars, and personal attempt stats.
6. **Question Actions & Trigger-Consequence Map:** Behavioral table mapping triggers to exact mutations and rollback procedures (excluding deferred reporting/social actions).
7. **Feedback Messages & System Alerts:** Visual styling and behavior of inline banners.
8. **Component Micro-Interaction States:** Atomic button and radio states under user pointer and keyboard interactions.
9. **Interaction Rules & Behavioral Matrix:** 10 explicit product interaction rules codifying tab drawer mutual exclusivity, list independence, attempt immutability post-verification, history preservation upon retry, and auto-check vs. manual verify modes.

## Evolution

The Questions sketch is consolidated into a single active stage board, uniting screen-level composition and component-level states without fragmented sub-boards or duplicate data.
