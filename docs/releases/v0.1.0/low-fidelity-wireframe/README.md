# Low-Fidelity Wireframe — v0.1.0

Status: in progress; structural review pending. Owner approved moving on from the [Sketch](../sketch/README.md) at [94072ce](https://github.com/ianmaciel7/exams-app/commit/94072ce2af79ceac651dbc121822f8fc1ae39aa4). The historical Sketch board remains unchanged.

## Purpose

Validate the two-region workspace, question grouping, hierarchy, control placement, pagination and representative layout variants. Native editable rectangular and elliptical shapes, greybox surfaces and content blocks establish the structural layout; no final branding, color palette, typography, tokens or interaction implementation. The labels and abstract content are illustrative. All variants depict the same screen, horizontally arranged.

## Coverage

Eight inherited states: top, end, selected, correct, incorrect, loading, empty and failure. Two explicitly proposed variants: initial unselected entry and narrower two-region workspace. These do not approve default selection, responsive navigation or a mobile breakpoint. No extra feature or route is introduced.

- Keep a compact sidebar and a dominant scrollable question region. Show a neutral icon placeholder, single-line label and active cue.
- Group heading, statement, choices and action/result; use whitespace, no question dividers. Answer remains unavailable before selection. Correct/incorrect result is textual, not dependent on color. Pagination at list end; Retry beneath failure copy.
- Use native notes outside the screens. Review at individual-state zoom in both themes.

## Review questions

See [Product decision register](../product/README.md#open-product-decisions). Initial selection: automatic first item or explicit selection? Answer lifecycle: retain evaluated choices on page/entry revisit? Allow resubmission? Narrow viewport: evaluate the proposed split before choosing a responsive strategy. Page size and ordering remain deferred. Submission pending/error and keyboard/focus/accessible state semantics belong to later behavior validation; the static board cannot test them.

Proposed comment anchors: initial_note (initial selection), correct_note (answer lifecycle), narrow_note (responsive layout). Native comment creation is not available through the current connected workflow; these are proposed anchors, not fabricated comment threads. Existing Sketch threads remain intact.

## Exit criteria

Review all inherited and proposed variants, verify hierarchy and control associations, confirm structural navigation and responsive direction, record decisions and verify native captures. Do not claim functional accessibility, usability testing or production implementation.

## Greybox correction — 2026-11-27

The owner rejected the first Low-Fidelity rendering (`d133d40`) because freehand smoothing deformed frames and controls and the result retained the Sketch appearance. Replace those outlines with regular native rectangular/elliptical shapes, use neutral filled surfaces for the sidebar and main region, filled blocks for abstract content, recognizable radio and action controls, a selected navigation background, and centered pagination. Keep the English labels, eight inherited states, two explicitly proposed studies and all ten existing native notes and anchors. Shorter illustrative sidebar labels are used in the narrow study. No question dividers, new routes, final branding or production tokens. The wireframe uses a fixed light grayscale artboard independent of the surrounding board theme; it does not establish a production theme. The geometry follows the Open Artifact v0.16.3 schema and the [Greybox guidance](https://github.com/ianmaciel7/exams-app-archive/blob/main/docs/references/ui-ux-research-sources/ux-design-activities-2026-11-25.md). Structural checks and actual native capture inspection are separate gates; owner review is pending. The original Sketch and its decision threads remain unchanged.
