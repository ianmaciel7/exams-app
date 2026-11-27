# Information Architecture — v0.1.0

A single workspace has a competition navigation sidebar and a main question-list region. Selecting a competition loads its corresponding list. The active competition is identifiable. Questions appear vertically in the main region; the user can scroll. Routing and initial selection remain open; page changes reset scroll to the top.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages and ordering remain open. Page changes reset the list to the top.

Progress: in progress; user review pending.

## Workspace structure and variants

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Other proposed variants remain pending visual review. No separate routes or working behavior are established.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.

## Copy and navigation boundaries

Current Sketch labels are in English; official institution names remain unchanged. Initial selection and whether prior answers remain visible on revisiting an entry are open in the [Product decision register](../product/README.md#open-product-decisions). The native Sketch is not a routing specification.
