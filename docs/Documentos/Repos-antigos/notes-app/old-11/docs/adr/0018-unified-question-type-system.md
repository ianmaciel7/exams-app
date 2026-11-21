# 0018. Unified Question Type System

- **Status:** Accepted
- **Date:** 2026-10-03
- **Canonical Owner:** `ARCHITECTURE.md`
- **Amends:** `docs/adr/0017-lean-exam-topics-domain-model-and-typedashboard.md` (sections 1 and 3: Question `properties`, answer evaluation, and Attempt payload)

## Context and Problem Statement

ADR 0017 models a `Question` with `format: "single_choice" | "multiple_choice"`, `options`, and `correctOptionIds`. That shape (the **legacy ExamTopics shape**) cannot express other assessment styles that certification and knowledge study need: true/false, typed completion, association, drag and drop, image hotspots, and case studies. It also records only a rating in the `Attempt`, so the answer a learner actually submitted is lost, and the validator accepts any extra field on a question.

The platform needs one question model where:

1. the question type is an explicit discriminator and every type has its own required, optional, and forbidden fields;
2. every correct answer references data that exists in the question;
3. images are an attribute of a question or option, never a type of their own;
4. each submission is preserved as an immutable event together with the answer that was sent.

## Decision Outcome

### 1. Question type is a discriminated union in `properties`

`Question` remains a polymorphic `Object` (`objectTypeId: "question"`, `DER.md` `schemaVersion: 4`). `properties.type` is the discriminator:

| `type` | Type-specific fields | `correctAnswer` |
| --- | --- | --- |
| `single-choice` | `options` (>= 2) | `string` (option id) |
| `multiple-choice` | `options` (>= 2) | `string[]` (>= 1 option ids) |
| `true-false` | `options` fixed to ids `true` and `false` | `"true" \| "false"` |
| `fill-blank` | none (no `options`) | `string[]` (>= 1 accepted answers) |
| `matching` | `leftItems`, `rightItems` | `Record<leftId, rightId>` |
| `drag-and-drop` | `items`, `slots` | `Record<slotId, itemId>` |
| `hotspot` | `image` (required), `areas` | `string[]` (>= 1 area ids) |
| `case-study` | `title`, `context`, `sections`, `parts` | `Record<partId, answer>` |

Common fields: `prompt`, optional `promptImage`, `explanation` (a `GroundedExplanation`, ADR 0017 and `INV-9`), optional `source`, plus the metadata that existing indexes depend on: `examId` and `orderIndex` stay at the top level of `properties`, so the composite index from ADR 0017 section 6 is unchanged. `content` still holds private learner notes only.

`QuestionOption` is `{ id, text, explanation?, imageUrl?, imageAlt? }`. Image URLs must be `https:` URLs.

### 2. Runtime validation rejects incompatible shapes

`validateQuestionProperties` dispatches on `type` and returns field-level error codes. It enforces: required fields per type, option count, unique ids inside each collection (options, items, slots, areas, sections, parts), `correctAnswer` references that exist, a mandatory image for `hotspot`, and **rejection of fields that do not belong to the type** (for example `options` on `fill-blank`). Validation is hand-written, like the existing validators, and adds no schema library.

### 3. Evaluation and normalization are pure functions

`evaluateAnswer(question, submittedAnswer)` is exhaustive over `type`. A selection is correct only when it matches the key completely: `multiple-choice` compares sets, `matching` and `drag-and-drop` require every pair or slot, `hotspot` compares the set of selected areas. `fill-blank` compares after trimming, collapsing whitespace, Unicode NFC normalization, and case folding; accents are significant. The result also carries per-item detail so the UI can mark each option, pair, slot, or area.

### 4. Attempts preserve the submitted answer

`Attempt` documents (ADR 0017 section 3, `INV-11`) gain `questionType`, `submittedAnswer` (`{ type, value }`) and `isCorrect`. `rating` mapping is unchanged (correct is `3`, incorrect is `1`). Attempts stay create-only; a retry writes a new Attempt and never edits an earlier one. Instant validation on click applies to `single-choice` and `true-false`; every other type is submitted with an explicit confirm action.

### 5. Legacy `exam_topic` compatibility

Documents in the legacy ExamTopics shape (`format`, `statement`, `correctOptionIds` and no `type`) are migrated, not extended:

- `single_choice` with one correct option becomes `single-choice`;
- `multiple_choice`, or any legacy document with more than one correct option, becomes `multiple-choice`;
- a legacy document without options becomes `fill-blank` when it carries textual answers, otherwise a reveal-only `case-study`.

A pure converter (`migrate-legacy-question`) is the single implementation; a migration script rewrites stored documents in the emulator and the read path applies the converter to any unmigrated document until the rewrite has run. No code path creates new data in the legacy shape, and the seed emits only the new model.

### 6. Drag and drop uses `@dnd-kit`

`@dnd-kit/core` provides pointer, keyboard, and screen-reader announcement support for `drag-and-drop`. The same question also offers a select-then-place interaction that does not need dragging.

### 7. Full-card single-click interaction for choice questions

`QuestionChoiceItem` delegates clicks across the full card container to its underlying control (`RadioGroupItem` or `Checkbox`) on a single click without requiring precision targeting of the text label or radio circle, while preserving native keyboard and direct input events.

## Consequences

### Positive

- Every question type has an explicit, validated contract; malformed questions fail at the boundary instead of rendering wrongly.
- The learner's submitted answer is auditable and replayable next to the FSRS snapshot.
- The `objects` collection, its security rules, and the composite index do not change.

### Trade-offs and Mitigations

- **Client holds the answer key** (same trade-off as ADR 0017): acceptable for study mode; proctored modes would need server-side grading.
- **New dependency** (`@dnd-kit`): scoped to one hook and one component, covered by `check:security` and `knip`.
- **Two shapes coexist during migration**: bounded by the converter on the read path and removed once every environment has run the migration script; the converter and its tests are then deleted.
