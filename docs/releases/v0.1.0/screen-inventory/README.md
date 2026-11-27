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
| Selected before submission | Required; explicit Answer control drawn; visual review pending |
| Correct answer | Requested; sketch pending validation |
| Incorrect answer | Required; selected error and correct answer shown |
| Loading | Proposal |
| Empty list | Proposal |
| Load failure | Required manual Retry action drawn; visual review pending |

The current Sketch uses a compact one-line sidebar list with neutral square-with-X icon placeholders, institution/year/position labels, ellipsis and subtle active text/indicator. No redundant section heading or additional menu. Exact visual treatment remains exploratory.

Both sidebar entries share one neutral square-with-X icon placeholder in the current Sketch; this is a visual refinement, not a new interaction.

The eight states remain: unanswered, end-of-list pagination, selected before submission, correct, incorrect, loading, empty, and load failure. The selected-before-submission state is required. The Answer and Retry controls are drawn and await visual validation; behavior and accessibility are not yet tested.

English labels are now consistent across all eight variants. The owner approved automatic first-item selection on entry; no separate unselected-entry state is needed when sidebar items exist. Revisiting starts unanswered after page or competition changes (approved in Mid-Fidelity). No additional variant is approved by this inventory update.

Question anatomy: title, statement, alternatives, left-aligned action/result row, then whitespace between complete questions. No separator above or below Answer or result. Whitespace also separates the final question from pagination. See [Sketch](../sketch/README.md#question-grouping-and-action-placement--2026-11-27).

The visual-rhythm refinement keeps the same eight states. Question groups use heading emphasis and whitespace; the selected, correct and incorrect states preserve the same structure. The loading drawing mirrors two complete question groups and a partial third with abstract placeholders. This historical sketch did not establish loading behavior or pagination size; Mid-Fidelity now specifies ten questions per page.

Pagination remains inside the end-of-list state; its labels and chevrons share an optical alignment, page slots have uniform spacing, and the whole group is centered in the main region. No navigation behavior changes.

The approved Sketch is preserved. The [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) inherits eight variants and adds one clearly labeled structural study (narrower viewport). The initial unselected proposal was removed after the owner approved automatic first-item selection; the existing loading variant covers entry. The narrow study is not an additional approved destination.

[Mid-Fidelity Wireframe](../mid-fidelity-wireframe/README.md) contains the eight inherited variants, the narrow study, hover/focus visual studies and three proposed variants: submission pending, submission failure and empty sidebar. The initial fourteen representations are now expanded to eighteen with collapsed-sidebar, long-content and middle/last pagination studies. Submission recovery and collapsible navigation are approved; empty sidebar and exact visual treatments remain proposals. None establish implemented runtime behavior.

Evaluated states remain read-only until the page or competition changes. Submission failure preserves the choice and enables Answer; pending prevents repeated submission. The approved page size is ten. The first, middle and last pagination studies cover boundary disabled states. The final page may contain fewer questions.
