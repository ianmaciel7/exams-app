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


### 0. Leis empíricas de UX/HCI — índice estrito separado de padrões

**Objetivo desta seção:** quando alguém pedir **leis de UX/UI**, fornecer primeiro **leis empíricas ou relações quantitativas publicadas**, com nome original, fonte e limites. **Não** apresentar Material Design, Apple HIG, animações, drag-and-drop, WCAG, heurísticas de Nielsen ou padrões de componentes como "leis". **Não existe órgão que declare todas as "leis UX" oficialmente normativas**; são regularidades estudadas em campos como interação humano-computador, psicologia e linguística. O restante deste documento continua obrigatório, mas é de outras categorias.

#### 0.1. Leis empíricas diretamente úteis para interação e percepção

| Nome original estabelecido | Campo e relação estudada | Exemplo no Exam App | Fonte original / científica | Limitação |
|---|---|---|---|---|
| **Fitts's Law (1954)** | Controle motor: tempo de apontar relacionado à distância e largura efetiva do alvo. | Botões de responder, handles, alvos de ícones e itens do grafo. | [Paul Fitts, *The Information Capacity of the Human Motor System*](https://doi.org/10.1037/h0055392) | Não estabelece sozinho tamanho mínimo WCAG, satisfação ou obrigatoriedade de 44/48 px. |
| **Hick–Hyman Law (1952–1953)** | Tempo de escolha em determinadas tarefas de reação relacionado à informação/incerteza das alternativas. | Organização de escolhas, menus e filtros; reduzir incerteza sem esconder opções úteis. | [W. E. Hick (1952)](https://doi.org/10.1080/17470215208416600); [revisão crítica (2018)](https://doi.org/10.1080/17470218.2017.1322622) | Prática, compatibilidade estímulo-resposta e contexto podem mudar o efeito; não define número fixo de opções. |
| **Steering Law (Accot–Zhai, 1997)** | Tempo de navegação motora por trajetórias com largura/restrição variável. | Menus encadeados, corredores de drag, sliders e alças finas de resize. | [Accot & Zhai, *Beyond Fitts' Law* (CHI 1997)](https://doi.org/10.1145/258549.258760) | Não é regra geral para cliques simples; usar quando a trajetória precisa ser controlada. |
| **Weber's Law** | Psicofísica: limiar diferencial depende proporcionalmente da intensidade de referência. | Investigar se mudanças de estado e diferenças visuais são perceptíveis. | [MIT — Perception, Weber's Law](https://vis.csail.mit.edu/classes/6.859/lectures/05-Perception.pdf) | Não prescreve tokens ou contrastes WCAG; medir condições perceptivas reais. |

#### 0.2. Outras leis/regularidades científicas com relevância **condicional**

| Nome original | Classe e aplicação apropriada | Fonte | Cuidado |
|---|---|---|---|
| **Zipf's Law** | Regularidade estatística de frequência × posição; **pode** orientar análise de termos de busca, rótulos ou popularidade quando houver dados reais do produto. | [G. K. Zipf, *Human Behavior and the Principle of Least Effort* (1949), registro bibliográfico](https://www.ncbi.nlm.nih.gov/nlmcatalog/274664); [revisão sobre distribuições de frequência](https://pmc.ncbi.nlm.nih.gov/articles/PMC298679/) | É uma lei estatística principalmente de linguagem/distribuições, **não** regra para ordenar menus ou assumir que 20% das rotas recebem 80% dos acessos. Ajustar e medir distribuição real. |
| **Power Law of Practice / Law of Practice (Newell–Rosenbloom)** | Modelo histórico de aquisição de habilidade: desempenho pode melhorar com prática e ganhos decrescentes; hipótese para atalhos de especialistas e fluxos recorrentes. | [Newell & Rosenbloom, *Mechanisms of Skill Acquisition and the Law of Practice* (CMU)](https://iiif.library.cmu.edu/file/Newell_box00089_fld06179_doc0001/Newell_box00089_fld06179_doc0001.pdf); [Heathcote et al., revisão crítica (2000)](https://pubmed.ncbi.nlm.nih.gov/10909131/) | **A forma de potência é debatida**: estudo de dados individuais favoreceu ajustes exponenciais. Não apresentar como lei universal comprovada nem estimar tempo sem observações. |


#### 0.2.1. Leis psicofísicas e do movimento esquecidas na revisão de conversas

**Referências publicadas anteriores a 2026, recuperadas após conferir os pedidos de leis, animação, percepção e responsividade.** São pesquisas históricas, **não normas de interface** e nem recomendações automáticas de animação. Empregar somente como hipótese de percepção em tarefas específicas e sempre confrontar com acessibilidade e dados do projeto.

| Nome original publicado | Aplicação condicional ao Exam App | Fonte científica | Limite empírico obrigatório |
|---|---|---|---|
| **Fechner's Law / Weber–Fechner Law (1860)** | Modelos de percepção de intensidade; pesquisa de contraste/brilho de superfícies. | [Análise neurocientífica da formulação de Fechner](https://pmc.ncbi.nlm.nih.gov/articles/PMC1994651/); [revisão crítica (2010)](https://pubmed.ncbi.nlm.nih.gov/20550824/) | A hipótese de sensação logarítmica **não é modelo universal válido**; não substituir WCAG por fórmula psicofísica. Relacionada a Weber, mas não idêntica. |
| **Stevens' Power Law (1957)** | Modelo potência de intensidade percebida; discussão experimental de percepção visual. | [S. S. Stevens, *On the psychophysical law* (1957)](https://doi.org/10.1037/h0046162) | Expoente depende da modalidade/estimativa; não derivar tokens, contraste ou duração universal a partir dela. |
| **Piéron's Law (1914)** | Relação entre intensidade do estímulo e tempo de reação em detecção, relevante apenas para hipótese experimental de saliência/visibilidade. | [Revisão e modelagem de Piéron](https://pmc.ncbi.nlm.nih.gov/articles/PMC3249387/); [Pins & Bonnet (1996)](https://doi.org/10.3758/BF03206815) | **Não** equivale a Fitts/Hick ou uma regra para reduzir latência de API; condições e estímulos estudados importam. |
| **Korte's Laws / Korte's Third Law (1915)** | Relações espaço–tempo observadas em estudos de **movimento aparente**; discussão histórica de motion para ícones/transições. | [Korte (1915), registro](https://books.google.de/books/about/Kinematoskopische_Untersuchungen.html?id=lD7SoQEACAAJ); [revisão de movimento aparente (2010)](https://doi.org/10.1111/j.1467-9450.2009.00782.x) | Revisões indicam que a forma geral da **terceira lei não resistiu a estudos posteriores**; não definir duração/easing por essa regra. |
| **Yerkes–Dodson Law (1908)** | Achado histórico sobre intensidade do estímulo e velocidade de aprendizagem em tarefas de discriminação; lembrar que excesso de estímulo pode atrapalhar algumas tarefas. | [Yerkes & Dodson (1908)](https://doi.org/10.1002/cne.920180503); [análise historiográfica crítica](https://doi.org/10.1177/0959354394044004) | O estudo original **não demonstra uma curva universal de estresse × produtividade para todo usuário**; não justificar gamificação ansiosa ou notificações pelo nome da lei. |

#### 0.2.2. Leis nomeadas de outros campos que informam avaliação, não “leis de interface”

| Nome original | Natureza / uso contextual | Fonte | Limite |
|---|---|---|---|
| **Goodhart's Law** | Advertência da economia sobre métricas transformadas em metas; avaliar HEART/experimentos sem otimizar retenção, tempo de tela ou cliques em detrimento da tarefa. | [Registro da formulação original e atribuições — Cambridge](https://www.damtp.cam.ac.uk/user/mem2/papers/LHCE/goodhart.html) | **Não é lei quantitativa de usabilidade**; evitar atribuir a Goodhart a reformulação posterior de Marilyn Strathern como citação literal dele. |
| **Campbell's Law** | Pesquisa sobre distorção de indicadores sociais sob incentivos; complementar a cautela com métricas de sucesso dos estudantes. | [Campbell, *Assessing the impact of planned social change* (1979)](https://doi.org/10.1016/0149-7189(79)90048-X) | **Não é critério WCAG nem lei de layout**; relação histórica com Goodhart sem tratá-los como sinônimos precisos. |

**Não misturar com efeitos:** **Endowed Progress Effect** (Nunes & Drèze, 2006, [artigo original](https://doi.org/10.1086/500480)) é um efeito experimental, **não lei**; no Exam App não fabricar progresso, conquistas ou conclusão para manipular motivação. Outros itens dos catálogos, como *Change Blindness, Banner Blindness, Stroop Effect, Satisficing, Survivorship Bias, Default Effect* e *Automation Bias*, exigem classificação própria, fonte e deduplicação. O levantamento de todas as entradas dos 20 sites ainda **não está concluído** conforme [síntese e limitações](docs/ux/pesquisa-20-fontes-2026-11.md).

#### 0.3. Nomes populares com “Law” que **não** entram no índice estrito de leis empíricas

- **Jakob's Law, Tesler's Law, Postel's Law, Parkinson's Law:** nomes estabelecidos em catálogos e outras disciplinas, mas, no escopo de decisões UI/UX, não equivalem a leis experimentais universais ou normas de conformidade.
- **Miller's Law / The Magical Number Seven:** o estudo de memória de Miller não justifica regra de sete itens no menu. **Law of Proximity, Similarity, Prägnanz, Common Region e Uniform Connectedness:** são princípios perceptivos da família Gestalt; preservar sua terminologia publicada e classificar como princípios perceptivos.
- **Law of Crossing / crossing-based interaction:** modelo/regularidades de interação estudadas por Accot e Zhai; diferenciar das leis básicas de apontamento. [IBM Research — *More than dotting the i's* (2002)](https://research.ibm.com/publications/more-than-dotting-the-is-foundations-for-crossing-based-interfaces).
- **Animated Icons, Symbol Effects, Sortable, Drag-and-Drop, View Transition API, Layout Animations:** são **efeitos, padrões ou APIs**, nunca leis. Acessibilidade de arraste deve seguir [WCAG 2.5.7](https://www.w3.org/TR/WCAG22/#dragging-movements), não uma suposta “lei de drag”.
- A lista editorial **Laws of UX** abaixo contém *30 conceitos de classes diferentes*, não 30 leis científicas comprovadas. **Somente promover uma nova entrada a esta seção 0** quando houver literatura científica rastreável e classificação correta.

**Regra operacional para agentes:** em respostas/issues/PRs solicitando “leis de UX/UI”, apresentar as **quatro leis da seção 0.1** primeiro; acrescentar as seções 0.2 e 0.2.1 apenas quando a tarefa justificar relações estatísticas, aprendizagem ou psicofísica, com limitações; usar 0.2.2 somente na análise de métricas, sem classificá-la como lei de interface. Associar cada lei a uma hipótese verificável e dados/teste; não inventar métricas ou conformidade.

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

### 13. Leis e modelos complementares para formulários e campos (13 entradas)

**Escopo e taxonomia:** os nomes originais abaixo são denominações publicadas por autores ou organizações identificáveis. **Lei empírica**, **conceito psicofísico**, **modelo teórico**, **princípio**, **mecanismo de design** e **framework editorial** são categorias diferentes. Não denominar todos como "leis oficiais" nem atribuir requisitos WCAG/ISO a fontes não normativas. O catálogo é complementar às leis de Fitts, Hick, Jakob, Gestalt, Nielsen e aos padrões já listados, não uma substituição.

| # | Nome original publicado | Classe | Português e aplicação em formulários do Exam App | Limites / cuidados | Fonte primária ou publicação de referência |
|---:|---|---|---|---|---|
| 1 | Steering Law (Accot–Zhai) | Lei/modelo empírico de HCI | Lei da condução: reduzir trajetórias estreitas em menus encadeados, drag-and-drop, sliders e controles de arraste. | É um modelo para movimentos restritos; não é regra geral de espaçamento ou clique. | [Accot & Zhai, CHI 1997](https://doi.org/10.1145/258549.258760) |
| 2 | Law of Crossing | Modelo de interação por cruzamento | Lei do cruzamento: avaliar alvos acionados ao cruzar limites em interações com mouse ou caneta. | Não substituir cliques convencionais por crossing sem teste; especialmente inadequado como regra geral para formulários. | [Shumin Zhai — Laws and Models of Action](https://www.shuminzhai.com/post/laws-of-action) |
| 3 | Principle of Least Astonishment | Princípio de design | Princípio da menor surpresa: controles, Enter, mudanças automáticas e botões devem agir conforme expectativa e rótulo. | Não equivale à lei de Jakob e não proíbe padrões novos quando são claros e testados. | [GNOME — Design Principles](https://wiki.gnome.org/Projects/GnomeShell/Design/Principles) |
| 4 | Gulf of Execution | Conceito/modelo de ação | Lacuna de execução: deixar óbvio onde editar, como aplicar filtro, como iniciar ou salvar uma ação. | Não se resolve com mais botões por padrão; avaliar descobribilidade e objetivo. | [Don Norman — The Design of Everyday Things](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| 5 | Gulf of Evaluation | Conceito/modelo de ação | Lacuna de avaliação: distinguir alteração local, salvando, salvo, erro e persistência confirmada. | Nunca comunicar "Salvo" antes da confirmação efetiva; tratar perda de conexão. | [Don Norman — The Design of Everyday Things](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| 6 | Feedforward | Conceito de design de interação | Antecipação informativa: o controle comunica o que vai ocorrer **antes** da ação, inclusive envio, aplicação e exclusão. | Diferente de feedback, que informa o resultado **depois** da ação; não prometer consequência falsa. | [The Encyclopedia of HCI — Affordances / Feedforward](https://assets.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/affordances) |
| 7 | Forcing Functions | Mecanismo de design / restrição | Impedir ações perigosas ou estados inválidos, por exemplo finalizar simulado sem autorização exigida. | Restrições devem ser proporcionais; não bloquear edição trivial nem causar armadilhas de foco. | [Don Norman — The Design of Everyday Things](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| 8 | Fogg Behavior Model (B=MAP) | Modelo comportamental | Motivação, capacidade e prompt: reduzir esforço para concluir tarefas e tornar ações acessíveis e oportunas. | Não usar para pressionar, manipular ou criar dark patterns; não impõe CTA para toda configuração. | [BJ Fogg — Fogg Behavior Model](https://www.behaviormodel.org/) |
| 9 | Weber's Law | Lei psicofísica empírica | Lei de Weber: diferenças perceptíveis dependem da intensidade de referência; testar distinção entre estados e hierarquia visual. | Não transformar em fórmula universal de tamanho de fonte, contraste ou espaçamento; WCAG continua valendo. | [The Corsini Encyclopedia of Psychology — Weber's Law](https://doi.org/10.1002/9780470479216.corpsy1033) |
| 10 | Just Noticeable Difference (JND) | Conceito psicofísico (não lei independente) | Diferença apenas perceptível: testar se mudanças de estado e ênfase visual realmente são notadas. | Relacionado a Weber; não substituir medições de contraste, foco ou testes acessíveis. | [The Corsini Encyclopedia of Psychology — JND](https://doi.org/10.1002/9780470479216.corpsy0481) |
| 11 | EAS Framework — Eliminate, Automate, Simplify | Framework de usabilidade de formulários | Eliminar campos desnecessários, automatizar entradas recuperáveis e simplificar as restantes. | Evitar inferência insegura, preenchimento sensível sem consentimento e omissão de campos essenciais. | [Nielsen Norman Group — EAS Framework (2025)](https://www.nngroup.com/articles/eas-framework-simplify-forms/) |
| 12 | Structure, Transparency, Clarity, Support | Quatro princípios editoriais de design de formulários | Estrutura lógica, expectativas claras, linguagem inequívoca e ajuda contextual; labels, exemplos e feedback devem apoiar a tarefa. | Não tratar os quatro princípios como norma ISO nem justificar excesso de instruções. | [Nielsen Norman Group — 4 Principles to Reduce Cognitive Load in Forms (2025)](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) |
| 13 | Seven Stages of Action | Modelo de ação | Sete estágios da ação: objetivo, plano, especificação, execução, percepção, interpretação e comparação; usar para auditar formulários de criação/edição. | É modelo analítico aproximado, não checklist rígido nem exigência de sete telas ou sete passos. | [Don Norman — The Design of Everyday Things](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |

#### 13.1. Decisão de salvar, aplicar ou confirmar — regras para agentes

- **MUST** classificar cada formulário ou controle por **efeito** (temporário vs. persistido), **risco** (reversível vs. destrutivo), **custo/latência** (imediato vs. caro) e **escopo** (um campo vs. operação composta), antes de decidir o CTA. Não criar botões "Salvar" ou "Aplicar" por hábito e não removê-los por estética.
- **SHOULD** aplicar imediatamente mudanças simples, previsíveis, reversíveis e de baixo custo (por exemplo, tema ou filtro local), mantendo foco e estado, informando o resultado e permitindo recuperar configuração anterior quando pertinente.
- **SHOULD** escolher salvamento automático para edição pequena e de baixo risco **somente** com persistência confiável, estado visível ("Salvando", "Salvo", "Erro ao salvar"), recuperação/retry limitado e proteção contra perda de dados. A alteração local **não** significa dado persistido.
- **MUST** usar confirmação explícita para criação/submissão composta, efeitos externos, operações caras, exclusão irreversível e entrega definitiva de simulado. Distinguir "Criar", "Iniciar", "Enviar", "Salvar" e "Excluir" segundo consequência real; não adicionar confirmação excessiva para cada clique.
- **MUST** preservar teclado/Enter, semântica do elemento HTML form, ordem de foco e prevenção de dupla submissão ou alteração acidental. Atualização automática de filtros não pode roubar foco nem tornar a interface imprevisível; garantir feedback e recuperação de falhas.
- **SHOULD** preferir edição inline para pequenas alterações isoladas quando o estado editável é claro e reversível, e formulário/página dedicados quando há múltiplos campos, dependências, validação importante ou revisão antes de concluir.
- **MUST** justificar em PR/issue por que há (ou não há) botão principal e como se comportam sucesso, falha, lentidão, interrupção e voltar; registrar evidência no board conforme política já definida.

#### 13.2. Aparência moderna de campos — sem inventar leis

- **SHOULD** aplicar uma hierarquia visual consistente para label, valor, descrição, erro e CTA, usando tokens do design system existente; evitar larguras desproporcionais, caixas e divisores redundantes, **sem proibir bordas universalmente**.
- **MUST** diferenciar estados default, hover, focus-visible, selected, invalid, disabled, read-only, pending e saved conforme o tipo de campo, com contraste e semântica acessível; não depender só de cor.
- **SHOULD** adequar largura, alinhamento e densidade à tarefa e ao conteúdo esperado; formulários sequenciais geralmente favorecem fluxo de leitura vertical, mas campos naturalmente associados podem ficar lado a lado quando isso melhora a compreensão e não quebra a ordem de foco.
- **MUST** escolher controle apropriado ao dado e ao tipo de decisão: radio para escolha exclusiva visível, checkbox para escolhas independentes, switch para estado binário aplicado imediatamente, select/combobox para listas apropriadas, slider quando ajuste aproximado é intencional e campo numérico quando precisão importa. Validar cada escolha com as regras WCAG/APG aplicáveis.
- **AVOID** justificar um redesign apenas por parecer "2026": comparar antes/depois, tempo e sucesso da tarefa, legibilidade, acessibilidade, responsividade e recuperação de erros, preservando a evidência.

**Fontes para as regras de formulários:** [NN/g — EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/), [NN/g — quatro princípios](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/). Essas regras são **diretrizes específicas do Exam App** fundamentadas nos conceitos, não citações literais nem novos critérios de conformidade.

### 14. Critérios ergonômicos, formulários e acessibilidade — Context7 (14/11/2026)

**Classificação e prevenção de duplicidade:** esta extensão reúne **8 critérios de Bastien & Scapin**, **10 princípios de Gerhardt-Powals**, **4 partes ISO 9241**, **7 critérios específicos WCAG 2.2** e diretrizes de sistemas de design verificadas com **Context7** (Material Design 3, GitHub Primer e Ant Design). A presença de um nome novo não significa necessariamente que o conceito fosse ausente: muitos itens ampliam as heurísticas de Nielsen/ISO e as seções 10–13. **Critérios ergonômicos, princípios cognitivos e padrões de produtos não são leis científicas nem normas WCAG.** Fontes ISO são identificadas por título e escopo publicamente disponível; não presumir acesso à íntegra licenciada nem declarar conformidade sem avaliação.

#### 14.1. Bastien & Scapin (1993) — Ergonomic Criteria for the Evaluation of Human-Computer Interfaces

| # | Nome original | Português | Critério de aplicação no Exam App | Fonte |
|---:|---|---|---|---|
| 1 | Guidance | Orientação | Ajudar a localizar e entender campos, ajuda, grupos, estados e feedback. | [Bastien & Scapin — Ergonomic Criteria (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 2 | Workload | Carga de trabalho | Reduzir carga motora e cognitiva, ações e densidade desnecessárias. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 3 | Explicit Control | Controle explícito | Diferenciar ação iniciada pelo usuário de efeitos automáticos, preservando controle, interrupção e reversibilidade. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 4 | Adaptability | Adaptabilidade | Atender níveis diferentes de experiência sem esconder ações essenciais. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 5 | Error Management | Gestão de erros | Prevenir erro, apresentar mensagens acionáveis e permitir correção sem apagar trabalho. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 6 | Consistency | Consistência | Usar controles, rótulos, apresentação e feedback coerentes em fluxos equivalentes. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 7 | Significance of Codes (and Denominations) | Significado dos códigos e denominações | Evitar abreviações obscuras, ícones sem significado e nomenclaturas inconsistentes. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |
| 8 | Compatibility | Compatibilidade | Ajustar interface às tarefas, contexto e expectativas do estudante. | [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf) |

**Subcritérios especialmente relevantes (nomes publicados):** **Prompting**, **Grouping/Distinction by Location**, **Grouping/Distinction by Format**, **Immediate Feedback**, **Legibility**, **Brevity**, **Concision**, **Minimal Actions**, **Information Density**, **Explicit User Action**, **User Control**, **Flexibility**, **User Experience**, **Error Protection**, **Quality of Error Messages** e **Error Correction**. O conjunto possui **18 critérios elementares** na organização original, sem tratar cada um como uma nova lei separada.

- **MUST** usar **Explicit User Action** para questionar mudanças inesperadas de navegação ou submissões disparadas pela edição de um campo; **não confundir** com proibição universal de autosave ou atualização imediata de filtros.
- **SHOULD** usar **Minimal Actions** e **Concision** para eliminar confirmações, campos e etapas redundantes, sem sacrificar prevenção de erros e acessibilidade.
- **SHOULD** usar **Grouping/Distinction** e **Information Density** para controlar espaçamento semântico, agrupamentos, largura útil e ruído de cards/bordas, sem impor estética universal.

#### 14.2. Gerhardt-Powals (1996) — Cognitive Engineering Principles for Enhancing Human-Computer Performance

| # | Nome original | Aplicação sugerida no Exam App |
|---:|---|---|
| 1 | Automate Unwanted Workload | Evitar digitação e seleção repetitivas quando os dados já são conhecidos e confiáveis. |
| 2 | Reduce Uncertainty | Explicitar o efeito de filtros, validação, envio e salvamento. |
| 3 | Fuse Data | Integrar dados relacionados em resumos compreensíveis. |
| 4 | Present New Information with Meaningful Aids to Interpretation | Mostrar exemplos, contexto e explicações quando introduzir campos complexos. |
| 5 | Use Names That Are Conceptually Related to Function | Nomear ações pelo resultado real, em vez de rótulos técnicos obscuros. |
| 6 | Group Data in Consistently Meaningful Ways | Organizar campos por assunto e dependência real. |
| 7 | Limit Data-Driven Tasks | Apresentar sínteses úteis em vez de exigir comparação manual de dados brutos. |
| 8 | Include Only Information Needed by the Operator | Priorizar informações relevantes no momento da tarefa. |
| 9 | Provide Multiple Coding of Data | Sinalizar estados também por texto/forma/ícone acessível, não apenas cor. |
| 10 | Practice Judicious Redundancy | Repetir informação só quando ajuda a executar ou verificar a tarefa. |

**Fonte:** [Gerhardt-Powals, International Journal of Human-Computer Interaction 8(2), 189–211 (1996)](https://doi.org/10.1080/10447319609526147). Trata-se de princípios de engenharia cognitiva, com sobreposição intencional a Nielsen, Gestalt e regras já documentadas; evitar contar duplicatas como avanços de cobertura.

#### 14.3. ISO 9241 — partes relevantes ainda não enumeradas

| Parte / edição | Título oficial | Aplicação de escopo no Exam App | Fonte |
|---|---|---|---|
| ISO 9241-143:2012 (confirmada em 2024) | Forms | Referência específica para desenho e avaliação de formulários e campos identificados por rótulos. | [ISO 9241-143](https://www.iso.org/standard/53590.html) |
| ISO 9241-161:2025 | Visual user-interface elements | Seleção, uso e relação de elementos visuais de UI. | [ISO 9241-161](https://www.iso.org/standard/85790.html) |
| ISO 9241-115:2024 | Guidance on conceptual design, user-system interaction design, user interface design and navigation design | Arquitetura conceitual, interação, estrutura e navegação. | [ISO 9241-115](https://www.iso.org/standard/80773.html) |
| ISO 9241-171:2025 | Software accessibility | Avaliação da acessibilidade do software além dos requisitos aplicáveis ao conteúdo web. | [ISO 9241-171](https://www.iso.org/standard/86308.html) |

**Limite:** referências de escopo e títulos disponíveis publicamente, não transcrições de cláusulas ISO licenciadas. **MUST NOT** marcar conformidade com essas normas sem obter os textos integrais pertinentes e realizar avaliação apropriada. Para web, verificar os critérios WCAG aplicáveis independentemente.

#### 14.4. WCAG 2.2 — sete critérios específicos para formulários e interações

| Critério e nível | Nome oficial | Regra de auditoria do Exam App e cuidado de escopo |
|---|---|---|
| 3.2.2 (A) | On Input | Alterar valor/seleção não pode provocar inesperadamente **mudança de contexto** sem aviso prévio. Atualizar resultados sem trocar contexto não é automaticamente uma falha. |
| 3.3.3 (AA) | Error Suggestion | Quando erro é detectado e há sugestão apropriada conhecida, orientar como corrigir, salvo impacto na segurança/finalidade. |
| 3.3.4 (AA) | Error Prevention (Legal, Financial, Data) | Modificação/exclusão de dados controlados pelo usuário **ou envio de respostas de teste** deve atender **ao menos uma** condição: reversibilidade, verificação com correção ou revisão/confirmação antes de finalizar. **Não exige modal em todas as operações.** |
| 3.3.7 (A) | Redundant Entry | Na mesma atividade/processo, reaproveitar ou permitir selecionar informação já fornecida, consideradas as exceções (essencial, segurança, validade). Não obriga retenção entre sessões. |
| 3.3.8 (AA) | Accessible Authentication (Minimum) | No login, não exigir teste de função cognitiva sem uma das alternativas/exceções permitidas; permitir mecanismos adequados de apoio à autenticação. |
| 1.3.5 (AA) | Identify Input Purpose | Campos sobre informações pessoais dos usuários devem expor programaticamente finalidade quando se enquadrarem na lista de propósitos especificada; não atribuir autocomplete arbitrário a qualquer campo. |
| 2.5.7 (AA) | Dragging Movements | Interações por arraste devem ter alternativa de ponteiro único sem arraste, salvo exceção de essencialidade. |

**Fonte normativa:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/); orientação por critério em [WAI Understanding](https://www.w3.org/WAI/WCAG22/Understanding/). **MUST** registrar resultado por critério aplicável e evidência, não declarar conformidade apenas porque a regra existe no AGENTS.md.

#### 14.5. Context7 — princípios/padrões oficiais dos design systems (não são leis universais)

| Sistema e fonte | Nome publicado | Aplicação orientativa |
|---|---|---|
| [Ant Design — Form Page](https://ant.design/docs/spec/research-form/) | Efficient; Clear; Security | Organização, clareza de causa/efeito, salvamento e reversibilidade; verificar especialmente configuração de simulados. |
| [Ant Design — Form Page](https://ant.design/docs/spec/research-form/) | Instant Effect Mode; Submission Effect Mode | Para ajustes independentes e reversíveis, atualização imediata é opção; para múltiplas configurações interdependentes, avaliar envio explícito. Não importar números de agrupamento como regras universais. |
| [Material Design 3 — Text fields](https://m3.material.io/components/text-fields/guidelines) | Filled text fields; Outlined text fields | Variantes com funções equivalentes e ênfase visual distinta; escolher pela hierarquia, pelo contexto e pela distinção de outros componentes. |
| [GitHub Primer — Forms](https://primer.style/product/ui-patterns/forms/) | Inline validation | Evitar primeira validação prematura enquanto o usuário digita; em geral validar após edição e perda de foco, revalidando um campo já inválido durante correção. Observar latência e leitores de tela. |
| [GitHub Primer — Text input](https://primer.style/product/components/text-input/guidelines/) | Label; Required indicator; Caption; Validation message; Trailing action | Compor campo completo com nome, instrução, erro acionável e ação local quando pertinente; não usar placeholder como único label. |

**Regra prática consolidada para o Exam App:**
1. **MUST** distinguir **alterar preferência**, **aplicar filtro**, **editar objeto**, **criar registro** e **entregar simulado**, com consequência e comportamento de salvamento claros e testáveis.
2. **MUST** validar **On Input (3.2.2)**, **Error Prevention (3.3.4)** e **Redundant Entry (3.3.7)** nos fluxos afetados; aplicar outras normas por escopo e nível, sem generalizações.
3. **SHOULD** preferir formulários simples, agrupados por sentido, com largura de campo útil, labels e erro próximos do controle; justificar quando ação explícita, autosave, inline edit ou fluxo em etapas é melhor.
4. **MUST** diferenciar material **consultado e documentado** de **código implementado** e **conformidade testada**. Registrar evidências do fluxo no board/issues quando houver mudança real de UI; esta inclusão documental isolada não exige capturas fabricadas.


### 15. WCAG 2.2 e técnicas verificáveis de formulários — complemento

**Classificação:** estes sete itens são **critérios de sucesso WCAG 2.2**, quando aplicáveis e no respectivo nível; os cinco nomes na seção seguinte são **tutoriais/padrões**, não leis universais. Complementam as seções 11.7, 13 e 14, sem alterar as contagens anteriores de Laws of UX e catálogo aplicado.

#### 15.1. Sete critérios WCAG adicionais com nomes oficiais

| Critério | Nome original | Regra de implementação do Exam App | Limites e fonte |
|---|---|---|---|
| **1.3.1 (A)** | **Info and Relationships** | Expor relações visuais também em código: labels, grupos semânticos, títulos e relações entre campos; usar fieldset/legend em grupos apropriados. | Agrupar por espaçamento não basta. [WCAG](https://www.w3.org/TR/WCAG22/#info-and-relationships) |
| **3.3.1 (A)** | **Error Identification** | Quando erro de entrada for detectado automaticamente, identificar o item errado e descrever o erro em texto. | Não exige apresentar erro antes de terminar a primeira edição. [WCAG](https://www.w3.org/TR/WCAG22/#error-identification) |
| **3.2.1 (A)** | **On Focus** | Receber foco, por si só, não pode provocar mudança de contexto. | Diferenciar painel de ajuda previsível de navegação/submissão inesperada. [WCAG](https://www.w3.org/TR/WCAG22/#on-focus) |
| **2.5.3 (A)** | **Label in Name** | O nome acessível de controle com label visível precisa conter o texto visível aplicável. | Não substituir texto visível por outro nome incompatível em ARIA. [WCAG](https://www.w3.org/TR/WCAG22/#label-in-name) |
| **3.2.6 (A)** | **Consistent Help** | Quando mecanismos de ajuda definidos no critério se repetirem no mesmo conjunto de páginas, manter sua ordem relativa. | Não exige que toda página tenha botão de ajuda. [WCAG](https://www.w3.org/TR/WCAG22/#consistent-help) |
| **1.4.13 (AA)** | **Content on Hover or Focus** | Conteúdo adicional por hover/foco deve atender aos requisitos de dispensabilidade, ponteiro e persistência quando aplicáveis. | Observar exceções do critério; tooltip não deve desaparecer antes da interação necessária. [WCAG](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) |
| **2.4.13 (AAA)** | **Focus Appearance** | Avaliar área e contraste do indicador de foco entre estados normal/focado, conforme o critério. | É **AAA**, não mínimo AA; não confundir com foco visível 2.4.7 ou não oculto 2.4.11. [WCAG](https://www.w3.org/TR/WCAG22/#focus-appearance) |

#### 15.2. Cinco tutoriais e diretrizes oficiais (não são leis)

| Nome publicado | Aplicação para campos e formulários | Fonte |
|---|---|---|
| **Grouping Controls** | Agrupar radio/checkbox e campos relacionados semanticamente (fieldset/legend ou alternativa acessível); organizar opções de select com optgroup quando apropriado. | [W3C WAI](https://www.w3.org/WAI/tutorials/forms/grouping/) |
| **Form Instructions** | Explicar obrigatoriedade, formato e exemplos relevantes de maneira acessível e associada ao campo; evitar instruções redundantes. | [W3C WAI](https://www.w3.org/WAI/tutorials/forms/instructions/) |
| **Validating Input** | Validar no cliente para orientação e no servidor para segurança/integridade; aceitar formatos equivalentes quando apropriado e preservar o trabalho após erro. | [W3C WAI](https://www.w3.org/WAI/tutorials/forms/validation/) |
| **Multi-page Forms** | Em formulários realmente extensos, separar grupos lógicos, indicar progresso, permitir voltar e explicitar etapas opcionais; evitar wizard para formulário curto. | [W3C WAI](https://www.w3.org/WAI/tutorials/forms/multi-page/) |
| **Inline Validation** | Não interromper a primeira digitação com erro precoce; validar após edição/blur ou envio conforme tarefa, e oferecer feedback durante correção de erros já apresentados. | [GitHub Primer](https://primer.style/product/ui-patterns/forms/) |

**Contrato de implementação:**
1. **MUST** verificar semântica programática além do layout: nome acessível, label, grupo, descrição, associação de erro, foco e teclado. Preferir HTML nativo quando adequado.
2. **MUST** tratar **On Focus (3.2.1)** e **On Input (3.2.2)** separadamente em filtros, autosave, selects e inline edit. Atualizar resultado não é automaticamente mudar de contexto.
3. **MUST** evitar perda de entrada e submissão duplicada; distinguir edição, inválido, submetendo, salvando, salvo, falhou e estado de concorrência quando relevante. Não anunciar persistência sem confirmação.
4. **MUST** orientar correção com texto específico e associação ao campo; para múltiplos erros, considerar resumo de erros com foco e links. Seguir o momento de validação da tarefa, não uma regra temporal universal.
5. **SHOULD** evitar desabilitar a única ação possível sem explicação ou caminho de recuperação; avaliar validação no envio quando isso for mais claro.
6. **MUST** testar teclado, IME/composição, autofill, zoom/reflow, mobile, hover/foco, leitor de tela quando possível e modo de alto contraste. Ver [DESIGN.md §8.10](DESIGN.md).
7. **MUST** documentar por critério status **passou/falhou/não aplicável/não testado**, cenário, fonte e evidência; catálogo não representa conformidade testada.


### 16. Auditoria geral de UI/UX para 2026 — princípios, normas e padrões adicionais

**Data da revisão: 14/11/2026. Escopo:** navegação, visualização de dados/grafo, design inclusivo, pesquisa, métricas, internacionalização, responsividade e acessibilidade (não apenas formulários). **Classificação obrigatória:** princípios de Design Universal, mantras de visualização, frameworks de métricas, design systems e diretrizes governamentais **não são novas leis científicas**; critérios WCAG são requisitos normativos quando aplicáveis ao nível declarado; ISO exige considerar texto integral licenciado e escopo. Não duplicar como novidade as leis de Fitts/Hick/Jakob, as dez heurísticas de Nielsen, Gestalt, Shneiderman (Eight Golden Rules), a lista Laws of UX ou os 86 itens aplicados anteriores. Espelhar esta seção em [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md); diretrizes visuais/operacionais em [DESIGN.md](DESIGN.md).

#### 16.1. Seven Principles of Universal Design — sete nomes originais

| # | Nome original | Aplicação a interfaces do Exam App |
|---:|---|---|
| 1 | **Equitable Use** | Possibilitar a mesma tarefa com acesso equivalente; evitar interfaces que segreguem estudantes que usam tecnologias assistivas. |
| 2 | **Flexibility in Use** | Atender diferentes dispositivos, modalidades, ritmos e preferências sem impor um único gesto. |
| 3 | **Simple and Intuitive Use** | Tornar tarefas principais previsíveis sem exigir conhecimento da arquitetura interna de objetos. |
| 4 | **Perceptible Information** | Dar informação importante por texto/semântica e recursos perceptíveis além de cor ou localização espacial. |
| 5 | **Tolerance for Error** | Prevenir falhas e permitir voltar, corrigir, retomar ou desfazer sem perda de progresso. |
| 6 | **Low Physical Effort** | Evitar ações motoras repetitivas, arrastes longos e controles difíceis de alcançar/manipular. |
| 7 | **Size and Space for Approach and Use** | Adaptar espaço e áreas de operação ao dispositivo, zoom e necessidade motora; não confundir com valor mínimo WCAG AA. |

**Fonte primária:** [North Carolina State University — Principles of Universal Design, versão 2.0 (1997)](https://design.ncsu.edu/research/center-for-universal-design/); [aplicação governamental ao digital — UK Department for Education](https://accessibility.education.gov.uk/guidelines/universal-design). Origem em design de produtos/ambientes: princípios são aplicáveis por analogia ao web design, **não um conjunto de SC WCAG**.

#### 16.2. Visual Information-Seeking Mantra — Shneiderman (1996)

**Nome original publicado:** **Visual Information-Seeking Mantra — Overview first, zoom and filter, then details-on-demand**. O artigo também descreve sete tarefas de visualização: **Overview; Zoom; Filter; Details-on-demand; Relate; History; Extract**. Fonte acadêmica: [Ben Shneiderman, The Eyes Have It (IEEE, 1996)](https://doi.org/10.1109/VL.1996.545307).

- **SHOULD** oferecer visão geral inicial, controles de zoom/filtro visíveis e detalhes sob demanda no grafo de objetos, nas métricas e em listas densas. **AVOID** apresentar somente relações detalhadas sem orientação inicial.
- **MUST** manter estado da seleção, relações, posição e histórico/retorno ao abrir um nó e navegar para seus vizinhos; não confundir **History** do modelo com histórico de tentativas do usuário.
- **SHOULD** dar alternativas textuais/estruturadas às relações visuais e permitir exportar/inspecionar dados quando fizer sentido; a metáfora do mantra é **heurística de projeto**, não requisito de que toda tela possua sete controles.

#### 16.3. ISO 9241-11:2018 — Usability: Definitions and Concepts

**Fonte e estado:** [ISO 9241-11:2018](https://www.iso.org/standard/63500.html), edição atual confirmada pela ISO em 2023. Apresenta o conceito de **usability** como resultado da utilização em um **context of use**; relacionar a avaliação a **effectiveness, efficiency and satisfaction**. Sua página pública não traz todas as cláusulas licenciadas.

- **MUST** definir usuário/tarefa/contexto antes de afirmar melhora de UX. Para fluxo representativo, medir **eficácia** (conclusão e erros), **eficiência** (esforço/tempo em condições comparáveis) e **satisfação** (evidência qualitativa/quantitativa apropriada).
- **AVOID** chamar menos cliques, menos bordas, maior tempo no app ou visual “2026” de melhora comprovada sem medir sucesso da tarefa e contexto.
- **MUST NOT** declarar conformidade ISO baseada apenas no resumo público ou neste arquivo.

#### 16.4. Microsoft Inclusive Design — três princípios oficialmente nomeados

| Nome original | Aplicação |
|---|---|
| **Recognize exclusion** | Identificar quem fica impedido de usar filtros, grafo, leitor PDF, teclado, zoom ou tradução. |
| **Learn from diversity** | Testar a interface com pessoas e contextos diversos; não inferir experiência de todas as pessoas a partir de uma única preferência estética. |
| **Solve for one, extend to many** | Uma melhoria para um cenário de acessibilidade pode beneficiar mais pessoas; validar generalização sem impor o mesmo padrão a todos. |

**Fonte:** [Microsoft Inclusive Design — Inclusive Design Principles](https://inclusive.microsoft.design/). São princípios metodológicos, não novas regras WCAG.

#### 16.5. W3C COGA — oito objetivos para acessibilidade cognitiva

| Nome do objetivo publicado no W3C | Aplicação orientativa |
|---|---|
| **Help Users Understand What Things Are and How to Use Them** | Páginas, ícones, controles e efeitos das ações reconhecíveis. |
| **Help Users Find What They Need** | Tarefas principais encontráveis, estrutura de páginas clara e orientação. |
| **Use Clear and Understandable Content** | Linguagem simples, enunciados fiéis e explicações compreensíveis. |
| **Help Users Avoid Mistakes and Know How to Correct Them** | Prevenção/recuperação de erros em estudo, configuração e navegação. |
| **Help Users Focus** | Reduzir ruído e interrupções; ajudar a retomar o ponto da leitura ou do estudo. |
| **Ensure Processes Do Not Rely on Memory** | Preservar contexto, mostrar filtros e progresso; não exigir lembrar informações de telas anteriores. |
| **Provide Help and Support** | Ajuda contextual e mecanismos de feedback encontráveis. |
| **Support Adaptation and Personalization** | Preferências de leitura, densidade e movimento controláveis sem perder funcionalidade. |

**Fonte:** [W3C WAI COGA — Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/). Trata-se de **W3C Working Group Note, orientação suplementar**; estes oito objetivos **não são requisitos adicionais de conformidade WCAG 2.2**. **MUST** separar regras normativas e recomendações cognitivas ao redigir PR e critérios de aceite.

#### 16.6. Government Design Principles — GOV.UK (11 princípios, página atualizada em 02/04/2025)

| Nome oficial | Aplicação concisa |
|---|---|
| **Start with user needs** | Priorizar objetivo de estudo real antes de reproduzir referência visual. |
| **Do less** | Evitar fluxos ou controles sem valor; reutilizar soluções testadas. |
| **Design with data** | Instrumentar sucesso da tarefa, erro e retorno; não decidir somente por preferência. |
| **Do the hard work to make it simple** | Resolver complexidade internamente sem removê-la de forma enganosa. |
| **Iterate. Then iterate again** | Prototipar, testar, corrigir e comparar versões. |
| **This is for everyone** | Acessibilidade/inclusão desde o desenho. |
| **Understand context** | Considerar desktop, mobile, uso de leitura extensa, rede instável e recursos assistivos. |
| **Build digital services, not websites** | Priorizar jornada completa de estudar, responder, revisar e retomar. |
| **Be consistent, not uniform** | Consistência funcional sem obrigar todas as telas a terem a mesma densidade/estrutura. |
| **Make things open: it makes things better** | Preservar evidência, fonte, rationale e feedback em documentação e board. |
| **Minimise environmental impact** | Evitar trabalho/rede/renderização desnecessários e operações intensivas permanentes quando houver alternativas. |

**Fonte oficial:** [GOV.UK — Government Design Principles](https://www.gov.uk/guidance/government-design-principles). O décimo primeiro princípio foi acrescentado em **abril de 2025**. Estes são **princípios de serviço do governo britânico**, não normas ISO e não validação automática da implementação do Exam App.

#### 16.7. HEART Framework (Rodden, Hutchinson & Fu) — métricas centradas no usuário

**Nome publicado:** **HEART — Happiness, Engagement, Adoption, Retention, Task Success**, com método complementar **Goals–Signals–Metrics (GSM)**. Fontes: [Google Research, CHI 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) e [página da pesquisadora Kerry Rodden](https://www.kerryrodden.com/heart/).

- **SHOULD** definir primeiro objetivo por jornada (encontrar questões, completar simulado, revisar erradas), depois sinais observáveis e somente então métricas. Incluir pesquisa de satisfação quando apropriado.
- **MUST** distinguir **engajamento** de **sucesso da tarefa**: mais tempo na tela pode significar dificuldade; não criar metas numéricas sem baseline ou pressão para maximizar métricas isoladas.
- **AVOID** tratar HEART como uma norma de acessibilidade ou uma exigência de medir todas as cinco categorias em cada tela.

#### 16.8. WCAG 2.2 — critérios gerais adicionais ainda não individualizados

Estas são **16 entradas adicionais** de sucesso WCAG, além das já documentadas nas seções 11, 14 e 15. Devem ser verificadas **somente quando aplicáveis** com suas exceções, níveis e técnicas; a presença no catálogo não equivale a conformidade.

| SC / nível | Nome original | Exemplo de auditoria para o Exam App |
|---|---|---|
| **1.3.2 (A)** | **Meaningful Sequence** | Ordem programática de leitura da questão e de painéis não perde significado após reflow. |
| **1.3.4 (AA)** | **Orientation** | Não restringir a orientação retrato/paisagem salvo quando essencial. |
| **1.4.4 (AA)** | **Resize Text** | Texto pode ser redimensionado sem perda de conteúdo ou funcionalidade dentro das condições do critério. |
| **1.4.12 (AA)** | **Text Spacing** | Ajustes de espaçamento especificados no SC não cortam textos/botões; **não exige usar os valores como padrão do produto**. |
| **2.1.2 (A)** | **No Keyboard Trap** | Usuário pode sair por teclado de modais, grafo, leitor PDF e overlays. |
| **2.1.4 (A)** | **Character Key Shortcuts** | Atalhos de tecla imprimível isolada devem poder ser desativados, remapeados ou funcionar apenas com foco no componente. |
| **2.2.1 (A)** | **Timing Adjustable** | Avaliar limite de tempo de simulado: ajustar/desligar/estender quando exigido, **respeitando exceção para tempo essencial**. |
| **2.4.1 (A)** | **Bypass Blocks** | Permitir saltar navegação repetida para conteúdo principal (por exemplo, skip link). |
| **2.4.2 (A)** | **Page Titled** | Título de documento descreve finalidade/concurso/questão em rota aplicável. |
| **2.4.4 (A)** | **Link Purpose (In Context)** | Propósito dos links de navegação fica claro por rótulo ou contexto programático. |
| **2.4.5 (AA)** | **Multiple Ways** | Permitir mais de um meio de localizar páginas quando aplicável; há exceção para resultado/etapa de processo. |
| **2.5.1 (A)** | **Pointer Gestures** | Gesto multiponto ou baseado em trajetória tem alternativa por ponteiro único sem trajetória, salvo essencialidade. |
| **2.5.2 (A)** | **Pointer Cancellation** | Não concluir ações irreversíveis no pointer-down sem atender uma das alternativas previstas pelo SC. |
| **2.5.4 (A)** | **Motion Actuation** | Ações disparadas por movimento do aparelho/usuário têm alternativa acessível e opção de desativação quando exigidas. |
| **3.1.1 (A)** | **Language of Page** | Idioma principal da página programaticamente determinável. |
| **3.1.2 (AA)** | **Language of Parts** | Trechos efetivamente em outro idioma recebem marcação linguística quando aplicável; observar exceções para nomes/termos. |

**Fonte oficial:** [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [Understanding](https://www.w3.org/WAI/WCAG22/understanding/). **Não** interpretar tempo essencial de prova como permissão genérica para timeouts que descartam respostas. Diferenciar expiração de sessão, tempo de prova e duração de loading.

#### 16.9. Referências atuais de sistemas de design (Context7 + fontes oficiais) — não são leis

| Sistema / nome publicado | Orientação e aplicação condicionais | Fonte |
|---|---|---|
| **Material Design 3 — Adaptive Design / Layout Scaffold / Panes / Breakpoints** | Diretriz atualizada em **maio de 2026**: adaptar composição, navegação e número de painéis ao espaço disponível; distinguir primeiro plano, painel de apoio e detalhe. Não copiar limites de janelas Android para a web cegamente. | [M3 — Layout](https://m3.material.io/foundations/layout/layout-overview/overview) e [Parts of layout](https://m3.material.io/foundations/layout/layout-overview/parts-of-layout) |
| **IBM Carbon — Empty State Pattern** | Distinguir resultado vazio, ausência de dados e erro; oferecer explicação e caminho útil sem inventar conteúdo. | [Carbon — Empty State](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/examples/EmptyState/EmptyState.mdx) |
| **Adobe React Aria — Accessible, Adaptive, International** | Testar comportamento por mouse, touch, teclado, tecnologias assistivas e RTL/idiomas; não exigir importar React Aria para aplicar princípios. | [React Aria — Interactions](https://react-spectrum.adobe.com/react-aria/interactions.html) e [Internationalization](https://react-spectrum.adobe.com/react-aria/internationalization.html) |
| **USWDS — Data Visualizations** | Gráficos precisam título/explicação da mensagem, rótulos, alternativas textuais/dados e verificação com tecnologias assistivas; uma tabela pode não transmitir a interpretação completa do gráfico. | [USWDS — Data visualizations](https://designsystem.digital.gov/components/data-visualizations/) |

**Prioridades do Exam App (MUST avaliar conforme escopo):** (1) navegador de Questões e Simulados encontrável; (2) sidebar/painel contextual responsivos sem abas ou CTAs duplicados; (3) grafo com visão geral, filtros, relação, detalhes e retorno; (4) gráficos com legenda, explicação textual, alternativa de dados e interação de teclado; (5) leitor PDF com foco, leitura e progresso preservados; (6) internacionalização e acessibilidade cognitiva; (7) medição verificável de sucesso por tarefa. **Nenhuma destas diretrizes prova implementação ou conformidade sem testes.**


### 17. Lacunas adicionais identificadas com Context7 — navegação, avaliação e fallback (14/11/2026)

**Escopo e classificação:** revisão incremental das seções 1–16. Novos nomes são: **teoria de HCI** (Information Foraging Theory), **método de avaliação** (Cognitive Walkthrough), **modelo de desempenho** (Keystroke-Level Model), **filosofia de desenvolvimento** (Progressive Enhancement), **padrões técnicos de interação WAI-ARIA APG** e **técnicas WAI de descrição de gráficos**. Nenhum constitui nova "lei oficial de 2026"; estudos históricos continuam relevantes para projetos em 2026. Não repetir como novas descobertas as entradas anteriores sobre Information Scent, Wayfinding, teclado, Fitts, Hick, HEART, Shneiderman ou WCAG. Fontes originais e de documentação atual por entrada.

#### 17.1. Modelos e métodos com nomes originais publicados

| Nome original | Categoria e autoria | Aplicação e limitações | Fonte |
|---|---|---|---|
| **Information Foraging Theory** | Teoria de busca de informação — Peter Pirolli e Stuart Card, 1995/1999 | Explicar como pistas de navegação (information scent), agrupamento da informação (information patches) e custo-benefício orientam descoberta de páginas. No Exam App: testar rótulos de Questões, Simulados, Revisão e Explorar contra a intenção do estudante. **Information Scent já estava catalogado; a teoria aqui organiza os conceitos, não duplica uma lei.** | [Pirolli & Card (1995)](https://chi1995.acm.org/proceedings/papers/ppp_bdy.htm); [Psychological Review (1999)](https://doi.org/10.1037/0033-295X.106.4.643) |
| **Cognitive Walkthrough** | Método de inspeção baseado em tarefas — Polson, Lewis, Rieman e Wharton, 1992 | Simular jornada de quem conhece pouco o app e avaliar por etapa objetivo, descoberta do controle, relação ação-resultado e feedback. **Não equivale a teste com usuários nem a auditoria de acessibilidade.** | [Artigo original (1992)](https://doi.org/10.1016/0020-7373(92)90039-N); [guia de aplicação (1994)](https://www.usabilitybok.org/cognitive-walkthrough/) |
| **Keystroke-Level Model (KLM)** | Modelo preditivo de desempenho — Card, Moran e Newell, 1980 | Estimar esforço temporal em tarefas frequentes de usuário experiente conforme sequência de operações e respostas do sistema. Comparar alternativas para filtros/atalhos/retomada, **sem alegar tempo real, dificuldade de aprendizado, sucesso ou satisfação**. | [Communications of the ACM (1980)](https://doi.org/10.1145/358886.358895) |
| **Progressive Enhancement** | Filosofia de desenvolvimento web | Preservar acesso ao conteúdo e às tarefas essenciais quando efeitos modernos, gráficos, animações ou APIs não são suportados; implementar alternativas proporcionais. **Não afirmar que todo o protótipo SPA funciona sem JavaScript se isso não foi implementado.** | [MDN — Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) |

**Aplicação em pesquisa (SHOULD):** para cada fluxo principal, registrar a tarefa de um iniciante, o rótulo que ele espera encontrar, o primeiro clique/ação, o resultado observável, o ponto de dúvida e a oportunidade de recuperação. Validar achados de Cognitive Walkthrough com testes reais antes de concluir que a UI melhorou. KLM é opcional para operações repetitivas e comparações de métodos; não substitui as métricas de sucesso da ISO 9241-11 e HEART.

#### 17.2. Padrões oficiais WAI-ARIA APG para componentes complexos (não são leis)

| Nome original do padrão | Aplicação adequada | Evitar / atenção | Fonte |
|---|---|---|---|
| **Disclosure (Show/Hide) Pattern** | Agrupamentos simples expansíveis da sidebar, filtros e navegação usual. Usar botão com estado expandido, ativação por Enter/Espaço e foco previsível. | Não transformar navegação comum em árvore de teclado complexo sem necessidade. | [W3C WAI-ARIA APG — Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| **Tree View Pattern** | Hierarquia real de objetos, tipos ou pastas que exige navegação própria por setas, expansão/recolhimento, seleção e gerenciamento de foco. | Uma sidebar com grupos de links não vira automaticamente ARIA tree; **o grafo relacional em canvas também não é, necessariamente, um treeview**. | [W3C WAI-ARIA APG — Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) |
| **Grid (Interactive Tabular Data and Layout Containers) Pattern** | Tabela ou grade interativa com navegação por células/setas, foco/seleção, ações ou edição. | Para tabela estática de resultados, preferir tabela HTML semântica simples; não usar role grid apenas para layout CSS. | [W3C WAI-ARIA APG — Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) |
| **Treegrid Pattern** | Dados tabulares hierárquicos **e interativos** que exigem linhas expansíveis e foco no interior da grade. | Não aplicar ao grafo visual ou à lista comum; exige semântica e teclado complexos. | [W3C WAI-ARIA APG — Treegrid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) |
| **Keyboard Interface / Focus in Composites** | Distinguir foco de seleção e seguir teclas convencionais do padrão escolhido. | Não misturar indiscriminadamente comportamento de tabs, listbox, grid e árvore; testar leitor de tela e teclado. | [W3C APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) |

**MUST:** escolher primeiro a semântica mínima suficiente e documentar o motivo de usar ou não um widget composto. Foco, seleção, expansão e navegação são estados diferentes. **MUST** definir o comportamento ao fechar drawer/modal/popover, remover item focado, trocar painel, alternar viewport e interromper animação: retorno ou reposicionamento de foco tem de ser deliberado e verificável. Fonte de implementação complementar: [Adobe React Aria — interações e foco](https://react-aria.adobe.com/) (Context7; orientação para comportamento, **não ordem de instalar React**).

#### 17.3. Visualizações complexas, navegação no conteúdo e degradação progressiva

| Nome oficial da orientação | Aplicação no Exam App | Fonte |
|---|---|---|
| **Complex Images** | Para imagem estática de gráfico, diagrama ou mapa, fornecer identificação curta e descrição detalhada das informações essenciais, com dados/estrutura acessíveis quando necessários. Para **grafo interativo**, fornecer experiência equivalente em lista/estrutura operável, não apenas texto alternativo numa imagem. | [W3C WAI — Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) |
| **In-page Navigation** | Em páginas realmente longas (documentação, edital, análise de resultado), oferecer índice com âncoras e títulos descritivos, preservando ordem de leitura e foco. Evitar índice redundante em página curta. | [USWDS — In-page Navigation](https://designsystem.digital.gov/components/in-page-navigation/) |
| **Progressive Enhancement / Graceful Degradation** | Se canvas, visualização 3D, filtros avançados ou animação falhar, manter informações e ações essenciais acessíveis em UI mais simples quando tecnicamente viável; exibir falha e recuperação explícitas. | [MDN — Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement); [MDN — Graceful Degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation) |

**Critérios para revisão do Exam App:**
1. **MUST** justificar a escolha entre lista, links expansíveis, árvore, grade e grafo pela tarefa e pela semântica, não por aparência. Sidebar simples: preferir Disclosure quando adequado; grafo relacional: interação visual com alternativa textual, não role tree automático.
2. **MUST** verificar interações de foco e seleção com mouse, teclado e tecnologia assistiva em widgets complexos, inclusive abrir/fechar painéis, excluir itens, navegar entre nós e interromper animação.
3. **MUST** distinguir descrição de imagem complexa estática de alternativa operável para grafo/gráfico interativo; preservar dados, relações relevantes e tarefa de navegação.
4. **SHOULD** usar Cognitive Walkthrough para avaliar primeiro uso de Questões, Simulados, Revisão, PDF e Explorar; medir resultados de uso e complementar com evidência do board/issue.
5. **SHOULD** aplicar Information Foraging Theory ao nome dos destinos, prévia de conteúdo, hierarquia e pistas para busca/volta; não mostrar todas as propriedades por padrão.
6. **MUST** registrar riscos de fallback/erro em gráficos e leitor PDF, sem inventar funcionalidade offline/no-JS ou declarar acessibilidade apenas por link de norma. A implementação continua sujeita a testes.
7. **MUST** preservar as regras visuais e de estados em [DESIGN.md](DESIGN.md) e sincronizar os nomes e as fontes com [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md).


### 18. Avaliação e infraestrutura de design 2026 — complementos oficiais

**Classificação:** os documentos abaixo **não são leis científicas de UI/UX**. São metodologia de avaliação W3C, formato de testes W3C, especificação comunitária de tokens, rascunho futuro de acessibilidade e capacidade de CSS. Foram conferidos em documentação publicada até **14/11/2026**, inclusive Context7 para DTCG e APG. Não declarar conformidade, implementação ou suporte sem evidência real; ver o [DESIGN.md](DESIGN.md) e o catálogo de [princípios de UX](docs/ux/ux-ui-principles.md).

| Nome original publicado | Status em 2026 | Utilidade para o Exam App / cuidado | Fonte oficial |
|---|---|---|---|
| **WCAG Evaluation Methodology (WCAG-EM) 2.0** | **W3C Group Note**, publicada em **23/07/2026** | Método de avaliação da conformidade WCAG de **produtos digitais**, considerando páginas, vistas e processos completos; não acrescenta critérios WCAG. | [W3C WCAG-EM 2.0](https://www.w3.org/TR/wcag-em-2/), [WAI Overview](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) |
| **Accessibility Conformance Testing (ACT) Rules Format 1.1** | **W3C Recommendation**, de **05/02/2026** | Formato para escrever regras de teste reproduzíveis e comparáveis; **não é um novo nível WCAG**. As ACT Rules individuais são informativas para conformidade. | [W3C ACT Rules Format](https://www.w3.org/TR/act-rules-format/), [WAI ACT Overview](https://www.w3.org/WAI/standards-guidelines/act/) |
| **Design Tokens Format Module 2025.10** | Relatório **estável** do Design Tokens Community Group, **28/10/2025**; **não** é W3C Recommendation | Vocabulário de tokens, grupos, tipos, referências/aliases e tokens compostos. Consultar ao **planejar interoperabilidade de tokens**; não converter os tokens CSS existentes para JSON sem necessidade/PR específico. | [DTCG — versão estável](https://www.designtokens.org/TR/2025.10/format/), [FAQ](https://www.designtokens.org/faq/) |
| **W3C Accessibility Guidelines (WCAG) 3.0 Working Draft** | **Rascunho de trabalho**, atualizado em **10/09/2026** | Acompanhar evolução; **não** substituir WCAG 2.2 como critério vigente de aceite nem declarar certificação WCAG 3. | [WAI WCAG 3 Introduction](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/) |
| **CSS Container Size Queries** | Tecnologia CSS documentada; **não é lei de UX** | Componentes de sidebar, painéis e cards adaptam sua composição ao contêiner disponível, quando isso for mais útil que usar somente o viewport. Verificar suporte e fallback antes de usar. | [MDN — CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) |

#### 18.1. Protocolo WCAG-EM 2.0 para avaliar produto e jornadas

**MUST** aplicar um processo proporcional em auditorias de conformidade abrangentes, usando os **cinco passos publicados**:

1. **Define the evaluation scope:** delimitar rotas, views, tecnologias, nível WCAG e versão do protótipo.
2. **Explore the target digital product:** identificar funcionalidade essencial e fluxos de Questões, Simulados, Revisão, Explorar, grafo, PDF, login e formulários.
3. **Select a representative sample set:** selecionar tipos de telas, estados, componentes, rotas e **processos completos**; incluir amostra aleatória quando apropriado, não só screenshots convenientes.
4. **Evaluate the selected sample set:** verificar critérios WCAG aplicáveis e os requisitos de conformidade sobre páginas e processos completos, com teclado, foco, leitor de tela quando possível, erros, zoom e mobile.
5. **Report the evaluation findings:** documentar versão/escopo, amostras, resultados, exceções, limitações e passos reproduzíveis, indicando **passou, falhou, não aplicável ou não testado**.

**MUST NOT** usar somente um resultado de scanner como prova de conformidade; **ACT Rules** servem para harmonização de testes e os resultados automáticos requerem avaliação humana para barreiras não detectáveis automaticamente. [WAI — Selecting Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/).

#### 18.2. Tokens, temas e adaptação sem migrações gratuitas

- **SHOULD** manter um inventário de tokens semânticos, fontes de verdade, referências, tema claro/escuro, estados de componentes, unidades e resoluções; consultar o DTCG 2025.10 se for introduzir um formato intercambiável ou converter tokens para outras plataformas.
- **MUST** distinguir **DTCG final estável 2025.10** do **Editors' Draft/preview experimental de 2026**; não implementar preview como norma final. Preservar a arquitetura atual e os tokens existentes de [DESIGN.md](DESIGN.md).
- **SHOULD** avaliar Container Queries em cards, painéis, grid e sidebar que podem ter larguras diferentes no **mesmo viewport**, incluindo layout com sidebar redimensionada; usar fallback que preserve conteúdo/CTA se container queries não forem aplicáveis.
- **MUST** testar a interação real e a semântica após mudanças de layout, evitando esconder foco, alterar contexto da tarefa ou quebrar componente por orientação/zoom.
- **MUST** classificar melhorias como **documentado, implementado ou testado**; estas referências não comprovam que o protótipo atual as aplica.

#### 18.3. Critérios WCAG 2.2 AAA complementares (não são obrigação AA)

| Critério / nível | Nome oficial | Aplicação facultativa em metas AAA e limites |
|---|---|---|
| **2.5.6 (AAA)** | **Concurrent Input Mechanisms** | Não restringir modalidades de entrada disponíveis salvo exceções essenciais, segurança ou configurações do usuário. |
| **3.3.6 (AAA)** | **Error Prevention (All)** | Para submissão de informação, oferecer reversão, verificação com correção **ou** revisão/confirmar conforme o critério; não exigir sempre modal. |
| **3.3.9 (AAA)** | **Accessible Authentication (Enhanced)** | Referência adicional para remover testes cognitivos nas etapas de autenticação, observando exceções/alternativas do critério. |

**Fonte:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Estes são **AAA**, não critérios necessários para alegação AA. Não inflar a lista principal de A/AA nem substituir 3.3.8 AA pelo 3.3.9 AAA.


### 19. Motion de componentes, ícones animados e drag-and-drop — diretrizes oficiais e padrões (2026)

**Escopo:** complementa os princípios de animação existentes, sem adicioná-los novamente como "leis". Separar **referência nativa Apple**, **design system Material 3**, **APIs Web/MDN**, **WCAG normativo** e **padrões dnd-kit/Motion**. O contrato de implementação e testes está em [MOTION.md §6](MOTION.md) e o mapeamento visual em [DESIGN.md §8.22](DESIGN.md). **Não instalar biblioteca nova só para reproduzir uma animação simples no protótipo HTML/CSS/JS.**

| Nome publicado | Categoria / escopo | Uso para o Exam App | Fonte |
|---|---|---|---|
| **Symbol Effects — Discrete, Indefinite, Transition, Content Transition** | Sistema **Apple Symbols** (APIs nativas, não componentes web) | Ícones de favorito, expandir/recolher, salvar e status podem expressar uma alteração de estado com efeito breve. **Não** reproduzir SF Symbols/SDK proprietário na web; para SVG/Lucide usar efeitos próprios acessíveis. | [Apple — Symbols](https://developer.apple.com/documentation/symbols), [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| **Draw On / Draw Off; Bounce; Pulse; Wiggle; Rotate; Replace** | Nomes de efeitos de símbolos Apple; referência de linguagem visual | Ícone pode animar entre estados com continuidade e feedback, sem looping arbitrário; avaliar versão/plataforma dos efeitos e não tratá-los como requisito web. | [Apple SF Symbols](https://developer.apple.com/sf-symbols/), [Apple — Symbols](https://developer.apple.com/documentation/symbols) |
| **Spatial Springs / Effects Springs (Material 3 Expressive)** | Design system M3 (não especificação de física da web) | Reposicionamento/escala/forma usam intenção espacial; cor/opacidade indicam estado sem bounce desnecessário. Já cobertos em MOTION.md §5: aplicar aos casos concretos. | [Material 3 — Motion](https://m3.material.io/styles/motion/overview), [Motion theming](https://m3.material.io/blog/m3-expressive-motion-theming) |
| **Sortable / Drag Handle / Drag Overlay / Drop Animation** | Padrões documentados por **dnd-kit** | Reordenar cards/painéis com alça deliberada, prévia de item arrastado, destino visível, animação de assentamento/cancelamento e estado consistente. | [dnd-kit — Sortable](https://dndkit.com/concepts/sortable/), [Drag Overlay](https://dndkit.com/react/components/drag-overlay/) |
| **Pointer Sensor / Keyboard Sensor / Accessibility / AutoScroller** | Recursos atuais de dnd-kit, implementação opcional | Mouse, toque, teclado, feedback anunciado e auto-scroll durante drag perto de bordas, com limite e testes. | [dnd-kit — DragDropManager](https://dndkit.com/concepts/drag-drop-manager/) |
| **Layout Animations / Shared Layout / AnimatePresence / Reorder** | Motion (API e exemplos React, não bibliotecas obrigatórias) | Transição de lista, card ↔ detalhe e entrada/saída sem salto ou perda de foco; adotar somente se compatível com stack atual/futura. | [Motion — Layout](https://motion.dev/docs/react-layout-animations), [Reorder](https://motion.dev/docs/react-reorder) |
| **View Transition API** | API Web (SPA/MPA), com compatibilidade condicionada | Transições de estado/rota e identidade visual entre vistas; fallback instantâneo, foco/scroll e estado lógico preservados. | [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [Using](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) |
| **G219 — Ensuring that an alternative is available for dragging movements that operate on content** | Técnica W3C **suficiente**, informativa, para **WCAG 2.2 SC 2.5.7 (AA)** | Dar alternativa de **ponteiro único sem arrastar**: botões Mover acima/abaixo, escolher destino por menu, escolher posição, clicar nó de origem e destino. **Teclado por si só não satisfaz 2.5.7.** | [WAI — G219](https://www.w3.org/WAI/WCAG22/Techniques/general/G219), [SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) |

**Contrato de implementação:**

1. **MUST** decidir o **significado** da animação: feedback de estado, orientação espacial, origem/destino, progresso ou gesto direto. Não animar todos os ícones no hover, criar loops decorativos, nem atrasar operações frequentes por estética.
2. **MUST** manter nome/papel/valor e foco acessível dos botões com ícone antes, durante e depois da animação; estado e mensagem em texto/ARIA quando pertinente. Ícones ornamentais devem ficar fora da árvore acessível, mas o botão continua nomeado.
3. **MUST** oferecer modo sem movimento espacial/loop quando há preferência reduced motion; preservar ação, estado e resultado. Para interações, **WCAG 2.3.3 Animation from Interactions é AAA**, ao passo que **2.5.7 Dragging Movements é AA**.
4. **MUST** distinguir quatro caminhos de reordenação: **arrastar por ponteiro**, **controle por teclado**, **alternativa por toque/clique sem arraste** e **cancelar/desfazer**, quando aplicáveis. A mesma ordem final e as mesmas permissões devem valer em todos.
5. **MUST** definir os estados de DnD: idle → armed → dragging → valid/invalid drop → committing → committed/failed, com Escape/cancelamento, drop fora do alvo, scroll, viewport dinâmico e persistência assíncrona; não anunciar "movido" antes de confirmar o estado apropriado.
6. **SHOULD** usar drag handle em cards que contêm botão, link, input ou seleção de texto; não roubar seleção/scroll do conteúdo nem aceitar drop em área inválida. Posição/índice devem permanecer acessíveis e reversíveis.
7. **MUST** aplicar WCAG 2.5.1, 2.5.2, 2.5.7 e 2.5.8 conforme pertinência, além de teclado/foco/reduced motion; registrar testes reais, incluindo touch, pointer cancel, arraste para fora, Escape e falha de gravação.
8. **MUST** manter animações interrompíveis e o estado lógico independente do fim do efeito; não depender só de transitionend/animationend. Consultar [MOTION.md §5.10](MOTION.md).
9. **MUST** registrar o fluxo com captura e, quando comportamento temporal importar, GIF/vídeo + descrição textual e resultado dos testes no board; **mudança apenas documental não exige imagem inventada**.


### 20. Estrutura de páginas e layout — evidências científicas e guias atuais (2026)

**Escopo:** esta seção responde à escolha de **hierarquia de conteúdo, proximidade, ordem, distribuição, painéis, colunas e modo de apresentação**. Não existe uma lei científica universal que obrigue layout em F, grid de 12/16 colunas, sidebar, CTA acima da dobra ou número fixo de painéis. **Leis de Fitts, Hick–Hyman e Gestalt já constam das seções 0–2**; não duplicá-las nem chamar guias de design systems de leis. Além dos princípios, consultar [DESIGN.md §8.23](DESIGN.md), [arquitetura da informação](docs/ux/arquitetura-informacao-navegacao.md) e [catálogo de UX](docs/ux/ux-ui-principles.md).

#### 20.1. Princípios e teorias com pesquisa publicada, relevantes para a composição

| Nome original estabelecido | Categoria e fonte original | Hipótese testável de composição para o Exam App | Limites e contraexemplos |
|---|---|---|---|
| **Proximity Compatibility Principle — PCP** | Princípio de fatores humanos, Wickens & Carswell (1995). [Artigo original, Human Factors](https://doi.org/10.1518/001872095779049408) | Dados que precisam ser **integrados ou comparados** na mesma tarefa devem estar perceptivamente próximos: enunciado e explicação relacionada, séries comparadas, seleção e propriedades do nó. | **Separar** informações pode ser útil quando a tarefa exige atenção seletiva a uma dimensão; proximidade funcional é diferente de colocar tudo num card. |
| **Spatial Contiguity Principle** | Princípio de aprendizagem multimídia, Mayer; Moreno & Mayer (1999). [Cambridge — Spatial Contiguity](https://www.cambridge.org/core/books/abs/multimedia-learning/spatial-contiguity-principle/B9B79EDC777C375C7ED410B82EF80247) | Posicionar legenda explicativa, imagem, figura do enunciado ou anotação do PDF perto do trecho ao qual se refere. | Diz respeito a **palavras e imagens correspondentes em material instrucional**, não obriga toda interface a usar uma única coluna ou impedir painéis separados. |
| **Split-Attention Principle / Effect** | Princípio e efeito investigado em aprendizagem multimídia/carga cognitiva. [Ayres & Sweller, Cambridge Handbook](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/splitattention-principle-in-multimedia-learning/497A2FCB9737E3009B3CF0E4D97F7B99) | Evitar forçar o estudante a procurar e integrar fontes indispensáveis distribuídas em abas/painéis distantes. | Aplica-se quando a tarefa requer integração mental simultânea; não proíbe navegação entre seções independentes. Sobrepõe-se parcialmente à contiguidade espacial. |
| **Signaling / Cueing Principle** | Princípio de aprendizagem multimídia com estudos experimentais. [van Gog, Cambridge Handbook (2021)](https://doi.org/10.1017/9781108894333.022) | Usar títulos, destaque semântico, alinhamento, marcadores e rótulos para indicar organização e relevância de enunciados, resultados e gráficos. | Sinalizar não significa aumentar número de badges, cores, chamadas e ícones em todas as regiões. |
| **Coherence Principle** | Princípio de aprendizagem multimídia; Mayer & Fiorella. [Cambridge Handbook (2021)](https://doi.org/10.1017/9781108894333.019) | Retirar decoração, textos e metadados irrelevantes **à tarefa atual** na superfície de resolução/leitura, preservando acesso contextual quando necessário. | Não omitir metadados exigidos pela tarefa, segurança, acessibilidade ou auditoria. Não é lei geral de minimalismo visual. |
| **Cognitive Fit Theory** | Teoria de adequação entre representação e tarefa, Vessey (1991). [Artigo original, Decision Sciences](https://doi.org/10.1111/j.1540-5915.1991.tb00344.x) | Comparações de valores exatos favorecem tabelas; tendências/relações espaciais podem favorecer gráficos/grafo; escolher a representação conforme a pergunta do usuário. | Nenhuma representação é universalmente superior; validar leitura, precisão, interpretação e alternativa acessível no caso real. |
| **F-Shaped Reading Pattern** | Padrão **observado**, não lei, em estudos de eye-tracking NN/g (2006; revisão de 2026). [NN/g — interpretação e limites](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/) | Texto longo precisa de títulos informativos, palavras-chave e início de parágrafo compreensível; testar escaneabilidade de instruções e resultados. | A leitura **nem sempre segue F**, sobretudo em layouts complexos, diferentes idiomas e tarefas; **não** impor layout em F ou prometer que colocar algo no alto à esquerda é universal. |

**Classificação e deduplicação:** PCP, Spatial Contiguity, Split-Attention, Signaling e Coherence são **princípios de pesquisa aplicados**, Cognitive Fit é **teoria**, e F-shaped é **padrão observado**. Nenhum se torna critério WCAG/ISO só por ter base científica; não os promover à seção 0 de leis estritas ou contar como sete novas leis. Fitts, Hick, Proximity/Similarity/Common Region, Figure–Ground, Prägnanz, Shneiderman, Information Foraging e Proximity Compatibility são referências complementares, não substitutas.

#### 20.2. Context7 — fontes oficiais de arquitetura visual, sem confundir com leis

| Documento / nome publicado | O que a documentação indica | Regra de aplicação |
|---|---|---|
| **Material Design 3 — Adaptive Design / Layout Scaffold / Panes / Breakpoints** | Estrutura por **bars, rails e panes**; breakpoints compact/medium/expanded/large/extra-large e estratégias adaptativas **show and hide, levitate, reflow**. [M3 — Layout](https://m3.material.io/foundations/layout/layout-overview/adaptive-design), [Scaffold](https://m3.material.io/foundations/layout/scaffold/overview) | Painel principal recebe prioridade; secundário aparece quando cabe sem prejudicar a tarefa ou fica sob demanda. **Não** adotar quantidades, widths ou regras Android automaticamente na web. |
| **IBM Carbon — 2x Grid / Spacing Tokens** | Grade responsiva com escalas semânticas de margem, coluna e espaçamento; versão de implementação usa 4/8/16 colunas por breakpoint. [Carbon — 2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/), [tokens de layout](https://github.com/carbon-design-system/carbon/blob/main/packages/layout/tokens/layout.tokens.json) | Referência para ritmo/alinhamento, **não** obrigação de substituir grid e tokens existentes ou usar todos os breakpoints Carbon. |
| **USWDS — Layout Grid / Side Navigation** | Grid responsivo flexível, navegação lateral curta com identificação da página atual e acesso por teclado. [USWDS — Layout Grid](https://designsystem.digital.gov/utilities/layout-grid/), [Side Navigation](https://designsystem.digital.gov/components/sidenav/) | Semântica clara, orientação e foco; não criar sidebar quando a jornada funciona melhor como página, tab ou drawer. |

#### 20.3. Regras práticas para agentes de layout (hipóteses, não leis novas)

1. **MUST** começar por **tarefa, informações essenciais, decisão, ação e feedback**, e só depois escolher página única, rota, painel, abas, accordion ou drawer. A organização de dados não precisa espelhar literalmente a arquitetura visual.
2. **SHOULD** usar **proximidade funcional** quando dados precisam ser integrados/comparados e **separação visual semântica** quando são tarefas independentes. Validar com tentativa real, não usar número fixo de bordas/cards/colunas.
3. **MUST** garantir ordem significativa e relações acessíveis conforme **WCAG 1.3.1, 1.3.2 e 1.4.10** quando aplicáveis. CSS Grid/Flex e breakpoints não autorizam ordem visual que contradiga leitura, Tab ou contexto.
4. **SHOULD** aplicar sinalização e coerência **na leitura e resolução de questões**: enunciado e figura relacionada próximos, destaque proporcional, explicação localizada e metadados secundários sob demanda. Testar contra layout com separação de fontes.
5. **SHOULD** aplicar Cognitive Fit em **gráficos, tabelas, estatísticas e grafo**; documentar que pergunta é respondida por cada representação e como o usuário obtém detalhes exatos e alternativa acessível.
6. **MUST** testar comportamento dos painéis quando largura, zoom, idioma, teclado e orientação mudam, preservando seleção, scroll, foco, filtros e posição do estudante. Usar container queries quando a largura do próprio painel — não só a janela — determinar a composição.
7. **AVOID** afirmar que layout em F/Z, regra de terços, golden ratio, grids de 12/16 colunas ou “tudo acima da dobra” são **leis experimentais obrigatórias de sites**. Padrões de leitura e regras de design exigem contexto e teste.
8. **MUST** registrar em PR/issue: problema observável, hipótese científica ou padrão utilizado, limitação, alternativas consideradas, evidência no board e teste de sucesso; **inclusão documental não equivale a protótipo implementado ou avaliado**.


### 21. Busca visual e estrutura instrucional — revisão Context7 (14/11/2026)

**Objetivo:** complementar [§20 — estrutura de páginas](AGENTS.md), [DESIGN.md §8.24](DESIGN.md) e [catálogo UX/UI](docs/ux/ux-ui-principles.md) com teoria de atenção, mensuração de desordem visual e pesquisas de organização didática. **Nenhuma das seis referências abaixo é nova lei universal de layout**. São **teorias, modelos e efeitos** em psicologia experimental e aprendizagem; investigar aplicação em tarefas reais em vez de transformar pesquisas sobre percepção em mandamentos de composição. A seção **0 — leis empíricas estritas** mantém suas categorias e não recebe estes itens.

#### 21.1. Atenção visual, hierarquia e busca (três referências)

| Nome original | Categoria / autores | Aplicação condicionada no Exam App | Fonte primária e restrições |
|---|---|---|---|
| **Feature Integration Theory** | Teoria de atenção visual, **Anne Treisman & Garry Gelade (1980)** | Distinção de características visuais simples versus alvos definidos por conjunção de características; testar descoberta de ação principal, indicador de erro, estado e filtro em páginas com muitos itens. | [Cognitive Psychology (1980)](https://doi.org/10.1016/0010-0285(80)90005-5). **Não** afirmar que qualquer cor/ícone sempre “salta aos olhos” ou substituir WCAG por saliência. |
| **Guided Search 2.0 — A Revised Model of Visual Search** | Modelo de busca visual, **Jeremy M. Wolfe (1994)** | Orientar rótulos, localização, contraste e organização de resultados/controles em sidebar, filtros e busca; testar encontrar um elemento-alvo entre distrações. | [Psychonomic Bulletin & Review (1994)](https://doi.org/10.3758/BF03200774). É **modelo**, não “lei do grid”; combina orientação de busca por características e atenção limitada. |
| **Feature Congestion: A Measure of Display Clutter** | Modelo/métrica experimental de desordem visual, **Rosenholtz, Li, Mansfield & Jin (2005)** | Comparar condições de alta/baixa competição visual de cards, badges, linhas e painéis, por tarefa de busca/atenção; investigar legibilidade além de preferência estética. | [CHI 2005 — texto do MIT](https://www.mit.edu/~yzli/clutter.pdf), [Measuring Visual Clutter (2007)](https://doi.org/10.1167/7.2.17). **Não** usar limiar numérico universal ou tratar “sem borda” como melhor layout. |

#### 21.2. Organização de conteúdos educacionais (três referências)

| Nome original | Categoria / autores | Aplicação condicionada no Exam App | Fonte e limites |
|---|---|---|---|
| **Segmenting Principle** | Princípio de aprendizagem multimídia, **Richard E. Mayer (2009)** | Dividir **explicação complexa ou animação didática** em blocos controlados pelo estudante; permitir avançar/rever sem perder contexto. | [Mayer, Multimedia Learning, cap. 9](https://www.cambridge.org/core/books/multimedia-learning/7A62F072A71289E1E262980CB026A3F9/listing). **Não** implica transformar toda página ou qualquer formulário em wizard; as evidências tratam sobretudo de mensagens multimídia complexas, autoiniciadas. |
| **Worked-Example Effect** | Efeito de aprendizagem e teoria da carga cognitiva, **Sweller & Cooper (1985)** | Em revisão e resolução comentada, considerar um exemplo com **passos explicativos integrados** para usuários que ainda não dominam o conceito; testar transferência e compreensão. | [Sweller & Cooper, Cognition and Instruction (1985)](https://doi.org/10.1207/s1532690xci0201_3), [Ward & Sweller (1990)](https://doi.org/10.1207/s1532690xci0701_1). O ganho depende de domínio, organização e familiaridade; não substituir toda prática ativa por exemplos. |
| **Expertise Reversal Effect** | Efeito experimental, **Kalyuga, Ayres, Chandler & Sweller (2003)** | Avaliar versões de ajuda, densidade e explicação para **iniciantes vs experientes**; instruções redundantes podem prejudicar quem já domina o assunto. | [Educational Psychologist (2003)](https://doi.org/10.1207/S15326985EP3801_4). **Não** deduzir expertise apenas de tempo de uso ou impor dois layouts sem testes. |

#### 21.3. Guidelines oficiais de composição textual — não são leis

| Fonte | Nome documentado | Condição de uso e cautela |
|---|---|---|
| [USWDS Typography](https://designsystem.digital.gov/components/typography/) e [Measure](https://designsystem.digital.gov/design-tokens/typesetting/measure/) | **Measure (line length)** | Para textos longos o USWDS recomenda faixa contextual aproximada **45–90 caracteres por linha**, com bom alvo em torno de 66; escolher largura pela fonte, idioma, zoom, tela e tarefa. **É diretriz de um design system**, não requisito rígido WCAG nem fórmula de usabilidade universal. |
| [IBM Carbon — density](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/docs/sass.md) | **Layout Density** | Variar espaçamento conforme tarefa de leitura ou análise sem esconder estados; não migrar tokens existentes só para replicar Carbon. |
| [Material 3 — Panes](https://m3.material.io/foundations/layout/scaffold/panes) | **Show and hide; Levitate; Reflow** | Reorganizar painéis mantendo orientação, seleção e significado; evitar layout em três colunas quando reduzir a legibilidade do enunciado. |

**Regras de auditoria e antirregressão:**

1. **MUST** definir o alvo de atenção por tarefa (por exemplo, Enunciado → Responder; Filtro → Resultado; Nó → Relações). Verificar tempo/erros de descoberta comparando layout atual e alternativa, sem supor saliência universal.
2. **SHOULD** medir **competição visual** separando componentes importantes de decoração, porém sem remover dados úteis; avaliar densidade em desktop, mobile, zoom e com texto mais longo.
3. **SHOULD** separar **apresentação segmentada de explicação** de **navegação por telas**: Segmenting Principle não determina número de páginas, abas nem cliques.
4. **SHOULD** testar exemplos resolvidos, explicações e progressão de ajuda conforme a experiência na matéria. O estudante experiente pode preferir detalhamento sob demanda; não ocultar alternativas acessíveis.
5. **MUST** preservar semântica, foco, ordem de leitura, reflow, estado de seleção e suporte a tecnologias assistivas; mecanismos visuais de saliência não substituem WCAG.
6. **MUST** registrar fonte, hipótese, caso de uso, limite, evidência no board quando existir e resultado **documentado / implementado / testado**. A inclusão destas referências é **somente documentação**, não teste da UI.


### 22. Padrões de componentes UI 2026 — inventário oficial e leis relacionadas

**Fonte obrigatória para criar/revisar componentes:** [docs/ux/componentes-ui-padroes-2026.md](docs/ux/componentes-ui-padroes-2026.md). Inventaria **30 padrões publicados no W3C WAI-ARIA APG** (de Accordion a Window Splitter), principais padrões de Material 3/Primer/React Aria e primitivas HTML/CSS atuais. **Padrões não são leis UX.** As leis e relações científicas continuam separadas nas seções 0–2; este complemento **mapeia** onde se aplicam, sem apresentar "30 novas leis".

#### 22.1. Escolha semântica de componentes por tarefa

| Necessidade | Componente e nome oficial pertinente | Contrato de escolha e lei/efeito aplicável |
|---|---|---|
| **Navegar** | **Link / Breadcrumb / Disclosure Navigation** | Preferir `<a href>` e landmarks `nav`; grupos expansíveis podem usar Disclosure. **Jakob's Law** (heurística de familiaridade), **Gestalt Proximity** (princípio perceptivo). Não criar `role=menu` só porque é sidebar. |
| **Alternar painel** | **Tabs** | Usar tablist/tab/tabpanel apenas para painéis associados com teclado/estado adequados; **tabs visuais de rotas** continuam links quando mudam de página. |
| **Escolher opção** | **Radio Group / Checkbox / Select / Listbox / Combobox / Segmented Buttons** | Usar exclusividade, quantidade e busca para decidir. **Hick–Hyman Law** para incerteza de escolha, não regra fixa de quantidade de opções. |
| **Exibir ações de item** | **Button / Menu Button / Action Menu / Toolbar** | Ações com nome/estado e foco; menus compostos usam teclado correspondente. **Fitts's Law** para alvo, **Steering Law** somente para trajetórias/restrições de menu em cascata. |
| **Confirmar decisão** | **Dialog (Modal) / Alert Dialog** | Modalidade real, foco contido e retorno; não usar `aria-modal=true` sem tornar fundo inerte nem dialog para qualquer explicação. |
| **Ajuda contextual** | **Tooltip / Popover / Disclosure** | Tooltip sem controles; popover interativo não modal quando apropriado; conformidade com **WCAG 1.4.13 AA** onde aplicável. |
| **Dados em coleção** | **Table / Grid / GridList / Tree View / Treegrid / DataTable** | Tabela para dados estáticos, Grid/Treegrid apenas com interatividade e modelo de teclado completos; grafo relacional não é automaticamente árvore ARIA. |
| **Andamento/medição** | **Progress / Meter / Alert / Status** | `<progress>` para operação/conclusão; `<meter>` para medição em faixa; anúncio de falha/recuperação por texto; não usar toast transitório como único aviso crítico. |
| **Painéis e drag** | **Window Splitter / Side Sheet / Drag Handle** | Resize/movimentação precisa de teclado e alternativa sem arraste quando o SC 2.5.7 (AA) exigir; Fitts/Steering informam esforço motor sem substituir WCAG. |

#### 22.2. Novidades nativas da web que precisam de teste de suporte

- **Popover API (`popover`/`popovertarget`)**: recurso Web não modal; **Baseline 2025**, não modal automático nem semântica de menu por si só. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
- **CSS Anchor Positioning (`anchor()`/`position-anchor`)**: posicionamento de popover/menu em relação a âncora com **Baseline 2026** para essas funcionalidades específicas, sujeito a browsers/recursos e fallback. [MDN — anchor()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/anchor), [position-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor).
- **Customizable `<select>` (`appearance: base-select`, `::picker(select)`)**: funcionalidade web moderna com **suporte limitado** em 2026; manter comportamento nativo/fallback e conferir Firefox/SSR/hydration antes de adotar. [MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select).
- **`<dialog>`/ `<details>` / `<meter>` / `<progress>`**: preferir semântica nativa adequada em vez de recriar widgets ARIA complexos sem necessidade. [MDN — HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).

#### 22.3. Contrato obrigatório para agentes de componentes

1. **MUST** consultar o [inventário de 30 padrões](docs/ux/componentes-ui-padroes-2026.md) antes de criar componente complexo e registrar **padrão escolhido, motivo, estados, semântica, teclado, foco, pointer/touch, feedback e fallback**. A origem pode ser W3C/HTML/design system; **não** chamá-la de lei científica.
2. **MUST** distinguir **Link de Button**, **Tabs de rotas**, **Menu de navegação**, **Tooltip de Popover**, **Table de Grid**, **Switch de Checkbox**, **Meter de Progress**, **Tree de grafo relacional**, e **modal de painel não modal**; consultar fonte primária específica antes de implementar ARIA.
3. **MUST** conferir **nome, função, estados, área clicável, foco visível, teclado, hover/focus tooltip, reduced motion, leitor de tela quando pertinente e mobile/zoom**. O padrão APG é orientação técnica, não prova de conformidade WCAG.
4. **MUST** preservar seleção, foco, filtros, estado pendente e continuidade entre panes, responsive, abertura/fechamento de overlays e atualizações assíncronas. A aplicação deve controlar persistência, cancelamento, erro e recuperação.
5. **SHOULD** vincular Fitts, Hick–Hyman, Steering, Gestalt, Jakob e outros **somente quando a hipótese for pertinente**, registrando como lei empírica, princípio perceptivo, heurística ou efeito. Não aplicar falsos números universais de botões, colunas ou duração.
6. **MUST** indicar se o componente está **documentado, implementado ou testado**; qualquer edição real de protótipo deve ter evidência no board, sem inventar screenshot/GIF.


### 23. Taxonomia de componentes e variantes de dialogs — pesquisa 2026

**Consulta obrigatória** ao [catálogo de 28 famílias de componentes e variantes de dialogs](docs/ux/taxonomia-componentes-e-dialogs-2026.md), além do [inventário dos 30 padrões W3C APG](docs/ux/componentes-ui-padroes-2026.md), antes de desenhar, alterar ou auditar qualquer widget composto. **Não confundir:** lei científica de UX/HCI, heurística/modelo, padrão semântico WAI-ARIA, variante de design system, composição visual e primitiva HTML.

- **MUST** classificar o componente por **tarefa, semântica, apresentação e estado**; escolher HTML nativo ou padrão APG apropriado antes do estilo. Usar fontes oficiais do catálogo, sem instalar nova biblioteca apenas porque um padrão existe.
- **MUST** decidir explicitamente entre **Dialog, AlertDialog, Non-modal Dialog, Popover, Menu, Combobox, SelectPanel, Sheet ou página**. Dialog de configurações com navegação interna não é AlertDialog; uma grade visual de tiles não é Listbox sem contrato de seleção.
- **MUST** respeitar foco inicial, foco contido quando modal, retorno ao trigger, Escape/cancelamento apropriado, nome e descrição acessíveis, fundo inerte somente se modal, rolagem, validação, persistência, erro e recuperação. Sem fechar silenciosamente com dados não salvos.
- **SHOULD** consultar variantes oficiais **Material 3 Basic/Full-screen**, **Carbon Passive/Transactional/Danger/Acknowledgment/Progress**, **Primer Dialog responsive**, **Apple Alerts/Sheets/Action Sheets/Popovers**, distinguindo variante do design system de role W3C.
- **MUST** selecionar formatos de dados conforme finalidade: Lista/Galeria/Kanban/Tabela/Embed compartilham dados e filtros; gráficos exigem título, unidade, valores e alternativa textual; grafo relacional não vira automaticamente uma árvore ARIA.
- **MUST** auditar componentes atuais de configuração, seleção de tipo, abas e painéis da dev antes de criar outro sistema paralelo. A imagem de referência do Settings Dialog é evidência de aparência, não prova de DOM/teclado do produto retratado.
- **MUST** registrar estado **documentado / implementado / testado** e screenshots/GIF reais no board quando a UI for alterada. Este catálogo é **somente documentação**; não significa correção ou teste de protótipo.

<!-- UX-LAWS-CATALOG:END -->

<!-- DESIGN-SYSTEM-INTEGRATION:START -->
## Material 3 Expressive + Apple HIG — contrato de integração para agentes (14/11/2026)

**Leitura obrigatória em alterações de interface:** [DESIGN.md](DESIGN.md) é a autoridade interna para aparência, componentes e tokens; [MOTION.md](MOTION.md) é a autoridade interna para animação e física; este `AGENTS.md` é a autoridade para execução, evidências e critérios de aceite. Complementar com [arquitetura de informação](docs/ux/arquitetura-informacao-navegacao.md), [princípios de UX/UI](docs/ux/ux-ui-principles.md), documentação oficial [Material Design 3](https://m3.material.io/) e [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/). **Não substituir silenciosamente** tokens, navegação ou comportamento existentes pelo visual de outra plataforma.

### Hierarquia de autoridade, fontes e modo de decisão

1. **MUST** priorizar tarefa real, acessibilidade e contratos existentes do Exam App sobre efeitos estéticos. Documentar objetivo, ação principal, estados e critérios de aceitação antes de redesenhar.
2. **MUST** diferenciar: (a) normas verificáveis WCAG/WAI-ARIA; (b) orientação oficial M3/HIG de escopo/plataforma específicos; (c) convenções próprias do Exam App; (d) sínteses, heurísticas e recomendações de skills comunitários. **Não chamar conselhos de terceiros de exigência oficial**.
3. **MUST** ler a fonte oficial atual quando a decisão depender de um valor exato (contraste, dimensão, componente, design token, motion token, licença ou API). Não fixar números de terceiros como especificação universal.
4. **MUST** usar tokens semânticos próprios do produto; tratar roles M3 `primary/on-primary/surface/on-surface` e Apple `label/fill/background` como **vocabulários de referência**, não como ordem para renomear os tokens `--app-*`, `--k-*` e `--motion-*` existentes. Preservar OKLCH e temas claro/escuro.
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
14. **MUST** suportar teclado, leitor de tela, foco visível/não oculto, estados `disabled/hover/pressed/focus/selected`, contraste, modo escuro, zoom/reflow, alto contraste quando aplicável e mensagens que não dependem só de cor.
15. **SHOULD** adotar layouts **adaptativos**, não apenas reduzir a largura: verificar sidebar, painel direito, barras de abas, filtros, gráficos/grafo, leitor de PDF e questões em viewport estreito, amplo e zoom de 200%/400% conforme critério aplicável; declarar limitações reais.
16. **AVOID** efeito Liquid Glass por padrão. Se uma superfície de controle flutuante precisar de translucidez, documentar propósito, contraste sobre conteúdos variáveis, fallback opaco, legibilidade em alto contraste, preferências de transparência e custo de `backdrop-filter`. O conteúdo principal de estudo deve permanecer estável e legível.

### Motion, feedback e integridade da tarefa

17. **MUST** seguir [MOTION.md](MOTION.md) para tokens e física. Diferenciar transições de estado (opacidade/cor, sem overshoot) das espaciais (posição, escala, raio, eventualmente spring); as equações e presets de skills são **referências**, não implementação automática.
18. **MUST** garantir animações **interrompíveis e reversíveis** a partir do estado visual atual, inclusive cliques rápidos, duplo clique, Escape, drag, novo filtro ou navegação em meio à transição; não enfileirar animações que causem atraso.
19. **MUST** impedir `scroll jump`, perda de foco, alteração acidental de resposta, atrasos na correção e movimento automático do grafo sem benefício. Não transformar a interface de estudos em demonstração de efeitos físicos.
20. **MUST** observar `prefers-reduced-motion` no CSS e JS/canvas e usar alternativa sem movimento espacial preservando significado, estado e feedback. Evitar reiniciar loops de física em abas ocultas ou quando estáveis.
21. **MUST** oferecer estado terminal de erro e recuperação para operações assíncronas, com timeout/deadline e retries limitados conforme a operação. Não usar animação de loading infinita como substituta de tratamento de erro.

### Procedimento de alteração e aceite

Antes de concluir uma mudança visual/interativa, o agente **MUST**:
- Conferir `origin/dev` **no início e no fim**; preservar mudanças concorrentes; abrir PR para `dev` conforme o fluxo do projeto.
- Levantar tarefa/problema, registrar baseline (DOM/ARIA, screenshot ou gravação/GIF onde movimento importar), URL/viewport/tema e comparar com evidências existentes em `docs/`, `prototypes/`, issues e `docs/archives/`.
- Registrar decisão de design: qual padrão interno foi mantido, qual princípio M3/HIG foi **adaptado**, qual alternativa foi rejeitada e por quê. Anotar fontes primárias e as referências comunitárias quando úteis.
- Validar teclado, leitor de tela onde possível, claro/escuro, touch/desktop, zoom, motion normal/reduzido, ações repetidas, navegação de volta, carregamento lento e erros. Para protótipos, verificar console e executar testes existentes relevantes.
- Publicar antes/depois com texto reconstrutível e evidência no board (`board.json` e assets), regenerando `BOARD.md` com `npm run board` quando a tarefa envolva UI real. **Mudança apenas documental** não exige screenshot inventado.
- Reportar **implementado × especificado × não testado**; não declarar conformidade M3, Apple HIG ou WCAG sem evidência.

**Consulta por tópico:** tokens, superfícies, tipografia, componentes, layout e critérios em [DESIGN.md](DESIGN.md); springs, easing, tempo, continuidade espacial, grafo, performance e motion reduzido em [MOTION.md](MOTION.md). Inventário de 22 referências (21 candidatos a skills e um agregador, sem auditoria integral) e separação entre fontes oficiais/comunidade em `DESIGN.md`.

### Auditoria de lacunas de design — evidência antes de declarar "implementado"

Para cada alteração de **formulário, navegação, componente, efeito ou tema**, registrar no PR uma matriz com colunas: `superfície` → `problema observado` → `regra interna aplicada` → `fonte oficial, quando houver` → `evidência antes/depois` → `teste` → `resultado (implementado/especificado/não testado)`. A ausência de teste não significa aprovação.

- **MUST** verificar [DESIGN.md §8.10–8.13](DESIGN.md): campos, formulários, matriz de estados, forced colors e padrões sem button; escolher `Salvar`/`Aplicar`/autosave pela semântica e risco da operação, não pela aparência.
- **MUST** testar inputs com teclado, digitação/composição IME, paste/autocomplete, validação, foco, erro de servidor, latência e recuperação. Não depender do placeholder, apenas cor, mensagens genéricas ou ausência silenciosa do botão.
- **MUST** testar navegação com estado transitório: reflow durante transição, alterações rápidas de viewport/zoom, clique repetido, hidden tab e nova ação antes do `animationend`; seguir [MOTION.md §5.10](MOTION.md).
- **MUST** verificar `forced-colors: active` quando aplicável; não esconder foco, seleção e separações funcionais atrás de sombra/gradiente/transparência. Para translucidez, `prefers-reduced-transparency` é **suporte progressivo**, não fallback universal; sempre ter superfície opaca como base.
- **MUST** distinguir **"links catalogados"** de **"SKILL.md efetivamente lido e verificado"**: não afirmar auditoria completa das 22 skills, compatibilidade ou conformidade sem registrar arquivo, caminho, revisão/commit e data, quando disponíveis. Conferir links com origem atual e corrigir moved/deleted.
- **SHOULD** validar uma tarefa representativa por superfície (criar/editar, filtrar, navegar, responder, rever erro), não apenas screenshots estáticas; se for mudança só documental, não inventar evidência visual.

### Verificação de atalhos, contraste e semântica por componente

- **MUST** conferir cada atalho anunciado na documentação, tooltip e modal com o dispatcher realmente implementado, em Windows/macOS, sem prometer `Ctrl+W`/`Ctrl+T` ou outro comando reservado pelo navegador. O usuário precisa de alternativa visível por clique/menu e os campos em edição não podem capturar atalhos globais.
- **MUST** medir contrastes de pares de cores e estados; OKLCH, Material 3 ou Apple HIG não comprovam automaticamente WCAG. Guardar resultado e contexto do cálculo quando declarar conformidade.
- **MUST** diferenciar foco de diálogo modal (Tab contido quando modal) de padrão menu (setas, Enter, Escape e retorno ao invocador) e de popover não modal. Preferir elementos nativos com semântica correta; auditar no DOM real.
- **SHOULD** testar conteúdo longo/localizado, idiomas e formatos de data/número, tamanho de fonte aumentado e ordem de leitura quando layout adaptativo reorganizar elementos. Ver [DESIGN.md §8.15](DESIGN.md).

### Princípios Apple 2026, UX Writing e decisão de expressividade

- **SHOULD** consultar [DESIGN.md §8.16](DESIGN.md) para identificar os **oito princípios oficiais Apple (Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight)** relevantes à tarefa; são orientações de design, não leis universais nem requisitos WCAG.
- **MUST** seguir [DESIGN.md §8.17](DESIGN.md) ao criar/alterar labels, tooltips, mensagens de erro, recuperação, estados vazios, avisos de IA e CTAs; a microcopy precisa explicar contexto e consequência, especialmente em ações irreversíveis.
- **SHOULD** seguir [DESIGN.md §8.18](DESIGN.md) para justificar contenção, tamanho, forma, cor, tipografia e movimento expressivo como mecanismos funcionais, em vez de copiar uma aparência Apple/Google.
- **MUST** separar candidatos a skills, catálogos agregadores e fontes primárias. O inventário de 22 URLs em `DESIGN.md` inclui um agregador (M09), **não 22 skills individuais verificados**. Na issue #156, registrar o arquivo `SKILL.md` exato ou marcar como não confirmado, sem supor leitura integral.

<!-- DESIGN-SYSTEM-INTEGRATION:END -->
