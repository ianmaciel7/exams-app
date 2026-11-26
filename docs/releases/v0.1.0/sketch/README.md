# Questions Sketch — v0.1.0

This document describes the design decisions, layout, and visual evidence behind the desktop questions-page sketch for Exam App v0.1.0, located in the editable [sketch whiteboard](./).

## Scope & Purpose
The questions sketch represents the primary workspace of the product, translating product discovery decisions and information architecture into a structural, preliminary visual sketch.

**Scope status:** This board is a static exploration, not a specification of implemented behavior. The user-approved decisions are recorded in [the release product history](../product.md): competition-scoped practice, filters beneath Questions, an auto-check/manual-verify choice, scrolling through multiple questions by default with quantity and single-question options, mock exams within Questions, and access to Performance through the account menu at the bottom of the sidebar. The detailed component variants, tools, states and interaction rules shown below are reference examples or proposals unless separately approved in that history. Their presence does not add them to v0.1.0.

Per project conventions, this sketch uses intentionally loose, procedurally curved linework (inspired by rough UI sketching and paper prototyping techniques) with editable text blocks, allowing rapid inspection before moving to higher-fidelity wireframes.

## Interface Regions & Decisions

### 1. Sidebar (Left Navigation)
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

## Question — States & Variants Exploration

A detailed, unvalidated exploration of the `Question` component is present on the same board adjacent to the main screen layout (spanning `x: 1650` to `x: 7000`). It is preserved for review, not a required prerequisite for wireframes or an approved feature list.

The exploration is organized across 9 structural groups:

1. **Question Anatomy (Baseline & Labels):** Full labeled structural breakdown of all static labels, provenance metadata, breadcrumbs, statement area, options list, action controls, and learning resource drawer tabs.
2. **Interactive Elements Taxonomy:** Systematic representation of 12 distinct UI control types (Static text, Links, Buttons, Icon buttons, Radio buttons, Checkboxes, Toggles, Tabs, Dropdowns, Disclosures, Badges, and Tooltips).
3. **Answer States Matrix (14 States):** Discrete cards illustrating Default/Unanswered, Selected option, Disabled answer button, Enabled answer button, Verifying with loading spinner, Correct answer feedback, Incorrect answer with highlighted error and official key, Previously answered attempt, Struck alternative, Multiple struck alternatives, Restored alternative, Annulled question alert, Outdated law warning, and Local offline fallback.
4. **Content Variants (16 Variants):** Exploring layout responsiveness across 4-choice multiple choice, 5-choice multiple choice, True/False format, Short statement, Long multi-paragraph statement, Long multi-line options, Without associated text, Associated text collapsed accordion, Associated text expanded reading passage, Inline reference diagram/image, Markdown structured table, Mathematical equation, Code snippet with syntax box, Multiple associated exams badge, and Missing optional source metadata (demonstrating graceful degradation without inventing data).
5. **Expanded Resource Tabs Drawers:** Complete visual drawer content for all 6 footer tabs:
   - **Commented Key:** Teacher written resolution and video solution reference.
   - **Lessons (3):** List of related syllabus video modules with watch actions.
   - **Comments:** Community discussion thread with comment composer and upvoting.
   - **Statistics:** Percentage accuracy, option distribution bars, and candidate personal attempt statistics.
   - **Notebooks:** Checkbox list of candidate study notebooks with inline creation.
   - **Notes:** Private markdown note editor with save/delete controls.
6. **Question Actions & Trigger-Consequence Map:** Detailed behavioral table mapping user triggers (radio click, verify click, retry click, strike click, ID badge copy, taxonomy link click, disclosure click, tab click, report error click) to their exact consequences and undo/rollback procedures.
7. **Feedback Messages & System Alerts:** Visual styling and behavior of inline banners for Correct answers, Incorrect answers, Annulled questions, Outdated legislation, and Offline synchronization errors.
8. **Component Micro-Interaction States:** Atomic button and radio states under user pointer and keyboard interactions (Default, Hover, Focus ring for accessibility, Pressed, Disabled, and Loading).
9. **Interaction Proposals & Behavioral Matrix:** Ten candidate behaviors covering tab drawer mutual exclusivity, list independence, pre-submission option flexibility, struck option selection, attempt immutability, retries, checking modes, filter navigation, and session memory. Only decisions independently recorded in the release product history are confirmed; all remaining behavior needs review.

## Evolution & Directory Alignment
- Exploration originally began under `sketch/questions/v1` and `sketch/questions/v2`.
- At the user's request, the sketch was consolidated into a single active board and aligned directly under `docs/releases/v0.1.0/sketch/` to conform to stage directory standards across `information-architecture/`, `screen-inventory/`, and `user-flows/`.
