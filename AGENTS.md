# Agent instructions

## Language

- Write project-authored content in English, including file and directory names, documentation, board content, and code comments. Preserve imported references and source evidence in their original language when appropriate.

## Boards and project memory

- When historical Exam App or Notes App decisions, interfaces, screenshots, code, or prior context could answer an open question, consult the `exams-archive` plugin and its relevant archive skills before guessing. Treat archive findings as historical evidence, verify their source and applicability to the current release, and do not assume an indexed path proves its contents. If the archive is unavailable, say so rather than inventing its contents.
- Store project-wide boards in `docs/boards/`, each in its own descriptively named directory. Store release-specific boards alongside the relevant stage under `docs/releases/<version>/`.
- Give every whiteboard a distinct, descriptive name. Also verify that its browser tab title identifies the board: a unique board name inside the canvas does not guarantee a unique tab title. If the viewer displays a generic title such as `Whiteboard`, report the limitation rather than claiming it is fixed, and investigate the viewer's title handling before changing shared plugin code.
- Use `docs/boards/overview/` for the overall project. Create additional boards when a topic, flow, or investigation needs its own space.
- Use `docs/boards/release-stages/` to track releases and link to their stage artifacts; `docs/releases/` holds the actual release-specific records and boards.
- Record important information, decisions, findings, and references on the relevant board; preserve visual evidence and associated files too.
- Store reference materials under `docs/references/`; when the source date is known, prefix their filenames with `YYYY-MM-DD`. Keep original reference contents intact and distinguish claims and proposals from verified project decisions.
- Keep links or paths to related sketches, wireframes, prototypes, and versions to make navigation easier.
- Preserve each board's content and native format. Do not replace a visual board with a Markdown document.
- For UI sketches and wireframes, follow `skills/sketch-wireframe/SKILL.md` and distinguish sketch, low-, mid-, and high-fidelity wireframes, mockups, and interactive prototypes. For editable Open Artifact sketches, also follow the whiteboard skill.

## Wireframes, prototypes, and versions

- Store release-specific sketches and wireframes under `docs/releases/<version>/`, grouped by stage or topic. Keep reusable, cross-release material separate from release-specific artifacts.
- Reserve `prototypes/<prototype-name>/` for actual prototypes, including interactive prototypes used to validate experiences.
- When versions need to remain accessible side by side for comparison, use subdirectories such as `v1/` and `v2/`; record their purpose and main differences on the relevant board.
- For small changes that do not need to coexist, prefer Git history over duplicating directories.
- Do not remove existing versions, evidence, or decisions without authorization.
- Preserve release-specific product discovery and decisions in `docs/releases/<version>/product.md` (lowercase). Keep the root `PRODUCT.md` as evolving product context; append dated decisions and note superseded assumptions in the relevant release record instead of rewriting its history. Reference each stage's actual output and status on the release board, and mark proposed or missing artifacts clearly.
- Keep each release's information architecture, screen inventory, user flows, sketches, wireframes, and mockups under `docs/releases/<version>/` in descriptively named stage folders. Create folders when an artifact exists, not as empty placeholders. Interactive application prototypes belong under `prototypes/` and should be referenced from the release record.
