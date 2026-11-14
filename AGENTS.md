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

- **Mandatory rule — Zero Information Loss:** Everything captured as evidence during any task — including browser screenshots, live reference app inspections (e.g., Capacities, QConcursos, Readwise, Readwise Reader), historical branch/archive comparisons (`docs/archives/`), measured DOM/CSS metrics, UI/UX regressions, and architectural decisions — **MUST be immediately persisted in two places**:
  1. **The Planning Board:** Add structured cards/containers and image references to `prototypes/board-exam-app/board.json`, copy all screenshot/evidence files into `prototypes/board-exam-app/assets/`, and regenerate `prototypes/board-exam-app/BOARD.md` using `npm run board`.
  2. **GitHub Issues & Pull Requests:** Open or update corresponding GitHub Issues (`gh issue create` / `gh issue comment`) and Pull Requests (`gh pr create`) documenting the evidence, file paths, and acceptance criteria, and land the board updates into `dev` via PR so no evidence or context is ever lost between sessions or AI assistants.
- `board.json` is the source of truth; never edit `BOARD.md` by hand. Regenerate it with `npm run board`.
- **Zero-Emoji UI Policy (Issue #42):** Never use Unicode emojis in the application UI, buttons, headers, badges, or KPIs; always use clean monochrome or semantic vector `<svg>` icons (`stroke-width: 1.75`–`1.9`).

### Evidence management & AI-readable documentation protocol (MANDATORY)

Screenshots alone are **insufficient** because future AI agents (or text-only contexts) may read `BOARD.md` or repository files without inspecting every PNG, and trial access to reference SaaS apps (e.g., Readwise, Reader, QConcursos, Capacities) may expire. Every evidence capture MUST obey the following rules:

1. **Dual Representation (Visual + Textual/Structural for AI Agents):**
   - Never register a screenshot without a rich textual specification that another AI can parse to reconstruct the screen, its controls, and its behavior without seeing the image.
   - Alongside `board.json` / `BOARD.md`, persist deep technical dossiers (such as `prototypes/board-exam-app/READWISE_DOSSIER.md`) containing:
     - All visited routes/URLs and navigation hierarchy.
     - Literal button labels, hover states, tooltips, dropdown items, and keyboard shortcuts.
     - Exact schemas, query grammars (e.g., boolean filter queries), template variables/subroutines (e.g., Jinja2 prompts), and algorithm parameters.
     - Raw DOM / ARIA accessibility tree snapshots (`browser_sandbox/outputs/step_*.json`) extracted during inspection.
2. **Mandatory Screenshot Integrity Verification (No Blank/Skeleton Captures):**
   - SPAs frequently render blank dark/light canvases (`~3 KB` PNGs) during initial hydration or route transitions.
   - **Rule:** Before copying any screenshot to `prototypes/board-exam-app/assets/` or referencing it in `board.json`, **always verify file size (`> 10 KB`) and visually inspect the image** (`read_file`) to confirm the UI widgets, modals, or lists are actually rendered (and not a `404` or loading skeleton).
3. **board_to_md.py Container Geometry & Ownership Contract:**
   - `prototypes/board-exam-app/board_to_md.py` assigns an element `e` to a `container` `c` **only if the geometric center `(e.x + e.w/2, e.y + e.h/2)` falls strictly inside `(c.x .. c.x + c.w, c.y .. c.y + c.h)`**, and every element ID must also be listed in `board.json`'s `"order"` array.
   - Whenever adding new evidence cards to a container in `board.json`, resize the container's `w` and `h` to encompass all child elements, append all new IDs to `"order"`, and run `npm run board` to verify that `BOARD.md` includes every new card under the expected section header.
4. **Direct Extraction from Browser Sandbox Disk (Zero-Quota Recovery):**
   - Browser subagents automatically persist every screenshot and DOM output on disk before returning:
     - Screenshots: `~/.gemini/antigravity/brain/<subagent-id>/browser_sandbox/screenshots/step_*.png`
     - DOM/Script outputs: `~/.gemini/antigravity/brain/<subagent-id>/browser_sandbox/outputs/step_*.json`
     - Full logs: `~/.gemini/antigravity/brain/<subagent-id>/.system_generated/logs/transcript_full.jsonl`
   - If a browser subagent hits a model rate limit (`RESOURCE_EXHAUSTED` / HTTP 429) or stops mid-run, **never lose or re-run the work already done**: immediately harvest all `.png` and `.json` files directly from `browser_sandbox/` via shell/Python scripts without invoking new subagents.

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

**Antes de desenhar ou alterar uma tela, leia [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) e [docs/ux/arquitetura-informacao-navegacao.md](docs/ux/arquitetura-informacao-navegacao.md). Para criar ou alterar animações, leia também [MOTION.md](MOTION.md).** O catálogo distingue normas, estudos, heurísticas e padrões: não transforme uma heurística em lei universal. Preserve todas as políticas de sincronização, board.json e ícones SVG deste arquivo.

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

### Movimento e animações (MANDATORY)

**Fonte canônica:** [MOTION.md](MOTION.md) contém os **12 princípios clássicos de animação adaptados para UI**, regras modernas de motion, tokens de duração/easing existentes, física do grafo, acessibilidade, exemplos por fluxo e referências consultadas via **Context7** (MDN e Motion) e skill **Impeccable — Animate**. Os 12 princípios são técnicas artísticas históricas, **não leis universais nem critérios WCAG**.

- **MUST** justificar animação por feedback, mudança de estado, continuidade espacial ou hierarquia; **AVOID** animação puramente decorativa em Questões, Simulados e Revisão.
- **MUST** preservar seleção, resposta, tempo útil, foco, hitbox, rolagem e dados; animação **não** pode atrasar envio, fechamento, navegação nem recuperação de erros.
- **MUST** oferecer caminho intencional para `prefers-reduced-motion: reduce` em CSS e em animações por JS/canvas; preservar feedback sem exigir deslocamento espacial. Verificar **WCAG 2.2 2.3.1 e 2.2.2 (A)** quando aplicáveis; **2.3.3 é AAA**, não AA.
- **MUST** tornar transições interrompíveis/reversíveis, sem filas e sem bloquear teclado, Escape, foco ou leitor de tela. Pausar loops quando invisíveis e limitar consumo de CPU/bateria.
- **SHOULD** reutilizar os tokens de `MOTION.md`, escolhendo easing/duração pela tarefa e testando em mobile; preferir CSS/WAAPI quando bastarem e **não** instalar Motion/React só por um efeito.
- **AVOID** tratar 60/120/200/350/500 ms como SLAs, impor física contínua em todo lugar, proibir `linear` universalmente, animar propriedades de layout sem medição ou aplicar resets globais de animação sem avaliar perda de feedback.
- **MUST** testar com movimento normal e reduzido, teclado, cliques rápidos/repetidos, latência, aba oculta e viewport estreita; registrar evidência e limites no PR.

**Índice dos 12 princípios (não normativos):** Squash and Stretch; Anticipation; Staging; Straight Ahead Action and Pose to Pose; Follow Through and Overlapping Action; Slow In and Slow Out; Arcs; Secondary Action; Timing; Exaggeration; Solid Drawing; Appeal. Tradução, uso apropriado, anti-padrões e exemplos estão em [MOTION.md](MOTION.md).

### Evidência, validação e entrega
25. **MUST** registrar o fluxo antes/depois e o critério verificável de aceite para qualquer mudança de navegação.
26. **MUST** validar com cenários de erro, lentidão, interrupção, retorno, teclado e mobile; declarar limites dos testes.
27. **SHOULD** usar primeiro clique, teste de árvore e teste de tarefas para decisões controversas; não otimizar só contagem de cliques.
28. **MUST** classificar achados P0 (bloqueio), P1 (alta) ou P2 (evolução), justificando exceções.
29. **MUST** registrar evidências visuais reais em board.json, regenerar BOARD.md com npm run board e vincular issues/PRs conforme a política acima.
30. **AVOID** declarar conformidade WCAG, superioridade sobre concorrentes ou melhoria de métricas sem medição verificável.

**Fontes-base:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [10 heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), [GOV.UK Design System](https://design-system.service.gov.uk/patterns/), [USWDS](https://designsystem.digital.gov/components/step-indicator/) e o catálogo com fontes independentes em docs/ux/ux-ui-principles.md.

<!-- UX-LAWS-CATALOG:START -->
## Catálogo de leis, heurísticas e normas de UI/UX — referência obrigatória

Este catálogo fornece os **nomes originais** (em inglês, quando publicados assim), traduções e descrições curtas para que agentes fundamentem decisões de UI/UX. **Antes de desenhar, alterar ou auditar uma tela**, consultar este catálogo, as regras obrigatórias anteriores deste AGENTS.md e os dossiês [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) e [docs/ux/arquitetura-informacao-navegacao.md](docs/ux/arquitetura-informacao-navegacao.md). Não substituir a evidência do board e das issues por citações teóricas.

**Grau de autoridade:** Laws of UX é um catálogo editorial de 30 leis/efeitos/modelos/heurísticas — nem todos são leis científicas. Gestalt são princípios perceptivos sem rol oficial único. Nielsen e Shneiderman são conjuntos de heurísticas. ISO são normas (observar edição, escopo e licenciamento). WCAG contém critérios de sucesso testáveis. Boas práticas de design systems **não** são requisitos normativos por si sós.

**Regra para uso em issue/PR:** indicar qual princípio foi aplicado, por quê, efeito esperado, cenário reproduzível de teste, limites e exceções. Não impor números mágicos de 3 cliques, 7 itens, 400 ms ou 80/20. Priorizar acessibilidade, preservação de dados, segurança, sucesso da tarefa e evidências com usuários. Não declarar conformidade WCAG sem auditoria dos critérios aplicáveis.

### Pesquisa Profunda — 20 bibliotecas de referência (14/11/2026)

- **MUST** consultar [docs/ux/pesquisa-20-fontes-2026-11.md](docs/ux/pesquisa-20-fontes-2026-11.md) ao pesquisar novas leis/princípios ou ao justificar decisões de UI/UX; o documento reúne os **20 URLs solicitados**, síntese aplicada, matriz de testes e limitações de cobertura.
- **MUST** usar o inventário de **30 entradas de Laws of UX** e as demais famílias abaixo como índice de nomes, com [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) como catálogo de **86 itens aplicados**. Não duplicar listas só para aumentar a contagem.
- **MUST** distinguir uma norma obrigatória de um estudo, modelo psicológico, heurística, catálogo agregador e padrão de plataforma. Uma URL listada não comprova que todas as entradas daquele site foram verificadas.
- **MUST** testar tarefas reais (descobrir Questões, resolver, simular, retomar e revisar) antes de declarar sucesso de uma recomendação; documentar comportamento observado, estados de erro/loading e limites.
- **AVOID** aplicar indiscriminadamente "7 itens", "3 cliques", "400 ms", "tudo na mesma página", "somente 1 CTA" ou "proibido usar bordas". Decisões dependem de contexto, foco, acessibilidade, dados e testes.
- **MUST** preservar as políticas de sincronização, evidências/board, SVG sem emojis e a integridade das tentativas já definidas neste AGENTS.md.

### 1. Laws of UX — 30 conceitos

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Aesthetic-Usability Effect | Efeito estética-usabilidade | Interfaces atraentes podem parecer mais fáceis de usar; aparência não demonstra usabilidade. |
| Choice Overload | Sobrecarga de escolhas | Muitas alternativas podem dificultar decidir; agrupar e priorizar as relevantes. |
| Chunking | Agrupamento em blocos | Unir informações em unidades significativas facilita compreensão e recordação. |
| Cognitive Bias | Viés cognitivo | Tendências sistemáticas de julgamento influenciam escolhas; evitar manipulação. |
| Cognitive Load | Carga cognitiva | Esforço mental necessário para entender e utilizar uma interface; reduzir esforço desnecessário. |
| Doherty Threshold | Limiar de Doherty | Resposta rápida e feedback preservam continuidade; 400 ms não é SLA universal. |
| Fitts’s Law | Lei de Fitts | Tamanho e distância do alvo afetam velocidade de seleção; ampliar áreas clicáveis. |
| Flow | Estado de fluxo | Concentração profunda em atividade com desafios adequados e pouca interrupção. |
| Goal-Gradient Effect | Efeito gradiente de objetivo | Proximidade de uma meta pode elevar motivação; apresentar progresso verdadeiro. |
| Hick’s Law | Lei de Hick | Mais opções e maior complexidade podem elevar tempo de decisão; não prescreve tamanho fixo de menu. |
| Jakob’s Law | Lei de Jakob | Experiências anteriores moldam expectativas; empregar padrões familiares quando pertinentes. |
| Law of Common Region | Lei da região comum | Elementos dentro de uma região delimitada são percebidos como grupo. |
| Law of Proximity | Lei da proximidade | Elementos próximos parecem relacionados; usar espaçamento semântico. |
| Law of Prägnanz | Lei da boa forma | Percepção tende a organizar estímulos em estruturas simples e estáveis. |
| Law of Similarity | Lei da similaridade | Elementos semelhantes em aparência parecem pertencer ao mesmo conjunto. |
| Law of Uniform Connectedness | Lei da conexão uniforme | Elementos visualmente conectados são percebidos como relacionados. |
| Mental Model | Modelo mental | Ideia que o usuário tem do funcionamento do sistema; alinhar rótulos e fluxos ao modelo observado. |
| Miller’s Law | Lei de Miller | Pesquisa sobre limites da memória imediata; não é regra de 7 opções de navegação. |
| Occam’s Razor | Navalha de Occam | Entre explicações adequadas, privilegiar a que requer menos suposições. |
| Paradox of the Active User | Paradoxo do usuário ativo | Usuários começam a experimentar antes de ler instruções; permitir exploração segura. |
| Pareto Principle | Princípio de Pareto | Pequena parte das causas pode concentrar efeitos; verificar dados e não presumir 80/20. |
| Parkinson’s Law | Lei de Parkinson | Trabalho pode se expandir para preencher prazo disponível; definir escopo e conclusão. |
| Peak-End Rule | Regra do pico-fim | Momentos intensos e encerramento influenciam lembrança retrospectiva. |
| Postel’s Law | Lei de Postel | Princípio histórico de robustez; tolerância a entradas exige limites de segurança. |
| Selective Attention | Atenção seletiva | Pessoas priorizam estímulos relevantes para a tarefa e ignoram concorrentes. |
| Serial Position Effect | Efeito de posição serial | Início e fim de uma sequência podem ser mais lembrados. |
| Tesler’s Law | Lei de Tesler | Parte da complexidade é inerente à tarefa; não a esconder de modo que cause erro. |
| Von Restorff Effect | Efeito Von Restorff | Item distinto se destaca e pode ser mais lembrado. |
| Working Memory | Memória de trabalho | Capacidade limitada para manter/manipular informações temporárias; preservar contexto visível. |
| Zeigarnik Effect | Efeito Zeigarnik | Tarefas inacabadas podem ficar mais salientes; facilitar retomada sem pressionar usuários. |

Fonte: https://lawsofux.com/laws/ — lista editorial de 30 entradas, distribuídas em três páginas.

### 2. Gestalt — 10 princípios perceptivos frequentes

| Nome original (uso corrente) | Português | Definição e aplicação |
|---|---|---|
| Proximity | Proximidade | Elementos espacialmente próximos parecem formar um grupo. |
| Similarity | Similaridade | Elementos com aparência semelhante parecem relacionados. |
| Good Continuation | Boa continuidade | Alinhamento e continuidade ajudam acompanhar uma sequência. |
| Closure | Fechamento | A percepção completa formas parcialmente apresentadas. |
| Figure-Ground | Figura-fundo | Separar objeto focal e fundo sustenta hierarquia perceptiva. |
| Common Fate | Destino comum | Elementos que se movem juntos parecem pertencer ao mesmo conjunto. |
| Common Region | Região comum | Contornos ou regiões agrupam objetos visualmente. |
| Symmetry and Order | Simetria e ordem | Organização equilibrada pode facilitar reconhecimento. |
| Prägnanz (Good Form) | Boa forma | A percepção procura formas simples e estáveis. |
| Uniform Connectedness | Conexão uniforme | Linhas e conexões comunicam associação. |

**Nota:** enumeração didática; não afirmar que exista uma lista normativa fechada de exatamente dez princípios da Gestalt. Parte deles reaparece em Laws of UX.

### 3. Nielsen — 10 Usability Heuristics for User Interface Design

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Visibility of System Status | Visibilidade do estado do sistema | Feedback adequado sobre progresso, resultado e falhas. |
| Match Between the System and the Real World | Correspondência com o mundo real | Empregar conceitos e linguagem reconhecíveis para estudantes. |
| User Control and Freedom | Controle e liberdade | Permitir cancelar, voltar ou desfazer quando possível. |
| Consistency and Standards | Consistência e padrões | Mesma terminologia e interação para funções equivalentes. |
| Error Prevention | Prevenção de erros | Evitar erros previsíveis antes do envio. |
| Recognition Rather Than Recall | Reconhecimento em vez de memorização | Mostrar opções e contexto sem exigir lembrança de passos anteriores. |
| Flexibility and Efficiency of Use | Flexibilidade e eficiência | Oferecer caminhos acessíveis a iniciantes e atalhos a experientes. |
| Aesthetic and Minimalist Design | Estética e minimalismo | Priorizar o conteúdo necessário; não esconder informações indispensáveis. |
| Help Users Recognize, Diagnose, and Recover from Errors | Reconhecer, diagnosticar e recuperar de erros | Explicar problema, causa útil e próximo passo preservando dados. |
| Help and Documentation | Ajuda e documentação | Oferecer apoio contextual localizável e claro. |

Fonte: https://www.nngroup.com/articles/ten-usability-heuristics/

### 4. Shneiderman — The Eight Golden Rules of Interface Design

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Strive for Consistency | Buscar consistência | Manter ações, linguagem e estilo consistentes. |
| Seek Universal Usability | Buscar usabilidade universal | Considerar experiência, dispositivos, diversidade e necessidades especiais. |
| Offer Informative Feedback | Oferecer feedback informativo | Resposta proporcional à importância da ação. |
| Design Dialogs to Yield Closure | Criar diálogos com encerramento | Indicar o término reconhecível de uma sequência de ações. |
| Prevent Errors | Prevenir erros | Impedir falhas e orientar recuperação construtiva. |
| Permit Easy Reversal of Actions | Permitir reversão fácil | Viabilizar desfazer e correções sem perda desnecessária. |
| Keep Users in Control | Manter usuários no controle | Não surpreender ou impedir autonomia sem justificativa. |
| Reduce Short-Term Memory Load | Reduzir a carga de memória imediata | Evitar exigir lembrança de detalhes entre telas. |

Fonte original do autor: https://www.cs.umd.edu/users/ben/goldenrules.html

### 5. ISO 9241-110:2020 — 7 Interaction Principles

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Suitability for the User’s Tasks | Adequação às tarefas | Apoiar objetivos reais, com esforço proporcional. |
| Self-Descriptiveness | Autodescrição | Tornar ação e estado compreensíveis no contexto. |
| Conformity with User Expectations | Conformidade com expectativas | Respostas previsíveis segundo convenções e contexto. |
| Learnability | Facilidade de aprendizagem | Favorecer descoberta, exploração e retenção. |
| Controllability | Controlabilidade | Permitir interrupção e direcionamento pelo usuário. |
| Use Error Robustness | Robustez a erros de utilização | Prevenir, tolerar e recuperar erros. |
| User Engagement | Envolvimento do usuário | Apoiar confiança, participação e motivação. |

Fonte: https://www.iso.org/standard/75258.html (edição de 2020, confirmada em 2025).

### 6. ISO 9241-112:2025 — 6 Principles for the Presentation of Information

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Detectability | Detectabilidade | Informações e controles importantes devem ser perceptíveis. |
| Discriminability | Distinguibilidade | Diferenciar grupos, estados e objetos sem ambiguidades. |
| Conciseness | Concisão | Evitar conteúdo ou passos que não acrescentem valor. |
| Unambiguous Interpretability | Interpretabilidade inequívoca | Informação deve ter sentido compreensível e claro. |
| Freedom from Distraction | Ausência de distrações | Reduzir interferências concorrentes na tarefa. |
| Consistency (Internal and External) | Consistência interna e externa | Preservar organização lógica e convenções conhecidas. |

Fonte: https://www.iso.org/standard/87518.html (edição de 2025, substitui 2017).

### 7. ISO 9241-210:2019 — 6 princípios de Human-Centred Design

| Princípio (rótulo descritivo em inglês) | Português | Definição e aplicação |
|---|---|---|
| Explicit Understanding of Users, Tasks, and Environments | Compreensão explícita | Basear o design em usuários, tarefas e ambientes. |
| User Involvement Throughout Design and Development | Envolvimento de usuários | Incluir usuários ao longo do processo. |
| User-Centred Evaluation Drives and Refines Design | Avaliação centrada no usuário | Avaliações devem orientar revisões. |
| Iterative Process | Processo iterativo | Investigar, projetar, testar e refinar. |
| Address the Whole User Experience | Experiência completa | Considerar jornada, contexto e resultados. |
| Multidisciplinary Skills and Perspectives | Perspectivas multidisciplinares | Integrar competências e pontos de vista diferentes. |

**Nota:** estes rótulos são sínteses em inglês, **não uma alegação de transcrição literal dos títulos normativos**. Fonte: https://www.iso.org/standard/77520.html

### 8. ISO/IEC 25010:2023 — 9 Product Quality Characteristics

| Nome original | Português | Definição e aplicação |
|---|---|---|
| Functional Suitability | Adequação funcional | Funções atendem necessidades e objetivos. |
| Performance Efficiency | Eficiência de desempenho | Boa relação entre tempo, recursos e capacidade. |
| Compatibility | Compatibilidade | Coexistência e interoperabilidade. |
| Interaction Capability | Capacidade de interação | Facilidade de aprender, operar, prevenir erros e receber ajuda. |
| Reliability | Confiabilidade | Disponibilidade, tolerância a falhas e recuperação. |
| Security | Segurança da informação | Proteção de confidencialidade, integridade e autenticidade. |
| Maintainability | Manutenibilidade | Capacidade de modificar e testar de forma sustentável. |
| Flexibility | Flexibilidade | Adaptação, escalabilidade e substituição. |
| Safety | Segurança contra danos | Redução de riscos e efeitos prejudiciais. |

Fonte: https://www.iso.org/standard/78176.html (2023; Safety é diferente de Security).

### 9. WCAG 2.2 — 4 princípios, 13 diretrizes

| Princípio oficial | Diretriz oficial | Português e aplicação |
|---|---|---|
| Perceivable | 1.1 Text Alternatives | Alternativas textuais para conteúdo não textual. |
| Perceivable | 1.2 Time-based Media | Alternativas para áudio e vídeo. |
| Perceivable | 1.3 Adaptable | Conteúdo preserva significado em apresentações diversas. |
| Perceivable | 1.4 Distinguishable | Separação, contraste e legibilidade do conteúdo. |
| Operable | 2.1 Keyboard Accessible | Operação por teclado. |
| Operable | 2.2 Enough Time | Tempo suficiente para interagir. |
| Operable | 2.3 Seizures and Physical Reactions | Evitar estímulos que provoquem crises e reações. |
| Operable | 2.4 Navigable | Localização, navegação, headings e foco. |
| Operable | 2.5 Input Modalities | Entradas alternativas ao teclado. |
| Understandable | 3.1 Readable | Leitura e idioma compreensíveis. |
| Understandable | 3.2 Predictable | Comportamento previsível. |
| Understandable | 3.3 Input Assistance | Ajuda com entrada de dados e erros. |
| Robust | 4.1 Compatible | Compatibilidade com tecnologias assistivas. |

Fonte normativa: https://www.w3.org/TR/WCAG22/ . Consultar **cada critério de sucesso aplicável** (A/AA/AAA), exceções e métodos de teste em https://www.w3.org/WAI/WCAG22/quickref/ . Estas 13 diretrizes **não substituem** os critérios de sucesso.

### 10. Práticas complementares de interface — não são leis universais

| Área | Práticas a avaliar conforme tarefa e contexto |
|---|---|
| Arquitetura da informação e navegação | Arquitetura e hierarquia do conteúdo; modelos mentais; taxonomia; ontologia; navegação global/local/contextual; breadcrumbs; divulgação progressiva; orientação por tarefas; encontrabilidade; rotulagem; pesquisa; filtros/facetas; ordenação; agrupamento; preservação de contexto; card sorting; tree testing. |
| Design visual | Hierarquia visual; equilíbrio; contraste; proporção; alinhamento; ritmo; espaço negativo; densidade; tipografia; escala; legibilidade; leiturabilidade; cores semânticas; design tokens; espaçamento; grid; ênfase; agrupamento; consistência; ícones; affordances; bordas/divisores; responsividade e adaptação. |
| Interação | Affordances; signifiers; feedback; mapeamento natural; restrições; controle; desfazer/refazer; prevenção e recuperação de erros; confirmação destrutiva; estados de loading/vazio/sucesso/erro/indisponibilidade/parcial; microinterações; animações funcionais; continuidade; transições; manipulação direta; previsibilidade; atalhos; etapas mínimas necessárias. |
| Formulários e dados | Labels persistentes; agrupamento; input correto; validação contextual/oportuna; erros acionáveis; valores preservados; autocomplete; defaults; máscaras úteis; campos obrigatórios; prevenção de envio duplicado; envio assíncrono; feedback de sucesso; recuperação; etapas justificadas; retomada; evitar perda de dados. |
| Estados, desempenho e confiabilidade | Percepção de desempenho; progresso; loading contextual; skeleton; timeout; retry limitado; cancelamento; offline; degradação controlada; mensagens de erro; falhas parciais; preservação de trabalho; continuidade; indicadores de operação longa; estados coerentes em todas as rotas. |
| Acessibilidade, i18n e inclusão | HTML semântico; WAI-ARIA; ARIA APG; teclado e foco; tecnologias assistivas; contraste; zoom/reflow; alvos motores; clareza cognitiva; Unicode; BCP 47; ECMA-402; localização; direção LTR/RTL; linguagem inclusiva. |
| Design systems (referências, não obrigações universais) | Material Design 3; Apple Human Interface Guidelines; WAI-ARIA APG; GOV.UK Design System; IBM Carbon; Microsoft Fluent 2. |

**Fontes complementares oficiais:** https://www.w3.org/WAI/ARIA/apg/ ; https://m3.material.io/ ; https://developer.apple.com/design/human-interface-guidelines/ ; https://design-system.service.gov.uk/ ; https://carbondesignsystem.com/ ; https://fluent2.microsoft.design/ ; https://www.w3.org/International/ .

**Precedência:** acessibilidade verificável, integridade de dados, segurança e sucesso de tarefas prevalecem sobre heurísticas estéticas. Não generalizar heurísticas como leis determinísticas nem alegar testes ou conformidade sem evidências.
<!-- UX-LAWS-CATALOG:END -->
