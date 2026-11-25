# Questions Sketch — v0.1.0

This document describes the design decisions, layout, and visual evidence behind the desktop questions-page sketch for Exam App v0.1.0, located in the editable [sketch whiteboard](./).

## Scope & Purpose
The questions sketch represents the primary workspace of the product, translating product discovery decisions and information architecture into a structural, preliminary visual sketch.

Per project conventions, this sketch uses intentionally loose, procedurally curved linework (inspired by rough UI sketching and paper prototyping techniques) with editable text blocks, allowing rapid inspection before moving to higher-fidelity wireframes.

## Interface Regions & Decisions

### 1. Sidebar (Left Navigation)
- **Competition Context:** Top selector displaying the active competition (concurso).
- **Primary Destinations:** Direct shortcuts to Home, Questions, and Mock exams.
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
  - **Header:** Question number, ID, and hierarchical Subject › Topic breadcrumbs.
  - **Source Provenance:** Explicit metadata displaying Year · Board (Banca) · Organization (Órgão) · Exam (Prova). Missing fields are never fabricated.
  - **Statement:** Main question text, with optional expandable associated text ("+ Associated text").
  - **Options:** Vertical lettered choices with interactive radio controls.
  - **Action & Feedback:** "Answer" / "Verify" action, with tabbed resource anchors below (Key, Lessons, Comments).

## Evolution & Directory Alignment
- Exploration originally began under `sketch/questions/v1` and `sketch/questions/v2`.
- At the user's request, the sketch was consolidated into a single active board and aligned directly under `docs/releases/v0.1.0/sketch/` to conform to stage directory standards across `information-architecture/`, `screen-inventory/`, and `user-flows/`.
