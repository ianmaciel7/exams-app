# Execution Plan: Unified Question Types

**Status:** Active  
**Owner:** Lead Orchestrator  
**Started:** 2026-10-03  
**Last Updated:** 2026-10-03

## Objective

Implement the unified question type system from [ADR 0018](../../adr/0018-unified-question-type-system.md): eight validated question types, per-type answering UI and feedback, attempts that preserve the submitted answer, and migration of the legacy ExamTopics shape.

## Scope

- In:
  - Discriminated-union types, runtime validators, answer evaluation, and the legacy converter (`src/types/`, `src/lib/validators/`, `src/lib/exam/`).
  - `QuestionCard` dispatching to one answering component per type, dedicated hooks, i18n catalogs (`en`, `es`, `pt-BR`), Ladle stories.
  - Attempt payload (`questionType`, `submittedAnswer`, `isCorrect`), `firestore.rules`, `src/lib/firebase/attempts.ts`.
  - Seed update and `scripts/tooling/migrate-questions.mjs`.
  - Documentation: ADR 0018, `docs/product-specs/question-types.md`, `DER.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `TESTING.md`.
- Out:
  - Server-side grading and proctored mode.
  - A question authoring UI.
  - Production migration automation (no admin credentials in the repository).

## Canonical Context

- Product intent: `INTENT.md` goals `G-3` and `G-5`
- Product requirement IDs: `docs/product-specs/question-types.md`
- Architecture / ADRs: [ADR 0018](../../adr/0018-unified-question-type-system.md), [ADR 0017](../../adr/0017-lean-exam-topics-domain-model-and-typedashboard.md), [ADR 0016](../../adr/0016-prefer-simple-domain-components-and-dedicated-hooks.md)
- Quality, security, and test owners: `CONSTRAINTS.md`, `SECURITY.md`, `TESTING.md`, and the attempt rules in `firestore.rules`

## Plan

- [x] Step 0: ADR 0018, this plan, product spec, and canonical doc sync
- [x] Step 1: Types (`src/types/question.ts`, `object.ts`, `attempt.ts`)
- [x] Step 2: Validators by type family plus attempt validator
- [x] Step 3: Pure evaluation and answer normalization
- [x] Step 4: Legacy converter and migration script
- [x] Step 5: Hooks (`useQuestionCard`, `useQuestionDragDropGroup`)
- [x] Step 6: Components, one per answering style, with feedback
- [x] Step 7: i18n catalogs
- [x] Step 8: `firestore.rules` and `submitAttempt`
- [x] Step 9: Seed with one question per type
- [x] Step 10: Stories, E2E, and quality gates

## Progress

- 2026-10-03 — ADR 0018 accepted; plan created.
- 2026-10-03 — Implemented steps 1-10: unified types, per-type validators, evaluation, legacy converter and `migrate:questions`, `useQuestionCard` and `useQuestionDragDropGroup`, one answering component per style, localized catalogs, attempt rules and payload, seed with one question per type, Ladle stories, and `e2e/exam-feed.spec.ts` (passes against the emulators in Chromium).
- 2026-10-03 — Polished Drag and Drop and Matching layout to align with ExamTopics / certification standards (2-column responsive grid for Actions and Answer Area, clean drop target states, and divided card table for matching).
- 2026-10-03 — Pending: run `pnpm migrate:questions` on each persisted emulator dataset, then remove the read-path converter and its tests.
- 2026-10-03 — Added `dropdown`, `ordering`, `matrix`, and `simulation` types (validators, evaluation, answer drafts, answering components, i18n, fixtures, and seed), dropdown parts in case studies, and an optional `yes-no` variant for `true-false`.
- 2026-10-05 — Enhanced `QuestionChoiceItem` ergonomics: clicking anywhere on the card container activates selection with a single click, eliminating dead zones outside the text label.

## Decision Log

- 2026-10-03 — "Legacy `exam_topic` format" means the ADR 0017 shape already stored in Firestore (`format`, `statement`, `correctOptionIds`); no literal `exam_topic` value exists in the repository.
- 2026-10-03 — Migration is a script that rewrites documents plus a read-path converter as a safety net; chosen over read-time-only conversion so stored data converges on one shape.
- 2026-10-03 — Drag and drop uses `@dnd-kit` for keyboard and screen-reader support instead of a hand-written implementation.
- 2026-10-03 — Drag and drop presents a symmetric 2-column layout (Available items / Answer area) matching certification exams, with full-width action tiles and practical select controls visible upon focus without duplicating placed cards.
- 2026-10-03 — The hotspot answer is built from toggle buttons placed over the image (not an interactive SVG) so each area is a native button with `aria-pressed`; `@dnd-kit/core` is the only new dependency (sortable and utilities are not needed).
- 2026-10-05 — Completed selection-based question types auto-submit when their required selections are complete; ordering and simulation retain explicit confirmation because their controls have a separate completion action.
- 2026-10-05 — Choice cards delegate outer card clicks to the target input control via `onClick` handler, guarding interactive sub-targets (button, input, label, link) to prevent double clicks and ensure 1-click selection across the entire card.

## Verification

- [x] Relevant deterministic checks (`rtk pnpm run check:fast`, `rtk pnpm run test:guards`, `rtk pnpm run test:firebase-emulator`, `rtk pnpm run test:coverage`)
- [x] Behavioral/runtime verification when applicable (`e2e/exam-feed.spec.ts` against the emulators, Ladle stories per type)
- [ ] Final diff review
- [x] Documentation synchronized (`rtk pnpm run verify:docs`)

## Recovery / Rollback

Every step lands as its own commit. Before the migration script runs against an emulator dataset, export it (`pnpm emulator:dev` exports on exit); the script supports `--dry-run` and skips documents that already carry `type`. Reverting the code leaves migrated documents readable only by the new model, so revert the data from the export first.

## Completion

**Completed:** —
**Result:** —
