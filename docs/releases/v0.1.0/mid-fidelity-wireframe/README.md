# Mid-Fidelity Wireframe — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending. Baseline: [Low-Fidelity Wireframe](../low-fidelity-wireframe/README.md) at [e70dbaf](https://github.com/ianmaciel7/exams-app/commit/e70dbafbebe942753c54a061adb35d3a61bb73f0). Preserve the historical Sketch and Low-Fidelity boards.

## Purpose

Review representative content, component semantics, hierarchy, density and state treatments without final visual identity, production tokens or functional behavior. Question stems and choices are original illustrative IT examples, not official DATAPREV or PPSA questions. Numbering and sidebar ordering are illustrative. Use neutral grayscale, native editable text and geometric shapes, and annotations outside the interface.

## Coverage

Eight inherited states: list start, end/pagination, selected, correct, incorrect, loading, empty questions, load failure. The narrow workspace demonstrates the approved collapsible sidebar (exact breakpoint requires technical validation). Hover/focus remain visual studies. Submission pending and failure represent approved recovery behavior; empty sidebar is approved. Add collapsed-sidebar, long-content, middle-page and last-page studies, then three phone/navigation lifecycle studies: twenty-one total. The first available sidebar item is selected automatically on entry; selected row uses background and text emphasis, no left marker. No question dividers or extra destinations.

## Component and layout review

- Use a readable question heading, illustrative stem and five text alternatives; align radio indicators and labels. Keep Answer beneath all alternatives on the left, disabled until selection, and place evaluated feedback in its action region. Identify the correct option and the selected wrong option in text; do not rely on color.
- Use native regular geometry. Sidebar labels stay one line with illustrative truncation; full labels must be discoverable in eventual implementation. Review actual responsive behavior separately. Pagination is centered at list end. Retry in the load-failure state reloads the question list.
- Hover and focus are distinct visual studies; confirm actual keyboard order, radio semantics, focus visibility, accessible names, disabled and announcement behavior in an interactive prototype. Submission recovery is approved; exact timing and ambiguous outcomes remain to be validated; do not conflate submission retry with list Retry. Do not assign a mobile breakpoint or imply functional responsiveness.
- Fixed grayscale artboards on both board themes; not the final app light/dark palette. Inspect all native states at useful zoom before approval.

## Open decisions

The six owner decisions are now resolved; see current-state.json for technical validation. Answer lifecycle, page size and recovery are approved below. The displayed first item is always selected on workspace entry if available; this decision is resolved. See [product](../product/README.md#open-product-decisions).

Suggested native comment anchors: narrow_note and collapsed_note (responsive treatment), no-items_note (empty sidebar), submit-failure_note (ambiguous server outcomes). Native comment creation is unavailable in this connected workflow; do not fabricate threads. These are notes and proposed anchors only.

## Exit criteria

Review real native captures for alignment, legibility, clipping, state distinction, stable layout and consistency with the approved baseline; settle material component and behavior decisions or explicitly defer them. No user testing, production implementation or higher fidelity approved yet.

## Historical revision log — 2026-11-27

The entries below record the progression of earlier revisions. Counts, review statuses and superseded geometry in this log are historical; use the current summary and latest alignment section for active requirements.

### Owner decisions and visual refinements — 2026-11-27

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible on small screens. Show ten questions per page, or fewer when the final page contains fewer questions.

All fourteen original variants are retained; four studies added. Native sticky notes replace yellow shapes, option feedback is moved closer to choices, pending Answer retains its width, hover is lighter than selected, and pagination includes first/middle/last boundary examples. The 47-question dataset is illustrative only. Long-content study checks multiline labels. The collapsible rail is a proposed visual mechanism; full names must be available and touch/keyboard interaction tested later. Navigation discards temporary answers only when the page/competition actually changes. No persistent answer storage or resubmission of successfully evaluated answers. No functional testing is claimed. Capture review remains pending.

## Visual rhythm and content-flow refinement — 2026-11-27

Owner requested refinements after reviewing `8d5ff69`. Use a 282-unit short-question cadence, 28-unit short-option rows, historical 120-by-36-unit action controls, and a 32-unit gap after the action. These are exploratory canvas units, not production tokens. Show the next question naturally instead of a fixed blank region. Expanded and collapsed variants preserve question content and scroll context. Use a bounded reading column, content-dependent multiline rows and hanging option labels. Place feedback near the corresponding option and visibly distinguish locked answers. Match loading geometry to loaded content. End-of-page studies depict preceding content and the final two questions, with centered pagination in flow and a 32-unit bottom margin. Ten questions per complete page; the 47-question dataset is illustrative. Use a slim neutral scrollbar and no question dividers.

All eighteen variants and native notes remain. No new behavior is approved. Exact breakpoint and implementation of the approved recovery and drawer remain technical validation items. Native capture inspection and functional validation are pending.

## Sidebar toggle — ghost treatment

The owner requested a ghost icon button for the sidebar toggle. In both expanded and collapsed Mid-Fidelity variants, render only the neutral panel icon by default, without a filled background or button outline. Keep the 28-unit illustrative control footprint and icon center unchanged. Hover may use a subtle neutral surface; keyboard focus must retain a visible focus indicator. Actual target size, hover, focus and accessible expand/collapse semantics require implementation validation. No behavior changes; historical stages remain intact.

## Long-content spacing and flush sidebar correction

Owner identified uneven option spacing in the rendered long-content study. Use the observed line count: A, C, D and E occupy one line; B occupies two. Reserve 28 canvas units for single-line options and 52 for the two-line option; align wrapped text after the letter. Continue with the complete second question and the next heading where visible, retaining 32 units between groups. Avoid fixed spacer rows. Open Artifact v0.16.3 imposes corner rounding on native rectangles. Replace only the sidebar surface in each Mid-Fidelity variant with a native inline SVG vector layer with straight internal corners and rounded external corners; retain the white native frame and every editable label, control, note and navigation element. The background layer is editable as a vector asset rather than independent shape primitives. No inner border or decorative card. The SVG geometry is a board-specific workaround, not an application implementation. Revalidate native rendering and wrapping before approving the stage. Historical stages and product behavior remain unchanged.

## Sidebar contrast regression correction

Native captures of `a070819` revealed that the full SVG sidebar prevented automatic text-backdrop contrast detection in the dark board theme. Open Artifact v0.16.3 `backdrop.ts` recognizes filled rectangles and notes, not ordinary SVG fills. Restore the native filled sidebar for labels and use a narrow vector seam only along the inner edge, outside the text column, to square the inner corners. Keep the ghost toggle as one fixed-color vector icon. All interactive radio outlines now use a fixed neutral dark stroke and a lighter fixed stroke for locked/pending states, preserving the selected dot and textual feedback. This is a renderer-specific structural treatment, not a final theme or functional accessibility test. Review captures in both board themes before stage closure; the previous captures are rejected for low contrast.

## Shared shell consistency review — 2026-11-27

Owner approved a consistent Ghost sidebar trigger throughout the workspace, including desktop, independent of question-list state. In the expanded shell it sits at the right of the sidebar header; in the collapsed rail it occupies the same header level. Distinguish the two navigation icons with neutral vector placeholders; full names must be available on focus/hover and touch. Preserve selected item and current page on collapse/expand. Use matching neutral pagination chevrons, with disabled boundaries visibly muted. The approved answer lifecycle and ten-question page size remain unchanged. Phone layout, navigation-list loading and navigation-list failure are three explicitly proposed studies, not approved network architecture or new destinations. The phone study depicts a closed navigation drawer with a visible trigger; the open drawer, breakpoint and touch/keyboard semantics require further review.

The previous eighteen variants are preserved and three studies are added. Shared component source: `scripts/mid-fidelity-components.cjs`; synchronize managed elements with `node scripts/sync-mid-fidelity.mjs --write` and validate with `node scripts/check-boards.mjs`. The source manages shell triggers, navigation icons, pagination chevrons and proposed studies; remaining question groups stay native and editable. Fixed-color SVG icons avoid board-theme transformations. The exact responsive treatment, empty-sidebar policy, ordering and ambiguous submission recovery remain open. The latest native capture and owner visual review are pending. No runtime behavior or accessibility conformance is claimed.

## Alignment and documentation reconciliation — 2026-11-27

Align sidebar icons and text to a shared optical row center; align the Ghost trigger and workspace title to the header axis. Use a 36-unit row, 42-unit cadence, 16-unit icons and an 8-unit icon-to-label gap as provisional canvas geometry. Keep the selected background without a left indicator, preserve the flush internal seam, and distinguish selected from hover. Center the entire pagination group in the main region with equal page slots and explicit gaps between chevrons and labels; keep disabled boundary controls visually distinct. Align option feedback with the associated option; keep result and lock text consistently positioned. Preserve the 28-unit single-line choice cadence, line-dependent height, hanging labels, and 32-unit gap between question groups. These are board-specific measurements, not universal UI rules or final design tokens.

All 21 variants remain. The state categories are explicit in [Screen Inventory](../screen-inventory/README.md); keep the horizontal arrangement of variants of one screen, not separate routes. The shared source now includes header/title, selection/hover surfaces, icons and labels, pagination, answer feedback and long-content layout. The alignment review at `45e695c` is historical; consult the current-state record for the latest reviewed capture. The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale selection/default behavior require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. Native visual review, runtime, usability and accessibility validation remain pending.

The canonical [current state](../current-state.json) and planning boards were synchronized. Prior stage boards are preserved as historical snapshots.

## Action controls and collapsed sidebar reveal — 2026-11-27

A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

Use one restrained neutral action-button family: 112 × 34 canvas units for Answer/Retry, unchanged dimensions during submission, a subtle disabled surface, distinct enabled/hover/pressed tones, and a single external keyboard focus outline. No scale/bounce, layout shift, decorative shadow or ripple. Hover and press are separate from submission state. The four-state button strip and separate collapsed hover/focus specimens are component studies outside the artboard, not additional screens. Actual activation, keyboard, touch and motion remain for prototype verification.

Historical evidence: [Archive motion specification](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/UI-MOTION-SPEC.md) and [motion evidence](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/UI-MOTION-EVIDENCE.json), entries `reveal-overflow`, `peek-open`, `peek-close`. Reveal is not automatic peek: no panel opens on hover. The original old-branch source could not be fetched; the archive catalog supports the distinction, not a claim of exact historical parity. [shadcn Button](https://ui.shadcn.com/docs/components/radix/button) and [WAI disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) inform control states and accessible activation. The native board shows static states, not working effects.

## Focus-visible refinement — 2026-11-27

Use one external, continuous 2-unit neutral focus outline with a 3-unit clear separation from the button, matching its radius. Do not use stacked filled rectangles to simulate focus. The button itself does not change dimensions or fill when focused. Use the same principle for icon controls and adapt ring placement to radio/list controls. For the fixed light artboard, #666666 against #ffffff has approximately 5.74:1 contrast. These are exploratory canvas measurements, not production CSS tokens or a WCAG conformance claim. WCAG 2.2 2.4.7 (AA) requires visible keyboard focus; 2.4.13 (AAA) provides a more specific area/contrast benchmark. Test 1.4.11, 2.4.11, forced colors, keyboard navigation, focus obscuration, and actual rendered states in the prototype. Keep :focus-visible separate from hover, pressed, checked, selected, and pending. Do not disable the native focus indicator without a valid replacement.

Answer and Retry use a stable 112 × 34 canvas footprint. Default #333333, hover #262626, pressed #191919, disabled #f4f4f4, pending #eeeeee. The four-state comparison is shown against the same light surface as the workspace; disabled and pending remain in their corresponding workspace variants. These neutral values are not final tokens. Avoid bounce, scaling, decorative shadows, ripple, geometry changes, and animation-dependent feedback. The collapsed hover and keyboard focus specimens are separate: hover reveals the icon with subtle surface feedback; keyboard focus reveals the icon with a single clear outline. Touch retains an accessible visible alternative.

References: [W3C Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [Atlassian focus ring](https://atlassian.design/components/focus-ring/usage), [Archive design foundations](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/references/ui-ux-research-sources/design-foundations-and-state-transitions-2026-11-25.md). Historical review: native capture `670a2d1` demonstrated the previous bulky nested outline. Subsequent captures were generated; current capture provenance and review status are recorded in current-state.json. All 21 workspace variants remain.

## Owner decisions — 2026-11-27

| Topic | Approved decision |
| --- | --- |
| Question ordering | Original exam order |
| Empty competition list | Message only; no action button |
| Phone sidebar | Overlay drawer |
| Competition list failure | Error and manual Retry |
| Unknown submission outcome | Retain choice and permit safe retry |
| Interface languages | Brazilian Portuguese and English |

The mobile variant includes a static open-drawer companion specimen. It is not an additional workspace variant; 21 variants remain. The vector specimen is editable as an asset, not as independently editable native shapes. Technical validation and visual review remain pending.
