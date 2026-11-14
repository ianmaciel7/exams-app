# Agent instructions

Exam App: study app for exams (certifications and Brazilian public-service exams).

## Mandatory synchronization with Claude Cloud & Live Artifact

All agents working in this repository must keep the codebase and the live Claude artifact synchronized with the active remote Claude Cloud session:

- **Active project thread:** https://claude.ai/code/project/chan_013qMDV6HM5kW8Z4atVzkN6s?thread=cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu
- **Remote tracking branch:** `origin/claude/project-thread-6zihkn` (and other `origin/claude/project-thread-*` branches).
- **Live prototype artifact:** https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC (slug: `a728ae48-3fa2-4dbf-9092-0392c90b58f7`).

### Synchronization procedure:
1. **Fetch & Align Git Branches**:
   - Always run `git fetch origin` before starting and inspect remote branches.
   - If Claude pushed new commits remotely, merge/rebase them into `dev`.
   - **Automated Branch Mirroring:** Both local git hooks (`.githooks/post-commit`, `post-merge`) and GitHub Actions (`.github/workflows/sync-artifact.yml`) automatically mirror every commit/merge on `dev` directly to `origin/claude/project-thread-6zihkn`. Manual push is only needed as a fallback: `git push origin dev:claude/project-thread-6zihkn`.
2. **Sync the Live Claude Artifact (Zero-Token CLI & Automated Hooks)**:
   - **Automated Git Hooks:** Git hooks are configured in `.githooks/` (`post-commit` and `post-merge`). Whenever `prototypes/exam-app-0.1.1/index.html` is committed or merged/pulled on `dev`, the hook runs `sync:artifact` automatically. Enable in any clone with:
     ```bash
     npm run setup:hooks # or: git config core.hooksPath .githooks
     ```
   - **Automated CI (GitHub Actions):** `.github/workflows/sync-artifact.yml` runs on push to `dev` whenever `prototypes/exam-app-0.1.1/index.html` changes. If `CLAUDE_ARTIFACT_TOKEN` is set in GitHub repository secrets, CI deploys the artifact automatically on merge.
   - **Manual deploy command:**
     ```bash
     npm run sync:artifact
     ```
   - *How it works:* Uses `claude-artifact-cli` (`uvx --from claude-artifact-cli claude-artifact publish --mode patch --url https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC prototypes/exam-app-0.1.1/index.html`).
   - *Why it's critical:* It calls Anthropic's direct frame deploy API (`/api/frame/deploy/direct`) using the local machine's existing Claude login token. It requires **zero model generation tokens**, **no paid API keys**, and **bypasses the 5-hour chat rate limit** completely.
   - *Verify status:*
     ```bash
     uvx --from claude-artifact-cli claude-artifact status --url https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC prototypes/exam-app-0.1.1/index.html
     ```

## Planning board, evidence capture, and memory preservation (MANDATORY)

- **Mandatory rule — Zero Information Loss:** Everything captured as evidence during any task — including browser screenshots, live reference app inspections (e.g., Capacities, QConcursos), historical branch/archive comparisons (`docs/archives/`), measured DOM/CSS metrics, UI/UX regressions, and architectural decisions — **MUST be immediately persisted in two places**:
  1. **The Planning Board:** Add structured cards/containers and image references to `prototypes/board-exam-app/board.json`, copy all screenshot/evidence files into `prototypes/board-exam-app/assets/`, and regenerate `prototypes/board-exam-app/BOARD.md` using `npm run board`.
  2. **GitHub Issues & Pull Requests:** Open or update corresponding GitHub Issues (`gh issue create` / `gh issue comment`) and Pull Requests (`gh pr create`) documenting the evidence, file paths, and acceptance criteria, and land the board updates into `dev` via PR so no evidence or context is ever lost between sessions or AI assistants.
- `board.json` is the source of truth; never edit `BOARD.md` by hand. Regenerate it with `npm run board`.
- **Zero-Emoji UI Policy (Issue #42):** Never use Unicode emojis in the application UI, buttons, headers, badges, or KPIs; always use clean monochrome or semantic vector `<svg>` icons (`stroke-width: 1.75`–`1.9`).

## Run the prototype (any tool)

The prototypes are static HTML. No build step, no dependencies beyond Python 3.

```bash
npm run dev          # or: python -m http.server 8765 --directory prototypes
npm run sync:artifact # publishes 0.1.1 directly to the live Claude artifact
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

## Claude Artifact Sync (Zero-Token CLI)

- The live Claude artifact at `https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC` can be updated directly from `prototypes/exam-app-0.1.1/index.html` without burning model tokens, prompts, or waiting for 5-hour rate limits:
  ```bash
  npm run sync:artifact
  ```
- This uses `uvx --from claude-artifact-cli claude-artifact publish --mode patch` which uses the machine's cached Claude OAuth token to patch the artifact via Anthropic's direct frame deploy API (`/api/frame/deploy/direct`).

## Other

### Zero Emoji Policy for UI

- Do not use Unicode emoji in the interface, controls, badges, metrics, empty states, or UI specifications. Use semantic, monochrome inline SVG icons with `currentColor`, `stroke-width="1.8"`, rounded caps, and rounded joins.
- Before finishing a UI change, scan the affected interface files for emoji and pictographic symbols.

- Design and planning material: `prototypes/README.md`.
- Archived legacy code is in `docs/archives/` (see `docs/archives/REUSE-MAP.md` on the `chore/project-tooling` branch).

## Recovering context and session history across AI agents

When continuing work across different AI agents or recovering context from past discussions, check these locations:

### Claude (Claude Code CLI, Desktop & Cloud)
- **CLI transcripts**:
  - `~/.claude/projects/<project-slug>/<session-id>.jsonl` — Full per-session logs (prompts, tool calls, thinking, outputs).
  - `~/.claude/history.jsonl` — Global command history.
- **Desktop App state & cache (LevelDB/IndexedDB)**:
  - `%LOCALAPPDATA%\Claude-Data\claude_pzs8sxrjxfjjc\claude-code-sessions\`
  - `%LOCALAPPDATA%\Claude-Data\...\Local Storage\leveldb\`
  - `%LOCALAPPDATA%\Claude-Data\...\IndexedDB\`
- **Project auto-memory**:
  - `~/.claude/projects/<project-slug>/memory/MEMORY.md` and related topic markdown files (e.g. `cross-tool-session-recovery.md`).
- **Cloud branches & PRs**:
  - Cloud sessions push branches named: `origin/claude/project-thread-*`.
  - Active Cloud Thread: [chan_013qMDV6HM5kW8Z4atVzkN6s](https://claude.ai/code/project/chan_013qMDV6HM5kW8Z4atVzkN6s?thread=cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu) (message ID: `cmsg_013qMDV6HM5kW8Z4atVzkN6sK8bH1qZiXjDNuMib8czmAu`).
  - Check PRs and review comments via GitHub CLI:
    ```powershell
    gh pr list --state all
    gh pr view <num> --comments
    ```
- **Searching session messages/IDs with PowerShell**:
  ```powershell
  # Search transcripts or Desktop cache for a specific channel (chan_*) or message (cmsg_*) ID:
  Get-ChildItem -Path "$env:USERPROFILE\.claude\projects" -Filter "*.jsonl" -Recurse | Select-String -Pattern "cmsg_"
  Get-ChildItem -Path "$env:LOCALAPPDATA\Claude-Data" -Recurse -File | Select-String -Pattern "chan_"
  ```

### OpenAI Codex (CLI & App)
- **Session transcripts**:
  - `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` — Full timestamped session logs.
  - `~/.codex/archived_sessions/` — Compressed / archived past sessions.
- **Session index**:
  - `~/.codex/session_index.jsonl` — Quick index containing `id`, `thread_name`, and `updated_at`.
- **History & SQLite state**:
  - `~/.codex/history.jsonl` — Command history.
  - `~/.codex/state_5.sqlite` — Main application state.
  - `~/.codex/thread_history_1.sqlite` — Thread interaction database.
- **Isolated worktrees**:
  - `~/.codex/worktrees/` — Working copies and checkouts managed by Codex.

### Google Gemini (Antigravity & Gemini CLI)
- **Conversation transcripts**:
  - Compact transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`
  - Full transcript: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`
- **Project memories via Serena MCP**:
  - `.serena/memories/*.md` (e.g. `.serena/memories/cross-tool-session-recovery.md`, `archives-reuse-map.md`)

## UX/UI — contrato de implementação para agentes (MANDATORY)

**Antes de desenhar ou alterar uma tela, leia [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) e [docs/ux/arquitetura-informacao-navegacao.md](docs/ux/arquitetura-informacao-navegacao.md).** O catálogo distingue normas, estudos, heurísticas e padrões: não transforme uma heurística em lei universal. Preserve todas as políticas de sincronização, board.json e ícones SVG deste arquivo.

### Navegação e tarefas
1. **MUST** oferecer caminhos descobríveis para as tarefas primárias: Questões, Simulados e Revisão; não exigir conhecer Tipos de Objeto.
2. **MUST** fazer cada CTA executar o destino prometido; Revisar erradas deve abrir um conjunto efetivamente filtrado.
3. **MUST** manter nomes e comportamento consistentes entre Home, sidebar, banco e contexto do concurso.
4. **MUST** preservar filtros, seleção, posição e retorno quando a tarefa exigir; preferir estado compartilhável na URL quando seguro.
5. **SHOULD** separar ficha de objeto (metadados e relações) de fluxo de estudo (responder, corrigir, avançar), sem duplicar banco de dados.
6. **AVOID** impor a regra dos três cliques, sete itens no menu ou mínimo de páginas sem evidência de teste.

### Conteúdo, páginas e componentes
7. **MUST** identificar propósito da página, contexto e ação primária no primeiro viewport, sem exigir que todo conteúdo caiba acima da dobra.
8. **SHOULD** priorizar enunciado, alternativas e resposta em resolução; propriedades avançadas são secundárias.
9. **MUST** escolher página, tabs, accordion, drawer, modal ou wizard conforme a tarefa; registrar justificativa em mudanças relevantes.
10. **AVOID** tabs para etapas sequenciais, modais para formulários longos e accordion para esconder conteúdo indispensável.
11. **SHOULD** usar paginação ou navegação por questão quando posição, retorno e compartilhamento importarem.
12. **MUST** fornecer estados de carregamento, vazio, erro, indisponibilidade, sucesso e recuperação para operações críticas.

### Filtros, formulários e dados
13. **MUST** exibir escopo, quantidade, filtros ativos, remoção individual e opção de limpar no banco de questões.
14. **MUST** manter uma definição consistente de questão, status e origem entre prática, simulado, cadernos e revisão.
15. **MUST** usar labels persistentes e mensagens de validação claras; não depender só de placeholder.
16. **MUST** proteger respostas e tentativas contra perda acidental; confirmar somente ações realmente irreversíveis.
17. **SHOULD** permitir atalhos e filtros salvos sem esconder controles básicos dos iniciantes.

### Acessibilidade e responsividade
18. **MUST** testar tarefas essenciais apenas com teclado, ordem de foco, foco visível e foco não encoberto.
19. **MUST** verificar critérios WCAG 2.2 AA aplicáveis, inclusive contraste, nome/papel/valor, labels, reflow e mensagens de status.
20. **MUST** conferir alvo mínimo WCAG 2.2 2.5.8 (24×24 CSS px ou exceção válida); não tratar 44×44 como mínimo AA universal.
21. **MUST** comunicar correto/incorreto e seleção sem depender exclusivamente de cor.
22. **MUST** implementar semântica e teclado apropriados para tabs, dialogs e accordions, seguindo WAI-ARIA APG.
23. **MUST** garantir uso em viewport estreita e zoom sem sobreposição de conteúdo, controles ou foco.
24. **MUST** seguir a política existente de ícones SVG sem emojis na interface.

### Evidência, validação e entrega
25. **MUST** registrar o fluxo antes/depois e o critério verificável de aceite para qualquer mudança de navegação.
26. **MUST** validar com cenários de erro, lentidão, interrupção, retorno, teclado e mobile; declarar limites dos testes.
27. **SHOULD** usar primeiro clique, teste de árvore e teste de tarefas para decisões controversas; não otimizar só contagem de cliques.
28. **MUST** classificar achados P0 (bloqueio), P1 (alta) ou P2 (evolução), justificando exceções.
29. **MUST** registrar evidências visuais reais em board.json, regenerar BOARD.md com npm run board e vincular issues/PRs conforme a política acima.
30. **AVOID** declarar conformidade WCAG, superioridade sobre concorrentes ou melhoria de métricas sem medição verificável.

**Fontes-base:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [10 heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), [GOV.UK Design System](https://design-system.service.gov.uk/patterns/), [USWDS](https://designsystem.digital.gov/components/step-indicator/) e o catálogo com fontes independentes em docs/ux/ux-ui-principles.md.
