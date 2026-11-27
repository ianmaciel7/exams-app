# Project documentation

Start with [Project Hub](boards/project-hub/README.md) or [Ideas Board](boards/overview/README.md). [Release Stages](boards/release-stages/README.md) and [Release v0.1.0](releases/v0.1.0/README.md) summarize current progress. [References](references/) support research, not approved scope.

## Open Artifact

Run `node scripts/open-boards.mjs` (Node.js 22+ and Open Artifact CLI required). The launcher registers all ten populated native boards. Set `OPEN_ARTIFACT_WHITEBOARD_CLI` to override CLI discovery. Use downloadable native capture artifacts for review.

Run `node scripts/sync-release-state.mjs --write` to regenerate planning data and `node scripts/sync-mid-fidelity.mjs --write` to synchronize managed wireframe elements. Validate with `node scripts/check-boards.mjs` and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs`. Structural checks are not visual or functional approval.

Follow [AGENTS.md](../AGENTS.md) and [whiteboard guidelines](boards/whiteboard-guidelines.md).

## Current release

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

## Capture evidence

Last verified successful capture: [d86973d](https://github.com/ianmaciel7/exams-app/commit/d86973ddcabfb685d97dc855a87a0f3ff4c9c80c) · [CI 46019545548](https://github.com/ianmaciel7/exams-app/actions/runs/46019545548). Manifest verified: 10 native boards, both Light and Dark. This is evidence for that commit only, not visual approval of the current revision.

Last recorded Mid-Fidelity review requiring changes: [d86973d](https://github.com/ianmaciel7/exams-app/commit/d86973ddcabfb685d97dc855a87a0f3ff4c9c80c) · [CI 46019545548](https://github.com/ianmaciel7/exams-app/actions/runs/46019545548) — Reviewed all 21 Mid-Fidelity states in both board themes (42 captures). The closed-phone artboard in Dark has missing right-hand tiles; Light renders the matching area. Other inspected states preserve the intended visual structure. Capture regression blocks progression; new evidence and owner visual approval required.

Last recorded planning-board review requiring changes: [898d493](https://github.com/ianmaciel7/exams-app/commit/898d493e56bbaefb49095eb5a2648ae463043359) · [CI 46005686904](https://github.com/ianmaciel7/exams-app/actions/runs/46005686904) — Owner identified crowded planning-board elements; layout corrections made in 165f554.

New revisions require their own capture; owner visual approval of Mid-Fidelity remains pending.

[PRODUCT.md](../PRODUCT.md) · [DESIGN.md](../DESIGN.md) · [Canonical state](releases/v0.1.0/current-state.json)

[Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).
