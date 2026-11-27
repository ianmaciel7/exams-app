# Product

<!-- impeccable:product-schema 1 -->

## Product purpose

Exam App is an exam preparation project.

## Current release

Current stage: High-Fidelity Wireframe — in progress; structural specification and visual review pending.

The reduced v0.1.0 scope is a single competition-question workspace. Automatically select the first available competition on entry. Browse ten questions per page; when there is more than one page, pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. Hide pagination when the list fits on one page. Show a nonmodal warning near page and competition navigation only when selected or evaluated answers would be discarded. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is available across workspace states. The collapsed rail shows a provisional Exam App mark at rest. On hover-capable desktop, reveal the expand action on hover or keyboard focus while keeping its target fixed. Reserve the expanded header for the future Exam App logo. Final identity remains pending. Keep the control visible on touch and no-hover devices. The phone drawer open and close controls occupy the same position. Provide a localized accessible action name and expose expanded state. Use a desktop hover and focus tooltip as supplementary help. Hover adds subtle surface feedback and keyboard focus adds a visible outline without moving the layout. Explicit activation opens or closes navigation. Collapse/expand preserves current page, selection, scroll context and answers. Questions follow original exam order. If no competitions are available, show an empty-state message without an action button. On phones, navigation opens as a drawer over the question content rather than shifting it. If competition-list loading fails, show an error and manual Retry. If an answer outcome cannot be confirmed, retain the selected option and permit a safe retry without duplicate evaluation. Support the application interface in Brazilian Portuguese and English.

Competition labels use `Name · Year · Position/exam`, with desktop ellipsis and full-name discovery by hover/focus, and wrapped phone drawer labels. Examples DATAPREV and PPSA are illustrative. English is the language of project-authored material; the application interface supports Brazilian Portuguese and English. Use the device language when the interface supports it and fall back to English otherwise; exam-content translation is not approved. No filters, simulations, scoring, persistent answer history or other routes are approved.

## Open decisions

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale detection/English fallback verification require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. High-Fidelity structural and visual review, runtime, usability and accessibility validation remain pending.

The owner approved a modal drawer when the expanded sidebar and readable questions cannot fit side by side. See the [responsive navigation decision](docs/releases/v0.1.0/product/README.md#responsive-navigation-decision).

## Sources

[Release record](docs/releases/v0.1.0/README.md) · [Product decision register](docs/releases/v0.1.0/product/README.md) · [Current state](docs/releases/v0.1.0/current-state.json) · [Active wireframe](docs/releases/v0.1.0/high-fidelity-wireframe/README.md) · [Design direction](DESIGN.md) · [Ideas Board](docs/boards/overview/README.md).

Historical candidates and earlier planning are preserved in [the archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126) and [the preceding revision](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/PRODUCT.md).
