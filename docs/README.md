# Project documentation

Start with [Ideas Board](boards/overview/README.md). Previous work is archived; current v0.1.0 planning explores competition selection, a vertically scrolling paginated question list and answer feedback states. [Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).

- [Project Hub](boards/project-hub/) — blank.
- [Release Stages](boards/release-stages/) — stage status summarized in the release record.
- [Release v0.1.0](releases/v0.1.0/README.md) — Sketch and Low-Fidelity progression approved; Mid-Fidelity Wireframe in progress; later stages not started.
- [References](references/) — supporting research, not approved scope.

## Open Artifact

Run `node scripts/open-boards.mjs` (Node.js 22+ and Open Artifact CLI required), then open the overview URL. The launcher registers all ten native boards; use the URLs it prints. Set `OPEN_ARTIFACT_WHITEBOARD_CLI` to override CLI discovery. The blank boards retain their native directories and metadata for future work.

Run `node scripts/check-boards.mjs` for structural checks and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs` for tests. Native rendering and user review remain separate.

Follow [AGENTS.md](../AGENTS.md) and [whiteboard guidelines](boards/whiteboard-guidelines.md).

## Design context and capture status

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

[PRODUCT.md](../PRODUCT.md) records product scope; [DESIGN.md](../DESIGN.md) records provisional visual direction. Sketch (8) and Low-Fidelity (9) are complete for progression and preserved. [Current release state](releases/v0.1.0/current-state.json) is the status contract. CI run [46001664133](https://github.com/ianmaciel7/exams-app/actions/runs/46001664133) generated the last reviewed 21 variants at `45e695c`; alignment defects were identified. New native captures and owner review remain pending. Use downloadable artifacts, not GitHub Pages.

Shared controls: `node scripts/sync-mid-fidelity.mjs --write`; validate with `node scripts/check-boards.mjs` (also checks current release consistency).

Latest reviewed baseline: [`ea7a119`](https://github.com/ianmaciel7/exams-app/commit/ea7a1194a797e433dcf6fe880b5d99acbd916de6) ([capture run 46003854656](https://github.com/ianmaciel7/exams-app/actions/runs/46003854656)). The owner requested action-state and collapsed-trigger refinements; the current revision retains 21 variants plus external component specimens. New captures pending review.
