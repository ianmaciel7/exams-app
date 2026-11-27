# User Flows — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

## Approved Mid-Fidelity transitions

| Event | Next state / effect |
| --- | --- |
| Enter workspace with available competitions | Select first displayed item automatically; load questions |
| Question request completes | List or empty questions |
| Question request fails | Show failure; manual Retry reloads selected list |
| Select alternative | Answer enabled; choice editable until confirmed |
| Answer | Pending; prevent duplicate submission |
| Evaluation succeeds | Correct or incorrect feedback; confirmed choice locked on current page |
| Submission fails | Retain choice; enable Answer again |
| Change page | Discard prior page answers; load target; reset scroll to top |
| Change competition | Discard previous responses; load target |
| Close application | Discard temporary answers |
| Collapse/expand sidebar | Preserve current competition, page, scroll context and responses |

Ten questions per full page; final page may contain fewer. Previous and Next unavailable at respective boundaries. Navigation-list loading/failure and empty sidebar are distinct proposals, not confirmed data flows. Phone drawer interaction remains proposed. Late responses must not restore discarded answers after navigation; ambiguous server outcomes and exact cancellation require validation.

## Open transitions

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

[Product decisions](../product/README.md#approved-mid-fidelity-decisions--2026-11-27) · [Current state](../current-state.json) · [Screen inventory](../screen-inventory/README.md) · [Historical flow record](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/docs/releases/v0.1.0/user-flows/README.md).

## Collapsed navigation and action states

A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

External component studies clarify default, hover and pressed actions and the collapsed hover/focus trigger without increasing the 21 workspace variants. No automatic hover expansion or runtime interaction is implied.
