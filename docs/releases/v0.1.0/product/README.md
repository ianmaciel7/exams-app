# Product — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

## Current release baseline

One workspace for browsing and answering questions of the selected competition. DATAPREV and PPSA are illustrative examples, not a confirmed exam dataset. No additional destinations, scoring, filters, simulations or persistent answer history are approved.

## Approved Mid-Fidelity decisions — 2026-11-27

Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

| Area | Approved decision |
| --- | --- |
| Entry | First available competition |
| Pagination | 10 questions per page; reset scroll |
| Answer | Explicit confirmation; lock after evaluation |
| Navigation | Discard answers on page/competition change |
| Session | No persistence across sessions |
| Submission failure | Keep choice; retry Answer; prevent duplicates |
| Sidebar | Ghost trigger; hover/focus reveal collapsed |
| Collapse | Preserve selection, page, scroll and answers |
| Question load failure | Manual Retry reloads selected list |
| Feedback | Correct option and user's wrong choice identified |

Competition labels: `Name · Year · Position/exam`; truncate with ellipsis while preserving full-name discovery by focus, hover and touch. PPSA's full position title still requires confirmation. English is the project-authored design language, not a production localization decision. The final page may contain fewer than ten questions; no page-size chooser. Late responses must not restore discarded answers.

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

Evidence: [QConcursos study](../../../references/2026-11-25-qconcursos-archive-evidence.md) and [historical archive inventory](https://github.com/ianmaciel7/exams-app-archive/blob/main/inventory/exams-app-branch-files.json). Original ExamTopics flow, pagination and retry bytes were not recovered. Scroll reset and manual retry are owner-approved decisions.

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.

[Current state](../current-state.json) · [Release record](../README.md)
