# Screen Inventory — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

One workspace, not separate destinations. Main region contains a scrolling question list, left-aligned Answer/result, and end-of-list pagination. The Ghost control is available across states; collapsed desktop pointer-rest shows the Ghost icon without a background. External component specimens are not additional variants. Desktop labels use one-line ellipsis with full-label discovery by hover/focus; phone drawer labels wrap. The drawer overlays the same question workspace. Phone component studies cover first/middle/last pagination, identical English/pt-BR workspace geometry, and feedback below wrapped alternatives. The Ghost trigger is visible at rest on all input devices. These are static design specimens, not additional workspace variants or functional validation.

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
| 14 | `no-items` | Core — empty competition list |
| 15 | `collapsed` | Responsive study — collapsed |
| 16 | `long-content` | Content stress test |
| 17 | `page-middle` | Pagination — middle |
| 18 | `page-last` | Pagination — last |
| 19 | `mobile` | Responsive study — closed and open overlay drawer |
| 20 | `sidebar-loading` | Navigation lifecycle — loading study |
| 21 | `sidebar-failure` | Navigation lifecycle — error and manual Retry |

## Boundaries

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse and expand icons remain visible at pointer rest with no button background (Ghost). Hover adds subtle surface feedback and keyboard focus adds a visible outline without moving the layout. Activation, not hover, expands the sidebar. Keep the same visible accessible trigger on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers. Questions follow original exam order. If no competitions are available, show an empty-state message without an action button. On phones, navigation opens as a drawer over the question content rather than shifting it. If competition-list loading fails, show an error and manual Retry. If an answer outcome cannot be confirmed, retain the selected option and permit a safe retry without duplicate evaluation. Support the application interface in Brazilian Portuguese and English.

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale selection/default behavior require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. Native visual review, runtime, usability and accessibility validation remain pending.

[Current state](../current-state.json) · [Mid-Fidelity](../mid-fidelity-wireframe/README.md)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
