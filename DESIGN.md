# Exam App — provisional design direction

## Overview

Operate mode: the user studies questions; navigation supports the task without competing for attention. This is a record of the current exploratory Sketch, not a production design system or approved visual identity. Source: [Sketch](docs/releases/v0.1.0/sketch/README.md), [native board](docs/releases/v0.1.0/sketch/db/), [Capacities reference](docs/references/assets/sidebar/capacities-workspace.png). No application implementation or normative design tokens have been established.

## Colors

Keep neutral ink and restrained semantic accents for selection, correct and incorrect feedback. Feedback must also have a textual or geometric cue. Sketch colors and sticky-note colors are illustrative, not production tokens. Review light and dark renders.

## Typography

Use the same legible sketch lettering throughout. The workspace label is modest; question content is primary. Use one-line readable navigation labels and truncate overflow while preserving the full accessible name in the eventual implementation. All current sketch interface labels and annotations use English; retain proper names such as DATAPREV and PPSA. Production typography and localization are undecided.

## Layout

A two-region workspace: compact sidebar at left, vertically scrolling question list at right. Pagination follows the last question, not a fixed footer. Keep the sidebar context during proposed loading, empty and failure states. The current sketch has 36-unit navigation row spacing and a one-unit selection marker; these are canvas units, not CSS tokens. Mobile navigation and responsive collapse are open decisions.

## Elevation & Depth

Prefer a flat, unobtrusive sketch hierarchy. Separate question blocks with whitespace alone; omit dividers around the action row and before pagination. Avoid nested card borders or heavy selection outlines. No production elevation tokens established.

## Shapes

Native editable hand-drawn strokes, identical neutral square-with-X icon placeholders, recognizable radio controls. Preserve the sketch's low fidelity and legibility.

## Components

Navigation: a single compact list of competition entries, with no redundant section heading. Both entries use the same neutral square-with-X icon placeholder; selection uses text emphasis and a thin indicator. Question list: stacked question items, single-choice alternatives, semantic correct/incorrect feedback, end-of-list pagination. See the [screen inventory](docs/releases/v0.1.0/screen-inventory/README.md) and [flows](docs/releases/v0.1.0/user-flows/README.md) for the state coverage and open decisions. Hover, focus, responsive behavior and actual accessibility remain untested.

## Do's and Don'ts

- Do prioritize the question content and maintain consistent navigation across states.
- Do keep design notes and review comments outside the interface; preserve their targets.
- Do use the Specialist UI/UX and Impeccable guidance for refinement, preserving approved scope.
- Do validate real native renders in both themes; distinguish appearance from working interactions.
- Don't introduce unapproved menus, filters, mock exams, metrics, settings or routes.
- Don't treat the sketch's geometry, colors or examples as a final production system.

Impeccable context: PRODUCT.md owns product facts. This file owns provisional visual direction. No machine-readable production palette, component library or sidecar has been generated because the app design system is not yet implemented. Do not invent them from the board renderer.

## Approved interaction behavior

The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

Use a per-question Answer control before evaluation and a Retry control in the failure state; both controls are depicted with native outline strokes and short English labels; visual validation is pending. The owner approved neutral square-with-X icon placeholders for the sidebar, replacing the previous list glyphs in all eight sketch variants. Do not treat this as final iconography.

The Sketch depicts Answer in a dedicated left-aligned action row below all alternatives of each fully visible unanswered question, muted before selection and emphasized after selection. No divider separates the alternatives from this action. Evaluated questions show the result in the same action region; option-specific feedback remains adjacent to the corresponding alternatives. Whitespace separates the complete question blocks and pagination; no horizontal divider follows the action or result. Retry appears below the load-failure explanation. This is a static visual proposal, not a tested interaction.

## Sketch rhythm review — 2026-11-27

Use consistent left alignment for question headings, statements, radio controls and action rows. A modest heading emphasis and a larger gap after each action distinguish question groups without borders. Align the workspace label to the first question heading in the top view; keep sidebar rows compact and retain the selected marker and single-line ellipsis. Place option-specific result text nearer the relevant alternative, with a common feedback column. Center pagination within the main region, align the labels and chevrons to a shared optical center, keep each chevron close to its corresponding label, and space page-number slots uniformly. The loading sketch mirrors the full-question cadence and partial third question, including abstract action placeholders. These are exploratory canvas choices, not production spacing tokens. The empty and failure message groups retain their existing alignment and Retry placement.

## Stage transition

The owner approved advancing from Sketch (`94072ce`). The [Low-Fidelity Wireframe](docs/releases/v0.1.0/low-fidelity-wireframe/README.md) uses neutral, regular outline geometry and representative labels for structural review. Existing Sketch choices remain the baseline; final typography, color, tokens and responsive behavior remain undecided.
