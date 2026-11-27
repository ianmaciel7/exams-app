# Exam App

Terms used to describe studying for competitive examinations in Exam App.

## Scope and language

Current v0.1.0: sidebar selection, vertically scrolling paginated question list, explicit Answer submission, correct/incorrect feedback and locked confirmed answers. Other terms describe historical ideas unless explicitly selected in the release record. In particular Home, Performance, Statistics, mock exams, attempt persistence, accuracy and filters are not current requirements. Evaluation is explicitly triggered by Answer; implementation timing and safe retry remain technical validation topics.

## Language

**Competition**:
The competitive selection process (concurso público) for which the user prepares. Ordinary question practice is scoped to one selected competition at a time.

**Exam**:
An assessment associated with a competition; its relationship to official booklets, stages, and editions is verified against official competition notices.

**Question**:
An item answered during study or a mock exam, displaying available provenance (year, examining board, organization, exam).

**Answer**:
The user's selected option, explicitly submitted through Answer. Confirmed evaluation is correct or incorrect and read-only on the current page. An unconfirmed submission retains the selected option for safe retry.

**Mock exam**:
A practice assessment. A competition-specific mock follows real examination format and verified rules; a mixed mock combines questions from multiple competitions and is clearly identified as mixed.

**Subject**:
An area of study used to classify questions and organize performance reviews (e.g., Software Engineering, Portuguese).

**Topic**:
A sub-area within a subject used to refine practice and performance breakdowns.

**Study progress (historical candidate)**:
The user's recorded performance over time, including attempt counts and accuracy across competitions, subjects, and topics.

**Accuracy (historical candidate)**:
Correct attempts divided by all recorded attempts in the selected context, presented with both counts (numerator and denominator). Ordinary practice and mock exams are tracked separately.

**Missed question (Errei)**:
A question whose latest evaluated attempt was incorrect. Historical candidate; dedicated missed-question filtering, attempt history and accuracy metrics are not selected for this release.

**Home (historical candidate)**:
The proposed entry page (Screen 1), providing a compact progress overview and competition selection cards to start practice.

**Performance (historical candidate)**:
The proposed dedicated metrics and progress view (Screen 4), accessed as a distinct conceptual view with accuracy metrics and topic breakdown rather than a sidebar list or footer rail per V010-20.

**Statistics**:
An unprioritized per-question metrics drawer outside the v0.1.0 release scope. Question resources such as inline accordions or drawers for question explanations (Gabarito Comentado) are also excluded from v0.1.0, where evaluation is explicitly triggered by Answer.

**Question palette**:
A non-linear navigation matrix used during mock exam timed sessions to indicate question status (answered, current, unvisited, flagged) and navigate across questions.

**Questions workspace**:
The primary study interface within a selected competition, containing a vertically scrolling question list and approved correctness feedback states. Advanced filter bar controls and toolbars are unprioritized ideas outside v0.1.0.

**Design annotation**:
A native editable sticky note outside the application frame that explains design intent. It is not an application feature.

**Sketch**:
A low-fidelity exploratory artifact with abstract example content, recognizable controls and visual state cues. It does not implement or validate interactions.
