# Sketch — v0.1.0

## Purpose and status

Explore the primary desktop Questions workspace for one selected competition: composition, hierarchy, navigation and the few visual states necessary to discuss the layout. This is an editable low-fidelity Open Artifact sketch, not a wireframe, component contract or working prototype. Progress: In progress. Native Light/Dark capture passed for the previous revision; the current Questions workspace requires a fresh native capture. User review, usability and functional validation remain pending.

Source of truth: [release decisions](../product/product.md#current-release-baseline), [stage responsibilities](../../../../AGENTS.md#stage-responsibilities-and-fidelity-boundaries), [IA](../information-architecture/), [screen inventory](../screen-inventory/) and [user flows](../user-flows/).

## Active visual studies

- Main desktop workspace: competition switcher (expanded sidebar), compact collapsed rail, competition heading placeholder, Mock exams, and question cards with abstract content and visible answer feedback.
- Two main question cards illustrate unanswered and correct-answer states. An additional small incorrect-answer study shows the essential visual distinction; detailed retry, checking and strike semantics remain open.
- Native editable sticky notes outside the interface record intent and uncertainty. There is no Notes feature implied by these annotations.

## Visual and scope constraints

Use abstract strokes for illustrative content and metadata values; link affordances remain blue and underlined, including year. Keep functional labels and essential state cues recognizable. Abstract competition icons; functional icons retain simple semantic geometry. Keep the same hand-drawn ink grammar across small and large strokes, using the project-local launcher and Excalifont. No final design tokens, production measurements or decorative polish.

Performance is direct navigation above the footer. Settings appears once in the footer. Mock exams remain within Questions and ordinary practice remains competition-scoped. Required supporting content stays inline. The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment. Link destinations, the practice evaluation trigger, and runtime behavior require validation.

## Collapsed rail correction (2026-11-26)

The rail retains the existing compact navigation, selected competition cue, direct Performance destination and avatar indication. Align the recognizable controls to a common approximate centerline, group the upper controls and lower navigation by whitespace, and reuse the Settings gear from the expanded footer without adding an account popover. Remove the duplicate external study frame and divider. The ink remains native and editable; no production dimensions or interaction contract are implied. A new native Light/Dark capture and user review are pending.

## Supporting references — not active Sketch content

The former question component study reference board was removed at the user's request. Its historical content remains in Git; its exploratory examples were not approved requirements.

## Verification

Open via `node scripts/open-boards.mjs`. Use `node scripts/check-boards.mjs` and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs`. Inspect actual browser captures of the complete active board in Light and Dark. The project-local ink pass preserves native data and hit geometry; external native exports do not include that viewer-only styling. Respect Open Artifact v0.16.3's 800-element limit. The collapsed rail correction removes four redundant study-frame strokes and the internal divider, enlarges and centers existing icon groups, and restores the existing Settings affordance as two native strokes.

Historical source: [pre-reorganization board and documentation at 2fee2dd](https://github.com/ianmaciel7/exams-app/tree/2fee2dd2cae8ef1ef36814d26f16347ab3904eef/docs/releases/v0.1.0/sketch).

Native capture and automated checks passed in [run 45887312298](https://github.com/ianmaciel7/exams-app/actions/runs/45887312298) at experimental commit `52f3b95`. Both themes were visually inspected; this is not a user-validation claim.
