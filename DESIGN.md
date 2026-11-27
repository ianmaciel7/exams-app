# Exam App — provisional design direction

## Overview

Operate mode: the user studies questions; navigation supports the task without competing for attention. This is a record of the current exploratory Sketch, not a production design system or approved visual identity. Source: [Sketch](docs/releases/v0.1.0/sketch/README.md), [native board](docs/releases/v0.1.0/sketch/db/), [Capacities reference](docs/references/assets/sidebar/capacities-workspace.png). No application implementation or normative design tokens have been established.

## Colors

Keep neutral ink and restrained semantic accents for selection, correct and incorrect feedback. Feedback must also have a textual or geometric cue. Sketch colors and sticky-note colors are illustrative, not production tokens. Review light and dark renders.

## Typography

Use the same legible sketch lettering throughout. The workspace label is modest; question content is primary. Use one-line readable navigation labels and truncate overflow while preserving the full accessible name in the eventual implementation. Production typography is undecided.

## Layout

A two-region workspace: compact sidebar at left, vertically scrolling question list at right. Pagination follows the last question, not a fixed footer. Keep the sidebar context during proposed loading, empty and failure states. The current sketch has 36-unit navigation row spacing and a one-unit selection marker; these are canvas units, not CSS tokens. Mobile navigation and responsive collapse are open decisions.

## Elevation & Depth

Prefer a flat, unobtrusive sketch hierarchy. Use light separators, not nested card borders or heavy selection outlines. No production elevation tokens established.

## Shapes

Native editable hand-drawn strokes, identical neutral question-list icons, recognizable radio controls. Preserve the sketch's low fidelity and legibility.

## Components

Navigation: a single compact list of competition entries, with no redundant section heading. Both entries use the same neutral list glyph; selection uses text emphasis and a thin indicator. Question list: stacked question items, single-choice alternatives, semantic correct/incorrect feedback, end-of-list pagination. See the [screen inventory](docs/releases/v0.1.0/screen-inventory/README.md) and [flows](docs/releases/v0.1.0/user-flows/README.md) for the state coverage and open decisions. Hover, focus, responsive behavior and actual accessibility remain untested.

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

Use a per-question Answer control before evaluation and a Retry control in the failure state; exact visual geometry is pending. The owner approved neutral square-with-X icon placeholders for the sidebar, replacing current list glyphs in the next visual revision. Do not treat this as final iconography.
