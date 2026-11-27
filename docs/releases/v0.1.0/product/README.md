# Product — v0.1.0

Current stage: High-Fidelity Wireframe — in progress; structural specification and visual review pending.

## Current release baseline

One workspace for browsing and answering questions of the selected competition. DATAPREV and PPSA are illustrative examples, not a confirmed exam dataset. No additional destinations, scoring, filters, simulations or persistent answer history are approved.

## Approved Mid-Fidelity decisions — 2026-11-27

Automatically select the first available competition on entry. Browse ten questions per page; when there is more than one page, pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. Hide pagination when the list fits on one page. Show a nonmodal warning near page and competition navigation only when selected or evaluated answers would be discarded. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. The collapsed rail shows a provisional Exam App mark at rest. On hover-capable desktop, reveal the expand action on hover or keyboard focus while keeping its target fixed. Reserve the expanded header for the future Exam App logo. Final identity remains pending. Keep the control visible on touch and no-hover devices. The phone drawer open and close controls occupy the same position. Provide a localized accessible action name and expose expanded state. Use a desktop hover and focus tooltip as supplementary help. Hover adds subtle surface feedback and keyboard focus adds a visible outline without moving the layout. Explicit activation opens or closes navigation. Collapse/expand preserves current page, selection, scroll context and answers. Questions follow original exam order. If no competitions are available, show an empty-state message without an action button. On phones, navigation opens as a drawer over the question content rather than shifting it. If competition-list loading fails, show an error and manual Retry. If an answer outcome cannot be confirmed, retain the selected option and permit a safe retry without duplicate evaluation. Support the application interface in Brazilian Portuguese and English.

| Area | Approved decision |
| --- | --- |
| Entry | First available competition |
| Pagination | 10 questions per page. Show pagination only when there is more than one page. Reset scroll on page change. |
| Answer | Explicit confirmation; lock after evaluation |
| Navigation | Show a nonmodal warning near the relevant navigation before changing page or competition when selected or evaluated answers would be lost. The change discards those answers. |
| Session | No persistence across sessions |
| Submission failure | Keep choice; retry Answer; prevent duplicates |
| Sidebar | Collapsed desktop glyph reveals on hover/focus; touch and no-hover controls stay visible |
| Collapse | Preserve selection, page, scroll and answers |
| Question load failure | Show an error notice and a manual Retry button that reloads the selected question list |
| Feedback | Correct option and user's wrong choice identified |
| Question ordering | Original exam order |
| Empty competition list | Message only; no action button |
| Phone sidebar | Overlay drawer |
| Competition list failure | Error and manual Retry |
| Unknown submission outcome | Retain choice and permit safe retry |
| Interface languages | Brazilian Portuguese or English according to the device language, with English fallback |

Competition labels: `Name · Year · Position/exam`; use one-line ellipsis on desktop with full-name discovery by hover/focus; wrap labels on phones without relying on hover. PPSA's full position title still requires confirmation. English remains the project-authored design language; the application interface supports Brazilian Portuguese and English. The final page may contain fewer than ten questions; no page-size chooser. Late responses must not restore discarded answers.

## Open decisions

No outstanding owner decisions in the current decision register.

## Technical validation

| Topic | Status |
| --- | --- |
| Responsive breakpoint and drawer accessibility | Prototype validation. 1024 CSS px is the initial test threshold. |
| Competition data source and original exam ordering | Technical design |
| Safe retry and ambiguous outcomes | Technical design / prototype |
| Device locale detection and English fallback | Technical design / prototype |
| Visual, keyboard, touch and accessibility verification | Review / prototype |

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale detection/English fallback verification require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. High-Fidelity structural and visual review, runtime, usability and accessibility validation remain pending.

Evidence: [QConcursos study](../../../references/2026-11-25-qconcursos-archive-evidence.md) and [historical archive inventory](https://github.com/ianmaciel7/exams-app-archive/blob/main/inventory/exams-app-branch-files.json). Original ExamTopics flow, pagination and retry bytes were not recovered. Scroll reset and manual retry are owner-approved decisions.

Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.

[Current state](../current-state.json) · [Release record](../README.md)

## Responsive navigation decision

When the available width cannot accommodate the expanded sidebar and readable questions side by side, navigation opens as a modal overlay. Place the phone drawer open and close controls in the same position. Give the drawer an accessible name; move keyboard focus inside on open and contain it while open. Escape and a visible close control dismiss it and return focus to the trigger. Selecting a competition closes the drawer, restores focus to the trigger and announces the selected competition. Dismissing without selecting preserves the current question context.

Start prototype testing at 1024 CSS px. Determine the final breakpoint by testing available width, zoom and long labels. Verify keyboard focus and screen reader announcements in the working prototype.

## Initial competition selection

On entry, select the first competition in the order presented by the available list. The release does not require sorting by date or name. The list source and its underlying order remain pending technical design.
