# notes-app

Branches (17): `main`, `dev`, `stag`, `firebase/file`, `old`, `old-1` … `old-11`. Cada `old-N` é um snapshot independente (ver `main-screenshots-readme/README.md` com descrição e capturas da home de cada um).

Recuperados aqui:
- `old-10/` — "Recall": Next.js 16.3, React 19, Base UI, TipTap, Firebase. Rotas: `/`, `/login`, `/space`, `/study`, `/review`, `/question`, `/question/[id]`, `/settings`, `/api/mcp`, `/api/auth/clear-session`. Componentes em `src/components` (`recall`, `study`, `ui`, `firebase`, `space-frame`). Docs: `spec.md`, `plan.md`, `ARCHITECTURE.md`. Captura: `main-screenshots-readme/screenshots/old-10-home.png`.
- `old-11/` — Next.js 16.3, Firebase Auth/Firestore, dnd-kit, ts-fsrs. Rotas: `/`, `/login`, `/[spaceId]`, `/[spaceId]/exams/[examId]`. Sem PNGs.
- `main-screenshots-readme/` — README e 10 capturas (old-2 a old-11).

Não copiei `old`, `old-1` a `old-9`, `dev`, `stag` nem `firebase/file`; dá para extrair qualquer uma com `git archive origin/<branch>`. Como rodar old-10/old-11: `pnpm install && pnpm dev` com variáveis Firebase próprias.
