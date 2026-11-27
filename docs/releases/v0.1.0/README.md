# Release v0.1.0

Current direction: sidebar competition selection and a vertically scrollable, paginated question list. Other capabilities remain unselected. Historical ideas remain in [Ideas Board](../../boards/overview/README.md).
 

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages, ordering, and scroll restoration on page change remain open.

| Stage | Progress | Validation |
| --- | --- | --- |
| [Product](product/README.md) | In progress | Pending |
| [Information Architecture](information-architecture/README.md) | In progress | Pending |
| [Screen Inventory](screen-inventory/README.md) | In progress | Pending |
| [User Flows](user-flows/README.md) | In progress | Pending |
| [Sketch](sketch/README.md) | In progress | Pending |
| Low-, mid-, high-fidelity wireframes, mockup, interactive prototype | Not started | Pending |

## Current state review

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner requested correct/incorrect feedback; the evaluation trigger, revealing the correct option after an error, page-change scroll restoration and retry policy remain open. Other proposed variants are pending review. No separate routes or working behavior are established.

The current Sketch uses a compact one-line sidebar list with generic question-list glyphs, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

[Open review threads](sketch/comments.json) and [provisional visual direction](../../../DESIGN.md). All stages remain in progress, validation pending; static sketches are not implementation. Latest source before this documentation sync: `9a2e566`.

Both sidebar entries share one neutral question-list icon in the current Sketch; this is a visual refinement, not a new interaction.
