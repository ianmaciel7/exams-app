# Agent instructions

## Language

- Write project-authored content in English, including file and directory names, documentation, board content, and code comments. Preserve imported references and source evidence in their original language when appropriate.

## Boards and project memory

- When in doubt about the project, consult the `exams-archive-native` (Exams Archive) plugin and its relevant skills whenever its historical Exam App or Notes App decisions, interfaces, screenshots, code, research, or prior context could help. This includes archived references to other products, such as QConcursos, and their captured interface states. Inspect the actual source or image before relying on it; an indexed path or filename alone does not establish its contents. Treat findings as historical evidence, verify their source and applicability to the current release, and do not turn reference features into approved requirements without a decision. If the archive is unavailable, say so rather than inventing its contents.
- Store project-wide boards in `docs/boards/`, each in its own descriptively named directory. Store release-specific boards alongside the relevant stage under `docs/releases/<version>/`.
- Give every whiteboard a distinct, descriptive name. Also verify that its browser tab title identifies the board: a unique board name inside the canvas does not guarantee a unique tab title. If the viewer displays a generic title such as `Whiteboard`, report the limitation rather than claiming it is fixed, and investigate the viewer's title handling before changing shared plugin code.
- Use `docs/boards/overview/` for the overall project. Create additional boards when a topic, flow, or investigation needs its own space.
- Use `docs/boards/release-stages/` to track releases and link to their stage artifacts; `docs/releases/` holds the actual release-specific records and boards.
- Whenever a stage progresses, a decision changes, or an artifact is created, update the relevant release-stage card, status, links, boards, and related documentation in the same task. Check for stale statements before finishing; distinguish a documented baseline from work validated with users.
- Record important information, decisions, findings, and references on the relevant board; preserve visual evidence and associated files too.
- Store reference materials under `docs/references/`; when the source date is known, prefix their filenames with `YYYY-MM-DD`. Keep original reference contents intact and distinguish claims and proposals from verified project decisions.
- Keep links or paths to related sketches, wireframes, prototypes, and versions to make navigation easier.
- Preserve each board's content and native format. Do not replace a visual board with a Markdown document.
- For UI sketches, use `especialista-ui-ux:sketch-de-interface` when available; for wireframes, use the relevant UI/UX plugin skill. Distinguish sketch, low-, mid-, and high-fidelity wireframes, mockups, and interactive prototypes. For editable Open Artifact sketches, also follow the whiteboard skill.

## Wireframes, prototypes, and versions

- Store release-specific sketches and wireframes under `docs/releases/<version>/`, grouped by stage or topic. Keep reusable, cross-release material separate from release-specific artifacts.
- Reserve `prototypes/<prototype-name>/` for actual prototypes, including interactive prototypes used to validate experiences.
- When versions need to remain accessible side by side for comparison, use subdirectories such as `v1/` and `v2/`; record their purpose and main differences on the relevant board.
- For small changes that do not need to coexist, prefer Git history over duplicating directories.
- Do not remove existing versions, evidence, or decisions without authorization.
- Preserve release-specific product discovery and decisions in `docs/releases/<version>/product.md` (lowercase). Keep the root `PRODUCT.md` as evolving product context; append dated decisions and note superseded assumptions in the relevant release record instead of rewriting its history. Reference each stage's actual output and status on the release board, and mark proposed or missing artifacts clearly.
- Keep each release's information architecture, screen inventory, user flows, sketches, wireframes, and mockups under `docs/releases/<version>/` in descriptively named stage folders. Create folders when an artifact exists, not as empty placeholders. Interactive application prototypes belong under `prototypes/` and should be referenced from the release record.
