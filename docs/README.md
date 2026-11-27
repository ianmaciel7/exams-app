# Project documentation

Start with [Ideas Board](boards/overview/README.md). All previous work is archived; the current v0.1.0 planning has been reset. [Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).

- [Project Hub](boards/project-hub/) — blank.
- [Release Stages](boards/release-stages/) — blank.
- [Release v0.1.0](releases/v0.1.0/README.md) — all stages not started; all five native stage boards blank.
- [References](references/) — supporting research, not approved scope.

## Open Artifact

Run `node scripts/open-boards.mjs` (Node.js 22+ and Open Artifact CLI required), then open the overview URL. The launcher registers all eight native boards; use the URLs it prints. Set `OPEN_ARTIFACT_WHITEBOARD_CLI` to override CLI discovery. The blank boards retain their native directories and metadata for future work.

Run `node scripts/check-boards.mjs` for structural checks and `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs` for tests. Native rendering and user review remain separate.

Follow [AGENTS.md](../AGENTS.md) and [whiteboard guidelines](boards/whiteboard-guidelines.md).
