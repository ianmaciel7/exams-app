# Sketch — v0.1.0

Eight side-by-side states of the same exploratory native Open Artifact screen: competition sidebar and vertically stacked questions, inspired by the list pattern the user described in ExamTopics. DATAPREV and PPSA are illustrative labels; abstract statements and alternatives are placeholders. The first two states show the top and end of the same page, with the same sidebar and pagination inside the main region footer. The sidebar lists entries directly without a “Concursos” section heading. The selected competition is identified only in the sidebar; no repeated competition heading or header divider in the main region. The partially visible questions and scrollbar communicate scroll position. This is not a second destination or a sticky-footer requirement. No filters, mock exams or other features are included. Answer feedback is now depicted as requested. The drawing is static, not a working interaction.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages and ordering remain open. Page changes reset the list to the top.

Progress: in progress; user visual review pending.

## Screen and variant layout convention

Arrange distinct screens/destinations vertically, one row per screen. Arrange states, scroll positions, responsive variants and alternative versions of the same screen horizontally within its row. Align the top of comparable artboards and leave clear spacing; do not imply a separate route just because a state has its own artboard. A page's pagination footer at the end of scroll is a horizontal variant of that same page, not a separate destination. Apply this convention to future UI sketch and wireframe boards unless the product owner specifies otherwise.

## UI/UX review (2026-11-26)

- Use a consistent question rhythm in both scroll states: same statement and answer-option spacing, with one light separator between questions rather than nested card borders. Preserve question titles and radio affordances.
- Keep the competition selection and one-line truncated labels in the sidebar; no duplicate main heading.
- Keep pagination inside the list footer; illustrate page 1 with a visibly selected page and an unavailable Previous control. The examples remain illustrative, not a decision on page size or data.
- Static geometry review only; keyboard, accessibility, dynamic truncation and actual scroll behavior require implementation and testing. Only the answer-feedback states requested by the product owner are added; implementation is not included.

## Question-list states (2026-11-26)

The eight artboards are variants of the same screen: top of the list (unanswered), end of the list, selected answer before evaluation, correct answer, incorrect answer, loading, empty list and load failure. In the correct state the chosen answer is marked correct. In the incorrect state the chosen answer and the correct answer are distinguishable by both text and color. Other questions remain unchanged. The selected-before-evaluation variant is required: the user selects an option and activates Answer. Loading and empty variants remain pending visual review. A load failure offers a manual Retry action. The Answer and Retry controls are now drawn and await visual validation; explanations, scores and persistence are not specified. The mock text and colors are illustrative.

## Native design annotations

Each of the eight screen states has a native sticky note directly beneath the artboard. Notes explain behavior, intended feedback, and open decisions; they are annotations rather than interface content. Color distinguishes navigation, open decisions, success, incorrect response, neutral information and load failure. The notes do not approve unresolved behavior or replace review comments. Threaded reviewer comments remain separate from board annotations.

## Review threads

Four native review threads are anchored to answer selection, incorrect-answer feedback, pagination and load failure recovery in `comments.json`. The four decision threads are resolved by the owner's approval; visual validation remains pending. Notes remain explanatory; threads are the place for discussion and resolution. Static Pages screenshots cannot substitute for interactive thread review.

## Visual review refinement

The eight states retain their existing scope. Sidebar entries use compact spacing, body-size labels and a single selection indicator instead of a surrounding outline. Native sticky notes are concise. Review comment threads retain their identities and review targets; their visible anchors move to the corresponding external notes to avoid covering controls. The capture pipeline additionally produces individual state screenshots in both themes using the native camera, with full-board screenshots preserved. The approved answer and retry behaviors are recorded below; this is not implementation.

## Sidebar refinement

The navigation remains a simple two-entry list, with a slightly wider label column, consistent 38-unit row spacing, editable icon placeholders and a short active marker. The sidebar divider is intentionally lighter than the outer frame. The Capacities workspace reference informs density and alignment only; no additional navigation or behavior is imported. Labels remain single-line and truncated; exact content, responsive collapse, hover, focus and keyboard behavior are not specified by this static sketch.

## Specialist and Impeccable refinement

Operate-mode layout: the question content is primary and the navigation supports it. Reduce the workspace label to a body-size heading, use a one-unit selection indicator and text emphasis, and keep a compact two-entry list with simple, individually drawn icon placeholders. Preserve the selected entry, label content and all eight screen states. This is an exploratory sketch, not an approved production style or a functional accessibility test. Hover, focus, long labels and responsive navigation remain review items; no new routes or controls are added.

## Documentation synchronization

The 36-unit row spacing and one-unit active marker supersede the earlier 38-unit sidebar study. See [provisional DESIGN.md](../../../../DESIGN.md), [Product](../product/README.md), [Information Architecture](../information-architecture/README.md), [Screen Inventory](../screen-inventory/README.md) and [User Flows](../user-flows/README.md). The four decision threads are resolved; visual validation remains pending. Source geometry is updated; new visual validation remains separate.

## Generic navigation icon refinement

The owner requested a more generic icon shared by both entries. Replace the prior list glyphs with identical neutral square-with-X icon placeholders made of six native strokes across all eight variants. The placeholder reserves the icon slot without selecting a logo, pictogram, initial, or final semantic icon. Final iconography belongs to a later visual-design stage. Selection remains indicated by text emphasis and the existing thin marker. No change to navigation behavior, labels or state coverage.

## Approved interaction decisions — 2026-11-26

The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

The eight states remain: unanswered, end-of-list pagination, selected before submission, correct, incorrect, loading, empty, and load failure. The selected-before-submission state is required. The Answer and Retry controls are drawn in the static board and await visual validation; behavior and accessibility are not yet tested.

The owner also approved a neutral square-with-X icon placeholder for each sidebar entry. The board source now uses identical square-with-X placeholders in all eight variants; captures exist, but owner visual approval remains pending.

## English copy consistency — 2026-11-27

All eight sketch variants now use English project-authored UI labels, state captions, pagination and feedback, in accordance with AGENTS.md. DATAPREV and PPSA remain proper names; the illustrative job-title placeholders are translated. Geometry, state coverage, sticky notes and review threads are unchanged. Visual validation of the updated text remains pending.

## Capture and review gate — 2026-11-27

[CI run 45981578592](https://github.com/ianmaciel7/exams-app/actions/runs/45981578592) for `0c5df27` passed board integrity and generated the downloadable light/dark captures; deployment failed separately. The dark overview contact sheet confirms English labels and preserved annotations. The cited capture predates the Answer and Retry control drawings. New captures and owner visual validation remain pending. See the [open product decisions](../product/README.md#open-product-decisions). The current eight variants remain unchanged; no new behavior is approved.

## Explicit action controls — 2026-11-27

Draw Answer beside the final alternative for fully visible unanswered questions, muted without a selection and emphasized after selection. Evaluated questions retain their feedback without an Answer control. Draw Retry beneath the load-failure explanation. Native editable outline strokes and text retain the existing hand-drawn style and eight variants. The placement and disabled appearance are provisional visual choices; no runtime behavior or additional product decision is implied. Capture and owner review remain pending.
