# Product

<!-- impeccable:product-schema 1 -->

## Product purpose

Exam App is an exam preparation project.

## Current release

v0.1.0 — current direction: select a competition in the sidebar and browse its questions in a vertically scrollable, paginated list. The owner also requested correct and incorrect answer states. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. English is the language of project-authored Sketch copy and documentation; production localization is not yet decided. Other capabilities, platform, stack, target users and constraints remain undefined. Previous features and decisions are historical candidates, not requirements.

Start with the [Ideas Board](docs/boards/overview/README.md). [Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).

## Evidence on hand

See the [release records](docs/releases/v0.1.0/README.md), [current Sketch](docs/releases/v0.1.0/sketch/README.md) and [provisional visual direction](DESIGN.md). Historical ideas are not approved requirements.

Approved initial selection: on every entry to the workspace, automatically select the first item in the sidebar's displayed order and load its questions. No manual selection step is required. If no items exist, no selection is possible; the empty-sidebar treatment remains unspecified. This is a product decision, not verified implementation.

## Approved Mid-Fidelity decisions — 2026-11-27

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible on small screens. Show ten questions per page, or fewer when the final page contains fewer questions.

These are owner-approved product requirements, not implemented behavior. Question ordering, exact responsive breakpoint, empty-sidebar treatment and recovery details for uncertain server outcomes remain open.
