# Agent instructions

## Language

- Write all repository content in English, including file and directory names, documentation, board content, and code comments.

## Boards and project memory

- Store boards in `docs/boards/`, each in its own descriptively named directory.
- Use `docs/boards/overview/` for the overall project. Create additional boards when a topic, flow, or investigation needs its own space.
- Record important information, decisions, findings, and references on the relevant board; preserve visual evidence and associated files too.
- Keep links or paths to related prototypes and versions to make navigation easier.
- Preserve each board's content and native format. Do not replace a visual board with a Markdown document.

## Prototypes and versions

- Organize prototypes under `prototypes/<prototype-name>/`.
- When versions need to remain accessible side by side for comparison, use subdirectories such as `v1/` and `v2/`; record their purpose and main differences on the relevant board.
- For small changes that do not need to coexist, prefer Git history over duplicating directories.
- Do not remove existing versions, evidence, or decisions without authorization.
