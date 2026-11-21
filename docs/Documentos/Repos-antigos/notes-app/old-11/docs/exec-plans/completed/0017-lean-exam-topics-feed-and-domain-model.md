# Execution Plan: Lean ExamTopics Feed and Domain Model

**Status:** Completed  
**Owner:** Lead Orchestrator  
**Started:** 2026-10-03  
**Last Updated:** 2026-10-03

## Objective

Implement the active recall certification study engine and continuous question feed defined in ADR 0017, featuring polymorphic Firestore entity representation (`DER.md` schemaVersion 4), single-record graph relations (`INV-10`), append-only practice attempts (`INV-11`), instant click-to-validate feedback with conditional grounded explanation reveal, and semantic design tokens (`DESIGN.md`).

## Scope

- In:
  - TypeScript types and schema definitions for Exam, Question, QuestionOption, GroundedExplanation, Card, FsrsSnapshot, and Attempt under `src/types/`.
  - Validation schemas with localized error codes under `src/lib/validators/`.
  - Message catalog entries in `src/messages/en.json`, `src/messages/es.json`, `src/messages/pt-BR.json` for exam feed, question cards, explanations, and accessibility labels.
  - Firestore composite index specification in `firestore.indexes.json` and registration in `firebase.json`.
  - Application components in `src/components/notes-app/` with approved role suffixes: `ExamList` (`useExamList`), `QuestionCard` (`useQuestionCard`), and `ScrollToTopButton`.
  - Instant click-to-validate feedback with semantic visual tokens (`DESIGN.md`: `primary` for correct, `destructive` for incorrect) and non-color accessible indicators.
  - Companion card atomic dual-write (Attempt creation + Card FSRS update via `writeBatch`).
  - App Router route: space-scoped exam view (e.g. `src/app/[spaceId]/exams/[examId]/page.tsx`) as an async Server Component with Next.js 15 `PageProps`.
  - Vitest unit tests (≥ 80% coverage across lines, functions, branches, statements), Ladle component stories, and Playwright E2E verification (e.g. `e2e/exam-feed.spec.ts`).
- Out:
  - Phase 2 complex multi-column TypeDashboard (deferred to future milestone).
  - High-stakes serverless proctored examination grading.

## Canonical Context

- Product intent: `INTENT.md` (`G-3`, `G-5`)
- Feature specification: `docs/product-specs/exam-topics-feed.md` (User Stories 1–15, Decisions 1–4)
- Domain model invariants: `docs/product-specs/knowledge-learning-workspace.md` (`INV-8`, `INV-9`, `INV-10`, `INV-11`, `INV-13`, `R-SRS`, `R-ASSESS`)
- Architecture / ADRs: `ARCHITECTURE.md`, `docs/adr/0017-lean-exam-topics-domain-model-and-typedashboard.md`, `docs/adr/0016-prefer-simple-domain-components-and-dedicated-hooks.md`
- Design system: `DESIGN.md` (shadcn `base-nova`, Base UI primitives, OKLCH variables)
- Constraints / security / testing: `CONSTRAINTS.md`, `SECURITY.md`, `TESTING.md`, `firestore.rules`

## Plan

- [x] Step 1: Types, validators, and i18n messages (Exam, Question, Card, Attempt in `src/types/`, validation schemas in `src/lib/validators/`, and localized strings in `src/messages/*.json`)
- [x] Step 2: Firestore composite indexes (`firestore.indexes.json`, registered in `firebase.json` and documented in `DER.md`)
- [x] Step 3: Domain hooks and FSRS dual-write integration (`useExamList`, `useQuestionCard` in `src/hooks/`), owning all state, effects, and atomic batch writes
- [x] Step 4: UI components with instant click-to-validate feedback (`ExamList`, `QuestionCard`, `ScrollToTopButton` in `src/components/notes-app/`) adhering to single-component-per-file, canonical props typing, trailing exports, `data-slot`, non-color indicators, and zero emojis
- [x] Step 5: Route integration (e.g. `src/app/[spaceId]/exams/[examId]/page.tsx` as async Server Component with Next.js 15 `await params`)
- [x] Step 6: Testing & Quality Verification (e.g. validator unit tests in `src/lib/validators/`, dedicated hook tests in `src/hooks/`, component tests in `src/components/notes-app/`, Ladle stories in `src/stories/`, route tests with `params: Promise.resolve(...)`, Firebase emulator dual-write tests in `src/lib/firebase/`, and Playwright E2E in `e2e/`)
- [x] Step 7: Quality gates pass and documentation synchronization

## Progress

- 2026-10-03 — Authored and refined ADR 0017; audited active execution plan with specialized subagent team; aligned plan with `CONSTRAINTS.md`, `CONVENTIONS.md`, `DESIGN.md`, and `DER.md`.

- 2026-10-03 — Implemented Steps 1-5: types, validators, i18n catalogs, composite indexes, `useQuestionCard`/`useExamList`, `submitAttempt` dual-write, `QuestionCard`/`ExamList`/`ScrollToTopButton`, and the `/[spaceId]/exams/[examId]` route.
- 2026-10-03 — Completed Steps 6-7: added the `attempts-emulator` dual-write suite and `e2e/exam-feed.spec.ts`, moved the Ladle story, fixed New-card scheduling, and synchronized `DER.md` and `TESTING.md`.
- 2026-10-03 — Added the discoverable entry point after review: `ExamNavigation` (`useExamNavigation`) lists active Exam objects in the `SpaceShell` sidebar and links to `/[spaceId]/exams/[examId]`; the e2e spec now reaches the feed through that link.

## Decision Log

- 2026-10-03 — Adopted direct click-to-validate feedback on options with automatic grounded explanation expansion (when available) for zero-friction active recall, replacing multi-step button interactions.
- 2026-10-03 — Added `ts-fsrs` (reference FSRS v5 implementation) as a dependency behind `src/lib/fsrs/schedule-card.ts`; no other module imports it.
- 2026-10-03 — `scheduleCard` zeroes stability and difficulty for New cards before calling ts-fsrs. `firestore.rules` requires `difficulty` in 1..10 on every stored card while ts-fsrs rejects non-zero memory on a New card; the emulator suite surfaced the conflict.
- 2026-10-03 — `QuestionCard` stories live in `src/stories/` because `guard-component-props` counts every exported story as a component, and Ladle discovers `src/**/*.stories.tsx`.
- 2026-10-03 — Adopted `ExamList` (`useExamList`) in component directory to comply with `guard-component-naming.mjs` and `guard-notes-app-pattern.mjs` archetype suffixes.

## Verification

- [x] Relevant deterministic checks (`rtk pnpm run check:fast`, `rtk pnpm run test:firebase-emulator` suites run against the live emulators, `rtk pnpm run test:coverage`: 94.35% statements, 92.24% branches, 89.52% functions, 95.07% lines)
- [x] Behavioral/runtime verification when applicable (`e2e/exam-feed.spec.ts` passes against the Auth and Firestore emulators; Ladle stories for `QuestionCard` states in `src/stories/question-card.stories.tsx`)
- [x] Final diff review
- [x] Documentation synchronized (`rtk pnpm run verify:docs`: 0 errors, one pre-existing `AGENTS.md` size warning; `rtk pnpm run check:docs`: passed)

## Recovery / Rollback

If validation fails or breaks existing space operations, revert new exam-specific types and components. Existing Space and Auth models remain isolated.

## Completion

**Completed:** 2026-10-03  
**Result:** Exam feed, click-to-validate question cards, and atomic Attempt plus Card FSRS dual-write implemented and verified (unit, emulator, e2e, guards, docs). `next build` was not run because a dev server held `.next`; it remains part of `check:ci`.  
