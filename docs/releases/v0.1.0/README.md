# Release v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

## Current scope and decisions

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

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

| Topic | Status |
| --- | --- |
| Question ordering | Open |
| Empty sidebar presentation | Proposal |
| Phone drawer and breakpoint | Proposal |
| Competition-list data source and recovery | Proposal |
| Ambiguous submission outcome | Open |
| Production localization | Open |

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

## Capture evidence

Last verified successful capture: [165f554](https://github.com/ianmaciel7/exams-app/commit/165f554320d9077545296c0e252189bb5d0f22e6) · [CI 46006601771](https://github.com/ianmaciel7/exams-app/actions/runs/46006601771). Manifest verified: 10 native boards, both Light and Dark. This is evidence for that commit only, not visual approval of the current revision.

Last recorded Mid-Fidelity review requiring changes: [670a2d1](https://github.com/ianmaciel7/exams-app/commit/670a2d17120e344e9f7ccc8632d7c780d00da41c) · [CI 46004860284](https://github.com/ianmaciel7/exams-app/actions/runs/46004860284) — Mid-Fidelity focus treatment reviewed; owner requested correction. Not an approval.

Last recorded planning-board review requiring changes: [898d493](https://github.com/ianmaciel7/exams-app/commit/898d493e56bbaefb49095eb5a2648ae463043359) · [CI 46005686904](https://github.com/ianmaciel7/exams-app/actions/runs/46005686904) — Owner identified crowded planning-board elements; layout corrections made in 165f554.

New revisions require their own capture; owner visual approval of Mid-Fidelity remains pending.

[Canonical release state](current-state.json) · [Ideas Board](../../boards/overview/README.md)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
