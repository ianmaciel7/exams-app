# Release v0.1.0

Current direction: sidebar competition selection and a vertically scrollable, paginated question list. Other capabilities remain unselected. Historical ideas remain in [Ideas Board](../../boards/overview/README.md).
 

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages and ordering remain open. Page changes reset the list to the top.

| Stage | Progress | Validation |
| --- | --- | --- |
| [Product](product/README.md) | In progress | Pending |
| [Information Architecture](information-architecture/README.md) | In progress | Pending |
| [Screen Inventory](screen-inventory/README.md) | In progress | Pending |
| [User Flows](user-flows/README.md) | In progress | Pending |
| [Sketch](sketch/README.md) | In progress | Pending |
| Low-, mid-, high-fidelity wireframes, mockup, interactive prototype | Not started | Pending |

## Current state review

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Other proposed variants remain pending visual review. No separate routes or working behavior are established.

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

[Review threads](sketch/comments.json) and [provisional visual direction](../../../DESIGN.md). All stages remain in progress, validation pending; static sketches are not implementation. Latest source before this documentation sync: `9a2e566`.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.
