# Exam App — provisional design direction

## Overview

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

Operate mode: question content is primary; navigation supports the task. The current reference is [Mid-Fidelity](docs/releases/v0.1.0/mid-fidelity-wireframe/README.md), not the historical Sketch. No production visual identity, typography, palette or design tokens are established.

## Layout and components

Align sidebar icons and text to a shared optical row center; align the Ghost trigger and workspace title to the header axis. Use a 36-unit row, 42-unit cadence, 16-unit icons and an 8-unit icon-to-label gap as provisional canvas geometry. Keep the selected background without a left indicator, preserve the flush internal seam, and distinguish selected from hover. Center the entire pagination group in the main region with equal page slots and explicit gaps between chevrons and labels; keep disabled boundary controls visually distinct. Align option feedback with the associated option; keep result and lock text consistently positioned. Preserve the 28-unit single-line choice cadence, line-dependent height, hanging labels, and 32-unit gap between question groups. These are board-specific measurements, not universal UI rules or final design tokens.

Keep grayscale native editable surfaces, whitespace instead of question dividers, and a single competition list without redundant headings. Maintain no decorative borders/cards. The first available item is selected by default. Answer is beneath all alternatives on the left; result occupies the same action region. Loading mirrors visible question geometry. Long text determines row height. Distinct neutral competition icon placeholders are illustrative, not final branding. Phone and navigation loading/failure remain proposals. Review both board themes and keep explanatory native notes outside frames.

## Colors and typography

Neutral grayscale structural study; semantic result labels do not rely on color alone. Use readable representative content and a stable hierarchy. Truncation retains the full label for future keyboard/touch discovery. The fixed light artboard in the two board themes is not an approved app light/dark palette.

## Validation and shared source

`scripts/mid-fidelity-components.cjs` manages common header, navigation rows, Ghost trigger, pagination, answer feedback, long-content geometry and proposed studies. Run `node scripts/sync-mid-fidelity.mjs --write`, then `node scripts/check-boards.mjs`. Review actual rendered optical alignment, wrapping, contrast and state parity before stage closure. Functional focus, accessible names, target sizes and responsive behavior require a later prototype.

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

## History and evidence

[Product](PRODUCT.md) owns product facts. [Release state](docs/releases/v0.1.0/current-state.json) owns the current planning status. [Previous design record with the full revision history](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/DESIGN.md) preserves the earlier Sketch, Low-Fidelity and renderer workarounds; their old geometry and review status are not current requirements. [Archive design foundations](https://github.com/ianmaciel7/exams-app-archive/blob/main/docs/references/ui-ux-research-sources/design-foundations-and-state-transitions-2026-11-25.md) · [NN/g consistency](https://www.nngroup.com/articles/consistency-and-standards/) · [shadcn Sidebar](https://ui.shadcn.com/docs/components/sidebar) · [GOV.UK radios](https://design-system.service.gov.uk/components/radios/).

## Action controls and collapsed sidebar reveal — 2026-11-27

A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

Use one restrained neutral action-button family: 112 × 34 canvas units for Answer/Retry, unchanged dimensions during submission, a subtle disabled surface, distinct enabled/hover/pressed tones, and a single external keyboard focus outline. No scale/bounce, layout shift, decorative shadow or ripple. Hover and press are separate from submission state. The four-state button strip and separate collapsed hover/focus specimens are component studies outside the artboard, not additional screens. Actual activation, keyboard, touch and motion remain for prototype verification.

Historical evidence: [Archive motion specification](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/UI-MOTION-SPEC.md) and [motion evidence](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/UI-MOTION-EVIDENCE.json), entries `reveal-overflow`, `peek-open`, `peek-close`. Reveal is not automatic peek: no panel opens on hover. The original old-branch source could not be fetched; the archive catalog supports the distinction, not a claim of exact historical parity. [shadcn Button](https://ui.shadcn.com/docs/components/radix/button) and [WAI disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) inform control states and accessible activation. The native board shows static states, not working effects.

## Focus-visible refinement — 2026-11-27

Use one external, continuous 2-unit neutral focus outline with a 3-unit clear separation from the button, matching its radius. Do not use stacked filled rectangles to simulate focus. The button itself does not change dimensions or fill when focused. Use the same principle for icon controls and adapt ring placement to radio/list controls. For the fixed light artboard, #666666 against #ffffff has approximately 5.74:1 contrast. These are exploratory canvas measurements, not production CSS tokens or a WCAG conformance claim. WCAG 2.2 2.4.7 (AA) requires visible keyboard focus; 2.4.13 (AAA) provides a more specific area/contrast benchmark. Test 1.4.11, 2.4.11, forced colors, keyboard navigation, focus obscuration, and actual rendered states in the prototype. Keep :focus-visible separate from hover, pressed, checked, selected, and pending. Do not disable the native focus indicator without a valid replacement.

Answer and Retry use a stable 112 × 34 canvas footprint. Default #333333, hover #262626, pressed #191919, disabled #f4f4f4, pending #eeeeee. The four-state comparison is shown against the same light surface as the workspace; disabled and pending remain in their corresponding workspace variants. These neutral values are not final tokens. Avoid bounce, scaling, decorative shadows, ripple, geometry changes, and animation-dependent feedback. The collapsed hover and keyboard focus specimens are separate: hover reveals the icon with subtle surface feedback; keyboard focus reveals the icon with a single clear outline. Touch retains an accessible visible alternative.

References: [W3C Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [Atlassian focus ring](https://atlassian.design/components/focus-ring/usage), [Archive design foundations](https://github.com/ianmaciel7/exams-app-archive/blob/05a3ebd9dfae12f0346cb9f8e34181b8a4614288/docs/references/ui-ux-research-sources/design-foundations-and-state-transitions-2026-11-25.md). Baseline native capture `670a2d1` demonstrated the previous bulky nested outline. Revised native captures pending. All 21 workspace variants remain.
