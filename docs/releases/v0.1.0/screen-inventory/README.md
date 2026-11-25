# Screen Inventory — v0.1.0

This document defines the working screen inventory and key component states for Exam App v0.1.0, accompanying the editable [screen inventory whiteboard](./).

It builds directly on the [Information Architecture](../information-architecture/) baseline and [Product Discovery](../product.md) decisions.

## Base Screens

### 1. Home
The personal study entry point, separate from the full Performance area.
- **States:**
  - *No recorded activity:* welcome summary, call to action to select a competition and start practicing.
  - *Active study activity:* compact progress summary (recent accuracy, total attempts), quick shortcut to resume last competition or practice missed questions.
- **Key regions:**
  - Sidebar with active competition indicator and bottom avatar.
  - Primary content: compact metrics snapshot and competition selector.

### 2. Questions
The primary workspace for answering questions within the selected competition.
- **States:**
  - *List view (default):* scrollable list of multiple questions with a per-page/quantity selector.
  - *Focus view:* single question at a time.
  - *Filtered view:* filtered by subject, topic, or missed questions ("Errei").
  - *Unanswered / active selection:* question statement, lettered options, and action controls (e.g., Verify when auto-check is off).
  - *Answered / feedback state:* immediate correctness indicator, feedback, and explanation (in practice mode).
- **Controls & Filters:**
  - Positioned immediately below the Questions heading.
  - Subject and topic selectors.
  - Missed-questions filter ("Errei"): filters by latest evaluated attempt.
  - Automatic answer checking toggle switch: positioned adjacent to filters.
  - Mock exam entry button: opens mock exam configuration.

### 3. Mock Exams (within Questions)
Mock exams are hosted inside Questions, utilizing the same core question card structure.
- **States:**
  - *Configuration modal/panel:* choice between competition-specific and mixed scope, question count selector (defaulting to official exam count if known), timer duration setting.
  - *Active timed session:* timer header (pauses when leaving, resumes on return), navigation grid/selector, blank option support, ability to change answers before submission.
  - *Results & Review:* shown only upon completion or time expiration; detailed breakdown of correct/incorrect answers, score, and answer key review.
  - *Interrupted session:* paused state with option to resume remaining time or abandon.

### 4. Performance
The dedicated analytics and progress area, accessed exclusively via the bottom avatar menu in the sidebar.
- **States:**
  - *Empty / small sample:* cautious presentation noting insufficient attempts.
  - *Detailed analytics:* overall accuracy (correct attempts / total recorded attempts), breakdown by competition, subject, and topic, with distinct metrics for ordinary practice vs. mock exams.
  - *Drill-down action:* clicking a weak topic or missed questions directly navigates to filtered practice in Questions.

## Open Questions & Review Items
- Exact pagination / infinite scroll behavior for long question lists.
- Exact scoring rules for official competitions vs. mixed mock exams.
- Persistence schema for interrupted sessions across browser restarts.
