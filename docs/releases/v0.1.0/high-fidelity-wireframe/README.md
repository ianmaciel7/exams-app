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
| 04 Continuation | Scrolled phone, pagination boundaries, single page without a pager, and inline answer-loss warning |
| 05 Lifecycle | Loading, empty, failure; competition empty |
| 06 Navigation | Loading/failure and 768-width study |
| 07 Feedback | Correct/locked, submitting, uncertain outcome |
| 08 Controls | Default/hover/pressed/focus/disabled/pending; full label |
| 09 Long content | Five options, hanging indent and feedback |
| 10 Redlines | Viewport, sidebar, inset, cap, pitch, action measurements |
| 11 Anatomy | Question, radio, button, nav, type and reading order; five answer-option states before submission |
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

Full option row selectable. Keyboard order, visible focus, accessible labels, target size and explicit state text. Use a named modal drawer with focus contained inside. Escape and a visible close control dismiss it and restore trigger focus. Selecting a competition also closes it, restores trigger focus and announces the selection. Dismissal without selection preserves scroll and selection. Start breakpoint testing at 1024 CSS px under the [responsive navigation decision](../product/README.md#responsive-navigation-decision). No horizontal overflow at 320/390/768/1024/1280. Grow long content, expose truncated desktop labels and wrap phone labels. Prototype validation covers resize, zoom, keyboard, screen reader, contrast and safe retry. No WCAG conformance claimed.

## Review and gates

### Control-state review priorities

The Controls study already shows rest, hover, pressed, keyboard focus, disabled and pending for Answer and Retry. It also shows rail hover and focus and reveals a truncated desktop competition name on hover or focus. The following are open review items for sections 04, 07, 08 and 11. Review the current revision in Light and Dark at readable zoom before closing the stage.

| Priority | Review target | Evidence to capture |
|---|---|---|
| 1 | Answer option rows, sections 07 and 11 | Section 11 shows rest, hover, keyboard focus, selected, and selected with keyboard focus. The selection marker persists with focus. The full row is the touch target and Answer submits separately. Inspect the five specimens in both themes and verify keyboard and touch in the prototype. In section 07, confirm that the correct option and the user's incorrect choice remain distinguishable and that evaluation visibly locks the rows. |
| 2 | Pagination, section 04 | Compare an enabled control at rest, on hover and with keyboard focus. Distinguish it from the current page and unavailable Previous or Next controls. Check first, middle and last pages, and verify that the single-page specimen omits the pager. |
| 3 | Truncated competition names and icon-only rail trigger, section 08 | Confirm that the full competition name is available through hover and keyboard focus, and that the phone label wraps. Review whether the trigger's purpose is clear before hover and whether a supplemental tooltip would help. |
| 4 | Focus outline, sections 08 and 11 | In both themes, check that the outline on Answer and Retry is visibly distinct from hover and decorative shadow. Compare it with the existing rail and option focus specimens, then include the proposed pagination focus specimens when available. |

In the interactive prototype, verify keyboard order and activation, touch without hover, and tooltip persistence and dismissal. The static board documents intended states. Interaction and assistive-technology results remain pending.

Sections 03 and 04 show the approved inline warning near competition and page navigation when selected or evaluated answers would be discarded. The warning is nonmodal. In the prototype, verify that people can predict the loss before either kind of change and that the warning appears only when answers are at risk. See [Nielsen's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

Initial 2cc13ec exposed 17 gaps; 9a140b9 restored 22 inherited obligations. 348f8bf restored compact anatomy, inline feedback and five-option long content; its [CI/deploy](https://github.com/ianmaciel7/exams-app/actions/runs/46029500276) passed. Both theme overviews of that revision were reviewed, not full-size acceptance. This revision adds three structural specification studies and removes outdated active dimensions.

Run `node scripts/sync-high-fidelity.mjs --write` after generator changes and `node scripts/check-boards.mjs` for parity and coverage. Keep coverage and specification gates blocked for closure until latest captures are inspected at useful zoom and owner approves. See [AGENTS.md](../../../../AGENTS.md).

Next question: Mockup: which visual identity, typography, semantic colors and theme treatment should be applied to the resolved structure?
