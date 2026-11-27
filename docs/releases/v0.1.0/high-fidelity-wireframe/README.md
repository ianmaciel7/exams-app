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

## Inherited coverage audit — 2026-11-27

The initial board at [2cc13ec](https://github.com/ianmaciel7/exams-app/commit/2cc13ec7f7d20efd8e97af56c77423d84d93553e) was published successfully but is incomplete. Owner identified missing detail. The canonical `highFidelity.coverageGate` ledger in [current-state.json](../current-state.json) records 22 obligations, including 17 gaps. Structural CI is not visual acceptance. Do not advance or request approval until the required gaps are resolved and real captures are reviewed. Retain approved Mid-Fidelity as baseline; use complete representative screens plus targeted component studies rather than duplicating all 21 artboards. See [AGENTS.md](../../../../AGENTS.md).

## Coverage repair — 2026-11-27

The 22-obligation ledger now maps all requirements to native element IDs. The four representative workspace specimens are retained, with supporting sections for phone continuation/320 width, pagination boundaries, question and navigation lifecycle, narrow desktop, answer feedback, controls, tooltip and long content. Both desktop question examples are complete; mobile intentionally scrolls and has a separate continuation. The open drawer is derived from the same closed workspace content and dimmed before adding navigation. No new product behavior is approved.

Structural dimensions are proposed: 44-unit Answer/Retry footprint (supersedes provisional 34-unit height for this study), 272 expanded / 64 collapsed, compact 240 sample at 768, 20 phone gutters and drawer clamped to leave 56 units of context. Final breakpoint and real reflow remain prototype work. The native board is generated from `scripts/high-fidelity-components.cjs`; run `node scripts/sync-high-fidelity.mjs --write`. CI checks generated parity and captures nine named sections in both board themes. Source coverage is not visual acceptance. The gate remains blocked until actual images are inspected and owner approval is recorded.

## Question anatomy correction — 2026-11-27

Visual comparison with the approved Mid-Fidelity wrong-answer state (ec20139) identified excessive row spacing, full-width evaluated backgrounds and a stem/first-option collision in compact feedback specimens. Restore the original inline Correct / Your answer labels, selected PATCH in the wrong-answer specimen, muted non-evaluated alternatives and separated result/lock labels. Desktop option rhythm is 32, phone 44; action footprint remains 44. A conservative two/three-line stem reservation at constrained widths prevents the previously observed collision. Two complete desktop questions and a partial third indicate scrolling; the 768 specimen now includes all five options and its Answer control. The long-content specimen restores all five baseline alternatives with hanging indentation and separate evaluation labels. No new interaction is approved; visual review of both native capture themes remains required.
