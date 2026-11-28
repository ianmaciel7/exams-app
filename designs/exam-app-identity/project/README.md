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

### Rendered-artboard audit

The native Playground CI now opens the actual workspace design editor with upstream's opt-in live-artboard mode for QA only. It inventories all nine committed artboards, measures actual rendered text colors and radio indicators against composited ancestor surfaces in sRGB, records state/label evidence and explicitly lists unsupported measurements. The downloadable `rendered-workspace-color-audit` report is revision-specific. Threshold failures are recorded as provisional-identity findings rather than hidden or treated as approval. The exploration remains unapproved; keyboard, focus, touch, screen reader, forced-colors and runtime recovery remain separate gates. No palette or visual geometry is changed.

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

The rendered audit is a separate post-deployment CI job, not a prerequisite of serving the already-validated native library. The job verifies the exact deployed SHA, waits for project styles, measures text ranges (including display:contents), records per-artboard diagnostics, and uploads evidence even when measured contrast or collection fails. Failures remain visible as a failed accessibility job and block issue #22 acceptance; they do not suppress publication of existing explicitly provisional studies or the independent #20 library checks.

### Isolated color-direction comparison (issue #21)

[Three unapproved color directions](../color-directions.json) record exact light/dark values, with separate brand and interaction roles. The independent `compare-provisional-colors` CI job applies temporary CSS variable overrides to the nine actual native workspace artboards and measures rendered text and radio contrast using the existing auditor. It also captures desktop and mobile in both themes, records image dimensions and original board dimensions, and uploads an evidence bundle. This is an isolated color study with the layout and current provisional logo fixed, not three full-system alternatives. No canonical tokens, original board, publication assets, stage, or production application are changed. Technical-error colors not present in the default artboards, original logo color, full-size inspection, combined interaction states and owner approval remain separate review items. Do not infer visual approval from the CI result.

Follow-up on [run 46092143973](https://github.com/ianmaciel7/exams-app/actions/runs/46092143973/artifacts/15241557328): downloaded evidence proves 208 passing rendered comparisons per color direction (624 total), zero collection errors, and four disabled-control text exceptions per candidate. Minimum measured ratios: mineral blue 5.9101:1; monochrome 5.7231:1; aubergine 5.6295:1. Actual PNGs were 309 × 218 desktop and 95 × 205 mobile, so they are inadequate for owner visual review. The comparison now captures at DPR 5 without bitmap enlargement, waits for fonts and images, enforces the original board pixel dimensions as a minimum, and rejects unknown required contrast measurements instead of passing them. Native canvas optical fidelity and the unmodified provisional logo remain review limitations; no approval implied.

### Amber Craft follow-up

The [separate amber/neutral workspace study](../../../prototypes/amber-craft-study/README.md) received positive owner feedback and was retained for issue #23. It does not replace this native design-system candidate, its comparison evidence, or approved grayscale structures. Final identity and runtime acceptance remain #23/#24.
