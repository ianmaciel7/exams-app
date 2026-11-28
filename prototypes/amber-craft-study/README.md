# Amber Craft — exploratory workspace study

**Status:** positive owner feedback, retained for the Mockup decision (#23). Not an approved design system, Mockup stage transition, or production implementation.

The [standalone HTML](index.html) is the exact self-contained file used for the reviewed light, dark and mobile Chromium captures. Original SHA-256: `8a3e398d50595b45b9cd83e8162f0c86ccdc2ac33f0ae9f8155ed045341f60d8`. Git blob: `5b575e0404f88c43270752a2a62460832eb987b1`. Earlier comparison controls and styles are intentionally retained but hidden, as in the reviewed source. No external assets or native Apple fonts are bundled.

## Visual rationale and provisional specifications

Reading first; an opaque neutral content surface and subdued competition navigation, flush pane seam, warm signal reserved for selected answers and Answer. No decorative cards, gradients, fake dashboards, or native OS chrome. The provisional mark is illustrative. The selected and evaluated states have distinct semantics.

| Role | Light | Dark |
| --- | --- | --- |
| Content | #FDFDFD | #18191B |
| Navigation | #F0F1F2 | #202123 |
| Text | #24272B | #F3F3F2 |
| Secondary text | #5E626A | #B7B9BD |
| Primary action | #F7C548 | #F3C65A |
| On action | #29210C | #251B06 |
| Selection | #FFF0C6 | #45391D |
| Selected navigation | #DFE2E5 | #36383C |
| Correct | #216B46 | #9CD7AD |
| Incorrect | #A22E38 | #FFB5B7 |
| Correct surface | #EDF6EF | #26362B |
| Incorrect surface | #FBE8E8 | #3E292C |

Desktop study: navigation 264 px; content cap 680 px; 48 px insets; 34 px question gap; option rows 38 px minimum; 10 px option radius, 9 px navigation radius, 11 px action radius; 42 px primary action; 17 px stem; 15 px answer text; 13 px question label; Inter/Arial/system fallback (no font download). Drawer is the only elevated material; 16 px outer corner, offset soft shadow. Transition 175 ms; reduced motion suppresses transitions. Mobile study uses 20 px inset and 44 px option/action minimum. These are study values, not universal HIG values or canonical tokens.

## Evidence and limitations

Prior local Chromium capture flow: desktop 1180 × 900, mobile 390 × 844; Q1 selected C and evaluated incorrect with correct B identified, Q2 selected C; light/dark, drawer/Escape, correct answer and horizontal width exercised. No claim of screen reader or WCAG conformance. The new independent CI reproduces those captures and tests; images are generated from exact committed HTML, not AI-generated raster. Original conversation PNGs are not transferred as binaries; new evidence is revision-specific.

The sample questions and competition labels are illustrative. Two questions per page and a 760 CSS px drawer threshold are demonstration shortcuts, not the approved ten-question rule or final breakpoint. Only Portuguese is rendered; no real competition data, backend submission/idempotency, locale detection, empty/loading/list-failure fixtures, full keyboard/AT testing or persistence implementation. The visible theme control is desktop-only; mobile comparison is driven by the capture harness. Hidden failure/variant controls remain for review. Known gaps include focus retention on DOM replacement, full navigation ARIA state and exact collapsed trigger semantics, long labels, all combined states, reflow/zoom and forced-colors. Preserve the approved release contract; fix and validate these in the proper authorized stage. This study is not promoted to a native Open Artifact design system or published as a second public portal.

Sources: [Apple HIG craft research](https://github.com/ianmaciel7/exams-app-archive/blob/main/docs/references/ui-ux-research-sources/apple-hig-design-craft-2026-11-27.md), [current release](../../docs/releases/v0.1.0/README.md), [identity study](../../designs/exam-app-identity/project/README.md).
