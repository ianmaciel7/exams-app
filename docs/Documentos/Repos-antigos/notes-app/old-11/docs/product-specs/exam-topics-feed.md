# Feature Specification: Lean ExamTopics Feed & Active Recall Simulator

**Linked ADR:** [ADR 0017](../adr/0017-lean-exam-topics-domain-model-and-typedashboard.md)  
**Triage Label:** `ready-for-agent`  
**Status:** Accepted  

---

## Problem Statement

Learners preparing for technical certifications (such as Google Cloud, AWS, or Kubernetes) face high friction when using traditional flashcard decks and monolithic quiz systems. Existing platforms either hide explanations behind separate page navigations, clutter the study experience with voting and forum arguments, or require bulky multi-click confirmation dialogs before verifying whether an answer is correct. Additionally, study sessions lack grounding in authoritative vendor documentation and fail to automatically integrate with spaced repetition (FSRS).

## Solution

A distraction-free, single-column continuous question feed that enables instantaneous click-to-validate active recall practice. As soon as a learner selects an option:
1. Visual correctness indicators immediately reflect whether the choice was right or wrong using semantic design tokens.
2. The authoritative canonical answer key is revealed.
3. If grounded explanations exist, they expand seamlessly beneath the options, citing official architectural documentation and rationale.
4. An immutable attempt log is recorded atomically, synchronizing with the user's FSRS flashcard state for optimal spaced review.

---

## User Stories

1. As a certification candidate, I want to open an exam feed by URL, so that I can immediately start practicing without navigating complex multi-pane menus.
2. As a candidate, I want to see questions presented in a clean, vertical stream, so that I can focus entirely on active recall.
3. As a candidate, I want each question prompt to clearly render rich formatting and code snippets, so that realistic architectural scenarios are easy to read.
4. As a candidate, I want to click any multiple-choice option to immediately validate my answer, so that I receive zero-latency feedback on my understanding.
5. As a candidate, I want the correct answer choice to be highlighted in a distinct semantic style (`border-primary bg-primary/10`), so that I instantly recognize the right answer.
6. As a candidate, I want an incorrect selection to be clearly styled with destructive tokens (`border-destructive bg-destructive/10 text-destructive`), so that my mistake is obvious without disorientation.
7. As a candidate, I want authoritative grounded explanations to automatically expand below the options upon validation, so that I understand why an option is correct based on official vendor architecture.
8. As a candidate, I want external vendor documentation links to open safely in a new tab, so that I can inspect deep architectural references without losing my place in the feed.
9. As a candidate, I want questions that lack pre-written grounded explanations to render cleanly without empty placeholder cards or broken layouts.
10. As a candidate, I want a secondary "Show Answer" button, so that I can inspect the canonical answer and explanation without submitting a test attempt when reviewing material.
11. As a candidate, I want my practice attempts to be recorded immutably, so that my historical accuracy and streak statistics are never lost.
12. As a candidate, I want question attempts to atomically update my spaced repetition schedule (FSRS), so that difficult questions reappear sooner and mastered ones reappear later.
13. As a candidate, I want a floating "Scroll to Top" button to appear when scrolling down long question feeds, so that I can quickly return to the beginning of the exam.
14. As an international learner, I want all UI strings, indicators, and labels to be localized into English, Spanish, and Brazilian Portuguese, so that language is never a barrier to learning.
15. As a candidate using keyboard navigation or assistive technology, I want all options to be fully accessible with keyboard focus and ARIA attributes, so that the study experience conforms to WCAG 2.1 AA standards.

---

## Implementation Decisions

1. **Polymorphic Persistence Model (`schemaVersion: 4`)**:
   - Exams and Questions are stored as polymorphic objects (`ExamObject`, `QuestionObject`) within the `objects` collection.
   - Core domain fields live inside `properties` (`examId`, `orderIndex`, `options`, `correctOptionIds`, `groundedExplanation`), while user notes live in `content`.
   - Graph relationships between Exams and Questions are established via `relations` using the single-record relation invariant (`INV-10`).
   - Practice attempts are stored as append-only records in an `attempts` subcollection (`INV-11`).

2. **Component Architecture & Behavior Ownership (`ADR 0016`)**:
   - `ExamList` renders the continuous question feed and pagination, while its dedicated hook `useExamList` owns query state, cursor pagination, and scroll tracking.
   - `QuestionCard` renders individual question prompts and options, while its dedicated hook `useQuestionCard` owns selection states, instant verification logic, and atomic FSRS attempt submissions.
   - Primitives are sourced directly from shadcn / Base UI (`src/components/ui/`) without ad-hoc wrapper elements.

3. **Instant Validation Interaction Model**:
   - Clicking an unselected option locks the question state for that attempt.
   - Evaluates selected options against `correctOptionIds` locally with zero network round-trip delay.
   - Concurrently dispatches an atomic dual-write: creates an `Attempt` record and triggers companion Card FSRS update.

4. **Firestore Indexing Contract**:
   - Composite index registered in `firestore.indexes.json` and declared in `firebase.json` for collectionGroup `objects`:
     - `lifecycleState: ASCENDING`
     - `objectTypeId: ASCENDING`
     - `properties.examId: ASCENDING`
     - `properties.orderIndex: ASCENDING`

---

## Testing Decisions

- **Testing Principles**:
  - Test external observable behavior and user flows rather than component internals or mock implementations.
  - Assert instant verification visual cues, explanation reveal on click, and FSRS attempt submission triggers.
- **Seams & Verification Boundaries**:
  - **Highest Seam**: `ExamFeedView` integration tests via Vitest and Testing Library simulating option clicks, verifying answer reveal, and asserting attempt callbacks.
  - **Isolated Behavior Seams**: `useQuestionCard` hook tests asserting correct state transitions (`unanswered` -> `answeredCorrect` / `answeredIncorrect`) and FSRS grading mapping.
  - **Visual & Accessibility Seams**: Ladle stories for `QuestionCard` covering all visual states (unanswered, correct selection, incorrect selection, no explanation available, high-contrast dark mode).

---

## Out of Scope

- Complex multi-column TypeDashboard layouts (deferred to Phase 2 in ADR 0017).
- High-stakes proctored test mode with hidden server-side answer keys.
- Community voting, comments, and crowdsourced forum threads.
