# Current — exploratory visual system

**Status:** owner requested commit and push of this candidate; not final identity or Mockup acceptance. Exact reviewed HTML is [index.html](index.html), SHA-256 `8b84e455e17f1303302fb13b80ec4295689bf34d9b6bead861bdad67fb30bb74`, Git blob `d0b1812b84c9ffe70ed402ea197f335ef89ea71c`. The previous [Amber study](../amber-craft-study/README.md) is preserved. Hidden inherited comparison styles and controls are intentionally retained as original evidence, not canonical implementation.

## Visual contract

| Role | Light | Dark |
| --- | --- | --- |
| Content | #FFFFFF | #121720 |
| Navigation | #EEF2F8 | #1C2534 |
| Primary text | #17243C | #F2F5FF |
| Secondary text | #526078 | #BDC8DA |
| Primary action | #1649E6 | #9FB8FF |
| On action | #FFFFFF | #15223C |
| Selection | #E8EFFF | #283959 |
| Navigation selection | #DCE5F7 | #303E58 |
| Focus | #1649E6 | #A6BFFF |
| Action hover | #113DC5 | #B3C8FF |
| Action pressed | #1034AA | #90ADFF |

Inter/Arial fallback; 18px question stem, 15px alternatives, 23px competition heading; 240px sidebar, 700px question grid including 32px number column and 18px gap (650px reading column), 42px inset. Options 37px minimum desktop and 44px mobile, 9px corners; navigation selection 11px corners; 42px desktop / 44px mobile capsule action, pressed radius 16px and 0.97 scale; 18px drawer corners. Drawer shadow 0 12px 32px #15243d33, no floating theme-control shadow. Motion 160ms with reduced-motion fallback. No gradients or decorative card surfaces. Correct/incorrect have distinct labels and vector cues; inherited semantic colors remain separate from identity.

## Why the earlier variants converged

Actual computed layout at 1180 x 900, initial state, same illustrative sample; local Chromium inspection of the three rounded concepts:

| Metric | Current | Vermilion | Glint |
| --- | ---: | ---: | ---: |
| Sidebar width | 240 | 258 | 248 |
| Header height | 75 | 84 | 80 |
| Answer row width | 650 | 662 | 682 |
| Answer row height | 37 | 38 | 39 |
| Question stem size | 18 | 19 | 19 |
| Answer row radius | 9 | 14 | 18 |
| Primary radius | capsule | capsule | capsule |
| Question anatomy | number gutter | vertical | vertical |

The variants differ in fonts, palettes, radius and some density, but inherit the same underlying list-detail shell and nearly identical row/action composition. Vermilion and Glint are especially similar in geometry. A theme comparison is useful, but a full design-system comparison requires independent visual concepts.

### Next exploration acceptance criteria

- Compare distinct concepts while retaining the actual exam task, product scope, original question ordering, explicit Answer, feedback/locked/retry and pagination after the last question. Preserve the approved sidebar/drawer behavior and do not silently change current-stage geometry.
- Explore a compact index/document design (number gutter, compact navigation, aligned functional boundaries), a reading-first editorial design (different typographic hierarchy and measure, grouping and feedback treatment), and a tactile material design (coherent rounded controls, differentiated surface relationships, context-specific depth and state transitions). These are unapproved hypotheses, not implemented alternatives.
- Require independent role-based token maps covering neutral/accent/status palettes, type families/roles, spacing, density, shape, borders, elevation, iconography and motion. Distinct component anatomy and visual hierarchy must remain recognizable in grayscale. Preserve clear non-color cues, selection versus evaluation, and focus.
- Inspect matched desktop/mobile captures in both themes with long content; check contrast, keyboard, touch, reduced motion, focus, overflow, localization, error recovery and exact source provenance. No claim of full accessibility from screenshots or limited tests. Owner review and explicit selection precede canonical token/native artifact changes.

## Evidence and limits

The exact reviewed source was preserved. Local Chromium tests covered selection, wrong answer with correct-choice cue, theme, mobile width, drawer/Escape, failure and retry. New independent CI captures Light, Dark and Mobile and records source SHA and runtime checks. Original conversation PNGs are not committed; CI generates reproducible revision-specific evidence. Font families are CSS declarations; installed fonts may differ between runners. Two questions per page, illustrative competitions, sample Portuguese content and 760px drawer threshold are demonstration shortcuts, not release rules. Full ten-question pagination, locale detection, empty/loading/list-failure states, real data/backend safe idempotency, full long-content/zoom/AT verification and native editable mockup integration remain outstanding. No final identity, application or stage change; #23/#24 govern acceptance.
