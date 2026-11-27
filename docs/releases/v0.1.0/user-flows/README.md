# User Flows — v0.1.0

Enter workspace → automatically select first available sidebar item → load its questions → show that competition's questions → scroll vertically through the list. Select another competition → show its questions. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size is ten; total pages and ordering remain dataset-dependent or unspecified. Page changes reset the list to the top.

Progress: in progress; user review pending.

## State transitions under review

Select entry → loading (proposal) → list, empty or load failure (proposed variants). Unanswered → select option → selected → activate Answer → correct or incorrect feedback. An incorrect answer reveals the correct option. Page navigation stays within the selected entry and resets scroll to the top. Load failure → manual Retry → loading → list, empty or failure. No implementation or new routes are implied.

## Open transitions

Revisiting previously evaluated questions after page or competition changes starts unanswered. Confirmed answers cannot change on the current page; answers do not persist across sessions. See [Product decisions](../product/README.md#approved-mid-fidelity-decisions--2026-11-27). Current UI labels are in English, including Answer and Retry; these controls are approved and drawn in the Sketch; runtime behavior is not tested.

The approved Answer action is depicted after the alternatives, on the left, without a divider above or below it; whitespace separates complete questions and pagination. The result occupies the same action region; option-level feedback remains attached to its option. This placement does not alter the approved transitions.

The [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) inherits approved transitions. Initial selection is approved: enter → select first available sidebar item → load → list, empty questions or failure. The historical Low-Fidelity narrow proposal approved no new transition; later Mid-Fidelity decisions are recorded below.

[Mid-Fidelity Wireframe](../mid-fidelity-wireframe/README.md) illustrates the approved entry/answer/list-retry flows and shows submission pending and local submission failure; the owner approved retry after failure and locking evaluated answers until navigation. Empty sidebar is a proposed state, not a new flow. Keyboard and responsive behavior remain untested.

## Approved Mid-Fidelity transitions

Unanswered -> select -> Answer -> pending -> evaluated (read-only) or submission failure (choice retained; Answer enabled again). Page/competition change -> discard current-page responses -> load target -> unanswered. Close application -> discard temporary session responses. Collapse/expand sidebar -> same competition and page, responses unchanged. Navigate ten questions per page; Previous disabled at first page, Next disabled at last page. Exact cancellation/late-response and ambiguous-outcome recovery require validation; do not restore stale answers.

The rhythm refinement affects visual representation only. Questions flow naturally; pagination follows the final question. Sidebar collapse preserves content and scroll context. Confirmed-answer lock and submission recovery remain as approved. Functional testing is pending.

The approved collapse/expand transition applies across all workspace states, including desktop. It does not clear page responses. Proposed navigation loading and failure flows must be distinguished from question loading and question Retry; automatic first-item selection occurs only when a valid list is available. Phone drawer interaction is a proposal, not an approved flow.
