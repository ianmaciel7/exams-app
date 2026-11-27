# High-Fidelity Wireframe — v0.1.0

Current stage: High-Fidelity Wireframe — in progress; structural specification and visual review pending.

## Entry and evidence

Owner explicitly approved Mid-Fidelity on 2026-11-27. The immutable [reviewed capture baseline](https://github.com/ianmaciel7/exams-app/commit/ec20139c96062542fc7eabb7424333b4fec6412f) and [CI evidence](https://github.com/ianmaciel7/exams-app/actions/runs/46024835242) contain 21 variants in both board themes. Preserve all existing boards. [Current state](../current-state.json) is authoritative.

## Distinct stage question

Can the approved workspace be specified with consistent near-final structural dimensions, readable content, overflow rules and critical responsive/feedback states without locking in brand styling?

Approved invariants: one question workspace, original exam order, ten per page, explicit Answer, locked evaluation, safe retry retaining choice, first competition selected, Ghost navigation and phone overlay, English/pt-BR interface. No new behavior approved. The full 21-state inventory remains the source for lifecycle coverage.

## Representative native specimens

| ID | Purpose |
| --- | --- |
| desktop-evaluated | 1280 × 800; readable width, evaluated option and locked feedback |
| desktop-collapsed | 1024 × 800; visible Ghost trigger and selected state |
| phone-closed | 390 × 800; localized chrome, wrapping and target rhythm |
| phone-open | 390 × 800; overlay drawer and preserved context intent |

## Proposed structural specifications

- Desktop 272 sidebar, 64 rail, 40 content inset and maximum 740 content width. Narrow widths must reflow without horizontal scrolling; breakpoint not yet approved.
- Phone 20 inset, drawer 304 (clamp on smaller screens), 48 option-row rhythm; 44-unit touch target intent. Radio glyph 18; the whole option row is the target in the future prototype. Sidebar and question controls keep stable placement. Long labels wrap on phone; desktop truncates with full-label discovery.
- Use neutral grayscale as structural evidence, not final palette, typography, brand or semantic tokens. Answer/Retry control footprint and footer behavior need a focused component review. Keep correct and selected-wrong labels explicit.
- Validate critical widths 320, 390, 768, 1024 and 1280, long text, pagination boundaries, focus intent, error/pending recovery, and both board themes. Capture proof and owner approval are pending. No implementation, functional or accessibility conformance is claimed.

## Exit and next question

Review native captures at useful zoom for clipping, overlap, consistent spacing and component anatomy. Resolve structural ambiguities and record evidence, then obtain owner approval. Mockup: which visual identity, typography, semantic colors and theme treatment should be applied to the resolved structure?
