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

The owner approved advancing from Sketch (`94072ce`). The [Low-Fidelity Wireframe](docs/releases/v0.1.0/low-fidelity-wireframe/README.md) uses regular native shapes, neutral greybox surfaces, filled content placeholders and representative labels for structural review. Existing Sketch choices remain the baseline; final typography, color, tokens and responsive behavior remain undecided.

Low-fidelity correction: do not reuse the Sketch stroke renderer for rectangular UI frames or controls. Distinguish regions by grayscale surfaces, preserve whitespace between questions, and keep essential labels readable. Validate native shape geometry, clipping, control alignment and state consistency from rendered captures. The fixed grayscale artboard is a structural study, not a production theme.

Low-Fidelity sidebar selection: use the neutral row background and emphasized label alone, without a left vertical indicator. The historical Sketch retains its earlier selection treatment. This is a structural visual decision, not a tested accessibility state.

On workspace entry, the first available sidebar item is selected automatically; the existing selected background and emphasized label are visible while its questions load. No left indicator or unselected-entry screen is required. The historical Sketch remains unchanged.

## Mid-Fidelity direction

The owner approved progression from Low-Fidelity. The [Mid-Fidelity Wireframe](docs/releases/v0.1.0/mid-fidelity-wireframe/README.md) replaces question placeholders with illustrative content, clarifies control states and uses a neutral, regular editable geometry. Preserve default first-item selection, no left selection marker, whitespace instead of question dividers, aligned actions and pagination. The narrower workspace, hover/focus treatments, submission states and empty sidebar remain studies or proposals. No final palette, design tokens or functional interactions are established.

## Mid-Fidelity decision review

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible on small screens. Show ten questions per page, or fewer when the final page contains fewer questions.

Keep the selected row background without a left marker, distinguish inactive hover and keyboard focus, attach option feedback near its associated text, keep Answer width stable while pending, and preserve the scroll/selection context when toggling the sidebar. The collapsed icon rail is an exploratory treatment, not an approved mobile breakpoint. Long-content and first/middle/last pagination studies are illustrative. Use native sticky notes outside the artboards.

## Mid-Fidelity rhythm refinement — 2026-11-27

Use a 282-unit short-question cadence, 28-unit short-option rows, 120-by-36-unit action controls, and a 32-unit gap after the action. These are exploratory canvas units, not production tokens. Show the next question naturally instead of a fixed blank region. Expanded and collapsed variants preserve question content and scroll context. Use a bounded reading column, content-dependent multiline rows and hanging option labels. Place feedback near the corresponding option and visibly distinguish locked answers. Match loading geometry to loaded content. End-of-page studies depict preceding content and the final two questions, with centered pagination in flow and a 32-unit bottom margin. Ten questions per complete page; the 47-question dataset is illustrative. Use a slim neutral scrollbar and no question dividers.

## Sidebar toggle — ghost treatment

The owner requested a ghost icon button for the sidebar toggle. In both expanded and collapsed Mid-Fidelity variants, render only the neutral panel icon by default, without a filled background or button outline. Keep the 28-unit illustrative control footprint and icon center unchanged. Hover may use a subtle neutral surface; keyboard focus must retain a visible focus indicator. Actual target size, hover, focus and accessible expand/collapse semantics require implementation validation. No behavior changes; historical stages remain intact.

## Long-content spacing and flush sidebar correction

Owner identified uneven option spacing in the rendered long-content study. Use the observed line count: A, C, D and E occupy one line; B occupies two. Reserve 28 canvas units for single-line options and 52 for the two-line option; align wrapped text after the letter. Continue with the complete second question and the next heading where visible, retaining 32 units between groups. Avoid fixed spacer rows. Open Artifact v0.16.3 imposes corner rounding on native rectangles. Replace only the sidebar surface in each Mid-Fidelity variant with a native inline SVG vector layer with straight internal corners and rounded external corners; retain the white native frame and every editable label, control, note and navigation element. The background layer is editable as a vector asset rather than independent shape primitives. No inner border or decorative card. The SVG geometry is a board-specific workaround, not an application implementation. Revalidate native rendering and wrapping before approving the stage. Historical stages and product behavior remain unchanged.

## Sidebar contrast regression correction

Native captures of `a070819` revealed that the full SVG sidebar prevented automatic text-backdrop contrast detection in the dark board theme. Open Artifact v0.16.3 `backdrop.ts` recognizes filled rectangles and notes, not ordinary SVG fills. Restore the native filled sidebar for labels and use a narrow vector seam only along the inner edge, outside the text column, to square the inner corners. Keep the ghost toggle as one fixed-color vector icon. All interactive radio outlines now use a fixed neutral dark stroke and a lighter fixed stroke for locked/pending states, preserving the selected dot and textual feedback. This is a renderer-specific structural treatment, not a final theme or functional accessibility test. Review captures in both board themes before stage closure; the previous captures are rejected for low contrast.
