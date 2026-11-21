# exams-app-old

- **Branch recuperada:** `dev` (também existem `backup/dev-20261111-1903`, `backup/dev-before-adr2`, `backup/old-1`, `claude/project-thread-u76ueb`; `main` só tem LICENSE).
- **Stack:** Next.js 16.4, React 19, Tailwind 4, Biome, Vitest, Playwright, OpenTelemetry, pnpm.
- **Estrutura:** `src/app` (`page.tsx` mínimo, `layout`, `error`, `not-found`, `loading`, `api/health`), `src/lib` (`env`, `flags`), `docs/adr/0001-0005`, `tests/home.spec.ts`.
- **Rotas:** `/` e `/api/health`. É só a fundação; não há telas de produto.
- **Como rodar:** `pnpm install && pnpm dev` (copie `.env.example`).
