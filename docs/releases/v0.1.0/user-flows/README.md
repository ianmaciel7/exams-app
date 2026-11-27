# User Flows — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

## Approved transitions

| Event | Result |
| --- | --- |
| Enter | Select first available competition → load |
| Load succeeds | Questions or empty list |
| Load fails | Manual Retry reloads questions |
| Select option | Enable Answer |
| Answer | Pending; prevent duplicate submission |
| Evaluation succeeds | Correct/incorrect; lock answer |
| Submission fails | Retain choice; enable Answer |
| Page/competition change | Discard prior answers; reset page scroll on page change |
| Close application | Discard session answers |
| Collapse / expand | Preserve context and answers |
| Collapsed hover / focus | Reveal icon; explicit activation opens |
| No competitions | Show empty message; no action or selection |
| Competition list fails | Show error; manual Retry reloads list |
| Phone navigation opens | Overlay drawer; preserve question context |
| Submission outcome uncertain | Retain option; safe retry without duplicate evaluation |

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers. Questions follow original exam order. If no competitions are available, show an empty-state message without an action button. On phones, navigation opens as a drawer over the question content rather than shifting it. If competition-list loading fails, show an error and manual Retry. If an answer outcome cannot be confirmed, retain the selected option and permit a safe retry without duplicate evaluation. Support the application interface in Brazilian Portuguese and English.

Late responses must not restore discarded answers. Exact cancellation and ambiguous server outcomes require prototype validation. Competition-list Retry is distinct from question-list Retry. Empty competitions and phone overlay drawer are approved; exact behavior requires prototype validation.

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale selection/default behavior require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. Native visual review, runtime, usability and accessibility validation remain pending.

[Current state](../current-state.json) · [Product decisions](../product/README.md#approved-mid-fidelity-decisions--2026-11-27)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
