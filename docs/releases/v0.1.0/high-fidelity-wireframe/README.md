# High-Fidelity Wireframe — v0.1.0

Current stage: High-Fidelity Wireframe — in progress; structural specification and visual review pending.

## Entry and evidence

Mid-Fidelity approved 2026-11-27. Immutable [baseline](https://github.com/ianmaciel7/exams-app/commit/ec20139c96062542fc7eabb7424333b4fec6412f) and [21-state evidence](https://github.com/ianmaciel7/exams-app/actions/runs/46024835242). [Current state](../current-state.json) is authoritative. No new behavior approved.

Companion technical specifications and studies for this stage:

- [Safe retry specification](safe-retry-spec.md) (`#15`): client state machine, `attemptId` + `contextEpoch` stale-response guards, `aria-live` announcements, backend idempotency guarantees, and prototype test matrix.
- [Dataset and content assessment](dataset-and-content-assessment.md) (`#16`): current repository dataset status, media/formula/table/passage/variable-option risks, and explicit deferral of historical out-of-scope features.
- [Evidence packet](evidence-packet.md) (`#18`): pre-change baseline checks at `17bc17e`, isolated MCP + native comment lifecycle verification, and live host limits.
- [Workspace mockup canvas](../../../../designs/exam-app-workspace-mockup/) and [Workspace motion study](../../../../designs/exam-app-workspace-motion/) (`#10`): provisional interactive design/motion studies across Light/Dark themes and `prefers-reduced-motion: reduce`, pending owner identity and High-Fidelity approval.

## Distinct stage question

Can the approved workspace be specified with consistent near-final structural dimensions, readable content, overflow rules and critical responsive/feedback states without locking in brand styling?

Approved invariants: one question workspace, original exam order, ten per page, explicit Answer, locked evaluation, safe retry retaining choice, first competition selected, Ghost navigation and phone overlay, English/pt-BR interface. Question content language stays in source language.

## Native sections

| Section | Evidence |
|---|---|
| 01 Desktop | 1280 x 900; flush square App Shell seams, expanded, evaluated wrong, two complete questions and visible beginning of third |
| 02 Collapsed | 1024 x 900; 64-unit square rail, selected and provisional mark at rest |
| 03 Phone | 390 x 800 `pt-BR` closed/open and `en` closed at identical width; 320 x 800 `en` closed; distinct open/close glyphs at identical coordinates |
| 04 Continuation | Scrolled phone, pagination boundaries, single page without a pager, inline answer-loss warning, and pagination control states (`rest`/`hover`/`pressed`/`focus`/`current`/`disabled`) |
| 05 Lifecycle | Loading skeleton mirroring heading, 2-line stem, 5-option 32-pitch rhythm, and 112 x 44 action footprint; empty, failure; competition empty |
| 06 Navigation | Loading/failure, 768-width compact study, and desktop nonmodal answer-loss warning when answers are at risk |
| 07 Feedback | Correct/locked, submitting, uncertain outcome; hanging-indent feedback below option text |
| 08 Controls | Answer/Retry states (`default`/`hover`/`pressed`/`focus`/`disabled`/`pending`), collapsed rail Logo-to-Icon swap (`Rest`/`Hover`/`Focus`/`No hover`/`Pressed`/`Expanded`), supplementary tooltips, competition icon cues, and navigation row states |
| 09 Long content | Five options, hanging indent and collision-free feedback at 1020 desktop and 320 minimum phone widths |
| 10 Redlines | Viewport, sidebar, inset, cap, pitch, action measurements, and square App Shell seam notes |
| 11 Anatomy | Question, radio, button, nav, type, reading order, and 8 answer-option states (`rest`/`hover`/`focus`/`selected`/`selected_hover`/`selected_focus`/`locked`/`pending`) |
| 12 Responsive | Proposed 320/390/768/1024/1280 ranges, overflow and accessibility intent |

## Proposed structural specification

Canonical `highFidelity.structuralSpec` and generator record the values. Board units are proposals, not production CSS measurements.

| Property | Proposal |
|---|---|
| Desktop expanded / rail | 272 / 64 |
| Desktop inset / cap | 40 / 740 |
| Desktop option pitch | 32 |
| Compact range | 768–1023 (proposal; start prototype testing at 1024 CSS px); sidebar 240, inset 24 |
| Phone range | <= 767; inset 20, option pitch 44 |
| Drawer | min(304, viewport width - 56); overlay with flush viewport edge and provisional 12-unit inner corner radius |
| Radio glyph / indent | 18 / 28 |
| Answer and Retry | 112 x 44; stable footprint |
| Collapsed rail trigger | 44 x 44 slot; 20 x 20 provisional mark at rest swapped in place for contextual expand glyph on hover/focus/no-hover |
| Provisional surface radii | Shell `0` (flush square internal seams), controls `6`, overlays `12` (provisional; final tokens belong to Mockup) |
| Title-to-stem offset / question gap | 30 / 24 |
| Type targets | Question 16/24 semibold; stem/options 16/24 regular; feedback 14/20 regular; navigation/button 14/20 medium |
| Wrapping | Dynamic wrapped text height (`linesFor`) in generator; actual measured content height in implementation |

Native renderer uses body/small presets. Exact font family, final design tokens, semantic colors and identity are Mockup work. Breakpoints and surface radii remain proposals. No new dividers between questions.

## Accessibility intent

Full option row selectable. Keyboard order, visible focus, accessible labels, target size and explicit state text. Use a named modal drawer with focus contained inside and background made inert. Escape and a visible close control dismiss it and restore trigger focus. Selecting a competition also closes it, restores trigger focus and announces the selection. Dismissal without selection preserves scroll and selection. Start breakpoint testing at 1024 CSS px under the [responsive navigation decision](../product/README.md#responsive-navigation-decision). No horizontal overflow at 320/390/768/1024/1280. Grow long content, expose truncated desktop labels and wrap phone labels. Prototype validation covers resize, zoom, keyboard, screen reader, contrast and safe retry ([Safe retry specification](safe-retry-spec.md)). No WCAG conformance claimed.

## Review and gates

### Control-state review priorities

The Controls study (Section 08) covers rest, hover, pressed, keyboard focus, disabled and pending for Answer and Retry, navigation row states, collapsed rail rest-to-expand swap, and tooltips for truncated competition names and the expand action. Section 04 covers pagination control states (`rest`/`hover`/`pressed`/`focus`/`current`/`disabled`) and Section 11 covers eight answer-option states. Review the current revision (776 elements) in Light and Dark at readable zoom before closing the stage.

| Priority | Review target | Evidence to capture |
|---|---|---|
| 1 | Answer option rows, sections 07, 09, and 11 | Section 11 shows rest, hover, keyboard focus, selected, selected + hover, selected + focus, evaluated locked, and pending. Confirm non-color cues distinguish every state, and confirm in sections 07 and 09 that `Correct` / `Your answer` / `Answer locked` stack cleanly at 320/390/768/1024/1280 without collisions. |
| 2 | Pagination, section 04 | Compare enabled rest, hover, pressed, and keyboard focus against current page (fill + border + bold label) and disabled controls. Check first, middle and last pages, and verify that the single-page specimen omits the pager. |
| 3 | Collapsed rail swap, truncated competition names, and mobile triggers, sections 03 and 08 | Confirm Rest shows only the provisional mark and Hover/Focus/No-hover/Pressed swap in place (`dx=0, dy=0`) without layout shift. Confirm full competition label and expand-action tooltips appear on hover/focus, phone labels wrap, and mobile open/close controls have distinct glyphs at identical coordinates. |
| 4 | App Shell seams & focus outlines, sections 01, 02, 06, 08, 10, 11 | Confirm flush 0px internal seams without unintended borders/radii on App Shell surfaces, and verify focus outlines on Answer, Retry, pagination, navigation rows, and option rows remain distinct in both themes. |

In the interactive prototype, verify keyboard order and activation, touch without hover, tooltip persistence and dismissal, `aria-live` announcements, and `attemptId` + `contextEpoch` safe retry. The static board documents intended states. Interaction and assistive-technology results remain pending.

Sections 03, 04, and 06 show the approved nonmodal warning near competition and page navigation when selected or evaluated answers would be discarded. In the prototype, verify that people can predict the loss before either kind of change and that the warning appears only when answers are at risk. See [Nielsen's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

Initial 2cc13ec exposed 17 gaps; 9a140b9 restored 22 inherited obligations. 348f8bf restored compact anatomy, inline feedback and five-option long content; its [CI/deploy](https://github.com/ianmaciel7/exams-app/actions/runs/46029500276) passed. The current remediation cycle resolves App Shell surface seams, collapsed rail swap, 320/390/768/1024/1280 parity, interaction-state studies, and skeleton/feedback geometry (with 0 `view-context.json` overlap issues).

Run `node scripts/sync-high-fidelity.mjs --write` after generator changes, `node scripts/sync-release-state.mjs --write` after `current-state.json` updates, and `node scripts/check-boards.mjs` + `node scripts/check-fidelity-coverage.mjs` for parity and coverage. Keep `coverageGate.status="blocked"` and `stageStatus="in progress"` until latest rendered Light/Dark captures are inspected at useful zoom and the owner approves. See [AGENTS.md](../../../../AGENTS.md).

Next question: Mockup: which visual identity, typography, semantic colors and theme treatment should be applied to the resolved structure?
