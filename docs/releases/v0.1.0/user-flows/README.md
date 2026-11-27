# User Flows — v0.1.0

Select a competition in the sidebar → show that competition's questions → scroll vertically through the list. Select another competition → show its questions. Answer feedback states are requested; submission mechanism and evaluation trigger are not specified.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages, ordering, and scroll restoration on page change remain open.

Progress: in progress; user review pending.

## State transitions under review

Select entry → loading (proposal) → list, empty or load failure (proposed variants). Unanswered → select option → correct or incorrect feedback; intermediate selected state depends on evaluation timing. Page navigation remains in the selected entry. Correct-answer reveal after an error, retry and page-change scroll restoration remain open. No implementation or new routes are implied.
