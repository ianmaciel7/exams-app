# User Flows — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

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

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

Late responses must not restore discarded answers. Exact cancellation and ambiguous server outcomes require prototype validation. Navigation-list loading/failure, empty sidebar and phone drawer interaction remain proposals, distinct from question-list Retry.

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

[Current state](../current-state.json) · [Product decisions](../product/README.md#approved-mid-fidelity-decisions--2026-11-27)

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.
