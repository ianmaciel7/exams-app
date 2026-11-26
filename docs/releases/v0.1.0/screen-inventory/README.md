# Screen Inventory — v0.1.0

This document defines the working screen inventory and key component states for Exam App v0.1.0, accompanying the editable [screen inventory whiteboard](./).

It builds on the [Information Architecture](../information-architecture/) baseline and [release decision register](../product.md#current-release-baseline). Candidate states are design hypotheses for review. Implementation and usability validation remain pending.

## Base Screens

### 1. Home
The personal study entry point, separate from the full Performance area.
- **States:**
  - *No recorded activity:* offer competition selection.
  - *Recorded activity:* compact progress summary and competition selection. Summary metrics remain open.
  - *No competitions available:* candidate empty state.
- **Key regions:**
  - Sidebar with a bottom avatar menu linking to Performance.
  - Primary content: compact metrics snapshot and competition selector.

### 2. Questions
The primary workspace for answering questions within the selected competition.
- **States:**
  - *List view (default):* scrollable list of multiple questions with a per-page/quantity selector.
  - *Focus view:* single question at a time.
  - *Filtered view:* filtered by subject, topic, or missed questions ("Errei").
  - *Unanswered / active selection:* question statement, lettered options, and action controls (e.g., Verify when auto-check is off).
  - *Evaluated answer:* show correctness after automatic checking or manual Verify.
  - *No matching questions:* candidate empty state for an active filter.
  - *Available source details:* show exam, year, examining board and organization where available.
- **Controls & Filters:**
  - Positioned immediately below the Questions heading.
  - Subject and topic selectors.
  - Missed-questions filter ("Errei"): filters by latest evaluated attempt.
  - Automatic answer checking toggle switch: positioned adjacent to filters.
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
The dedicated analytics and progress area, reached through the bottom avatar menu in the sidebar.
- **States:**
  - *Empty / small sample:* cautious presentation noting insufficient attempts.
  - *Detailed analytics:* overall accuracy (correct attempts / total recorded attempts), breakdown by competition, subject, and topic, with distinct metrics for ordinary practice vs. mock exams.
  - *Weak-topic link:* the design baseline opens filtered Questions in the relevant competition.

## Open Questions & Review Items
- Exact pagination and loading behavior for long question lists; the default scrollable multiple-question view, quantity selector, and one-question option are already decided.
- Exact scoring rules for official competitions vs. mixed mock exams.
- Filter refresh after evaluation, mock setup and history presentation, and restoration after reload or closure.
