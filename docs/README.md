# Project documentation

Start with [Ideas Board](boards/overview/README.md). Previous work is archived; current v0.1.0 planning explores competition selection, a vertically scrolling paginated question list and answer feedback states. [Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).

- [Project Hub](boards/project-hub/) — blank.
- [Release Stages](boards/release-stages/) — stage status summarized in the release record.
- [Release v0.1.0](releases/v0.1.0/README.md) — Sketch progression approved; Low-Fidelity Wireframe in progress; other later stages not started.
- [References](references/) — supporting research, not approved scope.

## Open Artifact

Run `node scripts/open-boards.mjs` (Node.js 22+ and Open Artifact CLI required), then open the overview URL. The launcher registers all nine native boards; use the URLs it prints. Set `OPEN_ARTIFACT_WHITEBOARD_CLI` to override CLI discovery. The blank boards retain their native directories and metadata for future work.

Run `node scripts/check-boards.mjs` for structural checks and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs` for tests. Native rendering and user review remain separate.

Follow [AGENTS.md](../AGENTS.md) and [whiteboard guidelines](boards/whiteboard-guidelines.md).

## Design context and capture status

[PRODUCT.md](../PRODUCT.md) records product scope; [DESIGN.md](../DESIGN.md) records provisional visual direction. The approved Sketch has eight state variants, native notes and four resolved decision threads. The new Low-Fidelity Wireframe has eight inherited variants and one proposed narrow-workspace study; automatic first-item selection approved, validation pending. The CI produces overview and individual state captures in both themes. [Run 45981578592](https://github.com/ianmaciel7/exams-app/actions/runs/45981578592) for English-copy commit `0c5df27` passed board integrity, capture and artifact upload; the separate deployment job failed at configuration. Use the downloadable capture artifact, not a deployed portal. See [release record](releases/v0.1.0/README.md) for status.

[Low-Fidelity Wireframe](releases/v0.1.0/low-fidelity-wireframe/README.md) is the active visual stage.
