# Product

<!-- impeccable:product-schema 1 -->

## Product purpose

Exam App is an exam preparation project.

## Current release

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

The reduced v0.1.0 scope is a single competition-question workspace. Automatically select the first available competition on entry. Browse ten questions per page; pagination follows the last question and resets scroll to the top. Select one option and explicitly submit with Answer. Correct and incorrect feedback identifies the correct choice and, when wrong, the user's choice. A confirmed answer is read-only on the current page. Changing page or competition, or closing the application, discards responses. On submission failure keep the choice and allow another submission; prevent duplicates while pending. Retry reloads a failed question list. A Ghost sidebar trigger is present across workspace states, including desktop; collapse/expand preserves current page, selection, scroll context and answers.

Competition labels use `Name · Year · Position/exam`, with full names discoverable. Examples DATAPREV and PPSA are illustrative. English is the language of project-authored material; production localization is not decided. No filters, simulations, scoring, persistent answer history or other routes are approved.

## Open decisions

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

## Sources

[Release record](docs/releases/v0.1.0/README.md) · [Product decision register](docs/releases/v0.1.0/product/README.md) · [Current state](docs/releases/v0.1.0/current-state.json) · [Active wireframe](docs/releases/v0.1.0/mid-fidelity-wireframe/README.md) · [Design direction](DESIGN.md) · [Ideas Board](docs/boards/overview/README.md).

Historical candidates and earlier planning are preserved in [the archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126) and [the preceding revision](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/PRODUCT.md).
