# Mid-Fidelity Wireframe — v0.1.0

Status: in progress; native capture and owner review pending. Baseline: [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) at [e70dbaf](https://github.com/ianmaciel7/exams-app/commit/e70dbafbebe942753c54a061adb35d3a61bb73f0). Preserve the historical Sketch and Low-Fidelity boards.

## Purpose

Review representative content, component semantics, hierarchy, density and state treatments without final visual identity, production tokens or functional behavior. Question stems and choices are original illustrative IT examples, not official DATAPREV or PPSA questions. Numbering and sidebar ordering are illustrative. Use neutral grayscale, native editable text and geometric shapes, and annotations outside the interface.

## Coverage

Eight inherited states: list start, end/pagination, selected, correct, incorrect, loading, empty questions, load failure. The narrow workspace now demonstrates the approved collapsible sidebar (exact treatment proposed). Hover/focus remain visual studies. Submission pending and failure represent approved recovery behavior; empty sidebar remains a proposal. Add collapsed-sidebar, long-content, middle-page and last-page studies: eighteen total. The first available sidebar item is selected automatically on entry; selected row uses background and text emphasis, no left marker. No question dividers or extra destinations.

## Component and layout review

- Use a readable question heading, illustrative stem and five text alternatives; align radio indicators and labels. Keep Answer beneath all alternatives on the left, disabled until selection, and place evaluated feedback in its action region. Identify the correct option and the selected wrong option in text; do not rely on color.
- Use native regular geometry. Sidebar labels stay one line with illustrative truncation; full labels must be discoverable in eventual implementation. Review actual responsive behavior separately. Pagination is centered at list end. Retry in the load-failure state reloads the question list.
- Hover and focus are distinct visual studies; confirm actual keyboard order, radio semantics, focus visibility, accessible names, disabled and announcement behavior in an interactive prototype. Submission recovery is approved; exact timing and ambiguous outcomes remain to be validated; do not conflate submission retry with list Retry. Do not assign a mobile breakpoint or imply functional responsiveness.
- Fixed grayscale artboards on both board themes; not the final app light/dark palette. Inspect all native states at useful zoom before approval.

## Open decisions

Question ordering, empty-sidebar treatment, exact responsive breakpoint and collapse mechanism, and ambiguous submission outcomes remain open. Answer lifecycle, page size and recovery are approved below. The displayed first item is always selected on workspace entry if available; this decision is resolved. See [product](../product/README.md#open-product-decisions).

Suggested native comment anchors: narrow_note and collapsed_note (responsive treatment), no-items_note (empty sidebar), submit-failure_note (ambiguous server outcomes). Native comment creation is unavailable in this connected workflow; do not fabricate threads. These are notes and proposed anchors only.

## Exit criteria

Review real native captures for alignment, legibility, clipping, state distinction, stable layout and consistency with the approved baseline; settle material component and behavior decisions or explicitly defer them. No user testing, production implementation or higher fidelity approved yet.

## Owner decisions and visual refinements — 2026-11-27

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible on small screens. Show ten questions per page, or fewer when the final page contains fewer questions.

All fourteen original variants are retained; four studies added. Native sticky notes replace yellow shapes, option feedback is moved closer to choices, pending Answer retains its width, hover is lighter than selected, and pagination includes first/middle/last boundary examples. The 47-question dataset is illustrative only. Long-content study checks multiline labels. The collapsible rail is a proposed visual mechanism; full names must be available and touch/keyboard interaction tested later. Navigation discards temporary answers only when the page/competition actually changes. No persistent answer storage or resubmission of successfully evaluated answers. No functional testing is claimed. Capture review remains pending.

## Visual rhythm and content-flow refinement — 2026-11-27

Owner requested refinements after reviewing `8d5ff69`. Use a 282-unit short-question cadence, 28-unit short-option rows, 120-by-36-unit action controls, and a 32-unit gap after the action. These are exploratory canvas units, not production tokens. Show the next question naturally instead of a fixed blank region. Expanded and collapsed variants preserve question content and scroll context. Use a bounded reading column, content-dependent multiline rows and hanging option labels. Place feedback near the corresponding option and visibly distinguish locked answers. Match loading geometry to loaded content. End-of-page studies depict preceding content and the final two questions, with centered pagination in flow and a 32-unit bottom margin. Ten questions per complete page; the 47-question dataset is illustrative. Use a slim neutral scrollbar and no question dividers.

All eighteen variants and native notes remain. No new behavior is approved. Exact collapse treatment, breakpoint, empty sidebar, ordering and ambiguous submission recovery remain open. Native capture inspection and functional validation are pending.

## Sidebar toggle — ghost treatment

The owner requested a ghost icon button for the sidebar toggle. In both expanded and collapsed Mid-Fidelity variants, render only the neutral panel icon by default, without a filled background or button outline. Keep the 28-unit illustrative control footprint and icon center unchanged. Hover may use a subtle neutral surface; keyboard focus must retain a visible focus indicator. Actual target size, hover, focus and accessible expand/collapse semantics require implementation validation. No behavior changes; historical stages remain intact.
