# High-Fidelity Wireframe — v0.1.0

Current stage: High-Fidelity Wireframe — in progress; structural specification and visual review pending.

## Entry and evidence

Mid-Fidelity approved 2026-11-27. Immutable [baseline](https://github.com/ianmaciel7/exams-app/commit/ec20139c96062542fc7eabb7424333b4fec6412f) and [21-state evidence](https://github.com/ianmaciel7/exams-app/actions/runs/46024835242). [Current state](../current-state.json) is authoritative. No new behavior approved.

## Distinct stage question

Can the approved workspace be specified with consistent near-final structural dimensions, readable content, overflow rules and critical responsive/feedback states without locking in brand styling?

Approved invariants: one question workspace, original exam order, ten per page, explicit Answer, locked evaluation, safe retry retaining choice, first competition selected, Ghost navigation and phone overlay, English/pt-BR interface. Question content language stays in source language.

## Native sections

| Section | Evidence |
|---|---|
| 01 Desktop | 1280 × 900; expanded, evaluated wrong, two complete questions and visible beginning of third |
| 02 Collapsed | 1024 × 900; selected and collapsed rail |
| 03 Phone | 390 × 800 closed/open; 320 × 800 closed |
| 04 Continuation | Scrolled phone and pagination boundaries |
| 05 Lifecycle | Loading, empty, failure; competition empty |
| 06 Navigation | Loading/failure and 768-width study |
| 07 Feedback | Correct/locked, submitting, uncertain outcome |
| 08 Controls | Default/hover/pressed/focus/disabled/pending; full label |
| 09 Long content | Five options, hanging indent and feedback |
| 10 Redlines | Viewport, sidebar, inset, cap, pitch, action measurements |
| 11 Anatomy | Question, radio, button, nav, type and reading order |
| 12 Responsive | Proposed ranges, overflow and accessibility intent |

## Proposed structural specification

Canonical highFidelity.structuralSpec and generator record the values. Board units are proposals, not production CSS measurements.

| Property | Proposal |
|---|---|
| Desktop expanded / rail | 272 / 64 |
| Desktop inset / cap | 40 / 740 |
| Desktop option pitch | 32 |
| Compact range | 768–1023; sidebar 240, inset 24 |
| Phone range | ≤ 767; inset 20, option pitch 44 |
| Drawer | min(304, viewport width − 56); overlay |
| Radio glyph / indent | 18 / 28 |
| Answer and Retry | 112 × 44; stable footprint |
| Title-to-stem offset / question gap | 30 / 24 |
| Type targets | Question 16/24 semibold; stem/options 16/24 regular; feedback 14/20 regular; navigation/button 14/20 medium |
| Wrapping | Reserve two/three lines in constrained studies; actual measured content height in implementation |

Native renderer uses body/small presets. Exact font family, final design tokens, semantic colors and identity are Mockup work. Breakpoints remain proposals. No new dividers between questions.

## Accessibility intent

Full option row selectable. Keyboard order, visible focus, accessible labels, target size and explicit state text. Move focus into drawer, Escape closes and restores trigger focus; preserve scroll/selection. No horizontal overflow at 320/390/768/1024/1280; grow long content, discover truncated desktop label, wrap phone labels. Prototype must test actual resize, zoom, keyboard, screen reader, contrast and safe retry. No WCAG conformance claimed.

## Review and gates

Initial 2cc13ec exposed 17 gaps; 9a140b9 restored 22 inherited obligations. 348f8bf restored compact anatomy, inline feedback and five-option long content; its [CI/deploy](https://github.com/ianmaciel7/exams-app/actions/runs/46029500276) passed. Both theme overviews of that revision were reviewed, not full-size acceptance. This revision adds three structural specification studies and removes outdated active dimensions.

Run `node scripts/sync-high-fidelity.mjs --write` after generator changes and `node scripts/check-boards.mjs` for parity and coverage. Keep coverage and specification gates blocked for closure until latest captures are inspected at useful zoom and owner approves. See [AGENTS.md](../../../../AGENTS.md).

Next question: Mockup: which visual identity, typography, semantic colors and theme treatment should be applied to the resolved structure?
