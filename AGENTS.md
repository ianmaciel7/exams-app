# Agent instructions

Exam App: study app for exams (certifications and Brazilian public-service exams).

## Run the prototype (any tool)

The prototypes are static HTML. No build step, no dependencies beyond Python 3.

```bash
npm run dev          # or: python -m http.server 8765 --directory prototypes
```

Then open:

- Current prototype: http://localhost:8765/exam-app-0.1.1/index.html
- Previous version: http://localhost:8765/exam-app-0.1.0/index.html
- Planning board viewer: http://localhost:8765/board-exam-app/index.html

Do not open `index.html` with `file://`: the app fetches PDFs and JSON, which needs HTTP.

## Edit the prototype

- The app is a single file: `prototypes/exam-app-0.1.1/index.html` (HTML + CSS + JS inline, about 380 KB). Search it by section instead of reading it whole.
- Data: `prototypes/exam-app-0.1.1/data/dataprev-2026-tipo1.json`. Source PDFs: `.../pdfs/`.
- App state (reading position, zoom, theme, spaces) is kept in the browser's `localStorage`, so it is per browser and per port.
- After an edit, reload the page and check the browser console for errors.

## Planning board

- Read `prototypes/board-exam-app/BOARD.md` (text). `board.json` is the source of truth; never edit `BOARD.md` by hand. Regenerate it with `npm run board`.

## Other

- Design and planning material: `prototypes/README.md`.
- Archived legacy code is in `docs/archives/` (see `docs/archives/REUSE-MAP.md` on the `chore/project-tooling` branch).
