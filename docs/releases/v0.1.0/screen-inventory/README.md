# Screen Inventory — v0.1.0

This document defines the working screen inventory and key component states for Exam App v0.1.0, accompanying the editable [screen inventory whiteboard](./).

It builds on the [Information Architecture](../information-architecture/) baseline and [release decision register](../product/product.md#current-release-baseline). Candidate states are design hypotheses for review. Implementation and usability validation remain pending.

## Base Screens

### 1. Home
The personal study entry point, separate from the full Performance area.
- **States:**
  - *No recorded activity:* offer competition selection cards.
  - *Recorded activity:* compact progress summary and competition selection cards. Summary metrics remain open.
  - *No competitions available:* candidate empty state.
- **Key regions:**
  - Unified competition switcher sidebar across all screens: header with Exam App title, search button, and collapse toggle; body strictly containing competition items DATAPREV and PPSA with distinct semantic icons; zero sidebar navigation lists (no Home, Questions, or Performance list items) and no unapproved footer controls.
  - Primary content: compact metrics snapshot and competition cards to start practice. Mock exams are entered within Questions.

### 2. Questions Workspace
The primary workspace for answering questions within the active selected competition, framed by the unified competition-centric sidebar.
- **States:**
  - *Unanswered / active selection:* question statement and lettered options.
  - *Evaluated answer:* immediate correctness feedback after answer evaluation.
  - *Available source details:* show exam, year, examining board and organization where available.
- **Header:**
  - Active competition heading (without redundant Questions subtitle).
  - Mock exam entry button: opens mock exam configuration.

### 2.B. Questions with Collapsed Sidebar
Workspace maximization rail (icon rail) expanding reading viewport width.
- **Header:** search button and rail expansion toggle.
- **Body:** compact competition switcher anchors for DATAPREV and PPSA.

### 3. Mock Exams
Assessment flow hosted inside Questions, utilizing the same core question card structure.
- **States:**
  - *Setup modal:* launched from Questions header action. Competition-specific or mixed scope and original or chosen question count. The mixed baseline starts with two or more competitions. Setup controls and timer defaults remain open.
  - *Timed session:* distraction-free focus shell. Leave questions blank. Revisit and change answers subject to verified exam-specific restrictions. Correctness is withheld until completion.
  - *Results & Review:* review recorded answers and correctness after manual finish or automatic submission at timeout. Scoring depends on verified rules.
  - *Interrupted session:* pause when leaving and resume with remaining time. The resume entry and interruption boundaries remain open.
  - *Previous mocks:* design baseline for opening earlier results. The history presentation and empty state require review.

### 4. Performance & Analytics
The dedicated analytics and progress view, framed by the unified competition-centric sidebar.
- **States:**
  - *Empty / small sample:* cautious presentation noting insufficient attempts.
  - *Detailed analytics:* overall accuracy (correct attempts / total recorded attempts), breakdown by competition, subject, and topic, with distinct metrics for ordinary practice vs. mock exams. Filtered weak-topic practice is an unprioritized idea outside v0.1.0.

## Open Questions & Review Items
- Practice evaluation trigger and loading behavior.
- Exact scoring rules for official competitions vs. mixed mock exams.
- Mock setup and history presentation, and restoration after reload or closure.

## Question component states

- Provenance: ID, subject, topic/subtopic, year, board, organization, exam have link affordances where supplied; never invent metadata. Proposed routes require validation.
- Statement and answer options use abstract strokes in the Sketch. Required supporting content stays inline. Show short correctness feedback after evaluation.
- The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment.
- Notes are native design annotations outside the UI, not a new Notes screen. All states remain design candidates or recorded scope, not verified interactions.
