# Screen Inventory — v0.1.0

## Questions workspace

- Sidebar: selectable competition items.
- Main region: stacked question items directly, without a repeated competition heading, vertical scroll.
- Sketch illustrates a selected DATAPREV item and PPSA as another example, question statements and alternatives as abstract marks.

- Pagination at the end of the question list (illustrative Previous/Next and numbered pages).

Other destinations and controls are not selected. Progress: in progress; user review pending.

## Screen state inventory

| State | Status |
| --- | --- |
| Unanswered / list start | Baseline sketch |
| List end / pagination | Baseline sketch |
| Selected before submission | Required; explicit Answer control not yet drawn |
| Correct answer | Requested; sketch pending validation |
| Incorrect answer | Required; selected error and correct answer shown |
| Loading | Proposal |
| Empty list | Proposal |
| Load failure | Required manual Retry action not yet drawn |

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.

The eight states remain: unanswered, end-of-list pagination, selected before submission, correct, incorrect, loading, empty, and load failure. The selected-before-submission state is required. The Answer and Retry controls still need visual reconciliation in the static board; behavior and accessibility are not yet tested.

English labels are now consistent across all eight variants. A separate initial unselected state may be needed depending on the [initial-selection decision](../product/README.md#open-product-decisions); do not silently assume a default. Revisiting evaluated answers is also unresolved. No additional variant is approved by this inventory update.
