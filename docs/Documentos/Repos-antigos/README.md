# Repos antigos — site base recuperado

Cópia de **referência** (somente leitura) do código-fonte dos repositórios antigos de `ianmaciel7`. Não inclui `node_modules`, lockfiles, `.env`, `graphify-out`, `.agents`/`.serena` nem PDFs/imagens pesadas. Nenhuma credencial foi encontrada; só existem `.env.example` com nomes de variáveis vazios.

| Pasta | Origem | O que é o "site base" |
|---|---|---|
| `exams-app-antigo-2/` | branch `dev` (a `main` só tem `.gitignore`) | Protótipo estático `exam-app-0.1.1__index.html` + central de boards `mestre.html` |
| `exams-app-old/` | branch `dev` | Bootstrap Next.js 16 com ADRs (home mínima, health, testes) |
| `notes-app/old-10/` | branch `old-10` | App "Recall": Spaces, questões, exames, estudo, MCP |
| `notes-app/old-11/` | branch `old-11` | Fundação Firebase Auth/Firestore, Spaces, rotas `[spaceId]`, exames |
| `notes-app/main-screenshots-readme/` | branch `main` | Galeria com a home de old-2 a old-11 |
| `shadcn-firebase-template/` | branch `main` | Template Next.js + shadcn + Firebase Auth + i18n |
| `shadcn-template/` | branch `main` | Template Next.js + shadcn + next-intl (sem Firebase) |

Capturas de tela geradas rodando o protótipo: `exams-app-antigo-2/capturas/`. As capturas históricas do notes-app estão em `notes-app/main-screenshots-readme/screenshots/`.

Não rodei os apps Next.js (exige `pnpm install` e Firebase); só o protótipo estático foi aberto e capturado.
