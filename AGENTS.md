# Agent instructions

Exam App: study app for exams (certifications and Brazilian public-service exams).

- Design and planning material lives in `prototypes/`. Start with `prototypes/README.md`.
- The planning board is `prototypes/board-exam-app/BOARD.md` (text). `board.json` is the source of truth; do not edit `BOARD.md` by hand, regenerate it with `python board_to_md.py` inside `prototypes/board-exam-app/`.
- Runnable prototypes: `prototypes/exam-app-0.1.1/` (current) and `0.1.0/`. They are static HTML; serve `prototypes/` with `python -m http.server 8765`.
- Archived legacy code is in `docs/archives/` (see `docs/archives/REUSE-MAP.md` on the `chore/project-tooling` branch).
