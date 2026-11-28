# Exam App

Practice questions in focus.

This identity proposal supports a reading-first workspace for public-service exam practice. A deep teal accent and ink text keep attention on the question. The mark uses an open page with a stepped edge, representing one question at a time. The expanded header uses the horizontal logo, with the page mark and tightly spaced wordmark in one vector asset. The collapsed rail uses the compact mark. Keep both distinct from navigation controls. Preserve text labels for answer outcomes, a distinct keyboard focus indicator, and a flush workspace boundary.

Review the mark at 16 and 24 pixels, then test the palette in an approved mockup with long questions and feedback. Identity approval and application integration remain pending.

## Provisional semantic roles and validation (issues #21 and #22)

The existing values are a candidate, not an approved palette. Do not change the grayscale High-Fidelity board or deploy these tokens to the application. The brand mark and interaction accent currently share a value, not a requirement to share a role.

| Component / state | Proposed existing role mapping | Required independent cue or unresolved role |
| --- | --- | --- |
| Reading surface, question, option, default navigation | ground, ink, muted | Navigation surface, rail and drawer differentiation still need a mockup decision. |
| Selected option, competition, current page | tint + ink; brand as checked indicator | Radio/check/current-page semantics and visible shape or weight; tint alone is insufficient. |
| Primary Answer or Retry | brand + on-brand | Hover, pressed, disabled and pending variants not yet defined; preserve dimensions and labels. |
| Ghost action, navigation hover | ink or muted on ground | Hover/pressed surface values pending; no automatic opening. |
| Keyboard focus | focus on ground or tint | Separate ring from adjacent brand fill with a contrasting gap; verify actual adjacency. |
| Correct or incorrect evaluation | correct or incorrect on ground/tint | Text label and explicit option indicator; wrong selection distinct from correct choice. |
| Technical failure / retry | ink and explicit error message; Retry action | Technical-error semantic role pending; do not equate network failure with incorrect answer. |
| Disabled, pending, locked | explicit label/state; stable geometry | Specific surface and foreground candidates pending; disabled is not the same as locked or loading. |
| Drawer backdrop, tooltip, separators | unresolved | Composited backdrop and functional boundaries need rendered review; do not add decorative borders. |

Run `node scripts/check-identity-contrast.mjs` from the repository root. The audit checks opaque sRGB contrast for 13 candidate text and indicator pairs in each theme, compares unrounded values to their thresholds, checks generated CSS value parity, and reports tint/ground and focus/brand separately as informational. Current calculated results: all 26 threshold-bearing pairs pass; tint/ground 1.174/1.837 and focus/brand 1/1 do not provide independent contrast. These are token calculations, not rendered WCAG conformance.

Before approval, compare genuinely distinct identity alternatives in the same question-reading context; record the owner decision. Resolve missing roles and aliases in canonical tokens.json, regenerate CSS and API docs through the native design-system workflow, verify parity, review a versioned diff, and retain the previous revision for rollback. Do not introduce hard-coded component colors. Actual component screenshots, alpha compositing, keyboard, forced colors, assistive technology, touch, color-vision review and responsive runtime behavior remain untested. Mockup and Prototype acceptance remain gated by the corresponding stage and owner approval.

### Candidate role and compositing contract — 2026-11-27

The [machine-readable semantic color contract](../semantic-color-contract.json) separates identity, semantic roles, component aliases, and combined states without inventing approved values. Existing CSS remains unchanged. Unresolved values explicitly use pending-owner rather than silently introducing new colors. The CI audit checks exact CSS parity between the design-system and workspace study, 26 opaque threshold-bearing pairs plus 40 calculated sRGB mixed-surface pairs (4/5/6/8/10% ink on ground, both themes). All 40 mixed pairs pass the applicable provisional text/indicator threshold in the independent calculation. Overlay and low-contrast boundary ratios are informational, not evidence of compliance or failure without actual adjacent surface and component context. The contract documents exclusions, ownership, fallback restrictions, migration and runtime tests still required.

<!-- open-artifact:usage (generated, do not edit) -->
## Consuming this system (generated — do not edit)

Load the compiled tokens; every token is a CSS custom property and every text style a class:

```html
<link rel="stylesheet" href="tokens.css">
```

Themes: `light`, `dark`. The first applies by default; set `data-theme="<id>"` on any element to switch its subtree.

For example `var(--ground)`, `var(--space-1)`, `var(--radius-none)`.

Text styles are classes: `<h1 class="display">`.


## Index (generated — do not edit)

- `api/tokens.md` — Tokens
- `api/assets.md` — Assets
- `api/assets/Logos.md` — Logos
- `api/README.md` — Exam App — agent reference
<!-- /open-artifact:usage -->
