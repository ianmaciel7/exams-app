# Screen Inventory — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

One workspace, not separate destinations. Main region contains a scrolling question list, left-aligned Answer/result, and end-of-list pagination. The Ghost control is available across states; collapsed desktop pointer-rest hides its icon. External component specimens are not additional variants.

| # | Native state ID | Review category |
| --- | --- | --- |
| 1 | `top` | Core — unanswered |
| 2 | `end` | Core — first page footer |
| 3 | `selected` | Core — before submission |
| 4 | `correct` | Core — correct and locked |
| 5 | `wrong` | Core — incorrect and locked |
| 6 | `loading` | Question lifecycle — loading |
| 7 | `empty` | Question lifecycle — empty list |
| 8 | `failure` | Question lifecycle — Retry |
| 9 | `narrow` | Responsive study — expanded |
| 10 | `hover` | Interaction study — hover |
| 11 | `focus` | Interaction study — focus |
| 12 | `submitting` | Core — submission pending |
| 13 | `submit-failure` | Core — submission recovery |
| 14 | `no-items` | Proposal — empty sidebar |
| 15 | `collapsed` | Responsive study — collapsed |
| 16 | `long-content` | Content stress test |
| 17 | `page-middle` | Pagination — middle |
| 18 | `page-last` | Pagination — last |
| 19 | `mobile` | Proposal — phone, closed drawer |
| 20 | `sidebar-loading` | Proposal — navigation loading |
| 21 | `sidebar-failure` | Proposal — navigation failure |

## Boundaries

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

[Current state](../current-state.json) · [Mid-Fidelity](../mid-fidelity-wireframe/README.md)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
