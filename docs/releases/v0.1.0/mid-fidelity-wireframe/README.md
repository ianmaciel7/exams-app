# Mid-Fidelity Wireframe — v0.1.0

Status: in progress; native capture and owner review pending. Baseline: [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) at [e70dbaf](https://github.com/ianmaciel7/exams-app/commit/e70dbafbebe942753c54a061adb35d3a61bb73f0). Preserve the historical Sketch and Low-Fidelity boards.

## Purpose

Review representative content, component semantics, hierarchy, density and state treatments without final visual identity, production tokens or functional behavior. Question stems and choices are original illustrative IT examples, not official DATAPREV or PPSA questions. Numbering and sidebar ordering are illustrative. Use neutral grayscale, native editable text and geometric shapes, and annotations outside the interface.

## Coverage

Eight inherited states: list start, end/pagination, selected, correct, incorrect, loading, empty questions, load failure. The narrow workspace remains a proposal. Add two visual interaction studies (hover and visible keyboard focus) and three explicitly proposed lifecycle states (submission pending, submission failure, empty sidebar). These do not approve new product behavior. The first available sidebar item is selected automatically on entry; selected row uses background and text emphasis, no left marker. No question dividers or extra destinations.

## Component and layout review

- Use a readable question heading, illustrative stem and five text alternatives; align radio indicators and labels. Keep Answer beneath all alternatives on the left, disabled until selection, and place evaluated feedback in its action region. Identify the correct option and the selected wrong option in text; do not rely on color.
- Use native regular geometry. Sidebar labels stay one line with illustrative truncation; full labels must be discoverable in eventual implementation. Review actual responsive behavior separately. Pagination is centered at list end. Retry in the load-failure state reloads the question list.
- Hover and focus are distinct visual studies; confirm actual keyboard order, radio semantics, focus visibility, accessible names, disabled and announcement behavior in an interactive prototype. Submission pending/error are candidates only; do not conflate submission retry with list Retry. Do not assign a mobile breakpoint or imply functional responsiveness.
- Fixed grayscale artboards on both board themes; not the final app light/dark palette. Inspect all native states at useful zoom before approval.

## Open decisions

Answer lifecycle (preserve evaluated answers across page/competition switches; change after confirmation), page size/order, empty-sidebar treatment, submission recovery, narrow/mobile navigation. The displayed first item is always selected on workspace entry if available; this decision is resolved. See [product](../product/README.md#open-product-decisions).

Suggested native comment anchors: correct_note (answer lifecycle), narrow_note (responsive direction), submitting_note and submit-failure_note (submission policy), no-items_note (empty sidebar). Native comment creation is unavailable in this connected workflow; do not fabricate threads. These are notes and proposed anchors only.

## Exit criteria

Review real native captures for alignment, legibility, clipping, state distinction, stable layout and consistency with the approved baseline; settle material component and behavior decisions or explicitly defer them. No user testing, production implementation or higher fidelity approved yet.
