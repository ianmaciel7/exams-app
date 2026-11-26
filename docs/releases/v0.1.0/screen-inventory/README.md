# Screen Inventory — v0.1.0

This document defines the working screen inventory and key component states for Exam App v0.1.0, accompanying the editable [screen inventory whiteboard](./).

It builds on the [Information Architecture](../information-architecture/) baseline and [release decision register](../product/product.md#current-release-baseline). Candidate states are design hypotheses for review. Implementation and usability validation remain pending.

## Base Screens

### 1. Home
The personal study entry point, separate from the full Performance area.
- **States:**
  - *No recorded activity:* offer competition selection.
  - *Recorded activity:* compact progress summary and competition selection. Summary metrics remain open.
  - *No competitions available:* candidate empty state.
- **Key regions:**
  - Collapsible competition switcher with abstract content icons in the Sketch, recognizable search and collapse controls, and a compact footer.
  - Performance directly above the footer and one Settings gear in the footer. Mock exams are entered within Questions.
  - Primary content: compact metrics snapshot and competition cards.

### 2. Questions
The primary workspace for answering questions within the selected competition.
- **States:**
  - *Unanswered / active selection:* question statement and lettered options.
  - *Evaluated answer:* show correctness after evaluation.
  - *Available source details:* show exam, year, examining board and organization where available.
- **Header:**
  - Active competition heading.
  - Mock exam entry button: opens mock exam configuration.

#### Mock exam states within Questions
Mock exams are hosted inside Questions, utilizing the same core question card structure.
- **States:**
  - *Setup:* competition-specific or mixed scope and original or chosen question count. The mixed baseline starts with two or more competitions. Setup controls and timer defaults remain open.
  - *Active timed session:* leave questions blank. Revisit and change answers subject to verified exam-specific restrictions. Correctness is withheld until completion.
  - *Results & Review:* review recorded answers and correctness after manual finish or automatic submission at timeout. Scoring depends on verified rules.
  - *Interrupted session:* pause when leaving and resume with remaining time. The resume entry and interruption boundaries remain open.
  - *Previous mocks:* design baseline for opening earlier results. The history presentation and empty state require review.

### 3. Performance
The dedicated analytics and progress area, reached directly above the sidebar footer.
- **States:**
  - *Empty / small sample:* cautious presentation noting insufficient attempts.
  - *Detailed analytics:* overall accuracy (correct attempts / total recorded attempts), breakdown by competition, subject, and topic, with distinct metrics for ordinary practice vs. mock exams.

## Open Questions & Review Items
- Practice evaluation trigger and loading behavior.
- Exact scoring rules for official competitions vs. mixed mock exams.
- Mock setup and history presentation, and restoration after reload or closure.

## Question component states

- Provenance: ID, subject, topic/subtopic, year, board, organization, exam have link affordances where supplied; never invent metadata. Proposed routes require validation.
- Statement and answer options use abstract strokes in the Sketch. Required supporting content stays inline. Show short correctness feedback after evaluation.
- The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment.
- Notes are native design annotations outside the UI, not a new Notes screen. All states remain design candidates or recorded scope, not verified interactions.
