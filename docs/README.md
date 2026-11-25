# Project documentation

Start with the project hub in `boards/project-hub/`. It links to the overview, release stages, and the current information architecture board.

In VS Code, run **Open Exam App boards** from Run and Debug, or execute `node scripts/open-boards.mjs` from the repository root. The launcher starts the boards and refreshes their local links. It uses the installed Open Artifact whiteboard CLI; set `OPEN_ARTIFACT_WHITEBOARD_CLI` to its `cli.mjs` path if it is installed elsewhere.

- `boards/overview/`: project-wide ideas and notes.
- `boards/release-stages/`: progress and stage outputs for releases.
- `releases/<version>/`: the decisions and artifacts specific to a release.
- `releases/v0.1.0/product.md`: product discovery and decision history for v0.1.0.
- `references/`: supporting reference material, including `2026-11-24-chatgpt-conversation-brazilian-civil-service-exams-structure.md`, an original Portuguese conversation export covering Brazilian civil service examination structure. These are references, not approved specifications.
- `references/2026-11-25-performance-and-account-menu-research.md`: sources and open decisions for the Performance area, account menu, and question-origin imagery.
- `releases/v0.1.0/information-architecture/`: the editable information architecture board for v0.1.0.

Create directories for additional stages when their artifacts exist. Keep runnable prototypes under the repository's `prototypes/` directory and link to them from the relevant release.
