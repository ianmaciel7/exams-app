# Release v0.1.0

Current direction: sidebar competition selection and a vertically scrollable, paginated question list. Other capabilities remain unselected. Historical ideas remain in [Ideas Board](../../boards/overview/README.md).
 

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages and ordering remain open. Page changes reset the list to the top.

| Stage | Progress | Validation |
| --- | --- | --- |
| [Product](product/README.md) | In progress | Pending |
| [Information Architecture](information-architecture/README.md) | In progress | Pending |
| [Screen Inventory](screen-inventory/README.md) | In progress | Pending |
| [User Flows](user-flows/README.md) | In progress | Pending |
| [Sketch](sketch/README.md) | Complete | Owner approved progression |
| [Low-Fidelity Wireframe](low-fidelity-wireframe/README.md) | In progress | Pending |
| Mid-, high-fidelity wireframes, mockup, interactive prototype | Not started | Pending |

## Current state review

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Other proposed variants remain pending visual review. No separate routes or working behavior are established.

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

[Review threads](sketch/comments.json) and [provisional visual direction](../../../DESIGN.md). Prior planning decisions remain in progress; Sketch progression is owner-approved; static sketches are not implementation. Latest visually inspected English-copy source: [`0c5df27`](https://github.com/ianmaciel7/exams-app/commit/0c5df27b67de7cb3d59ac8945adc0e07bf0ec050). All four decision threads are resolved; visual approval remains pending.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.

## Review gate — 2026-11-27

The English-copy revision preserves the eight state variants and native annotations. Board integrity and capture generation passed in [CI run 45981578592](https://github.com/ianmaciel7/exams-app/actions/runs/45981578592); the separate deployment job failed. The Answer and Retry actions are approved and now drawn in the native Sketch; updated captures and visual review are pending. See the [Product decision register](product/README.md#open-product-decisions) for unresolved decisions. Do not advance fidelity stages until visual review of the essential controls is reconciled.

The owner-approved action placement is synchronized in the [Sketch](sketch/README.md#question-grouping-and-action-placement--2026-11-27): Answer below the alternatives on the left, no divider above or below the action, feedback in the same region, and whitespace between questions and pagination. Current native capture review remains pending.

The 2026-11-27 [visual rhythm review](sketch/README.md#visual-rhythm-review--2026-11-27) refines question grouping, heading alignment, option feedback, pagination and loading geometry without expanding release scope. New native captures and owner visual approval remain pending.

The pagination alignment refinement groups Previous/Next with their chevrons, equalizes page-slot spacing and centers the group in the question region; see the [Sketch](sketch/README.md#pagination-alignment-refinement--2026-11-27). Native capture review remains pending.

## Stage transition — 2026-11-27

The owner approved advancing from Sketch at `94072ce`. Preserve its native board and capture history. [Low-Fidelity Wireframe](low-fidelity-wireframe/README.md) begins structural review with the eight inherited states plus two explicitly proposed variants (initial unselected entry and narrower workspace). Initial selection, answer lifecycle and responsive direction remain open. No higher fidelity stage or implementation is approved.

The owner rejected the first Low-Fidelity visual treatment (`d133d40`). The [Greybox correction](low-fidelity-wireframe/README.md#greybox-correction--2026-11-27) replaces smoothed freehand outlines with native shapes and filled neutral regions while preserving coverage and open decisions. The stage remains in progress until native visual inspection and owner review.
