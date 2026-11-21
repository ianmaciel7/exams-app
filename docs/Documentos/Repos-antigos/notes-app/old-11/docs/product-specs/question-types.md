# Feature Specification: Unified Question Types

**Linked ADR:** [ADR 0018](../adr/0018-unified-question-type-system.md)  
**Triage Label:** `ready-for-agent`  
**Status:** Accepted  

---

## Problem Statement

The exam feed only understands single and multiple choice. Learners also practice true/false, typed completion, association, drag and drop, image hotspots, and case studies, and they need to see what they answered after the fact.

## Solution

One question model with twelve explicit types, per-type answering controls, immediate or confirmed grading, per-item feedback, and an immutable attempt log that stores the submitted answer.

---

## Question Types

| Type | Control | Submission | Correct when |
| --- | --- | --- | --- |
| `single-choice` | radio group | on selection | the selected option is the key |
| `multiple-choice` | checkboxes | when the expected number of options is selected | the selected set equals the key set |
| `true-false` | radio group (`true`, `false`; optional `yes-no` labels) | on selection | the selection is the key |
| `fill-blank` | text input or textarea | confirm | the normalized text equals an accepted answer |
| `dropdown` | one select per dropdown field | when every field is selected | every dropdown holds its key option |
| `matching` | one select per left item | when every left item is paired | every left item maps to its key item |
| `ordering` | reorderable item list (keyboard accessible) | confirm | the items are in the exact key order |
| `drag-and-drop` | draggable items and slots (keyboard accessible) | when every slot is filled | every slot holds its key item |
| `hotspot` | image with clickable areas | when the expected number of areas is selected | the selected areas equal the key areas |
| `matrix` | one choice per row across shared columns | when every row is answered | every row maps to its key column |
| `simulation` | simulated terminal accepting typed commands | confirm | every normalized key command was executed |
| `case-study` | tabs for context sections plus answerable parts | when every part is answered | every part is correct (reveal-only when it has no parts) |

## User Stories

1. As a learner, I want each question type to use the control that fits it, so that answering feels natural.
2. As a learner, I want to see which options, pairs, slots, or areas were right or wrong, so that I know exactly what to fix.
3. As a learner, I want the general explanation and the explanation of a specific option, so that I understand the reasoning.
4. As a learner, I want my submitted answer to stay visible after grading, so that I can compare it with the key.
5. As a learner, I want to try a question again without losing earlier attempts, so that my history stays accurate.
6. As a keyboard or screen reader user, I want every type to work without a pointer, so that the feed is accessible.
7. As an author of imported content, I want invalid questions rejected with a field-level reason, so that bad data never reaches the feed.
8. As an existing user, I want old questions to keep working, so that migration does not lose my study history.

## Implementation Decisions

1. `type` is the discriminator; each type declares required, optional, and forbidden fields, and unknown fields are rejected.
2. Images are attributes (`promptImage`, option `imageUrl`, hotspot `image`), never a type. Only `hotspot` requires one. Every image has alternative text.
3. Feedback never relies on color alone: icons and screen-reader text accompany correct and incorrect states.
4. `fill-blank` normalization: trim, collapse whitespace, Unicode NFC, case-insensitive. Accents are significant.
5. Hotspot areas use percentage coordinates (0-100) of the image box, as `rect`, `circle`, or `polygon`. A `circle` radius is a percentage of both axes, so it renders as an ellipse on a non-square image; use a `rect` or `polygon` when the exact shape matters. Each area is a toggle button named by its label, and graded areas are also listed as text. Image sources are `https:` URLs or same-origin paths.
6. `case-study` parts are single-choice, multiple-choice, true-false, fill-blank, or dropdown questions; case studies do not nest.
7. Legacy ExamTopics-shaped questions are migrated by `pnpm migrate:questions` and converted on read until then. A legacy question without options becomes `fill-blank` when it has textual answers, otherwise a reveal-only `case-study`.
8. Drag and drop uses `@dnd-kit/core` (pointer and keyboard sensors with localized announcements). Each slot also has a select, so every placement works without dragging.
9. Multiple choice no longer grades itself when the selection reaches the number of correct options (that leaked the count); it is confirmed with "Check answer".

## Testing Decisions

- Validators: one valid case per type; missing fields; wrong option counts; correct answers that reference nothing; duplicate ids; hotspot without image; fields foreign to the type; non-https image URLs.
- Evaluation: full-set matching for multiple choice, matching and drag and drop; fill-blank normalization; hotspot with one and several areas.
- Components: render, keyboard operation, ARIA roles and names, and feedback states for each type.
- Migration: every conversion branch, idempotency, and the script in `--dry-run`.

## Out of Scope

- Question authoring UI.
- Server-side grading and proctored mode.
- Partial credit.
