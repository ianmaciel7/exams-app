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
- **MUST** usar as **30 entradas de Laws of UX**, as demais famílias e as **86 entradas aplicadas transcritas integralmente nas seções abaixo**, com [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) como espelho de manutenção. A repetição neste AGENTS.md é intencional para leitura autossuficiente por agentes.
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
### 11. Catálogo aplicado integral — 86 entradas com fonte e exceções (espelhado no AGENTS.md)

**Obrigatório para agentes:** as **86 entradas abaixo estão presentes integralmente neste próprio arquivo**, com classe, definição, regra para o Exam App, limites e fonte. São leis, modelos, heurísticas, padrões, normas, métricas e métodos de pesquisa — **não 86 leis científicas**. Este espelho é intencional para agentes que só recebem AGENTS.md como contexto. Documento de origem e manutenção: [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md). Atualizar ambos quando modificar qualquer entrada; preservar os 30 itens Laws of UX, as demais famílias e normas já listadas acima.

#### 11.1. Cognição, decisão e percepção

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 1 | Lei de Fitts | Estudo empírico | O tempo de apontar depende da distância e do tamanho do alvo. | Aumentar área clicável de Responder, Próxima e ações frequentes. | Não prediz toda a experiência; contexto motor e dispositivo importam. | [Fitts](https://doi.org/10.1037/h0055392) |
| 2 | Lei de Hick-Hyman | Estudo empírico | O tempo de escolha tende a crescer com quantidade e incerteza das alternativas. | Priorizar Questões e Simulados na Home sem ocultar caminhos necessários. | Não implica remover opções úteis ou impor número máximo de itens. | [Hick](https://doi.org/10.1080/17470215208416600), [Laws](https://lawsofux.com/) |
| 3 | Lei de Jakob | Heurística | Convenções aprendidas em outros produtos moldam expectativas. | Usar navegação, filtros e controles familiares. | Padrões externos não substituem pesquisa com estudantes. | [Laws](https://lawsofux.com/) |
| 4 | Lei de Tesler | Heurística | A complexidade inerente de uma tarefa não desaparece por esconder controles. | Simplificar criação de simulado sem omitir duração e origem das questões. | A complexidade deve ser alocada de modo compreensível, não negada. | [Laws](https://lawsofux.com/) |
| 5 | Miller e 7 ± 2 | Pesquisa histórica | O artigo descreve limites de processamento em tarefas específicas. | Agrupar filtros semanticamente, sem fixar sete itens no menu. | Não é limite universal de opções, navegação ou memória de trabalho. | [Miller](https://doi.org/10.1037/h0043158) |
| 6 | Carga cognitiva | Modelo teórico aplicado | Excesso de informações concorrentes dificulta compreender a tarefa. | Mostrar enunciado e alternativas antes de metadados extensos. | Densidade útil pode ser desejável para usuários experientes. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 7 | Divulgação progressiva | Heurística | Detalhes avançados aparecem quando se tornam relevantes. | Manter propriedades técnicas em painel secundário. | Não esconder o CTA principal nem informações de segurança. | [Progressive](https://www.nngroup.com/articles/progressive-disclosure/) |
| 8 | Reconhecimento em vez de lembrança | Heurística | Opções visíveis evitam exigir memorização de rotas ou comandos. | Mostrar ações de responder, revisar e simular no contexto. | Evitar poluição visual; priorizar o necessário. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 9 | Efeito de posição serial | Generalização psicológica | Início e fim de sequências podem receber mais atenção ou lembrança. | Colocar ações prioritárias em posições previsíveis. | Efeito depende da tarefa e não determina ordem fixa de menu. | [Laws](https://lawsofux.com/) |
| 10 | Regra do pico-fim | Generalização psicológica | Momentos intensos e o encerramento influenciam avaliação retrospectiva. | Fazer entrega de simulado e resultado serem claros e recuperáveis. | Não otimizar só a emoção final, negligenciando a jornada. | [Laws](https://lawsofux.com/) |
| 11 | Limiar de Doherty | Heurística histórica | Respostas rápidas e feedback sustentam continuidade da interação. | Exibir seleção, salvamento e carregamento sem silêncio. | Números históricos não são SLA universal; medir latência real. | [Laws](https://lawsofux.com/), [Vitals](https://web.dev/articles/vitals) |
| 12 | Efeito estética-usabilidade | Tendência perceptiva | Aparência agradável pode melhorar percepção inicial de facilidade. | Usar hierarquia e tipografia consistentes. | Beleza não corrige fluxos quebrados nem prova usabilidade. | [Laws](https://lawsofux.com/) |
| 13 | Efeito Zeigarnik | Hipótese contextual | Tarefas inacabadas podem permanecer salientes. | Oferecer Retomar simulado com progresso salvo. | Não usar pressão ou ansiedade para forçar retorno. | [Laws](https://lawsofux.com/) |
| 14 | Princípio de Pareto 80/20 | Heurística de priorização | Algumas tarefas podem concentrar uso ou valor. | Priorizar jornadas conforme telemetria e entrevistas. | A proporção 80/20 não é lei de distribuição de uso. | [Laws](https://lawsofux.com/) |

#### 11.2. Organização visual e Gestalt

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 15 | Proximidade | Princípio perceptivo | Elementos próximos tendem a ser percebidos como grupo. | Agrupar filtros por disciplina, banca e situação. | Proximidade não substitui títulos e semântica. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 16 | Similaridade | Princípio perceptivo | Aparência semelhante sugere função ou categoria semelhante. | Padronizar botões e estados das alternativas. | Diferenciar visualmente ações com consequências diferentes. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 17 | Região comum | Princípio perceptivo | Um contêiner pode comunicar agrupamento. | Delimitar filtros avançados e resumo do simulado. | Evitar caixas em excesso e ruído de bordas. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 18 | Continuidade | Princípio perceptivo | Alinhamentos e sequências favorecem leitura de percurso. | Alinhar enunciado, respostas, correção e próxima questão. | A ordem semântica do DOM deve acompanhar a visual. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 19 | Fechamento | Princípio perceptivo | Pessoas completam formas visuais incompletas. | Usar indicadores de progresso simples e legíveis. | Nunca depender só de formas implícitas para informação crítica. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 20 | Figura-fundo | Princípio perceptivo | Contraste ajuda distinguir elemento focal do entorno. | Dar prioridade visual à questão em resolução. | Manter contraste acessível, inclusive em dark mode. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles), [WCAG](https://www.w3.org/TR/WCAG22/) |
| 21 | Conexão uniforme | Princípio perceptivo | Linhas e conexões sugerem relação. | Indicar relações entre concurso, cargo e questões no grafo. | Conexões devem ter rótulos e alternativa textual. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |

#### 11.3. Dez heurísticas de Nielsen, individualmente

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 22 | H1 Visibilidade do status | Heurística | O sistema informa o que ocorreu e o que está acontecendo. | Mostrar questão salva, simulado em andamento e falha de carregamento. | Feedback deve ser proporcional, sem notificações excessivas. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 23 | H2 Correspondência com mundo real | Heurística | Vocabulário e ordem refletem o modelo mental do estudante. | Usar Questões, Simulados, Revisão em vez de exigir tipos de objeto. | Confirmar terminologia em pesquisa com usuários. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 24 | H3 Controle e liberdade | Heurística | A pessoa consegue sair, cancelar e desfazer quando apropriado. | Voltar ao banco sem perder filtros e retomar tentativa. | Nem toda operação pode ser desfeita após envio definitivo. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 25 | H4 Consistência e padrões | Heurística | A mesma ação e conceito mantêm nomes e comportamentos. | Unificar banco global e contextual, preservando diferenças justificadas. | Contextos diferentes podem exigir variantes explícitas. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 26 | H5 Prevenção de erros | Heurística | O projeto reduz chances de erros antes de acontecerem. | Confirmar entrega definitiva e evitar perda de respostas. | Não pedir confirmação para ações triviais. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 27 | H6 Reconhecimento, não recordação | Heurística | Informações relevantes ficam visíveis ou recuperáveis. | Mostrar filtros aplicados e contexto da questão. | Mostrar tudo ao mesmo tempo pode sobrecarregar. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 28 | H7 Flexibilidade e eficiência | Heurística | Iniciantes e experientes têm caminhos adequados. | Oferecer atalhos de teclado opcionais e filtros salvos. | Atalhos não substituem controles descobríveis. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 29 | H8 Estética e minimalismo | Heurística | O conteúdo secundário não compete com a tarefa principal. | Enunciado e alternativas dominam a tela de resolução. | Minimalismo não significa omitir dados essenciais. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 30 | H9 Recuperação de erros | Heurística | Mensagens explicam o problema e a ação corretiva. | Erro ao carregar questões com Tentar novamente e contexto preservado. | Evitar códigos técnicos sem tradução. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 31 | H10 Ajuda e documentação | Heurística | Ajuda contextual existe quando a interface não basta. | Explicar filtros e regras do simulado perto da configuração. | Ajuda não substitui correção de navegação ruim. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |

#### 11.4. Arquitetura da informação e navegação

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 32 | Navegação orientada a tarefas | Recomendação de produto | Organizar entradas pela intenção, não só pelo modelo de dados. | Questões e Simulados como entradas primárias; objetos ficam acessíveis em Explorar. | Validar por primeiro clique e teste de árvore. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), [Tree](https://www.nngroup.com/articles/tree-testing/) |
| 33 | Information scent | Conceito de encontrabilidade | Rótulos e pistas ajudam prever o destino de um clique. | Nomear CTA Resolver questões e Fazer simulado com destino correspondente. | A previsibilidade precisa ser testada com pessoas reais. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 34 | Wayfinding e localização | Padrão | Mostrar onde a pessoa está e como voltar. | Título, contexto do concurso, breadcrumbs quando houver hierarquia. | Breadcrumb não é necessário em fluxo plano. | [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 35 | Navegação consistente | Norma WCAG 2.2 3.2.3 | Elementos de navegação repetidos mantêm ordem relativa consistente. | Sidebar e atalhos preservam nomes e ordem. | Critério admite mudanças iniciadas pelo usuário. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 36 | Identificação consistente | Norma WCAG 2.2 3.2.4 | Componentes de mesma função são identificados de modo consistente. | Não alternar Simulado, Prova e Teste para a mesma ação. | Funções distintas podem exigir nomes distintos. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 37 | Estado na URL | Padrão de aplicação | Estado compartilhável e navegável facilita retorno. | Preservar filtros, página e contexto em rota ou query quando pertinente. | Dados sensíveis ou temporários não devem ir para URL. | [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 38 | Contexto ao voltar | Heurística | Retornar à lista não deve apagar a seleção de trabalho. | Restaurar posição, filtros e questão selecionada. | Pode ser inadequado restaurar estado obsoleto após mudança de dados. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 39 | Hierarquia rasa quando útil | Heurística | Reduzir desvios e rótulos ambíguos importa mais que contar cliques. | Testar acesso direto ao banco de questões. | A regra de três cliques é falsa. | [Clicks](https://www.nngroup.com/articles/3-click-rule/) |
| 40 | Taxonomia e navegação não são iguais | Recomendação de IA | Objetos e relacionamentos podem coexistir com caminhos por tarefa. | Manter ficha Questão e experiência Responder separadas, mas conectadas. | Evitar duplicar bancos e filtros. | [ISO115](https://www.iso.org/standard/80773.html) |

#### 11.5. Escolha de páginas e componentes

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 41 | Página dedicada | Padrão | Uma tarefa extensa recebe espaço, URL e histórico próprios. | Usar para Banco de Questões, Execução e Resultado. | Não abrir nova rota para ação mínima e transitória. | [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 42 | Página longa com seções | Padrão | Conteúdo que precisa ser lido em sequência pode ficar contínuo. | Resultado com resumo e análise por disciplina na mesma página. | Separar quando houver fluxos realmente independentes. | [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 43 | Tabs | Padrão APG | Alternam painéis relacionados de um mesmo contexto. | Em ficha de concurso, separar Visão geral e Objetos relacionados. | Não ocultar etapas sequenciais ou conteúdo que precisa ser comparado simultaneamente. | [APGTabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [GOVTabs](https://design-system.service.gov.uk/components/tabs/) |
| 44 | Accordion | Padrão APG | Expande e recolhe seções independentes. | Agrupar filtros avançados por assunto. | Não esconder respostas essenciais nem usar como navegação principal. | [APGAccordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), [GOVAccordion](https://design-system.service.gov.uk/components/accordion/) |
| 45 | Details | Padrão | Expõe explicação complementar curta sob demanda. | Explicar critérios de correção e origem da questão. | Conteúdo crítico deve ficar visível. | [GOVDetails](https://design-system.service.gov.uk/components/details/) |
| 46 | Drawer de navegação | Padrão de design | Superfície lateral revela destinos ou controles em espaço restrito. | Sidebar recolhível no mobile, com Questões e Simulados visíveis. | Garantir saída, foco e identificação do estado. | [Material](https://m3.material.io/components/navigation-drawer/overview), [Apple](https://developer.apple.com/design/human-interface-guidelines/) |
| 47 | Painel contextual | Padrão | Detalhes secundários acompanham a tarefa sem substituí-la. | Metadados, notas e vínculos ao lado da questão no desktop. | No mobile deve virar seção acessível ou painel sob demanda. | [Carbon](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) |
| 48 | Popover | Padrão | Informação ou escolha breve aparece ancorada ao gatilho. | Opções de ordenação ou dica de filtro. | Não usar para formulário longo ou conteúdo essencial. | [Fluent](https://fluent2.microsoft.design/) |
| 49 | Modal | Padrão APG | Interrompe interação com fundo para decisão concentrada. | Confirmar entrega definitiva ou exclusão irreversível. | Exige foco contido, retorno de foco e alternativa de cancelamento quando aplicável. | [APGDialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| 50 | Wizard e etapas | Padrão | Processo longo e linear pode ser dividido com progresso. | Configuração avançada de simulado somente se houver decisões dependentes. | Não criar etapas para formulário curto ou fluxo não linear. | [USWDSStep](https://designsystem.digital.gov/components/step-indicator/) |
| 51 | Paginação | Padrão | Divide conjunto grande em páginas identificáveis. | Banco de questões com total, página atual e retorno estável. | Escolha depende de tarefa e performance, não de preferência universal. | [USWDSPagination](https://designsystem.digital.gov/components/pagination/) |
| 52 | Rolagem contínua | Padrão | Mantém leitura de conteúdo sequencial no mesmo contexto. | Lista curta ou revisão linear de explicações. | Não usar scroll infinito se impedir localizar e retomar questão específica. | [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 53 | Ações fixas ou sticky | Padrão | Controles frequentes permanecem disponíveis durante rolagem. | Próxima questão e Salvar quando ajudarem em telas longas. | Não encobrir conteúdo, foco ou teclado virtual. | [Focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) |

#### 11.6. Busca, filtros, formulários e dados

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 54 | Busca visível | Heurística | Busca deve ser reconhecível e ter escopo claro. | Buscar por enunciado, assunto ou banca com placeholder explicativo. | Busca não substitui filtros estruturados. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 55 | Filtros por facetas | Padrão | Critérios independentes refinam o mesmo conjunto. | Disciplina, banca, cargo, ano, status e origem no banco unificado. | Não oferecer filtros sem dados confiáveis. | [Filters](https://www.nngroup.com/articles/applying-filters/) |
| 56 | Filtros aplicados explícitos | Padrão | Mostrar critérios ativos permite compreender o resultado. | Chips removíveis e contagem de questões. | Evitar duplicar o mesmo estado em controles inconsistentes. | [Filters](https://www.nngroup.com/articles/applying-filters/) |
| 57 | Limpar filtros | Padrão | Recuperar conjunto inicial deve ser fácil. | Botão Limpar tudo sem apagar preferências salvas. | Preservar filtros que o usuário explicitamente fixou, se sinalizado. | [Filters](https://www.nngroup.com/articles/applying-filters/) |
| 58 | Zero resultados | Padrão | Estado vazio explica a causa e oferece recuperação. | Sugerir remover filtro, alterar busca ou ver questões disponíveis. | Não inventar questões nem ocultar filtros ativos. | [Atlassian](https://atlassian.design/components/empty-state/) |
| 59 | Ordenação declarada | Padrão | Ordem e critério de listagem ficam visíveis. | Ordenar por relevância, ano ou número da questão com rótulo. | Relevância só deve existir se houver critério definido. | [Carbon](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) |
| 60 | Tabela de dados | Padrão | Linhas e colunas facilitam comparar atributos homogêneos. | Usar em lista administrativa de objetos ou questões. | Resolução focada pede enunciado, não tabela densa. | [Carbon](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) |
| 61 | Rótulos persistentes | Norma WCAG 2.2 3.3.2 | Campos têm instruções ou rótulos adequados. | Banca, disciplina e quantidade com label explícito. | Placeholder sozinho não equivale a label. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 62 | Validação próxima ao campo | Padrão | Mensagem aponta erro e como corrigi-lo. | Informar quantidade de questões inválida no configurador. | Para formulários longos, complementar com resumo de erros. | [GOVErrors](https://design-system.service.gov.uk/components/error-summary/) |
| 63 | Prevenção de perda de dados | Heurística | Ações destrutivas exigem proteção proporcional. | Salvar tentativa e avisar ao sair com mudanças não salvas. | Confirmação repetida de cada clique atrapalha. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |

#### 11.7. Acessibilidade verificável

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 64 | Teclado | Norma WCAG 2.2 2.1.1 | Funcionalidades devem ser operáveis por teclado. | Resolver, filtrar, iniciar e finalizar simulado sem mouse. | Testar interações reais, não apenas presença de tabindex. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 65 | Ordem de foco | Norma WCAG 2.2 2.4.3 | Sequência de foco preserva significado e operação. | Seguir título, filtros, questão, alternativas e ações. | Layout visual e DOM precisam ser coerentes. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 66 | Foco visível | Norma WCAG 2.2 2.4.7 | Indicador de foco deve ser perceptível. | Exibir foco em tabs, botões, chips e alternativas. | Não remover outline sem substituto suficiente. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 67 | Foco não oculto | Norma WCAG 2.2 2.4.11 AA | Foco não pode ficar totalmente escondido por conteúdo criado pela página. | Corrigir sobreposição de header, dock e drawers. | AA não exige ausência de qualquer sobreposição; preferir foco totalmente visível. | [Focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) |
| 68 | Nome, papel e valor | Norma WCAG 2.2 4.1.2 | Controles expõem semântica e estado à tecnologia assistiva. | Alternativas e botões com rótulos e estados programáticos. | ARIA não compensa interação nativa quebrada. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 69 | Contraste de texto | Norma WCAG 2.2 1.4.3 AA | Texto normal em geral precisa 4.5:1 e grande 3:1, com exceções. | Validar temas claro e escuro. | Logos, texto incidental e inativo têm exceções específicas. | [WCAG](https://www.w3.org/TR/WCAG22/), [WebAIM](https://webaim.org/articles/contrast/), [Deque](https://dequeuniversity.com/rules/axe/4.10/color-contrast) |
| 70 | Contraste não textual | Norma WCAG 2.2 1.4.11 AA | Informação gráfica necessária e limites de controles precisam contraste adequado. | Borda de seleção, foco e estado de alternativa. | Critério contém exceções e escopo específico. | [WCAG](https://www.w3.org/TR/WCAG22/), [WebAIM](https://webaim.org/articles/contrast/) |
| 71 | Cor não é único sinal | Norma WCAG 2.2 1.4.1 | Significado não depende apenas de cor. | Correta e errada também por texto, ícone SVG ou padrão. | Manter consistência sem redundância excessiva. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 72 | Tamanho de alvo | Norma WCAG 2.2 2.5.8 AA | Alvo mínimo 24×24 CSS px ou exceção de espaçamento/equivalência. | Auditar chips e botões compactos; preferir alvos maiores quando possível. | 44×44 é critério AAA 2.5.5, não mínimo AA universal. | [Target](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) |
| 73 | Reflow e zoom | Norma WCAG 2.2 1.4.10 | Conteúdo deve refluir sem rolagem bidimensional indevida nas condições do critério. | Verificar resolução de questão em viewport estreita e zoom. | Algumas tabelas e gráficos têm exceção. | [WCAG](https://www.w3.org/TR/WCAG22/) |
| 74 | Mensagens de status | Norma WCAG 2.2 4.1.3 AA | Atualizações de status são comunicadas sem roubar foco. | Anunciar resposta salva e atualização de contagem. | Alertas urgentes podem requerer padrão diferente. | [WCAG](https://www.w3.org/TR/WCAG22/), [APGAlert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) |
| 75 | Movimento reduzido | Norma WCAG 2.2 2.3.3 AAA e preferência do usuário | Movimento disparado por interação deve poder ser desativado, salvo essencial. | Respeitar prefers-reduced-motion em CSS, JS e canvas, preservando feedback e integridade da tarefa. | Não confundir este AAA com obrigação AA geral; considerar 2.2.2 e 2.3.1 (A) quando aplicáveis. | [WCAG](https://www.w3.org/TR/WCAG22/), [MOTION.md](../../MOTION.md) |
| 76 | Cabeçalhos e rótulos | Norma WCAG 2.2 2.4.6 AA | Títulos e labels descrevem assunto ou propósito. | Título Questão 12 de 70 e botões com ação explícita. | Evitar rótulos genéricos como Ver mais sem contexto. | [WCAG](https://www.w3.org/TR/WCAG22/) |

#### 11.8. Desempenho, ética e validação

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 77 | LCP | Métrica de desempenho | Mede quando o maior conteúdo visível é renderizado. | Medir carregamento da Home e do banco. | Não é medida isolada de satisfação; dados de campo importam. | [Vitals](https://web.dev/articles/vitals) |
| 78 | INP | Métrica de responsividade | Mede latência de interação observada ao longo da página. | Medir resposta a filtros e seleção de alternativas. | Diferenciar atraso de rede e processamento local. | [Vitals](https://web.dev/articles/vitals) |
| 79 | CLS | Métrica de estabilidade | Quantifica mudanças inesperadas de layout. | Evitar deslocar alternativa durante carregamento de correção. | Mudanças esperadas após interação não são todas penalizadas. | [Vitals](https://web.dev/articles/vitals) |
| 80 | Feedback otimista com recuperação | Padrão | Interface pode responder antes da persistência, com tratamento de falha. | Marcar alternativa imediatamente e confirmar salvamento. | Não afirmar persistência se falhou. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 81 | Ética e ausência de padrões enganosos | Princípio ético | Interface não deve manipular decisões ou ocultar consequências. | Mostrar claramente duração, critérios e entrega do simulado. | A intenção do produto não substitui teste de compreensão. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), [GOVPatterns](https://design-system.service.gov.uk/patterns/) |
| 82 | Primeiro clique | Método de pesquisa | A primeira escolha revela pistas de navegação percebidas. | Pedir que usuários encontrem Questões, Simulados e Revisão. | Não generalizar a partir de poucos participantes. | [Tree](https://www.nngroup.com/articles/tree-testing/) |
| 83 | Teste de árvore | Método de pesquisa | Avalia encontrabilidade da hierarquia sem decoração visual. | Testar rótulos da sidebar e Explorar antes de redesenhar. | Não avalia percepção visual ou comportamento da tela final. | [Tree](https://www.nngroup.com/articles/tree-testing/) |
| 84 | Teste de tarefa | Método de pesquisa | Observa sucesso, erros e desvios em jornadas reais. | Filtrar, responder, voltar, criar simulado e revisar erradas. | Definir amostra e critérios antes de comparar versões. | [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| 85 | Métricas de fluxo | Instrumentação | Medir sucesso, abandono, retorno e tempo por tarefa. | Comparar antes e depois da navegação por tarefas. | Evitar metas inventadas ou otimizar cliques isoladamente. | [Clicks](https://www.nngroup.com/articles/3-click-rule/) |
| 86 | Consistência de componentes | Padrão de design system | Reusar tokens, nomenclatura e comportamento reduz variações arbitrárias. | Reaproveitar botões, campos, filtros e estados em todas as rotas. | Consistência não impede variantes justificadas por contexto. | [Shopify](https://shopify.dev/docs/api/polaris), [Fluent](https://fluent2.microsoft.design/), [Apple](https://developer.apple.com/design/human-interface-guidelines/) |

### 12. Inventário explícito das 20 fontes fornecidas para a pesquisa

As 20 URLs estão **dentro do AGENTS.md**, não apenas em documento externo. **Atenção:** indexar uma URL **não** equivale a enumerar todos os itens do site; a auditoria exaustiva, site a site, permanece pendente. Não atribuir nomes ou evidências a páginas que não foram verificadas. Para cobertura futura: registrar por entrada nome original, URL específica, classe, tradução, duplicatas, data e limites.

| # | Fonte | URL | Tipo principal / observação |
|---:|---|---|---|
| 1 | UX Atlas | https://www.uxatlas.in/explore | Agregador amplo; não confundir com o domínio diferente `uiuxatlas.com` |
| 2 | UXScan — UX Psychology | https://uxscan.app/ux-psychology | Agregador de psicologia, vieses e leis |
| 3 | Psychological | https://psychological.bouksim.com/ | Agregador de conceitos psicológicos e exemplos |
| 4 | UX/UI Principles | https://uxuiprinciples.com/en | Biblioteca de princípios; verificar acesso de cada entrada |
| 5 | UX Guidelines | https://www.ux-guidelines.com/ | Coleção de diretrizes e práticas |
| 6 | UI Coach | https://www.uicoach.io/ux-laws | Leis / princípios para consulta |
| 7 | Laws of UX | https://lawsofux.com/laws/ | Catálogo editorial de leis, efeitos e modelos; **30 entradas já indexadas no AGENTS.md** |
| 8 | ProUX | https://www.proux.design/ux | Coleção de conceitos de UX |
| 9 | UX Quest | https://www.uxqst.com/ux-laws | Catálogo de leis |
| 10 | Twisted Brackets | https://www.twistedbrackets.com/ui-laws | Catálogo de princípios visuais |
| 11 | UX Principles | https://uxprinciples.design/laws | Catálogo de leis |
| 12 | UX UI Open | https://uxuiopen.com/laws-of-ux | Catálogo visual de leis |
| 13 | UX360 | https://ux360.design/laws-of-ux/ | Catálogo de leis |
| 14 | Design Principles | https://principles.design/browse/ | Agregador de princípios de design; nem todos são leis de UX |
| 15 | Nielsen Norman Group | https://www.nngroup.com/articles/ten-usability-heuristics/ | Fonte direta para **10 heurísticas** já indexadas |
| 16 | W3C WCAG | https://www.w3.org/TR/wcag/ | Norma técnica; usar a referência estável de versão https://www.w3.org/TR/WCAG22/ para critérios WCAG 2.2 |
| 17 | Apple HIG | https://developer.apple.com/design/human-interface-guidelines/ | Padrões de plataforma; exemplo: botões e área de toque |
| 18 | U.S. Web Design System | https://designsystem.digital.gov/ | Design system para governo dos EUA; padrões de componentes acessíveis |
| 19 | Baymard Institute | https://baymard.com/blog | Pesquisa aplicada, em especial formulários/navegação/e-commerce; não generalizar sem contexto |
| 20 | UI Patterns | https://ui-patterns.com/ | Padrões de interação; não confundir padrões com leis empíricas |

**Estado verificável desta integração:** 30/30 entradas do catálogo editorial Laws of UX listadas acima; 86/86 entradas da curadoria aplicada transcritas integralmente aqui; 20/20 URLs fornecidas indexadas aqui; demais famílias (Gestalt, Nielsen, Shneiderman, ISO e WCAG) mantidas acima. **Cobertura de todas as entradas individuais dos 20 sites: não verificada.** Não declarar que essa etapa está concluída antes de uma auditoria por fonte.

<!-- UX-LAWS-CATALOG:END -->

<!-- DESIGN-SYSTEM-INTEGRATION:START -->
## Material 3 Expressive + Apple HIG — contrato de integração para agentes (14/11/2026)

**Leitura obrigatória em alterações de interface:** [DESIGN.md](DESIGN.md) é a autoridade interna para aparência, componentes e tokens; [MOTION.md](MOTION.md) é a autoridade interna para animação e física; este \`AGENTS.md\` é a autoridade para execução, evidências e critérios de aceite. Complementar com [arquitetura de informação](docs/ux/arquitetura-informacao-navegacao.md), [princípios de UX/UI](docs/ux/ux-ui-principles.md), documentação oficial [Material Design 3](https://m3.material.io/) e [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/). **Não substituir silenciosamente** tokens, navegação ou comportamento existentes pelo visual de outra plataforma.

### Hierarquia de autoridade, fontes e modo de decisão

1. **MUST** priorizar tarefa real, acessibilidade e contratos existentes do Exam App sobre efeitos estéticos. Documentar objetivo, ação principal, estados e critérios de aceitação antes de redesenhar.
2. **MUST** diferenciar: (a) normas verificáveis WCAG/WAI-ARIA; (b) orientação oficial M3/HIG de escopo/plataforma específicos; (c) convenções próprias do Exam App; (d) sínteses, heurísticas e recomendações de skills comunitários. **Não chamar conselhos de terceiros de exigência oficial**.
3. **MUST** ler a fonte oficial atual quando a decisão depender de um valor exato (contraste, dimensão, componente, design token, motion token, licença ou API). Não fixar números de terceiros como especificação universal.
4. **MUST** usar tokens semânticos próprios do produto; tratar roles M3 \`primary/on-primary/surface/on-surface\` e Apple \`label/fill/background\` como **vocabulários de referência**, não como ordem para renomear os tokens \`--app-*\`, \`--k-*\` e \`--motion-*\` existentes. Preservar OKLCH e temas claro/escuro.
5. **MUST** escolher um vocabulário visual predominante por superfície. No Exam App o padrão é **produto próprio, low-chrome e orientado a leitura**; usar princípios de M3 Expressive para ênfase funcional e Apple HIG para clareza/continuidade, sem introduzir glassmorphism como estilo global.
6. **MUST** respeitar a arquitetura atual: protótipo HTML/CSS/JS sem build. Não instalar React, Motion, GSAP, Material Web, MUI ou bibliotecas de componentes apenas por referência de skill. Em migração futura para Next.js, reavaliar trade-offs e preferir componentes acessíveis já adotados no projeto.
7. **SHOULD** ler apenas a referência específica da tarefa em vez de copiar repositórios inteiros ou adicionar dezenas de instruções redundantes. Preservar licença e atribuição; snippets externos não são automaticamente compatíveis nem seguros.

### Design visual, estrutura e componentes

8. **MUST** comunicar hierarquia por layout, espaços, alinhamento, tipografia e papéis de cor **antes** de adicionar sombras, bordas, transparências e animações; manter a política low-chrome da issue #97. Não remover divisores funcionais só para ficar "sem bordas".
9. **MUST** manter uma única navegação primária coerente. Abas representam vistas irmãs do mesmo contexto; filtros são controles de refinamento, não abas duplicadas; wizard representa etapa sequencial. Resolução de questões e simulados preservam o próprio fluxo e estados.
10. **MUST** escolher controles por semântica: botão/CTA para ação, link para navegação, tab para alternância de vista, chip para filtro/atributo, select/radio para escolha e dialog apenas para interrupção adequada. Não disfarçar ação primária como chip ou menu oculto.
11. **SHOULD** aplicar expressividade pontualmente onde melhora localização da ação/resultado, mudança de contexto ou descoberta de relação: seleção ativa, gráfico/grafo, onboarding, sucesso importante. **AVOID** formas decorativas em enunciados, tabelas densas, provas ou painéis textuais.
12. **MUST** preservar tipografia legível mesmo com zoom, tradução e fontes substitutas. Não importar SF Pro/SF Symbols proprietários indiscriminadamente na web; seguir licença e manter SVGs semânticos conforme política de ícones.
13. **MUST** distinguir o tamanho visível do componente da sua área efetiva de interação. Para WCAG 2.2 AA, avaliar o critério 2.5.8 de **24×24 CSS px ou exceção válida**. Alvos Apple **44 pt** e Material **48 dp** são diretrizes de plataforma, não o mínimo universal WCAG AA; preferir alvos confortáveis em touch e testar espaçamento.
14. **MUST** suportar teclado, leitor de tela, foco visível/não oculto, estados \`disabled/hover/pressed/focus/selected\`, contraste, modo escuro, zoom/reflow, alto contraste quando aplicável e mensagens que não dependem só de cor.
15. **SHOULD** adotar layouts **adaptativos**, não apenas reduzir a largura: verificar sidebar, painel direito, barras de abas, filtros, gráficos/grafo, leitor de PDF e questões em viewport estreito, amplo e zoom de 200%/400% conforme critério aplicável; declarar limitações reais.
16. **AVOID** efeito Liquid Glass por padrão. Se uma superfície de controle flutuante precisar de translucidez, documentar propósito, contraste sobre conteúdos variáveis, fallback opaco, legibilidade em alto contraste, preferências de transparência e custo de \`backdrop-filter\`. O conteúdo principal de estudo deve permanecer estável e legível.

### Motion, feedback e integridade da tarefa

17. **MUST** seguir [MOTION.md](MOTION.md) para tokens e física. Diferenciar transições de estado (opacidade/cor, sem overshoot) das espaciais (posição, escala, raio, eventualmente spring); as equações e presets de skills são **referências**, não implementação automática.
18. **MUST** garantir animações **interrompíveis e reversíveis** a partir do estado visual atual, inclusive cliques rápidos, duplo clique, Escape, drag, novo filtro ou navegação em meio à transição; não enfileirar animações que causem atraso.
19. **MUST** impedir \`scroll jump\`, perda de foco, alteração acidental de resposta, atrasos na correção e movimento automático do grafo sem benefício. Não transformar a interface de estudos em demonstração de efeitos físicos.
20. **MUST** observar \`prefers-reduced-motion\` no CSS e JS/canvas e usar alternativa sem movimento espacial preservando significado, estado e feedback. Evitar reiniciar loops de física em abas ocultas ou quando estáveis.
21. **MUST** oferecer estado terminal de erro e recuperação para operações assíncronas, com timeout/deadline e retries limitados conforme a operação. Não usar animação de loading infinita como substituta de tratamento de erro.

### Procedimento de alteração e aceite

Antes de concluir uma mudança visual/interativa, o agente **MUST**:
- Conferir \`origin/dev\` **no início e no fim**; preservar mudanças concorrentes; abrir PR para \`dev\` conforme o fluxo do projeto.
- Levantar tarefa/problema, registrar baseline (DOM/ARIA, screenshot ou gravação/GIF onde movimento importar), URL/viewport/tema e comparar com evidências existentes em \`docs/\`, \`prototypes/\`, issues e \`docs/archives/\`.
- Registrar decisão de design: qual padrão interno foi mantido, qual princípio M3/HIG foi **adaptado**, qual alternativa foi rejeitada e por quê. Anotar fontes primárias e as referências comunitárias quando úteis.
- Validar teclado, leitor de tela onde possível, claro/escuro, touch/desktop, zoom, motion normal/reduzido, ações repetidas, navegação de volta, carregamento lento e erros. Para protótipos, verificar console e executar testes existentes relevantes.
- Publicar antes/depois com texto reconstrutível e evidência no board (\`board.json\` e assets), regenerando \`BOARD.md\` com \`npm run board\` quando a tarefa envolva UI real. **Mudança apenas documental** não exige screenshot inventado.
- Reportar **implementado × especificado × não testado**; não declarar conformidade M3, Apple HIG ou WCAG sem evidência.

**Consulta por tópico:** tokens, superfícies, tipografia, componentes, layout e critérios em [DESIGN.md](DESIGN.md); springs, easing, tempo, continuidade espacial, grafo, performance e motion reduzido em [MOTION.md](MOTION.md). Inventário dos 22 skills de referência e separação entre fontes oficiais/comunidade em \`DESIGN.md\`.

<!-- DESIGN-SYSTEM-INTEGRATION:END -->
