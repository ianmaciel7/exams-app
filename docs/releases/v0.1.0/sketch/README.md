# Sketch — v0.1.0

## Purpose and status

Explore the primary desktop Questions workspace for one selected competition: composition, hierarchy, navigation and the few visual states necessary to discuss the layout. This is an editable low-fidelity Open Artifact sketch, not a wireframe, component contract or working prototype. Progress: In progress. Visual review of this revision and usability/functional validation remain separate.

Source of truth: [release decisions](../product.md#current-release-baseline), [stage responsibilities](../../../AGENTS.md#stage-responsibilities-and-fidelity-boundaries), [IA](../information-architecture/), [screen inventory](../screen-inventory/) and [user flows](../user-flows/).

## Active visual studies

- Main desktop workspace: competition switcher (expanded sidebar), compact collapsed rail, competition heading placeholder, Mock exams, filters and Auto-check, results and List/One controls, question cards with abstract content and visible answer feedback. No redundant Questions subtitle.
- Two main question cards illustrate unanswered and correct-answer states. An additional small incorrect-answer study shows the essential visual distinction; detailed retry, checking and strike semantics remain open.
- One compact Statistics-expanded sketch explores inline expansion. The graph and data marks are placeholders, not approved metrics or a specification.
- Native editable sticky notes outside the interface record intent and uncertainty. There is no Notes feature implied by these annotations.

## Visual and scope constraints

Use abstract strokes for illustrative content and metadata values; link affordances remain blue and underlined, including year. Keep functional labels and essential state cues recognizable. Abstract competition icons; functional icons retain simple semantic geometry. Keep the same hand-drawn ink grammar across small and large strokes, using the project-local launcher and Excalifont. No final design tokens, production measurements or decorative polish.

Performance is direct navigation above the footer; Settings appears once in the footer. No account popover. Mock exams remain within Questions; Missed belongs to Status and Performance review. Ordinary practice is competition-scoped. Statistics is the only retained resource disclosure; no separate Associated text or Commented key control. Required supporting content remains inline. Filter chips, Clear filters, result count and automatic application/dependent Topic are proposals; link destinations, metrics and runtime behavior require validation. Do not infer approved features from placeholders.

## Supporting references — not active Sketch content

The former detailed anatomy/taxonomy, answer-state matrix, exam-format examples, Statistics specification, and actions/alerts/behavior maps are preserved as native editable elements in the [question component study reference board](../references/question-component-study/). They are historical exploratory material, not active stage deliverables or approved requirements. Later stages may consult them as needed; no later stage is advanced by this relocation.

## Verification

Open via `node scripts/open-boards.mjs`. Use `node scripts/check-boards.mjs` and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs`. Inspect actual browser captures of the complete active board in Light and Dark. The project-local ink pass preserves native data and hit geometry; external native exports do not include that viewer-only styling. Respect Open Artifact v0.16.3's 800-element limit. The revised board contains 235 elements (201 retained from the former workspace, including 4 updated titles/labels, plus 34 lightweight study elements).

Historical source: [pre-reorganization board and documentation at 2fee2dd](https://github.com/ianmaciel7/exams-app/tree/2fee2dd2cae8ef1ef36814d26f16347ab3904eef/docs/releases/v0.1.0/sketch).
