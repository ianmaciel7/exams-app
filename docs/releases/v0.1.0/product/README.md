# Product — v0.1.0

## Current release baseline

User direction (2026-11-26): select a competition in the sidebar to open its questions; browse a vertical list inspired by ExamTopics. Goal: browse questions for the selected competition. No other features selected. Answer evaluation, filtering, data, loading strategy and scoring remain undefined. Pagination is included. Sketch examples DATAPREV and PPSA are illustrative.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages, ordering, and scroll restoration on page change remain open.

Progress: in progress; user review pending.
