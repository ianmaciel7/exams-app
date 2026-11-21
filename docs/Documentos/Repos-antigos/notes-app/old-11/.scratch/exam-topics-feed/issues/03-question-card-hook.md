# 03: Dedicated question card state hook and atomic FSRS attempt dual-write

**What to build:** The dedicated behavior hook `useQuestionCard` managing instant selection states, local correctness evaluation, explanation toggle, and atomic attempt submission paired with companion card FSRS updates.

**Blocked by:** 01: Core polymorphic exam and question domain types and schema contracts

**Status:** ready-for-agent

- [ ] Implement `useQuestionCard` state machine (unanswered -> answeredCorrect / answeredIncorrect)
- [ ] Connect atomic dual-write: append-only `Attempt` document creation plus FSRS spaced repetition card schedule update
- [ ] Implement secondary "Show Answer" preview without logging active recall attempt score
- [ ] Author deterministic Vitest tests asserting all state transitions and grading bounds
