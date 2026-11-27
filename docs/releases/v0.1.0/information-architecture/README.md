# Information Architecture — v0.1.0

A single workspace has a competition navigation sidebar and a main question-list region. Selecting a competition loads its corresponding list. The active competition is identifiable. Questions appear vertically in the main region; the user can scroll. The first available sidebar item is selected automatically on entry. Routing remains open; page changes reset scroll to the top.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size is ten; total pages and ordering remain dataset-dependent or unspecified. Page changes reset the list to the top.

Progress: in progress; user review pending.

## Workspace structure and variants

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Other proposed variants remain pending visual review. No separate routes or working behavior are established.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.

## Copy and navigation boundaries

Current Sketch labels are in English; official institution names remain unchanged. Prior answers are discarded when changing page or entry, as recorded in the [Product decision register](../product/README.md#open-product-decisions). The native Sketch is not a routing specification.

The [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) explores the same workspace, including a proposed narrower composition. The initial unselected proposal is superseded by automatic first-item selection; collapsible navigation is approved for small screens; exact mechanism and routing remain open.

The [Mid-Fidelity Wireframe](../mid-fidelity-wireframe/README.md) retains the same two-region workspace and the first available item default. The narrow expanded/collapsed treatments and empty-sidebar composition remain visual proposals; no route or destination is added.

The owner approved a collapsible sidebar on small screens and ten questions per page. Collapsing or expanding does not change the selected competition or page. Changing competition or page discards responses. A collapsed rail is a design study; breakpoint and mobile details remain open.

The sidebar trigger is now approved for all desktop workspace states and narrow layouts. It is a shell control, not a question-list control. The phone layout and navigation loading/failure compositions are explicitly proposed studies; no new route, data architecture or exact breakpoint is selected.
