# Archives reuse map

`docs/archives/` holds legacy projects as git bundles (`*.bundle`) plus per-bundle `.md` docs and `.png` screenshots. Catalog: `docs/archives/README.md`. Full reuse map: `docs/archives/REUSE-MAP.md` (read it before porting anything).

All 15 bundles are extracted (no .git) into `.archive-extracted/<bundle-name>/` (git-ignored, ~476 MB, regenerable: `git clone -b <head> <bundle> <dir>` then delete `.git`). CodeGraph has a SEPARATE index there (3.8k files, 63k nodes). Query it with `codegraph_explore` passing `projectPath` = `C:\Users\ianma\workspace\exams-app\.archive-extracted` (the default project index of exams-app stays for the new code). Serena does NOT read these (no TS language server configured); use CodeGraph or Read.
Verified: SM-2 = notes-app-old-10 `src/domain/recall.ts` (`schedule`, line 224, tested in tests/recall.test.ts). FSRS = notes-app-old-8 `src/domain/scheduler.ts`, notes-app-old-9 `src/domain/study/fsrs-scheduler.ts`, notes-app-old-11 `src/lib/fsrs/schedule-card.ts`. Ignore `.agents/skills/impeccable/scripts/live-browser.js` noise in results.

Caveat: in `exams-app-old-*` bundles branch names use dashes (`backup-old-1`), so `git clone -b backup/...` from the README fails. Use `git bundle list-heads` then `git checkout origin/<branch>`.

## Lineage
- Prototypes: notes-app-old .. old-4 (low reuse)
- Local-first: notes-app-old-5, 6, 8 (Dexie + FSRS, JSON backup)
- Firebase + exams: notes-app-old-7, 9, 10, 11 (auth, Spaces, SM-2, MCP, dnd-kit, Stryker/LHCI)
- Exams App Old: exams-app-old-backup-old-1, dev-before-adr2, dev-20261111-1903 (Next.js 16, ADRs; closest to current project)

## Top reuse candidates
- ADRs 0001-0012: exams-app-old-backup-old-1 `docs/adr/`
- Next.js 16 foundations + Vitest/Playwright: exams-app-old-backup-dev-20261111-1903
- SM-2: notes-app-old-10 `src/domain/recall.ts` (+tests); best first port
- Auth + i18n (next-intl): exams-app-old-backup-old-1
- MCP read server, Firestore tenancy rules: notes-app-old-10/11
- Agent tooling/skills: notes-app-old-11 `.agents/`

Suggested order: ADRs -> re-bootstrap from dev-20261111-1903 -> SM-2 -> auth + i18n -> Spaces/questions domain -> MCP + tenancy rules.
