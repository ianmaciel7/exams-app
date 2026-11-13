# Archive Reuse Map

Maps what is inside `docs/archives/*.bundle` to what the current `exams-app` can reuse.
Built by extracting the bundles and listing their file trees (not by running their code).
Items marked **(unverified)** come from the catalog `README.md` only.

> Bundle caveat: branch names inside the `exams-app-old-*` bundles use dashes, not slashes
> (`backup-old-1`, not `backup/old-1`), so the restore commands in `README.md` and the per-bundle
> `.md` files fail on `-b backup/...`. Use:
> `git clone <bundle>` then `git checkout origin/backup-old-1` (check with `git bundle list-heads`).

## Lineage (oldest to newest)

| Era | Bundles | What it is |
|---|---|---|
| Prototypes | `notes-app-old` ... `old-4` | UI exploration (Radix -> Base UI, TipTap). Low reuse. |
| Local-first | `notes-app-old-5`, `old-6`, `old-8` | Dexie + FSRS flashcards (Revisa), JSON backup. |
| Firebase + exams | `notes-app-old-7`, `old-9`, `old-10`, `old-11` | Auth, Spaces, questions, mock exams, SM-2, MCP, dnd-kit, quality tooling. |
| Exams App Old | `exams-app-old-backup-old-1`, `dev-before-adr2`, `dev-20261111-1903` | Formal Next.js 16 bootstrap with ADRs. Closest to the current project. |

## High-value reuse candidates

| Need in exams-app | Where | Notes |
|---|---|---|
| Architecture decisions to carry forward | `exams-app-old-backup-old-1`: `docs/adr/0001-0012` (Next, shadcn, theming, i18n, project standards, agents, Firebase UI, Firebase auth, CI, Terraform, CD) | Read first; current repo has no ADRs yet. |
| Next.js 16 native foundations | `exams-app-old-backup-dev-20261111-1903`: `docs/adr/0004`, `src/app/{error,global-error,not-found,loading}.tsx`, `src/instrumentation*.ts`, `src/proxy.ts`, `src/app/api/health/route.ts` | Includes tests for each. |
| Testing setup | same bundle: `docs/adr/0006`, `vitest.config.mts`, `playwright.config.ts`, `src/test/setup.ts` | Vitest 5 + RTL + Playwright. |
| Env validation + flags | same bundle: `src/lib/env.ts` (+test), `src/lib/flags.ts` | |
| CSP, headers, HTTP guards, logger, cache | `exams-app-old-backup-dev-before-adr2`: `src/lib/{csp,headers,guards,server,logger,cache,parse,format}.ts` (+tests) | Later ADR 0004 favored native APIs over wrappers, so treat these as reference, not a drop-in. |
| Auth (sign-in, register, forgot-password, profile, MFA) | `exams-app-old-backup-old-1`: `src/app/(public)/*`, `src/app/(protected)/*`, `src/lib/{auth,dal}.ts`, `src/lib/firebase/*`, `src/app/api/auth/session/route.ts` | Server DAL + session cookie. Also MFA (SMS/TOTP) components. |
| i18n (en, pt-BR, es) | `exams-app-old-backup-old-1`: `src/i18n/{request,routing}.ts`, `src/app/_components/intl-provider.tsx` | next-intl. |
| CI/CD + infra | `exams-app-old-backup-old-1`: `.github/workflows/*`, `.github/actions/*`, `infra/bootstrap/*` (Terraform) | ADRs 0010-0012. |
| Lint guardrails | `exams-app-old-backup-old-1`: `.ast-grep/rules/**` (~80 rules + tests), `.biome/rules/**`, `.dependency-cruiser.cjs`, `.fallowrc.json` | Rules enforce shadcn/Base UI, forms, Firebase and Next conventions. Pick selectively. |
| Spaced repetition: SM-2 | `notes-app-old-10`: `src/domain/recall.ts` (253 lines, ease factor default 2.5), `tests/recall.test.ts` | Small, pure, tested. Best first port. |
| Spaced repetition: FSRS | `notes-app-old-5`, `notes-app-old-8` | Exact file paths **(unverified)**; search for `fsrs`. |
| Questions / mock exams / Spaces domain | `notes-app-old-10`: `src/domain/recall.ts`, `src/actions/recall.ts`, `src/components/recall`, `src/app/{question,study,review,space}` | Domain model for the product. |
| MCP read server for AI agents | `notes-app-old-10`: `src/app/api/mcp/route.ts`, `src/lib/mcp/tools.ts`, `src/domain/api-keys.ts`, `src/actions/api-keys.ts`, `tests/e2e/mcp.spec.ts` | API-key based. |
| Multi-tenant security | `notes-app-old-10/11`: `firestore.rules`, `tests/firestore-rules.test.ts`, `tests/e2e/tenancy.spec.ts`, skill `firestore-rules-change` | Tenancy isolation is tested. |
| Drag-and-drop questions | `notes-app-old-11`: `@dnd-kit/*` usage, skill `implementing-drag-drop` (examples + a11y notes) | |
| Seeds / emulator data | `notes-app-old-11`: `.firebase/seeds/*`; `notes-app-old-10`: `scripts/seed.ts`, `tests/emulator-seed.test.ts` | Deterministic local data. |
| Mutation + perf budgets | `notes-app-old-11`: `stryker.config.mjs`, `lighthouserc.cjs` | |
| Offline retry queue | `notes-app-old-10`: `src/lib/retry-queue.ts` (+test) | |
| JSON backup/restore | `notes-app-old-8`: `src/data/backup.ts` (+test), `src/components/backup/backup-manager.tsx` | |
| Rich text editor | TipTap: `notes-app-old-4`, `old-10`; Plate/Slate: `old-6` | Pick one; TipTap is the more recent. |

## Agent tooling worth copying (not app code)

- `notes-app-old-11/.agents/`: 8 sub-agents (architect, security/a11y reviewer, firebase-specialist, ...), rules (`adr-implementation-guard`, `documentation-sync`, `no-emojis`, `path-portability`), hooks (biome-on-edit, guard-paths), eval harness, ~50 skills.
- `exams-app-old-backup-dev-20261111-1903`: skills `adr-update`, `git-sync-origin`, `grill-with-docs`, `domain-modeling`.
- `notes-app-old-10/.serena/memories/*` and `graphify-out/` (precomputed graphs, can be stale).

## Not recommended to reuse

- `notes-app-old`, `old-1` (docs only), `old-2`, `old-3`, `old-4`: UI exploration superseded by later work.
- `graphify-out/` caches and `.firebase/logs/*`: generated artifacts.

## Suggested order

1. Read `old-1` ADRs 0001-0012 and `dev-20261111-1903` ADRs 0004-0006; decide which to re-adopt.
2. Re-bootstrap from `dev-20261111-1903` (smallest, newest foundation).
3. Port SM-2 from `notes-app-old-10` with its tests.
4. Add auth + i18n from `exams-app-old-backup-old-1`.
5. Port Spaces/questions domain, then MCP and tenancy rules.
