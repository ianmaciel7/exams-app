# User Flows — v0.1.0

Select a competition in the sidebar → show that competition's questions → scroll vertically through the list. Select another competition → show its questions. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages and ordering remain open. Page changes reset the list to the top.

Progress: in progress; user review pending.

## State transitions under review

Select entry → loading (proposal) → list, empty or load failure (proposed variants). Unanswered → select option → selected → activate Answer → correct or incorrect feedback. An incorrect answer reveals the correct option. Page navigation stays within the selected entry and resets scroll to the top. Load failure → manual Retry → loading → list, empty or failure. No implementation or new routes are implied.

## Open transitions

Initial entry before selecting a competition and revisiting previously evaluated questions after page or competition changes are unresolved; see [Product decision register](../product/README.md#open-product-decisions). Do not assume answer persistence or allow a submitted answer to change without approval. Current UI labels are in English, including Answer and Retry; these controls are approved and drawn in the Sketch; runtime behavior is not tested.

The approved Answer action is depicted after the alternatives, on the left, without an intervening divider. The result occupies the same action region; option-level feedback remains attached to its option. This placement does not alter the approved transitions.
