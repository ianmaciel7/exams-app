# Project documentation

Start with the project hub in `boards/project-hub/`. It links to the overview, release stages, and all active release stage whiteboards (information architecture, screen inventory, user flows, and sketch).

In Codex, use the **Run** local environment action. In VS Code, run **Open Exam App boards** from Run and Debug, or execute `node scripts/open-boards.mjs` from the repository root. The launcher starts the boards and resolves their stable links for the local server without changing tracked board files. It requires Node.js 22 or later and an installed Open Artifact whiteboard CLI. It automatically discovers the CLI in Antigravity/Gemini (`~/.gemini/config/plugins/open-artifact/`) and Codex (`~/.codex/plugins/cache/created-by-me-remote/open-artifact/`); set `OPEN_ARTIFACT_WHITEBOARD_CLI` to an explicit `cli.mjs` path to override. The Codex local environment does not install these external dependencies; they must already be available on the host.

The launcher uses an isolated local Open Artifact server and generates a temporary editor asset copy under `node_modules/.cache/exam-app-open-artifact/`. It adds a browser-tab title that follows each board's metadata without changing the shared plugin installation. Restart the launcher after updating the plugin. Previously opened tabs use the old server and must be reopened from the new hub URL.

Run `node scripts/check-boards.mjs` for a read-only check of board order, element references and local URL drift. Run `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs` to test board integrity and Sketch ink behavior. The native board limit is 800 elements for Open Artifact v0.16.3. These checks do not replace the Open Artifact validator or visual review.

- `boards/overview/`: project-wide ideas and notes.
- `boards/project-hub/`: central hub linking to all active project boards and context.
- `boards/release-stages/`: progress and stage outputs for releases.
- `releases/<version>/`: the decisions and artifacts specific to a release; each release has a README index.
- `releases/v0.1.0/product/`: Product discovery board and `product.md` decision history for v0.1.0.
- `references/`: supporting reference material, including `2026-11-24-chatgpt-conversation-brazilian-civil-service-exams-structure.md`, an original Portuguese conversation export covering Brazilian civil service examination structure. These are references, not approved specifications.
- `references/2026-11-25-performance-and-account-menu-research.md`: sources and open decisions for the Performance area, account menu, and question-origin imagery.
- `references/2026-11-25-qconcursos-archive-evidence.md`: recovered historical question screenshots, provenance and evidence limits.
- `references/2026-11-26-context-efficiency-audit.md`: context and delegation baseline, findings, and measurement procedure.
- `releases/v0.1.0/information-architecture/`: the editable information architecture board and documentation for v0.1.0.
- `releases/v0.1.0/screen-inventory/`: screen inventory board and screen/state specifications.
- `releases/v0.1.0/user-flows/`: user flows board and core study journey specifications.
- `releases/v0.1.0/sketch/`: questions-page sketch board and structural specifications.

Create directories for additional stages when their artifacts exist. Keep runnable prototypes under the repository's `prototypes/` directory and link to them from the relevant release.

## Current release and Sketch review

Use the [release baseline](releases/v0.1.0/product/product.md#current-release-baseline) as the current decision source. Historical references and dated discovery entries are not current requirements. The project-local launcher applies consistent hand-drawn ink only to Sketch boards; original native geometry and external exports remain unchanged. Inspect both themes and native notes; never treat screenshots as proof of interactions. Latest verified capture: [run 45884414167](https://github.com/ianmaciel7/exams-app/actions/runs/45884414167), experimental commit `87f5f5c` (no redundant Questions subtitle).

## Stage ownership

Follow the [stage responsibilities and fidelity boundaries](../AGENTS.md#stage-responsibilities-and-fidelity-boundaries). Detailed exploratory question anatomy, content variants and interaction studies live in the [v0.1.0 reference board](releases/v0.1.0/references/question-component-study/) rather than in the active Sketch. The launcher registers it separately and the Project Hub links to it. References do not advance release stages.
