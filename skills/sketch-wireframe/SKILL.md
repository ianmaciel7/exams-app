---
name: sketch-wireframe
description: Create, compare, revise, and review early UI sketches, graybox layouts, low-, mid-, or high-fidelity wireframes, annotated wireframes, and wireflows. Use for structure-first UI exploration before visual identity or production implementation.
metadata:
  version: "1.1.0"
  researched: "2026-11-24"
---

# Sketch and wireframe

## Select the deliverable

Respect the requested stage and reference. If unspecified for a new interface, start with a sketch or low-fidelity wireframe. Do not automatically advance fidelity or implement production UI.

| Stage | What to decide | Visual language |
| --- | --- | --- |
| Sketch | Regions, relative sizes, competing ideas | Rough editable shapes, short labels, pencil-like or plain strokes |
| Low-fidelity wireframe | Layout, hierarchy, navigation, major actions | Neutral grayboxes, simple controls, minimal copy |
| Mid-fidelity wireframe | Component placement, density, relationships, realistic content | Clean grayscale, consistent alignment, recognizable controls |
| High-fidelity wireframe | Detailed structure, sizing, content and states | Precise neutral components; no final brand treatment by default |
| Mockup | Visual identity and presentation | Color, typography, imagery, final styling |
| Interactive prototype | Behavior, navigation, feedback | Any visual fidelity; functional or explicitly simulated interactions |

Visual fidelity, content fidelity, and interaction fidelity are independent. An annotated wireframe and a wireflow are deliverable formats, not mandatory higher stages. These stage names are project conventions, not a universal standard.

## Workflow

1. Identify the user task, screen or fragment, viewport, primary action, constraints, and decision to test. Retrieve relevant project decisions and prior versions; distinguish facts from assumptions.
2. Establish the screen anatomy: zones, order, relative space, grouping, and reading hierarchy. For exploratory requests compare 2–3 meaningfully distinct structures; for a small targeted revision change only the requested scope.
3. Choose the least detailed representation that answers the design question. Use the visual grammar in [fidelity guide](references/fidelity.md) and realistic labels where their length changes layout.
4. Create the actual screen composition, not a collection of explanatory cards. Keep annotations separate or outside the viewport. Follow the user's visual reference instead of inventing visual details.
5. Use the appropriate artifact skill. For editable Open Artifact whiteboards, follow the whiteboard skill and construct separate editable shapes and text. For a requested HTML prototype, use standalone HTML/CSS with minimal JavaScript only when behavior is requested. Do not substitute a screenshot for editable or functional output.
6. Review the artifact at its intended viewport using [review checklist](references/review.md). Inspect a rendered preview when available; correct clipping, overlap, accidental polish and unsupported interactions. Mark untested aspects.
7. Record fidelity, purpose, assumptions, decisions, open questions and the artifact path on the relevant project board. Preserve previous versions when comparison matters.

## Guardrails

- Sketches are deliberately rough, but legible. Do not add gradients, shadows, decorative icons, brand colors, polished cards, excessive labels or fake interaction.
- Grayscale alone does not make a polished interface a wireframe. Simplify components and emphasis according to the stage.
- Preserve real constraints: navigation names, content size, important controls and relevant states. Do not fabricate requirements.
- If interaction is requested, state what works and what is simulated. Wireflows can show transitions without implementing them.
- Do not add desktop/mobile variants, alternative screens, or a design system unless they help answer the question or are requested.

Read [research and sources](references/research.md) when revising the methodology. Read [review checklist](references/review.md) before delivering a wireframe.
