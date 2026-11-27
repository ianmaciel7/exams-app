# Release v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

## Current scope and decisions

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse and expand icons remain visible at pointer rest with no button background (Ghost). Hover adds subtle surface feedback and keyboard focus adds a visible outline without moving the layout. Activation, not hover, expands the sidebar. Keep the same visible accessible trigger on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers. Questions follow original exam order. If no competitions are available, show an empty-state message without an action button. On phones, navigation opens as a drawer over the question content rather than shifting it. If competition-list loading fails, show an error and manual Retry. If an answer outcome cannot be confirmed, retain the selected option and permit a safe retry without duplicate evaluation. Support the application interface in Brazilian Portuguese and English.

## Stages

| Stage | Current status |
| --- | --- |
| [Product](product/README.md) | In progress · synchronized |
| [Information Architecture](information-architecture/README.md) | In progress · synchronized |
| [Screen Inventory](screen-inventory/README.md) | In progress · 21 variants |
| [User Flows](user-flows/README.md) | In progress · synchronized |
| [Sketch](sketch/README.md) | Complete for progression · 8 variants |
| [Low-Fidelity Wireframe](low-fidelity-wireframe/README.md) | Complete for progression · 9 variants |
| [Mid-Fidelity Wireframe](mid-fidelity-wireframe/README.md) | In progress · 21 variants |
| High-Fidelity Wireframe | Not started |
| Mockup | Not started |
| Interactive Prototype | Not started |
| Usability Testing | Not started |

## Open decisions

No outstanding owner decisions in the current decision register.

## Technical validation

| Topic | Status |
| --- | --- |
| Responsive breakpoint and drawer focus | Technical design / prototype |
| Competition data source and original exam ordering | Technical design |
| Safe retry and ambiguous outcomes | Technical design / prototype |
| Locale selection and default | Technical design / prototype |
| Visual, keyboard, touch and accessibility verification | Review / prototype |

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale selection/default behavior require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. Native visual review, runtime, usability and accessibility validation remain pending.

## Capture evidence

Last verified successful capture: [ec20139](https://github.com/ianmaciel7/exams-app/commit/ec20139c96062542fc7eabb7424333b4fec6412f) · [CI 46024835242](https://github.com/ianmaciel7/exams-app/actions/runs/46024835242). Manifest verified: 10 native boards, both Light and Dark. This is evidence for that commit only, not visual approval of the current revision.

Last recorded Mid-Fidelity review requiring changes: [d86973d](https://github.com/ianmaciel7/exams-app/commit/d86973ddcabfb685d97dc855a87a0f3ff4c9c80c) · [CI 46019545548](https://github.com/ianmaciel7/exams-app/actions/runs/46019545548) — Reviewed all 21 Mid-Fidelity states in both board themes (42 captures). The closed-phone artboard in Dark has missing right-hand tiles; Light renders the matching area. Other inspected states preserve the intended visual structure. Capture regression blocks progression; new evidence and owner visual approval required.

Last recorded planning-board review requiring changes: [898d493](https://github.com/ianmaciel7/exams-app/commit/898d493e56bbaefb49095eb5a2648ae463043359) · [CI 46005686904](https://github.com/ianmaciel7/exams-app/actions/runs/46005686904) — Owner identified crowded planning-board elements; layout corrections made in 165f554.

New revisions require their own capture; owner visual approval of Mid-Fidelity remains pending.

[Canonical release state](current-state.json) · [Ideas Board](../../boards/overview/README.md)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
