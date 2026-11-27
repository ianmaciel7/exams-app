# Release v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

## Current scope and decisions

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

| Stage | Progress | Validation |
| --- | --- | --- |
| [Product](product/README.md) | In progress, synchronized | Open decisions remain |
| [Information Architecture](information-architecture/README.md) | In progress, synchronized | Routing and phone details open |
| [Screen Inventory](screen-inventory/README.md) | In progress, synchronized | 21 Mid-Fidelity variants |
| [User Flows](user-flows/README.md) | In progress, synchronized | Functional validation pending |
| [Sketch](sketch/README.md) | Complete for progression | Owner approved at 94072ce; 8 variants |
| [Low-Fidelity Wireframe](low-fidelity-wireframe/README.md) | Complete for progression | Owner approved at e70dbaf; 9 variants |
| [Mid-Fidelity Wireframe](mid-fidelity-wireframe/README.md) | In progress | 21 variants; corrected capture review pending |
| High-Fidelity Wireframe | Not started | Pending |
| Mockup | Not started | Pending |
| Interactive Prototype | Not started | Pending |
| Usability Testing | Not started | Pending |

## Current evidence

[Capture run 46001664133](https://github.com/ianmaciel7/exams-app/actions/runs/46001664133) generated the 21 variants at `45e695c`; visual review identified alignment defects. This revision addresses them without advancing the stage. Use the native downloadable capture artifact, not GitHub Pages. [Current status contract](current-state.json) · [Alignment review](mid-fidelity-wireframe/README.md#alignment-and-documentation-reconciliation--2026-11-27).

## Historical records

The earlier stage boards and decision threads are preserved. Their design geometry, unresolved decisions and capture statuses describe those historical snapshots, not the current release. [Previous release record, including the full dated revision history](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/docs/releases/v0.1.0/README.md) · [Ideas Board](../../boards/overview/README.md).

Latest reviewed baseline: [`ea7a119`](https://github.com/ianmaciel7/exams-app/commit/ea7a1194a797e433dcf6fe880b5d99acbd916de6) ([capture run 46003854656](https://github.com/ianmaciel7/exams-app/actions/runs/46003854656)). The owner requested action-state and collapsed-trigger refinements; the current revision retains 21 variants plus external component specimens. New captures pending review.
