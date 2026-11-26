# Sketch — v0.1.0

This document describes the design decisions, layout, and visual evidence behind the desktop questions-page sketch for Exam App v0.1.0, located in the editable [sketch whiteboard](./).

## Scope & Purpose
The questions sketch represents the primary workspace of the product, translating product discovery decisions and information architecture into a structural, preliminary visual sketch.

**Scope status:** This board is a static exploration, not a specification of implemented behavior. The user-approved decisions are recorded in [the release product history](../product.md): competition-scoped practice, filters beneath Questions, an auto-check/manual-verify choice, scrolling through multiple questions by default with quantity and single-question options, mock exams within Questions, and access to Performance through the account menu at the bottom of the sidebar. The detailed component variants, tools, states and interaction rules shown below are reference examples or proposals unless separately approved in that history. Their presence does not add them to v0.1.0.

Per project conventions, this sketch uses intentionally loose, procedurally curved linework (inspired by rough UI sketching and paper prototyping techniques) with editable text blocks, allowing rapid inspection before moving to higher-fidelity wireframes.

## Interface Regions & Decisions

### 1. Sidebar (Left Navigation)
- **Collapsible Toggle:** A dedicated sidebar toggle button `[◨]` anchored at the top right of the sidebar header (referenced from modern AI and productivity apps such as ChatGPT, documented in `docs/references/assets/2026-11-26-chatgpt-sidebar-collapse-button.png`).
- **States Explored:**
  - **Expanded Sidebar (Default):** Full 255px panel showing logo, active competition selector (`Dataprev 2026`), navigation shortcuts, and bottom account avatar.
  - **Collapsed Sidebar (Icon Rail):** 70px compact rail displayed adjacent to the main screen, presenting essential icon anchors (`[◨]` toggle, active exam icon, `[?]` questions, `[✎]` mock exams, and `(•)` account avatar) with hover tooltips for label discovery.
- **Competition Context:** Top selector displaying the active competition (concurso).
- **Primary Destinations:** Home and Questions; the sketch explores access to Mock exams within Questions. Exact controls remain open.
- **Account & Settings:** Avatar anchored at the **bottom of the sidebar** (confirmed by user decision, superseding the top-avatar proposal).
  - Clicking the avatar opens a popover menu with access to **Performance**.
  - Verified by historical sidebar prototypes and reference products documented in [Performance and account menu research](../../../references/2026-11-25-performance-and-account-menu-research.md).

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
    - Right: `[ Report error ]` / `Reportar Erro` action.
  - **Card Divider:** Clean horizontal divider separating the action area from question learning resources.
  - **Resource Tabs Strip:**
    - `Commented key` (Gabarito Comentado: official and teacher solutions)
    - `Lessons (3)` (Aulas: video lesson reference with badge count)
    - `Comments` (Comentarios: community discussion)
    - `Statistics` (Estatisticas: attempt accuracy and alternative selection distribution)
    - `Notebooks` (Cadernos: save to notebook)
    - `Notes` (Anotacoes: personal candidate notes)

### 5. Floating Question Tools Dock
- Located on the right edge of the question workspace, inspired by QConcursos focus and study tools:
  - `[Focus]` Focus Mode (Modo Foco toggle)
  - `[Timer]` Timer / Stopwatch (Relogio)
  - `[Aa]` Font size adjustment
  - `[Strike]` Strike-through tool (Riscador de alternativas)
  - `[Books]` Notebooks shortcut (Cadernos)
  - `[Notes]` Annotation and drawing tool (Anotacoes)

## Related study

The detailed, unvalidated question component and interaction exploration is preserved in the [Question Component Study](../components/question/). Its examples are proposals or historical references unless independently approved in the [release decision record](../product.md).

## Evolution

The earlier Questions sketch was consolidated into one active stage board. Its detailed study elements were moved to a separate component study without changing their IDs or content; see [migration mapping](../components/question-migration.json).
