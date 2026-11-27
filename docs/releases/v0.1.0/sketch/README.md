# Sketch — v0.1.0

Two side-by-side scroll states of the same exploratory native Open Artifact screen: competition sidebar and vertically stacked questions, inspired by the list pattern the user described in ExamTopics. DATAPREV and PPSA are illustrative labels; abstract statements and alternatives are placeholders. The left state shows the top of the list and the right state shows the end of the same page, with the same sidebar and pagination inside the main region footer. The partially visible questions and scrollbar communicate scroll position. This is not a second destination or a sticky-footer requirement. No filters, answer evaluation, mock exams or other features are included. The drawing is static, not a working interaction.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages, ordering, and scroll restoration on page change remain open.

Progress: in progress; user visual review pending.
