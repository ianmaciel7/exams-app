# Exam App — Design System & UI/UX Specification (`DESIGN.md`)

Este documento define os princípios de produto, design tokens, tipografia, geometria de superfícies e arquitetura de interfaces do **Exam App**. Ele serve como a especificação de verdade para desenvolvedores e agentes de IA que criam ou refinam telas do ecossistema.

---

## 1. Princípios de Produto & Filosofia Visual

O Exam App é uma plataforma de estudos de alta densidade cognitiva para concursos públicos brasileiros e certificações. Sua experiência combina o rigor estrutural de ferramentas de gestão de conhecimento pessoal (PKM) com a ergonomia de plataformas líderes de resolução de questões:

1. **Superfícies em Camadas (Inspirado em Capacities e Notion)**:
   - A interface utiliza o paradigma de *cards sobre fundo sutil* (`--app-tab-bg-back`), criando profundidade sem poluição visual.
   - O conteúdo em foco reside em superfícies brancas/claras (`--app-tab-bg-base` / `oklch(1 0.0001 263.28)`), delimitadas por bordas delicadas de 0.5px a 1px (`--app-tab-border-front`).
2. **Clareza Hierárquica & Densidade Controlada**:
   - Informações críticas (enunciado, alternativas, gabarito, cronograma de edital) recebem destaque sem dispersão.
   - Metadados secundários (banca, ano, tags, órgãos) são agrupados em chips semânticos compactos de altura padronizada (20px a 24px).
3. **Ergonomia Sem Deslocamento de Rolagem (No Scroll Jumping)**:
   - Resoluções de questões, expansão de comentários e alternância de abas não devem provocar saltos de rolagem (*layout shifts* ou pulos de viewport).
   - O feedback de acerto/erro é estático ou posicionado logo abaixo da alternativa, sem empurrar bruscamente a área de leitura.
4. **Espacialidade e Conexões (Inspirado em Obsidian)**:
   - Todo objeto de estudo (Concurso, Edital, Cargo, Disciplina, Questão) é um nó interligado em um grafo de conhecimento contínuo e bidirecional.
   - As visualizações alternam com fluidez entre leitor de documentos, resolução de questões, painel de contexto e grafo interativo.

---

### 1.1 Política Low-Chrome (Issue #97)

Separadores contínuos no *shell* (por exemplo, `.side` e `.ws-tabs`) são excepcionais. O layout prioriza fundos em camadas, *gutters* e sombras discretas para distinguir os três painéis sem desenhar uma grade permanente.

- **Sem borda decorativa:** a lateral `.side` não recebe `border-right` e o trilho `.ws-tabs` não recebe `border-bottom` por padrão.
- **Divisores funcionais preservados:** separadores condicionais entre abas, `.side-rz`, `.rp-split`, grupos, campos, listas e superfícies com elevação podem usar bordas quando a interação ou semântica exige.
- **Rodapé e conteúdo preservados:** `.side-foot`, `.body .view` e `.rp-body` mantêm suas delimitações até validação visual específica.
- **Não globalizar:** nunca redefinir `--line` para transparente nem aplicar `border: none` globalmente.
- **Validação antes de concluir:** comparar tema claro/escuro e três larguras (1366, 1024, 768px), com sidebar e painel contextual expandidos/recolhidos. Capturar evidência visual antes/depois no board.

## 2. Design Tokens & Cores Semânticas (OKLCH)

A paleta adota o espaço de cor **OKLCH**, garantindo uniformidade perceptiva de brilho (*lightness*) e contraste acessível em conformidade com as normas WCAG AA/AAA.

### 2.1 Cores de Entidade (Semantic Entity Badges)

Cada tipo de objeto no sistema possui uma tonalidade distintiva para identificação instantânea em listas, abas, grafo e chips:

| Entidade | Light Mode (Hex / Token) | Dark Mode (Hex / Token) | Propósito & Semântica |
| :--- | :--- | :--- | :--- |
| **Concurso** | `--k-concurso: #258a70` | `--k-concurso: #62c5a8` | Instituição realizadora e certame global |
| **Edição** | `--k-edicao: #356fca` | `--k-edicao: #78b1ff` | Ano / versão do concurso (ex: 2024, 2026) |
| **Cargo** | `--k-cargo: #8751bb` | `--k-cargo: #d0a6ff` | Função pretendida (ex: Analista de TI) |
| **PDF / Edital** | `--k-pdf: #c0443e` | `--k-pdf: #f38d88` | Documentos oficiais, retificações, gabaritos |
| **Órgão** | `--k-orgao: #a0621c` | `--k-orgao: #e8b073` | Órgão governamental solicitante |
| **Banca** | `--k-banca: #1f7a8c` | `--k-banca: #6fcbdc` | Organizadora da prova (FGV, Cebraspe, FCC) |
| **Disciplina** | `--k-disciplina: #8a7512` | `--k-disciplina: #d9c765` | Matéria do edital (ex: Direito Constitucional) |
| **Questão** | `--k-questao: #5b5ba8` | `--k-questao: #a0adff` | Item avaliativo individual |

### 2.2 Superfícies e Sistema de Abas (OKLCH Tab Tokens)

Tokens de superfície extraídos da especificação legada de paridade (`notes-app-old-4`):

```css
:root {
  /* Fundo de base para abas ativas e cartões principais */
  --app-tab-bg-base: oklch(1 0.0001 263.28);
  /* Fundo da barra superior, tabs inativas e gutters */
  --app-tab-bg-back: oklch(0.9856 0.0016 67);
  /* Estado de hover sobre abas inativas */
  --app-tab-bg-back-hover: oklch(0.9676 0.0016 67.02);
  /* Borda sutil de elevação */
  --app-tab-border-front: oklch(0.9163 0.0017 67.07);

  /* Hierarquia de texto */
  --app-tab-text-primary: oklch(0.2191 0.0058 285.84);
  --app-tab-text-secondary: oklch(0.3887 0.0052 301.05);
  --app-tab-text-subtle: oklch(0.5725 0.0051 33.89);
  --app-tab-text-active: #5c6fbd;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --app-tab-bg-base: var(--bg);
    --app-tab-bg-back: var(--side);
    --app-tab-bg-back-hover: var(--hover);
    --app-tab-border-front: var(--line);
    --app-tab-text-primary: var(--text);
    --app-tab-text-secondary: var(--text);
    --app-tab-text-subtle: var(--muted);
    --app-tab-text-active: #78b1ff;
  }
}
```

### 2.3 Feedback de Resolução (Status Semântico)

- **Sucesso / Acerto**: `oklch(0.62 0.17 142)` (Verde folha equilibrado). Em Dark Mode: `oklch(0.75 0.15 142)`.
- **Erro / Incorreto**: `oklch(0.55 0.22 25)` (Carmim controlado, não ofuscante). Em Dark Mode: `oklch(0.72 0.18 25)`.
- **Atenção / Marcada para Revisão**: `oklch(0.78 0.16 75)` (Âmbar suave).
- **Gabarito Oficial Preliminar/Definitivo**: `oklch(0.58 0.18 255)` (Azul cobalto focado).

---

## 3. Tipografia & Escala de Espaçamento

O sistema emprega a família **Inter** (`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) com renderização nítida via `subpixel-antialiased` ou `-webkit-font-smoothing: antialiased`.

### 3.1 Escala Tipográfica

- **Títulos de Seção / Header do Workspace**: `18px`, peso `600`, line-height `1.25`, tracking `-0.015em`.
- **Enunciado de Questão (Corpo Principal)**: `14px` a `15px`, peso `400`, line-height `1.6`, tracking `-0.005em`.
- **Alternativas de Questões**: `13.5px`, peso `400`, line-height `1.5`.
- **Texto de Abas (`.ws-tab`)**: `13px`, peso `400` (inativa) e `500` (ativa), line-height `1`.
- **Metadados, Badges & Chips**: `11px` a `12px`, peso `500`, tracking `0.01em`, uppercase opcional em siglas.
- **Monospaçado (Códigos de Leis, Artigos, Regex)**: `'JetBrains Mono', 'Fira Code', monospace`, `12.5px`.

### 3.2 Geometria de Superfícies & Raios de Borda

- **Abas (`.ws-tab`)**: Altura fixa de `32px`, raio `rounded-[8px]`, padding `3px 2px 3px 6px`.
- **Barra Superior Unificada**: Altura fixa e idêntica de `46px` (`min-height: 46px`) em ambas as colunas (workspace central e painel direito).
- **Cartões de Conteúdo & Questão**: Raio `12px`, borda `1px solid var(--app-tab-border-front)`, sombra `0 1px 3px rgba(0, 0, 0, 0.05)`.
- **Chips e Badges**: Raio `6px`, padding `2px 8px`, altura `22px`.
- **Botões de Ação**: Raio `8px`, altura `32px` ou `36px`.

---

## 4. Benchmark & Análise de Telas Equivalentes na Web

### 4.1 Capacities (Layout de 3 Colunas & Abas Conectadas)
- **O que adotamos**:
  - Estrutura tripartida: **Navegação Lateral Esquerda** (acervo, pastas, filtros de concurso), **Área Central de Trabalho** (documento, simulado, leitor de PDF) e **Painel Direito de Inspeção** (grafo local, ficha de metadados, notas rápidas).
  - Seletor de Espaços (Spaces Switcher) ancorado no topo da sidebar esquerda com menu popup para troca imediata de foco de estudo.
  - Abas inteligentes com estado salvo em localStorage, suportando fixação (*pin*), reordenação e fechamento rápido.

### 4.2 Obsidian (Grafo Interativo & Relações Bidirecionais)
- **O que adotamos**:
  - Grafo global e grafo local por entidade.
  - Densidade de nós configurável com filtragem visual por cores semânticas (`--k-*`).
  - Física de layout **condicional e interrompível**: estabiliza e pausa quando não há necessidade de movimento; desativa em `prefers-reduced-motion`, aba oculta ou grafo fora da viewport. Grafos com mais de 240 nós usam layout estático provisório para limitar custo `O(N²)` (ver `MOTION.md`; benchmark ainda pendente).
  - Abertura de nós com tecla de modificação (ex: Shift + Clique para abrir no painel lateral).

### 4.3 Quizlet (Resolução Focada & Repetição Espaçada)
- **O que adotamos**:
  - Atalhos de teclado nativos para responder (1 a 5 ou A a E, Enter para confirmar).
  - Indicador de progresso limpo sem bloquear a visão do enunciado.
  - Feedback visual não punitivo, com animação de microinteração rápida e foco na explicação.

### 4.4 QConcursos & Tec Concursos (Resolução de Questões em Concursos Brasileiros)
- **O que adotamos**:
  - Separação clara entre **Texto de Apoio / Legislação** e **Comando da Questão**.
  - Identificação precisa da banca examinadora, órgão, ano de aplicação e disciplina no cabeçalho de cada item.
  - Alternativas com alvos de clique generosos (`min-height: 44px`), espaçamento confortável entre linhas e radio buttons customizados.
  - **Zero Scroll Jump**: a exibição de gabarito comentado, comentários de professores e estatísticas da questão utiliza áreas colapsáveis com transição suave, mantendo o scroll do usuário travado na questão ativa.
  - Botão de "Caderno de Erros" e "Marcação para Revisão" integrados a cada cartão de questão.

---

## 5. Diretrizes da Barra Superior Unificada (Unified Top Bar)

A barra superior é a âncora de navegação e orientação do usuário, com altura invariante de **46px**:

```
+----------------------------------------------------------------------------------------------------------+
| [C Espaço ↕]  [◧ Toggle Sidebar]  [< > Histórico]  |  [Aba 1 ×] [Aba 2 ×] [+] [▼ Overflow]  |  [◨ Toggle RP] |
+----------------------------------------------------------------------------------------------------------+
```

### 5.1 Componentes e Disposição

1. **Seletor de Espaço (`[C Espaço ↕]`)**:
   - Posição: Canto superior esquerdo da barra quando a navegação lateral estiver recolhida.
   - Mostra o monograma e nome do espaço de estudo ativo (ex: "Dataprev 2026", "INSS", "CNU").
   - Clique abre dropdown acessível com busca e gerenciador de espaços.
2. **Alternador de Sidebar Esquerda (`[◧]`)**:
   - Botão quadrado de 28px x 28px, borda arredondada de 6px, hover suave.
   - Ativa/recolhe a navegação lateral com atalho global `Ctrl + \`.
3. **Controles de Histórico (`[<] [>]`)**:
   - Navegação Voltar/Avançar inspirada em navegadores web.
   - Estado desabilitado (`opacity: 0.35; cursor: default`) quando a pilha de histórico local estiver no início/fim.
4. **Trilho de Abas Principais (`[Abas +]`)**:
   - Largura mínima por aba: `MAIN_TAB_MIN_WIDTH = 82px`. Espaçamento: `MAIN_TAB_GAP = 4px`.
   - Separador vertical sutil entre abas inativas (`height: 18px; width: 0.5px; opacity: 0.6`).
   - Botão de fechar aba (`×`): área de 20px x 20px no canto direito da aba, visível permanentemente na aba ativa e no hover das abas inativas.
   - Atalhos de teclado: `Alt + 1` até `Alt + 9` para alternar abas; `Ctrl + W` ou duplo clique na aba para fechar.
   - Botão `+`: cria nova aba de visualização (explorador, grafo, busca).
   - Botão de Overflow (`[▼]`): acionado automaticamente quando o número de abas excede a largura disponível, exibindo menu suspenso pesquisável de 256px.
5. **Alternador de Painel Direito (`[◨]`)**:
   - Alinhado à extremidade direita da barra superior.
   - Permite expandir ou colapsar o painel lateral de inspeção, mantendo paridade visual de altura (46px) com a barra de abas do painel direito.

---

### 5.2 Zero Emoji Policy

Unicode emoji e caracteres pictográficos não são usados na interface, em botões, badges, KPIs, estados vazios ou especificações de UI. Use ícones vetoriais SVG semânticos e monocromáticos com `currentColor`, `stroke-width="1.8"`, `stroke-linecap="round"` e `stroke-linejoin="round"`.

## 6. Arquitetura de Telas & Padrões de Interface

### 6.1 Tela de Resolução de Questões (Modo Treino / Exercícios)

- **Header do Item**:
  - Chips semânticos: Banca (`--k-banca`), Órgão (`--k-orgao`), Ano (`--k-edicao`), Cargo (`--k-cargo`), Disciplina (`--k-disciplina`).
  - Botão de favoritar e botão de adicionar a caderno de erros.
- **Corpo da Questão**:
  - Enunciado formatado com suporte a tabelas, citações legislativas e imagens.
  - Alternativas listadas verticalmente de A a E.
  - Hover highlight em toda a área da alternativa (`--app-tab-bg-back-hover`).
- **Barra de Ação de Resposta**:
  - Botão "Responder" com destaque primário (`#5c6fbd` / `#78b1ff`).
  - Ao responder:
    - Alternativa escolhida: contorno destacado.
    - Se correta: verde semântico acessível com badge de acerto.
    - Se incorreta: carmim semântico acessível e indicação da alternativa correta.
    - O feedback aparece inline sem reposicionar bruscamente o scroll da página.
- **Abas de Apoio Pós-Resposta**:
  - `[Gabarito Comentado]` / `[Estatísticas]` / `[Comentários da Comunidade]` / `[Caderno de Anotações]`.

### 6.2 Ficha de Objeto (Edital, Concurso ou Cargo)

- **Banner / Metadados Principais**:
  - Título do concurso/órgão com ícone oficial SVG.
  - Tabela resumo de dados críticos: Período de Inscrição, Data da Prova, Remuneração, Vagas, Taxa.
- **Visualizador Split-View (PDF + Análise)**:
  - Lado esquerdo: Leitor PDF integrado com busca de texto selecionável e marcadores de página.
  - Lado direito: Lista de disciplinas e tópicos extraídos do anexo de conteúdo programático.

### 6.3 Modo Simulado

- **Barra de Controle de Prova (Sticky Top)**:
  - Cronômetro regressivo com alertas visuais suaves aos 30min e 10min restantes.
  - Contador de questões: `Respondidas (45) / Em Branco (15) / Marcadas para Revisão (5)`.
- **Grade Rápida de Salto (Navigator Drawer)**:
  - Grade numérica compacta com cores de status para saltar instantaneamente para qualquer questão sem scroll longo.
- **Dashboard Final de Desempenho**:
  - Gráfico de acerto percentual por disciplina, tempo médio gasto por questão e comparativo com o ponto de corte estimado.

---

## 7. Acessibilidade (WCAG 2.2 AA)

1. **Navegação Integral por Teclado**:
   - `Tab` / `Shift+Tab` percorre ordenadamente todos os elementos interativos com anel de foco visível (`focus-visible: 2px solid var(--app-tab-text-active)` com offset de 2px).
2. **Contraste de Cores**:
   - Razão mínima de contraste de 4.5:1 para texto normal e 3:1 para texto grande e componentes gráficos interativos.
3. **Leitores de Tela (ARIA)**:
   - Abas utilizam `role="tablist"`, `role="tab"`, `aria-selected="true|false"` e `aria-controls`.
   - Alternativas utilizam `role="radiogroup"` e `role="radio"` com `aria-checked`.
   - Modais e painéis suspensos utilizam `role="dialog"` ou `role="menu"` com gerenciamento de foco (focus trap).

<!-- MATERIAL-APPLE-INTEGRATION:START -->
## 8. Síntese aplicada — Material Design 3 Expressive × Apple HIG

> **Status:** diretriz interna proposta para o Exam App, derivada de documentação oficial e de skills comunitários consultados em 14/11/2026. **Não significa que todos os itens já estejam implementados.** As seções 1–7 e os tokens implementados no protótipo continuam válidos; se houver divergência, registrar a decisão em issue/PR antes de alterar o produto.

### 8.1 Modelo de referência e precedência

| Fonte | O que aproveitamos | O que não importamos automaticamente |
|---|---|---|
| **Exam App** (canônico) | Identidade low-chrome, leitura concentrada, entidades semânticas, grafo, barra de abas, OKLCH e organização de estudos | Nenhuma refatoração visual sem observar comportamento real |
| [Material Design 3](https://m3.material.io/) | Papéis de cor, design tokens, variações de estado, componentes escolhidos por finalidade, adaptatividade | Nomenclatura de tokens/controles Android obrigatória no HTML |
| Material 3 **Expressive** | Ênfase direcionada por peso tipográfico, cor, forma, hierarquia e movimento funcional | Overshoot em texto ou efeitos excessivos em tarefas repetitivas |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) | Clareza, conteúdo em primeiro plano, previsibilidade, continuidade espacial e acessibilidade | UI nativa iOS literal em aplicativo web multiplataforma |
| [Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass) | Tratamento cuidadoso de sobreposições **funcionais** e contraste dinâmico | Glassmorphism como decoração em cards, enunciados e relatórios |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) + [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) | Critérios verificáveis de acessibilidade Web e padrões de interação | Inferir conformidade apenas pela aparência |

**Regra de decisão:** conteúdo e tarefa → arquitetura da informação → estado/comportamento → ergonomia → acessibilidade → geometria/cores → efeitos. Um componente não deve parecer mais importante por motivo puramente estético.

### 8.2 Tradução de tokens, sem substituir a identidade do projeto

Referências externas mostram duas linguagens de tokens. A aplicação **não deve** criar três paletas independentes para a mesma interface.

| Intenção semântica | Vocabulário M3 de referência | Vocabulário Apple de referência | Decisão Exam App |
|---|---|---|---|
| Superfície principal | `surface`, `surface-container` | `background` / `secondary-system-background` | Preservar `--app-tab-bg-base` e papéis existentes |
| Superfície rebaixada | `surface-container-low` | `secondary/grouped background` | Preservar `--app-tab-bg-back`, gutters e low-chrome |
| Conteúdo principal | `on-surface` | `label` | Manter alto contraste e tokens de texto do produto |
| Conteúdo secundário | `on-surface-variant` | `secondary-label` | Preferir peso/contraste calibrados a opacidade arbitrária |
| Ação principal | `primary` / `on-primary` | `tint` / `accent` | Um CTA primário por contexto, com par de contraste |
| Estado selecionado | `primary-container`, `on-primary-container` | `selected/active fill` | Estado consistente entre sidebar, abas, filtros e grafo |
| Erro | `error`, `on-error` | `systemRed` + texto de status | Usar semântica de erro; não confundir com cor de entidade PDF |
| Cores de entidades | N/A: brand/semantic extensions | N/A: custom semantic colors | **Manter** `--k-concurso`, `--k-edicao`, `--k-questao` etc. |
| Movimento | `motion` / spatial/effects | Springs, interruption, gesture | **Manter** `--motion-*`, conforme [MOTION.md](MOTION.md) |

**Contrato:**
- Definir **roles semânticos** na camada de design; componentes não recebem cores hardcoded para representar sucesso, erro, seleção ou entidade. Valores literais documentados na seção 2 são baselines existentes, não licença para espalhar novas cores no HTML.
- OKLCH é a preferência atual do Exam App. Tokens M3 derivados de *seed color* podem inspirar paletas, mas não justificam trocar cores de entidade já reconhecidas; testar contraste em claro/escuro e com conteúdo variável.
- Cores `on-X` sempre devem formar pares legíveis sobre as superfícies `X`; contraste não pode depender de uma combinação presumida por um plugin.
- Light/dark/high-contrast devem preservar **significado** e estados, não apenas inverter valores. Não representar dados só pela cor; combinar forma, texto/ícone, legenda ou padrão.
- Dynamic color conforme wallpaper é capacidade de determinadas plataformas M3; na Web é uma **opção de personalização**, não requisito do Exam App. Não inferir paletas do dispositivo sem intenção de produto e controle do usuário.
- O padrão de código é `var(--token)`/classes semânticas; usar `oklch()` e fallback suportado quando necessário; não renomear todos os tokens para `--md-sys-*` ou `--apple-*`.

### 8.3 Tipografia e hierarquia expressiva

1. Manter **Inter e a pilha de fallback existente** da seção 3. Referências a SF Pro/SF Symbols indicam padrões tipográficos nativos Apple, **não autorização para distribuir assets proprietários**.
2. Dar prioridade, nesta ordem, a: título/contexto, tarefa atual, enunciado, opções de resposta, feedback e metadados. Quanto mais densa a tela, menor deve ser a variedade de estilos simultâneos.
3. Aplicar a ideia M3 Expressive de **emphasized typography** em pontos escassos (ação primária, seção selecionada, marco de conclusão). Preferir mudança de peso/cor sem mexer no tamanho, caso a alteração de tamanho provoque layout shift.
4. **Não reduzir texto crítico** de enunciados, alternativas e feedback por vontade de encaixar mais cards na dobra. As medidas históricas da seção 3 devem ser avaliadas com zoom e testes de legibilidade antes de serem promovidas a novos padrões.
5. Usar line-height confortável em longas leituras; comprimento de linha controlado, parágrafos escaneáveis, títulos informativos e números com estabilidade visual em cronômetros/contadores.
6. Respeitar aumento de fonte e preferências do navegador; nunca bloquear zoom nem resolver truncamento crítico somente com ellipsis.

### 8.4 Formas, raios e elevação — do M3 Expressive ao low-chrome

- A família M3 Expressive ilustra escalas de raio **0, 4, 8, 12, 16, 20, 28, 32, 48 e full** e *expressive shapes* decorativas. **No Exam App**, os valores existentes da seção 3.2 continuam canônicos até revisão baseada em evidência.
- **Raios aninhados:** quando painel externo e elemento interno são ambos arredondados, considerar aproximadamente `r_interno = max(0, r_externo - padding)` como heurística geométrica, não como regra obrigatória para todos os componentes.
- Sombra, tom e contraste de superfície são alternativas à borda contínua. Usar poucos níveis de profundidade; preservar separadores funcionais para resize, colunas de dados, grupos e controles.
- Formas assimétricas, *bursts*, *cookies*, blobs ou morphing pertencem a ilustrações/feedback especial, nunca a contêineres textuais de questões, PDFs e simulados.
- **Não animar border-radius em listas densas** sem propósito. Bordas e elevação devem manter indicação de hover, foco, selecionado e drag.
- O exemplo Apple de material translúcido é **contextual**; o paradigma M3 de superfície tonal opaca é o default apropriado a áreas de conteúdo do Exam App.

### 8.5 Componentes: intenção antes da aparência

| Componente / superfície | Aplicação no Exam App | Anti-padrão a evitar |
|---|---|---|
| CTA primário | Começar/resumir simulado, responder/confirmar quando apropriado | Dois ou três botões igualmente dominantes |
| Botão secundário / ícone | Preferências, expandir painel, ação contextual; nome acessível em icon-only | Clique sem ação, hover exclusivo para descobrir |
| Chip | Filtro aplicado, entidade, estado ou propriedade curta | Chip agindo como navegação primária oculta |
| Abas | Vistas equivalentes de uma ficha ou workspace | Abas duplicadas em gráfico, tabs para passos sequenciais |
| Menu / Popover | Ações opcionais de baixo uso, ancoradas ao disparador | Esconder tarefa principal em menu de reticências |
| Sidebar / Navigation Rail | Destinos principais persistentes em desktop; versão adaptada em mobile | Navegação fragmentada entre sidebar e toolbar |
| Right Panel | Contexto e propriedades auxiliares da seleção atual | Duplicar toda a página ou deslocar a questão |
| Dialog | Confirmação irreversível, escolha curta, erro que requer decisão | Formulário longo e frequente sem justificativa |
| Drawer / Sheet | Filtros e navegação em largura restrita; retorno preservado | Overlay que cobre todo o enunciado sem saída clara |
| Card / List | Agrupamento quando a superfície realmente tem unidade própria | Card em card em card e divisores permanentes inúteis |
| Grafo | Relações entre objetos, foco no nó selecionado, filtros/legendas | Animação incessante, seleções sem estado ou controles repetidos |
| Leitor PDF / Questões | Conteúdo primeiro, zoom e navegação estáveis, progresso e contexto | Toolbars infladas, rolagem inesperada, gabarito antecipado |

**Estados mínimos por controle:** default, hover quando houver mouse, active/pressed, focus-visible, selected quando aplicável, disabled, loading, success, error, empty e offline/indisponível quando relevantes. `disabled` não substitui explicação de motivo; feedback textual não substitui affordance.

### 8.6 Densidade, navegação e arquitetura adaptativa

A responsividade é uma mudança na **composição** conforme espaço e tarefa, não uma versão miniaturizada do desktop:

| Situação | Composição recomendada (hipótese a validar) | Continuidade exigida |
|---|---|---|
| Desktop amplo | Sidebar, workspace primário, painel de contexto opcional | Mesmo objeto selecionado entre painel/grafo/leitor |
| Desktop compacto/tablet | Sidebar recolhível e painel secundário sob demanda | Nenhuma aba ou CTA inacessível |
| Mobile / largura estreita | Área principal com prioridade ao estudo, navegação/drawer contextual | Enunciado legível e alternativas clicáveis sem scroll horizontal |
| Zoom 200%/400% e texto ampliado | Reflow real, barras envolventes ou overflow acessível | Foco visível; controles não sobrepostos/truncados |

- Usar breakpoints reais de **conteúdo**, não pressupor que `1024px` equivalha a tablet ou que orientação determine uso de mouse.
- Flex/Grid/`minmax()`/`clamp()`/`rem` e container queries podem ser usados **se houver suporte adequado**; em protótipo HTML manter progressão compatível sem build.
- Resolver primeiro cortes/overflows da sidebar, conteúdo duplicado de tabs, painéis que obscurecem estudo e gráficos que perdem legenda em mobile.
- Em grafo: filtros por tipo de entidade, níveis de relação, foco e controles explícitos devem ter **representação textual acessível** (lista/árvore) além de canvas/SVG.
- Em leitor/PDF: zoom não pode quebrar navegação, leitura nem foco; toolbar usa espaço proporcional à tarefa.
- Apoiar teclado, mouse, toque e tecnologias assistivas; drag sempre precisa de alternativa não baseada só em arrastar.

### 8.7 Liquid Glass funcional: política de uso limitada

Liquid Glass é um **material de interface nas plataformas Apple**, não uma API padrão Web. Um efeito CSS inspirado nele pode ser proposto para **uma camada de controle flutuante**, jamais como efeito global de conteúdo.

**Pode ser avaliado** em: barra flutuante transitória de grafo, popover não textual denso, overlay de ferramenta com benefício claro de contexto. **Não aplicar por padrão** em: corpo de enunciado, alternativas, tabelas, formulários, modal com texto longo, cartão de revisão, visualização de PDF.

Requisitos para aceitar qualquer protótipo de translucidez:
- Substrato visual suficientemente estável; **contraste medido sobre fundos reais de pior caso**, tema claro/escuro, zoom e modo alto contraste.
- Fallback **opaco** para ausência de `backdrop-filter`, preferências de transparência/contraste e dispositivos lentos; permitir desligar o efeito se ele prejudicar leitura.
- Separação clara de conteúdo, contorno de foco e affordance sem depender de refração/brilho; não usar blur para esconder fronteiras de interação.
- Custo de renderização medido; limitar superfícies com blur e não animar blur grande continuamente.
- Em CSS, a camada de vidro pode combinar base, borda especular discreta, saturação/blur; **`backdrop-filter: blur()` isolado não reproduz o material nativo**. Não prometer equivalência perfeita ao iOS.

Exemplo **ilustrativo, não aplicado ao protótipo**:

```css
/* Padrão opt-in, somente em controles flutuantes aprovados */
.contextual-overlay {
  color: var(--app-tab-text-active);
  background: var(--app-tab-bg-base); /* fallback opaco */
}
@supports (backdrop-filter: blur(12px)) {
  .contextual-overlay[data-translucent="true"] {
    background: color-mix(in oklch, var(--app-tab-bg-base) 92%, transparent);
    backdrop-filter: blur(12px);
  }
}
@media (prefers-contrast: more) {
  .contextual-overlay[data-translucent="true"] {
    background: var(--app-tab-bg-base);
    backdrop-filter: none;
  }
}
```

A interface de leitura continua preferindo **superfícies opacas, espaçamento coerente e pouco chrome**, como descrito na issue #97.

### 8.8 Acessibilidade — separar os mínimos por plataforma

| Referência | Escopo | Interpretação correta |
|---|---|---|
| WCAG 2.2 SC 2.5.8 (AA) | Web | Alvo mínimo **24×24 CSS px**, considerando espaçamento ou exceções do critério |
| WCAG 2.2 SC 2.5.5 (AAA) | Web | Alvo ampliado **44×44 CSS px**, ressalvadas exceções |
| Apple HIG (44 pt) | iOS/iPadOS | Recomendação de área de interação **em pontos**, não pixels CSS |
| Material 3 (48 dp) | Android/Material | Alvo confortável **em dp**; não equivaler automaticamente a CSS px |
| WCAG 2.2 1.4.3/1.4.11 | Web | Texto comum **4,5:1**, texto grande **3:1**, componentes gráficos essenciais **3:1**, com exceções normativas |
| WAI-ARIA APG | Web | Teclado, roles/estados, nome acessível e foco dos padrões de UI |

**Política de produto:** preferir área interativa confortável (frequentemente maior que o mínimo AA) sem aumentar indiscriminadamente a **altura visual** de chips/abas densos: hit area pode incluir espaço adicional que não se sobreponha indevidamente a vizinhos. Sempre medir o resultado, não deduzir conformidade da dimensão CSS declarada.

Checklist básico: foco na ordem certa, foco não oculto por sticky UI; ícones rotulados; leitura do enunciado por tecnologias assistivas; status de acerto/erro anunciado no momento correto; filtros removíveis por teclado; alternativas com nome/papel/valor; gráficos com dados textuais; contraste em overlays; zoom e reflow; motion reduzido.

### 8.9 Critérios de aceite para futuras mudanças visuais

- Capturar **antes e depois** por viewport, tema, estado, navegação e conteúdo representativo. Para animação relevante capturar vídeo/GIF e narrar o comportamento em texto.
- Validar **foco, teclado, touch e leitor de tela** quando possível, inclusive sem mouse e em viewport estreita.
- Comparar com a implementação `dev`, evidências de `docs/`, `prototypes/` e `docs/archives/`, não só com screenshots de sites externos.
- Registrar *trade-offs*: performance, densidade, acessibilidade e convenção da plataforma. Citar fonte oficial/skill no PR.
- Critérios de qualidade: sem CTAs mortos, abas duplicadas, ação primária perdida, contornos decorativos em excesso, scroll jumping, loading infinito ou gesto sem alternativa.
- Não declarar que a aplicação está "conforme Apple/M3" porque um token, radius ou efeito se parece com referência.

### 8.10 Formulários e campos — especificação visual e decisão de persistência

**Objetivo:** o formulário deve parecer parte do Exam App, não uma coleção desconexa de caixas. Aplicar a regra de salvamento de [AGENTS.md §13.1](AGENTS.md), distinguindo *edição*, *aplicação local*, *persistência confirmada* e *submissão definitiva*. As recomendações Apple/M3 abaixo são **adaptações para Web**, não cópia de SwiftUI/Compose.

| Situação | Forma de interação preferida | Quando mostrar botão | Feedback obrigatório |
|---|---|---|---|
| Alterar tema, alternar visualização, recolher painel | Aplicação imediata reversível | Em geral **não** | Mudança visível instantânea; reversão simples |
| Filtrar lista local sem custo significativo | Atualização previsível; debounce quando textual | Em geral **não**; `Limpar` quando útil | Total de resultados, chips ativos, estado sem resultados |
| Filtros que disparam busca cara, múltiplas escolhas ou carga demorada | Painel de rascunho + `Aplicar filtros` quando o custo justificar | **Sim**, se necessário estabelecer uma operação | Mudanças pendentes, botão habilitado, progresso/cancelamento |
| Editar rótulo ou propriedade simples | Inline ou autosave confiável | Opcional; **não** se autosave está explícito | `Editado` → `Salvando` → `Salvo` ou `Erro ao salvar` com retry |
| Criar concurso/caderno, configurar simulado ou alterar várias propriedades | Formulário identificado, validação e revisão de consequências | **Sim**, CTA nomeando a operação | Pendente, validação, confirmação real, destino/retorno |
| Enviar simulado, publicar resultado, exclusão irreversível | Ação explícita, com confirmação proporcional e proteção contra dupla submissão | **Sim** | Consequência, irreversibilidade, sucesso/erro e recuperação |

**Estrutura recomendada:** título da tarefa → explicação somente se necessária → seções com nomes claros → pares label/campo → *hint* contextual → erro específico junto ao campo → ações na posição esperada. Campos relacionados podem dividir uma linha **somente** se a ordem do DOM/leitura e o comportamento no mobile continuarem coerentes.

**Elementos de cada campo:**
- **Label persistente** acima ou ao lado conforme largura/contexto; placeholder é exemplo breve e opcional, nunca a única identificação. Seção agrupada usa `fieldset/legend` quando necessário.
- **Valor** legível no estado normal, focus, read-only, disabled e com erro; o texto digitado não deve competir com rótulos, prefixos ou ícones.
- **Hint** curta, anterior ao erro, associada por `aria-describedby` quando ajuda; unidade e formato ficam junto ao controle.
- **Erro** específico, acionável e associado ao campo (ex.: "Informe um ano entre ..."), com indicação que não depende da cor; usar `aria-invalid` no campo inválido. Para formulários extensos, considerar sumário de erros com links para campos.
- **Ação no campo** (limpar, revelar senha, pesquisar) com nome acessível, área clicável confortável, estado de foco, sem trocar inesperadamente o valor.
- **Status de persistência** não confunde `dirty`, `pending`, `saved`, `failed`, `conflict` e `offline`. "Salvo" aparece apenas após sucesso real; editar durante gravação deve preservar versão e evitar sobrescrita.

**Controles e estados:**

| Componente | Uso correto | Estados/considerações |
|---|---|---|
| Text input / textarea | Texto curto / longo, respectivamente | Label, placeholder auxiliar, IME, autocomplete, paste, readonly, erro, contador se houver limite |
| Select / combobox | Opções conhecidas / escolha com busca quando necessário | Sem teclado quebrado, opção selecionada sempre legível, lista navegável, fechamento e foco |
| Radio group | Escolha mutuamente exclusiva e opções visíveis | Grupo/legend, ordem de leitura, seleção por teclado; não usar switch para decisão não aplicada |
| Checkbox | Preferências independentes e consentimento explícito | `checked`, `indeterminate` quando válido, label clicável e validação |
| Switch | Estado binário cuja alteração é aplicada imediatamente | `on/off` explícito, pending/erro no caso de persistência remota; não representar ação de submit como switch |
| Slider / campo numérico | Ajuste aproximado / entrada exata | Valor e unidade disponíveis; alternativa por teclado e entrada direta se precisão importar |
| Search + filtros | Localizar/restringir conjunto | Escopo, filtro ativo, resultado, remoção individual, reset, debounce e cancelamento de resposta obsoleta |
| Action buttons | Enviar, salvar, cancelar, excluir, reverter | Primária sem concorrentes visuais, loading com texto estável, prevenção de duplo envio, erro com recuperação |

**Validação:** escolher o momento de validar pela tarefa (após blur, durante digitação quando útil, ou submit); não disparar erro antecipadamente ao focar campo vazio. Não apagar entrada inválida sem explicar; conservar o que foi digitado após erro de servidor.

**Aparência atual a revisar, não alterar às cegas:** a seção 3 inclui corpo de questão 14–15px, alternativas 13,5px e metadados 11–12px. Não são mínimos normativos; examinar legibilidade real com zoom, texto ampliado e leitura prolongada antes de fixar como meta. Estilo "moderno" não se mede pela ausência de borda, campo excessivamente fino ou placeholder flutuante.

Fontes: [Apple HIG — Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields), [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [GOV.UK — Text input](https://design-system.service.gov.uk/components/text-input/), [GOV.UK — Error message](https://design-system.service.gov.uk/components/error-message/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) e [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### 8.11 Contrato de estados e governança dos componentes

Nenhum componente é aprovado apenas pelo estado "bonito" em screenshot estático. O agente deve registrar sua matriz de estados, **sem criar estados irrelevantes**:

| Superfície | Estados mínimos esperados | Verificações prioritárias |
|---|---|---|
| Botões e controles de toolbar | default, hover (mouse), pressed, focus-visible, disabled, pending | Rótulo, clique funcional, mesma posição do texto durante loading, não duplicar operação |
| Input e editor | empty, filled, focus, invalid, readonly, disabled, dirty, saving, saved, failed | Label+hint+erro, preservação da entrada, Enter, Tab, IME, autosave |
| Abas / filtros | default, selected, focus, loading, empty/error do painel | Um painel ativo, sem abas duplicadas, estado na URL quando apropriado |
| Drawer / dialog / popover | closed, opening, open, closing, interrupted | Retorno de foco, Escape, backdrop, scroll, aria-modal apenas se modal de fato |
| Sidebar / right panel | collapsed, expanded, resizing, overlay, loading | Largura mínima, reflow, persistência de seleção, não ocultar CTA |
| Questão / simulado | unanswered, selected, pending, corrected, flagged, timed-out | Não revelar gabarito antecipadamente; evitar perda/duplicação de resposta |
| Grafo e dados | initializing, ready, empty, filtering, selected, error, reduced-motion | Legenda, seleção estável, alternativa textual, focus e performance |
| PDF e documentos | loading, ready, page-changing, zooming, error, unavailable | Posição de leitura, status real, cancelamento e retry limitados |

**Duas saídas obrigatórias para redesign significativo:** (1) matriz de estados/semântica e (2) exemplos antes/depois com viewport, tema e foco, além de evidência textual. Um GIF prova a existência de movimento, **não** comprova WCAG ou utilidade.

### 8.12 Transparência reduzida, contraste forçado e modo de alto contraste

O fallback de uma superfície translúcida é **opaco por padrão**. `prefers-reduced-transparency` ainda tem suporte irregular em navegadores; **não depender dele isoladamente**. `forced-colors: active` pode retirar sombras e fundos: se um elemento dependia somente de `box-shadow` para delimitação ou seleção, ele pode desaparecer no modo de alto contraste.

Exemplo ilustrativo, a ser adaptado aos tokens CSS existentes:

```css
.contextual-overlay {
  background: var(--app-tab-bg-base);
  border: 1px solid var(--app-tab-border-front);
}

/* Apenas após aprovação da translucidez; fallback continua opaco */
@supports (backdrop-filter: blur(12px)) {
  .contextual-overlay[data-translucent="true"] {
    background: color-mix(in oklch, var(--app-tab-bg-base) 92%, transparent);
    backdrop-filter: blur(12px);
  }
}

@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .contextual-overlay[data-translucent="true"] {
    background: var(--app-tab-bg-base);
    backdrop-filter: none;
  }
}

@media (forced-colors: active) {
  .contextual-overlay {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
    backdrop-filter: none;
  }
  .contextual-overlay :focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
```

- Testar a UI em **Windows High Contrast/forced colors** e contraste aumentado quando disponível, inclusive estados selected, foco e alertas. Usar *system colors* apropriadas, preferir elementos HTML nativos e evitar `forced-color-adjust: none` salvo justificativa muito específica.
- Verificar se suporte a `color-mix()`, `backdrop-filter` e preferências de media query corresponde aos navegadores-alvo antes de ativar o efeito.
- Testar `prefers-reduced-motion` separadamente: menos movimento **não implica** menos transparência, e vice-versa.

Fontes: [MDN — forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors), [MDN — prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency), [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials).

### 8.13 Matriz de rastreabilidade e qualidade

Para cada padrão novo, registrar **a referência exata e o que foi adaptado**: `padrão`, `contexto Exam App`, `fonte primária`, `skill auxiliar`, `status (documentado/implementado/testado)`, `evidência`, `restrições`. Preferir fontes oficiais e a implementação atual quando houver divergência.

As lacunas registradas aqui não comprovam falha do protótipo: são requisitos de documentação/validação que deverão ser aplicados em mudanças reais. **Não declarar "conformidade" com M3, HIG ou WCAG** apenas por cumprir um checklist de estilo.

## 9. Registro de referências dos 22 skills catalogados (auditoria de conteúdo em andamento)

Os 22 itens abaixo são **referências comunitárias catalogadas**, não extensões oficiais de Apple ou Google. **Catalogar URL não comprova leitura integral de cada SKILL.md, README e referências internas.** Não afirmar que os 22 foram verificados ou que cada resumo corresponde ao estado atual do repositório sem registro de arquivo/revisão/data. Esta integração é uma síntese preliminar enquanto a análise aprofundada de cada fonte não estiver documentada. Alguns estão voltados a Android/SwiftUI; nem todo trecho de código se aplica a um protótipo HTML/CSS/JS. Para números ou requisitos, confrontar com a documentação oficial **vigente**.

| # | Projeto / skill | Conhecimento reaproveitado | Fonte |
|---|---|---|---|
| M01 | skydashnet — Material 3 UI | Checklists, hierarquia, tokens, auditoria | https://github.com/skydashnet/material-design-3-ui-skill |
| M02 | hamen — Material 3 | Roles, temas e componentes multiplataforma | https://github.com/hamen/material-3-skill |
| M03 | abhixv — M3 Expressive | Ênfase, escala de formas, motion spatial/effects | https://github.com/abhixv/google-m3-expressive-design-skill |
| M04 | Softengineit — Material Web | CSS tokens, React/Tailwind, auditoria estática | https://github.com/Softengineit/material-design-skill |
| M05 | gdlbo — Material | Hierarquia antes de estética, superfícies estáveis, gate expressive | https://github.com/gdlbo/material-skill |
| M06 | macsystems — M3 Agent | Mapa de papéis e componentes oficiais | https://github.com/macsystems/m3-agent-skill |
| M07 | yhongm — Material | Sistema multiplataforma, tipografia, motion e temas | https://github.com/yhongm/material-design-skill |
| M08 | shelbeely — Material Shape | Raios, formas expressivas, casos de uso | https://github.com/shelbeely/Shelbeely-Agent-skills/tree/main/skills/material-design-3-shape |
| M09 | majiayu000 — Material Design (catálogo; caminho a verificar) | Referência genérica; **conteúdo e caminho de SKILL.md não verificados** | https://github.com/majiayu000/claude-skill-registry/tree/main/skills/other/material-design |
| M10 | MadAppGang — Design References | Quadro comparativo M3/HIG, heurísticas | https://github.com/MadAppGang/claude-code/blob/main/plugins/dev/skills/design/design-references/SKILL.md |
| A01 | gotired — Apple Design Skills | Auditoria HIG, crítica visual, consistência | https://github.com/gotired/Apple-Design-Skills |
| A02 | oye-rahul — Apple Web Design | Camadas funcionais, Liquid Glass e web responsiva | https://github.com/oye-rahul/Apple-Design-Skill |
| A03 | BuilderIO — Apple Design | Interfaces fluidas, springs e gestos interrompíveis | https://github.com/BuilderIO/agent-native-product-visuals/tree/main/.agents/skills/apple-design |
| A04 | bowen31337 — Apple Design Web | CSS/SVG, physics, motion/GSAP, componentes | https://github.com/bowen31337/apple-design |
| A05 | dickwu — Apple Design | Revisão HIG, padrões, acessibilidade | https://github.com/dickwu/apple-design-skill |
| A06 | tzzs — Apple Design | Separar afirmação fundamentada de palpite | https://github.com/tzzs/apple-design-skill |
| A07 | sharmahr — iOS HIG | Navegação, interação, áreas-alvo e revisão | https://github.com/sharmahr/ios-human-interface-guidelines |
| A08 | ykswang — Apple HIG | Índice e atualização de referências HIG | https://github.com/ykswang/apple-hig-skill |
| A09 | alirezarezvani — Apple HIG Expert | Auditoria e checagem de conformidade | https://github.com/alirezarezvani/claude-skills/tree/main/product-team/apple-hig-expert |
| A10 | ehmo — Platform Design iOS | Regras de adaptação, safe areas e touch | https://github.com/ehmo/platform-design-skills/tree/main/skills/ios |
| A11 | rshankras — Apple Design Skills | Liquid Glass, tipografia, animação, microcopy | https://github.com/rshankras/claude-code-apple-skills/tree/main/skills/design |
| A12 | Sunwood-ai-labs — Apple HIG | Fluxo evidence-first e verificação pós-alteração | https://github.com/Sunwood-ai-labs/design-with-apple-hig |

**Fontes primárias para validação:** [Material 3](https://m3.material.io/), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/). As alegações técnicas dos skills e recomendações numéricas de terceiros devem ser revalidadas contra o arquivo original e a origem oficial antes de qualquer uso normativo. **Evidência de leitura integral dos 22 arquivos SKILL.md: não registrada nesta versão**.

<!-- MATERIAL-APPLE-INTEGRATION:END -->
