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

A paleta adota o espaço de cor **OKLCH**, útil para controlar perceptualmente luminosidade e cromaticidade. **OKLCH, por si só, não garante contraste nem conformidade WCAG AA/AAA.** Medir cada par texto/superfície e indicador/superfície em todos os estados, inclusive claro, escuro, seleção, erro e alto contraste, conforme os critérios WCAG aplicáveis.

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
   - Ativa/recolhe a navegação lateral. **Atalho implementado no protótipo:** `Ctrl+B` no Windows/Linux (ou `⌘B` no macOS pelo modificador `Mod`); validar colisões com navegador e editores. `Ctrl+\` controla o **painel direito**, não a sidebar.
3. **Controles de Histórico (`[<] [>]`)**:
   - Navegação Voltar/Avançar inspirada em navegadores web.
   - Estado desabilitado (`opacity: 0.35; cursor: default`) quando a pilha de histórico local estiver no início/fim.
4. **Trilho de Abas Principais (`[Abas +]`)**:
   - Largura mínima por aba: `MAIN_TAB_MIN_WIDTH = 82px`. Espaçamento: `MAIN_TAB_GAP = 4px`.
   - Separador vertical sutil entre abas inativas (`height: 18px; width: 0.5px; opacity: 0.6`).
   - Botão de fechar aba (`×`): ícone visual compacto (baseline legado de 20px), **sem supor que a hit area efetiva é 20×20**. A área interativa deve satisfazer WCAG 2.2 SC 2.5.8 (24×24 CSS px ou exceção de espaçamento/equivalência/essencialidade aplicável e comprovada). Testar proximidade da aba, pin e controles vizinhos; manter descoberta por teclado/foco, não apenas hover.
   - **Atalhos implementados no protótipo:** `Alt+1` a `Alt+9` para alternar abas e `Alt+W` para fechar a aba atual. **Não documentar `Ctrl+W` como atalho interno**: navegadores o reservam normalmente para fechar a aba do navegador. Duplo clique para fechar exige validação no código real; não presumir. Evitar capturar combinações do navegador/SO que conflitam; manter alternativa por clique/menu.
   - Botão `+`: cria nova aba de visualização (explorador, grafo, busca). O comando implementado é `Alt+T`; `Ctrl+T` costuma pertencer à criação de aba do navegador e não deve ser anunciado como atalho do workspace. A interface real ainda precisa ser corrigida onde o tooltip apresenta `Ctrl+T`.
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
   - `Tab` / `Shift+Tab` percorre em ordem lógica os controles. Exemplo **CSS válido**: `:focus-visible { outline: 2px solid var(--app-tab-text-active); outline-offset: 2px; }`. Não remover foco sem alternativa visível; verificar se sticky bars e overlays não o ocultam.
2. **Contraste de Cores**:
   - Razão mínima de contraste de 4.5:1 para texto normal e 3:1 para texto grande e componentes gráficos interativos.
3. **Leitores de Tela (ARIA)**:
   - Abas utilizam `role="tablist"`, `role="tab"`, `aria-selected="true|false"` e `aria-controls`.
   - Alternativas utilizam `role="radiogroup"` e `role="radio"` com `aria-checked`.
   - **Diálogo modal:** `role="dialog"`, `aria-modal="true"` apenas quando realmente modal, foco inicial adequado, Tab/Shift+Tab contidos no modal, Escape e restauração do foco ao fechar, segundo [APG Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). **Menu de ações:** `role="menu"`/`menuitem` apenas quando realmente for menu, com setas/Enter/Escape e retorno de foco segundo [APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/); não aplicar focus trap de modal a menus ou popovers comuns. Preferir elementos HTML semânticos nativos para navegação simples.

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


#### 8.10.1 Formulários: implementação acessível e hierarquia low-chrome

Complementa a matriz de persistência e a anatomia de campos desta seção com as verificações de [AGENTS.md §15](AGENTS.md). **Não é necessário reestilizar todos os formulários para um único padrão.** Exigir evidência de tarefa, legibilidade, responsividade e estados antes de concluir que um novo visual é melhor.

| Ponto de decisão | Contrato visual e de comportamento | Evidência a verificar |
|---|---|---|
| **Forma do campo** | Campo deve ser reconhecível como interativo, sem depender de uma caixa pesada ou de uma borda invisível. Pode usar variante preenchida ou contornada conforme contraste e hierarquia do contexto; não tornar todas as superfícies idênticas. | Descoberta dos campos, foco e estado disabled em claro/escuro e forced-colors. [Material 3](https://m3.material.io/components/text-fields/guidelines) |
| **Label, hint e erro** | Rótulo persistente; ajuda curta perto do campo, não só placeholder; mensagem específica de erro em texto e associada programaticamente ao input. Prefixo, sufixo e ação local não devem competir com o valor. | HTML acessível e leitor de tela, incluindo erro após submissão. [WAI Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) |
| **Grupo e alinhamento** | Proximidade visual e agrupamento semântico com fieldset/legend quando apropriado; evitar cartões e divisores para cada input isolado. Agrupar por sentido e usar fluxo vertical em formulários sequenciais. | Ordem de leitura/Tab, mobile, zoom e conteúdo longo. [WAI Grouping](https://www.w3.org/WAI/tutorials/forms/grouping/) |
| **Largura, densidade e espaçamento** | Alinhar campos a uma largura útil e proporcional à entrada prevista; não esticar um valor curto em toda a coluna. Usar espaçamento e tipografia semânticos existentes, não um número arbitrário de pixels só por estética. | Leitura, digitação e reflow em viewports e idiomas diferentes. |
| **Estado e foco** | Estados default/hover/focus-visible/invalid/disabled/readonly/pending/saved distintos sem depender só de cor, sombra ou placeholder. Foco claro em alto contraste; considerar o critério AAA 2.4.13 como meta de melhoria, sem alegar AA por ele. | WCAG 2.4.7, 2.4.11, 2.4.13 e 1.4.11 conforme aplicabilidade. |
| **Validação** | Não interromper primeira digitação com erro prematuro; ajustar blur/submit e revalidação ao contexto. Em erro, preservar o valor, associar ajuda/erro e guiar ao campo, com sumário quando fizer sentido. | Erro no cliente e servidor, foco no envio, correção e recuperação. [Primer Forms](https://primer.style/product/ui-patterns/forms/) |
| **Ações e persistência** | Evitar CTA de Salvar/Aplicar para preferências reversíveis de efeito imediato. Exigir ação clara para criar, enviar, excluir ou concluir operação composta/cara; exibir dirty, salvando, salvo, falhou quando houver persistência. | Duplo clique, latência, concorrência, offline, retorno e reversibilidade. |
| **Ajuda e overlays** | Se tooltip/popover de ajuda for acionado por hover/foco, observar 1.4.13 AA; mecanismos de ajuda repetidos seguem 3.2.6 A. | Mouse, teclado, toque, Escape e leitor de tela quando aplicável. |
| **Etapas** | Formulário em etapas apenas se houver grupos lógicos extensos; progresso e retorno claros, preservando preenchimento. | Voltar/avançar, etapa opcional, interrupção e retomada. [WAI Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) |

**Especificação visual de aceite para redesign de campos:**

- **MUST** mostrar pelo menos exemplos reais de campo vazio, preenchido, foco, erro, desabilitado e carregamento/estado salvo quando aplicável, em tema claro e escuro.
- **MUST** validar que o texto visível da ação integra seu nome acessível (WCAG 2.5.3); foco sozinho não muda de contexto (3.2.1); erro detectado é descrito em texto (3.3.1).
- **MUST** verificar vínculos semânticos do grupo (1.3.1), consistência de mecanismos de ajuda repetidos (3.2.6) e conteúdo adicional por hover/foco (1.4.13) quando aplicáveis.
- **SHOULD** medir identificação do controle, sucesso da tarefa, tempo de preenchimento e recuperação de erro no protótipo — não declarar aparência moderna só porque o raio ou a borda mudou.
- **MUST** preservar componentes e tokens existentes e propor variações de densidade/ênfase como hipóteses verificáveis; o código atual usa HTML/CSS/JS, sem exigir bibliotecas novas.
- **MUST** distinguir documentação de implementação: esta seção define requisitos e critérios, **não demonstra** que os formulários atuais passaram nos testes.

**Guias oficiais adicionais:** [WAI Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/), [WAI Validating Input](https://www.w3.org/WAI/tutorials/forms/validation/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [GitHub Primer — Forms](https://primer.style/product/ui-patterns/forms/).

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

### 8.14 UX geral — layout adaptativo, grafo e visualização acessível (revisão 2026)

Esta seção traduz [AGENTS.md §16](AGENTS.md) e [docs/ux/ux-ui-principles.md](docs/ux/ux-ui-principles.md) em contratos de design. **Nenhuma regra é proposta apenas por ser tendência de 2026**: validar em tarefa, viewport, modalidade de interação e dados. Material 3 e React Aria são referências para adaptação; o protótipo continua HTML/CSS/JS e não exige adicionar bibliotecas.

#### 8.14.1. Material 3 Adaptive Design — composição por contexto, não apenas por largura

A documentação Material 3 de **maio de 2026** introduz nomenclatura atualizada para **Adaptive Design**, **Layout Scaffold**, **Panes** e **Breakpoints**. É uma referência de design system, **não um requisito normativo de breakpoint ou de número de colunas para web**. [Fonte M3 Layout](https://m3.material.io/foundations/layout/layout-overview/overview).

| Superfície | Compacto / viewport estreito | Intermediário | Amplo / desktop | Invariantes |
|---|---|---|---|---|
| **Navegação primária** | Acesso explícito a Questões, Simulados, Revisão; menu/painel temporário quando necessário. | Navegação ajustada ao espaço real, evitando duas barras rivais. | Sidebar persistente se couber e ajudar. | Rotas e rótulos consistentes, foco e voltar funcionais. |
| **Painel direito / propriedades** | Sob demanda como seção, página, drawer ou overlay acessível, sem encobrir tarefa. | Mostrar apenas quando não diminuir indevidamente área de leitura. | Painel auxiliar persistente somente quando a tarefa ganhar eficiência. | Não forçar três colunas; preservar seleção, rolagem, foco e posição. |
| **Resolução de questões** | Enunciado e alternativas com prioridade; ações alcançáveis. | Área de leitura estável com secundário recolhível. | Metadados/explicação contextual sem competir com o enunciado. | Conteúdo e ordem semântica equivalentes; sem perda de resposta. |
| **Grafo de objetos** | Visão principal com controles alternativos e relações em lista. | Detalhes de nó em superfície adaptável, não duplicada. | Grafo + painel de relações contextual se houver espaço. | Mesmo nó ativo/relacionamentos ao mudar viewport. |
| **Leitor PDF** | Leitura e navegação de páginas prioritárias; toolbar pode colapsar sem ocultar comandos essenciais. | Ferramentas relevantes próximas do conteúdo. | Painel de notas/metadados só quando não prejudicar leitura. | Preservar página, zoom, busca, seleção e foco no reflow. |
| **Gráficos e resultados** | Um gráfico legível por vez; alternativa tabular e resumo textual alcançáveis. | Grade conforme legibilidade real. | Comparação lado a lado quando faz sentido; evitar abas duplicadas. | Mesmos dados, filtros, legendas e interpretação independentemente da composição. |

**MUST:** testar por comportamento, não impor números mágicos de largura; conferir zoom, fonte ampliada, teclado, touch, redimensionamento da janela durante animação e idiomas mais extensos. O painel auxiliar não pode sequestrar foco/rolagem ou manter um gráfico duplicado fora de sincronia.

#### 8.14.2. Grafo — Visual Information-Seeking Mantra e continuidade espacial

Adotar como **hipótese de experiência** o modelo de Ben Shneiderman, [The Eyes Have It (1996)](https://doi.org/10.1109/VL.1996.545307), sem exigir sete controles visíveis:

| Tarefa do modelo | Comportamento verificável no Exam App |
|---|---|
| **Overview** | A pessoa entende o conjunto ou região inicial do grafo, com controles principais descobríveis. |
| **Zoom** | Zoom deliberado e reversível, sem perda do nó ativo. |
| **Filter** | Tipo, relação ou outra faceta selecionável com efeito indicado e opção de limpar. |
| **Details-on-demand** | Clique/teclado em nó exibe detalhes sem trocar contexto de maneira desorientadora. |
| **Relate** | Relações visíveis com identificação textual de origem/destino/tipo quando pertinente. |
| **History** | Voltar à seleção e posição anterior após navegar para relações; não se confunde com histórico de respostas. |
| **Extract** | Oferecer representação em lista/tabela ou exportação apenas onde houver caso de uso real. |

**MUST:** evitar movimento automático que desloque o nó selecionado sem necessidade; aplicar o [MOTION.md](MOTION.md) para transições interrompíveis, movimento reduzido e preservação do estado. Testar todos os caminhos sem mouse, inclusive seleção de nó, filtros, fechar painel e retornar ao contexto.

#### 8.14.3. Gráficos e dashboards — mensagem e equivalência de acesso

A referência [USWDS Data Visualizations](https://designsystem.digital.gov/components/data-visualizations/) esclarece que visualização acessível não é só contraste: quem não vê o gráfico precisa compreender **a mensagem e o dado**, e uma tabela por si só nem sempre comunica a interpretação de uma tendência.

- **MUST** exibir **título explicativo**, rótulos/eixos/unidades e legenda consistente para dados representados; não depender apenas de cor ou hover. Resumir por texto a conclusão importante (por exemplo, evolução no percentual de acerto), sem inventar interpretação ou dados.
- **MUST** disponibilizar alternativa textual/estruturada adequada a leitores de tela; tabelas para exploração de valores e resumo narrativo para tendência/relacionamentos. Gráficos interativos devem expor caminhos de teclado/foco e status acessíveis.
- **SHOULD** preservar filtros e seleção entre gráfico e representação textual; evitar duas abas para a mesma visualização, legendas duplicadas ou gráficos decorativos que escondam a métrica principal.
- **SHOULD** preferir tipos de gráfico familiares adequados à comparação desejada; evitar densidade, efeitos ou séries além da capacidade de leitura no viewport disponível.
- **MUST** verificar estado vazio, não há resultado, erro, dados parciais e atualização. Para tratamento de estado vazio, consultar [IBM Carbon Empty State Pattern](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/examples/EmptyState/EmptyState.mdx).

#### 8.14.4. Inclusão, cognição e internacionalização

Aplique os [7 Principles of Universal Design](https://accessibility.education.gov.uk/guidelines/universal-design), os [3 Inclusive Design Principles](https://inclusive.microsoft.design/) e os [8 objetivos suplementares W3C COGA](https://www.w3.org/TR/coga-usable/) sem confundir tais orientações com critérios WCAG.

- **MUST** garantir que o primeiro passo para **Questões**, **Simulados** e **Revisão** seja descobrível sem conhecer termos internos como tipos/objetos/relacionamentos.
- **SHOULD** oferecer opções de densidade e apresentação quando úteis, mantendo o mesmo conteúdo/ação em qualquer versão; simplificação não pode apagar dado essencial ou evidência.
- **MUST** preservar contexto cognitivo ao navegar: onde estou, o que posso fazer agora, qual foi o resultado e como voltar/retomar.
- **MUST** prever textos longos, formato de data/número, leitura LTR/RTL quando aplicável e associação de idioma (WCAG 3.1.1/3.1.2) sem usar coordenadas esquerda/direita como única semântica. Referência: [Adobe React Aria Internationalization](https://react-spectrum.adobe.com/react-aria/internationalization.html).
- **MUST** não exigir gesto, temporização, precisão motora ou memorização como única maneira de concluir a tarefa; avaliar os SC WCAG pertinentes por fluxo e exceções.

#### 8.14.5. Qualidade da experiência em contexto — ISO 9241-11 + HEART

Referências: [ISO 9241-11:2018](https://www.iso.org/standard/63500.html), [HEART Framework (Google Research)](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) e [GOV.UK Design Principles (2025)](https://www.gov.uk/guidance/government-design-principles/). São fontes de avaliação e processo: **não definem aparência de bordas, medidas fixas ou métricas obrigatórias por tela**.

| Jornada | Eficácia (sucesso) | Eficiência (esforço) | Satisfação / sinais |
|---|---|---|---|
| Encontrar Questões e filtrar | Encontrou conjunto correto; escopo/filtros compreendidos | Tempo, erros, desvios e retrabalho | Sente controle e clareza do resultado |
| Resolver questão avulsa | Respondeu e recebeu correção correta | Quantidade de passos sem perda de contexto | Explicação compreensível, foco na leitura |
| Configurar e finalizar Simulado | Iniciou/entregou com regras compreendidas e sem perda | Correções de configuração, interrupções e retomada | Segurança/confiança no salvamento e resultado |
| Explorar grafo/objetos | Localizou relação/nó desejado | Voltar, zoom e filtragem sem desorientação | Compreendeu por que os objetos se relacionam |
| Ler PDF e revisar | Acessou conteúdo e retomou posição | Rolagem, busca e mudanças de zoom | Leitura confortável e recuperação previsível |

**MUST:** definir tarefas, critérios de sucesso e amostra antes/depois; diferenciar **documentado**, **implementado** e **testado**. O catálogo e exemplos são hipóteses para testes de usuário e a11y, não dados coletados. **SHOULD:** usar o processo Goals–Signals–Metrics do HEART para escolher indicadores apropriados; não maximizar retenção/tempo de tela à custa de compreensão.

### 8.15 Localização, redação e apresentação numérica

A UI deve ser robusta em **português brasileiro**, com suporte futuro a outros idiomas, antes de adotar densidade e animações de uma plataforma específica.

- **MUST** declarar idioma do documento e de trechos estrangeiros quando aplicável; usar **Intl/ECMA-402** na formatação sensível a locale de datas, horas, números, percentuais e moedas. Evitar concatenação manual de mensagens localizáveis e datas ambíguas.
- **MUST** acomodar expansão de textos, nomes longos de concursos/órgãos, siglas e tamanho de fonte ampliado, sem sobrepor campos ou esconder tarefas principais. Adaptar layout em vez de truncar conteúdo crítico.
- **SHOULD** preferir propriedades CSS lógicas para alinhar blocos e testar bidi/RTL quando houver idiomas que o exijam; não espelhar indiscriminadamente números, gráficos e conteúdos oficiais de provas.
- **MUST** manter cronômetros, notas e percentuais compreensíveis, com valores estáveis e anúncios acessíveis proporcionais ao significado da atualização. Preservar valores originais publicados em documentos oficiais.
- **MUST** preservar ordem semântica do DOM e de leitura ao reordenar painéis em layouts adaptativos. Ordem visual não pode ocultar a ordem real de Tab e tecnologias assistivas.

Referências: [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [MDN — Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), [W3C Internationalization](https://www.w3.org/International/) e [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### 8.16 Apple HIG — oito princípios oficiais de design (2026)

A Apple publicou/atualizou em junho de 2026 **oito princípios nomeados** em [Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles/) e na sessão [WWDC26 — Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/). São **princípios orientativos Apple**, não "leis psicológicas" nem requisitos WCAG. Aplicá-los como perguntas de revisão **adaptadas ao Exam App Web**:

| Nome oficial | Tradução de trabalho | Questão de auditoria no Exam App | Não confundir com |
|---|---|---|---|
| **Purpose** | Propósito | Esta tela ajuda uma tarefa de estudo real? A ação prioritária é reconhecível antes dos metadados? | Criar recursos apenas para demonstrar design |
| **Agency** | Autonomia / controle | O estudante consegue cancelar, voltar, desfazer, editar e recuperar dados? Simulado tem confirmação proporcional? | Adicionar modais a toda ação |
| **Responsibility** | Responsabilidade | A UI distingue resultado real, análise por IA e hipótese? Pede dados/permissões apenas quando necessários e explica consequências? | Declarações de segurança/privacidade não verificadas |
| **Familiarity** | Familiaridade | Controles idênticos funcionam igual em sidebar, painel, questões e grafo? Links, botões e atalhos respeitam convenções? | Copiar uma interface Apple literalmente na Web |
| **Flexibility** | Flexibilidade | Funciona com teclado, touch, tecnologias assistivas, preferências, janela estreita e texto ampliado? | Uma única tela responsiva apenas pela largura |
| **Simplicity** | Simplicidade | Há tarefas com caminho claro e contexto suficiente, sem abas/filtros duplicados? | Minimalismo que esconde a ação essencial |
| **Craft** | Capricho técnico e visual | Estados, alinhamento, microcopy, loading/erro, foco e movimento se mantêm coerentes e confiáveis? | Sombras, arredondamento e efeitos como substitutos de qualidade |
| **Delight** | Experiência agradável | O resultado traz confiança e tranquilidade ao estudar, sem criar distração em provas? | Confete, glassmorphism e springs sem função |

**Aceite:** escolher o(s) princípio(s) relevante(s) na issue/PR e justificar por evidência; não exigir todos os oito em todas as pequenas alterações nem apresentar esta matriz como certificação Apple. No estudo prolongado, a emoção-alvo predominante é **clareza, controle e confiança**, não excitação contínua.

### 8.17 UX Writing: nomenclatura, mensagens e recuperação

Princípios adaptados de [Apple HIG — Writing](https://developer.apple.com/design/human-interface-guidelines/writing), [W3C WAI — Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) e [WCAG 2.2](https://www.w3.org/TR/WCAG22/). São decisões editoriais do Exam App em português brasileiro; não uma lista de termos obrigatórios da Apple.

| Contexto | Padrão preferível no Exam App | Evitar |
|---|---|---|
| Navegação | Nome específico da tarefa ou entidade: `Questões`, `Simulados`, `Revisar erros` | `Ver tudo`, `Mais` como única entrada para tarefa central |
| Ação primária | Verbo + objeto/resultado: `Iniciar simulado`, `Confirmar resposta`, `Salvar alterações` quando houver envio | `OK`, `Próximo` sem contexto ou ação sem rótulo |
| Mudança automática | `Salvando…` → `Salvo` após confirmação, ou `Não foi possível salvar — Tentar novamente` | `Salvo` antes da persistência, spinner sem saída |
| Erro de campo | Descrever **o que corrigir** perto do controle; manter valor e foco coerente | `Inválido` genérico, erro só vermelho |
| Estado vazio | Explicar o escopo e oferecer **próximo passo real**: `Nenhuma questão corresponde a estes filtros. Limpar filtros` | Apenas ícone ou `Sem dados` |
| Falha de carregamento | `Não foi possível carregar o PDF. Tentar novamente` com controle de retry/cancelamento | Loop infinito, `Algo deu errado` sem recuperação |
| Ação destrutiva | `Excluir caderno?` + consequência real + ações `Cancelar` e `Excluir caderno` | Confirmações vagas repetitivas |
| Aviso sobre IA | Separar resposta oficial/gabarito, interpretação automática e conteúdo gerado; mostrar limite de confiança e origem quando aplicável | Apresentar sugestão de IA como gabarito oficial |

**MUST** usar terminologia consistente entre sidebar, breadcrumbs, abas, botões, busca e ajuda; nomes visíveis precisam integrar o nome acessível (WCAG 2.5.3 quando aplicável). Escrever labels curtos, mas não sacrificar a consequência da ação; usar voz ativa e evitar jargão quando há vocabulário comum. Testar truncamento, tradução e leitor de tela. Evitar notificações redundantes, especialmente durante resolução seriada de questões.

### 8.18 Aplicação seletiva de M3 Expressive — táticas, não ornamentos

O skill comunitário [abhixv/m3-expressive](https://github.com/abhixv/google-m3-expressive-design-skill/blob/main/skills/m3-expressive/SKILL.md) descreve **containment, size, shape, color, typography** como táticas de usabilidade/expressão, com motion como recurso complementar. A implementação deve ser conferida contra a [documentação oficial Material 3](https://m3.material.io/) antes de atribuir valores ou comportamentos à especificação Google.

| Tática | Aplicar quando | Exemplo de contexto | Não fazer |
|---|---|---|---|
| **Containment** | Agrupamento faz relações ficarem óbvias | Resposta + feedback; filtros aplicados e quantidade de resultados | Empilhar cards aninhados e divisores redundantes |
| **Size** | Uma ação é realmente prioritária | CTA de iniciar simulado, controle de entrega definitiva | Tornar todos os botões grandes; deslocar enunciados |
| **Shape** | Silhueta indica função/estado sem prejudicar densidade | Superfície de seleção, toolbar ou ação única | Formas chamativas em alternativas de prova ou textos longos |
| **Color** | Cor reforça estado/tipo de objeto com texto/ícone | Chips semânticos, foco no nó, acerto/erro | Usar só cor para status; quebrar tokens próprios |
| **Typography** | Texto precisa de hierarquia e reconhecimento | Título de objeto, ação primária e contexto atual | Reduzir corpo de questão ou truncar título crítico |
| **Motion** (complementar) | Ajuda a perceber causalidade ou relação espacial | Painel contextual, foco em grafo, menu ancorado | Movimento ornamental persistente; ver [MOTION.md](MOTION.md) |

**Critério de aceite:** a solução expressiva precisa melhorar descoberta, foco, associação ou compreensão em uma tarefa. Se a melhoria só pode ser descrita como "parece mais moderno", tratá-la como hipótese visual e não como padrão obrigatório.


### 8.19 Componentes complexos e continuidade de interação — revisão Context7 (2026)

Este contrato complementa [AGENTS.md §17](AGENTS.md) e as seções 8.14–8.18. O Exam App permanece um protótipo HTML/CSS/JS; React Aria, WAI-ARIA APG e USWDS são **fontes de comportamento**, não dependências automáticas. A escolha de widget deve corresponder à sua **semântica e interação real**, não a um visual específico.

| Superfície / padrão | Uso apropriado e interação esperada | Erro comum a evitar | Fonte oficial |
|---|---|---|---|
| **Sidebar com grupos expansíveis — Disclosure** | Grupos comuns de navegação usam link e botão de expansão/colapso distinguíveis; estado expandido anunciado; Enter/Espaço ativam o botão. | Tratar todo menu recolhível como ARIA tree, forçando navegação por setas não esperada. | [W3C APG — Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| **Explorador hierárquico — Tree View** | Se houver árvore real de tipos/pastas com navegação especializada, implementar setas, Home/End e relação foco/seleção segundo APG. | Atribuir role tree ao canvas do grafo, ou misturar seleção por clique e foco por teclado sem estado consistente. | [W3C APG — Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) |
| **Grade interativa — Grid** | Somente para células navegáveis/interativas: definir foco na célula ou no seu controle, setas, edição e retorno de modo. | Substituir tabela HTML simples por role grid sem necessidade e sem implementar o modelo de teclado. | [W3C APG — Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) |
| **Dados tabulares hierárquicos — Treegrid** | Usar exclusivamente quando houver linhas hierárquicas expansíveis e operações de célula, com teclado apropriado. | Confundir treegrid com visualização em grafo ou uma lista comum. | [W3C APG — Treegrid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) |
| **Modal, popover, drawer e listas dinâmicas — Focus Management** | Foco inicial, contenção quando modal, retorno à origem ao fechar e reposicionamento coerente quando item focado for removido. | Foco perdido no body, atrás do drawer ou em elemento que deixou de existir. | [Adobe React Aria](https://react-aria.adobe.com/); [W3C APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) |
| **Gráficos e diagramas — Complex Images** | Imagem estática: identificação e descrição detalhada equivalentes; grafo interativo: oferecer lista/tabela operável de nós e relações com seleção e contexto preservados. | Acreditar que um único alt curto substitui interação com gráfico ou grafo. | [W3C WAI — Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) |
| **Conteúdo longo — In-page Navigation** | Índice de seções em edital, relatório ou documentação quando melhora orientação; rótulos e âncoras significativos. | Barra de navegação duplicada numa página curta ou âncora que fica escondida sob toolbar fixa. | [USWDS — In-page Navigation](https://designsystem.digital.gov/components/in-page-navigation/) |
| **Funcionalidade essencial — Progressive Enhancement** | Manter leitura/dados/tarefa principal quando visualizações avançadas ou animações não carregam, com fallback viável e erro recuperável. | Declarar suporte sem JavaScript, PDF offline ou canvas alternativo que não existe. | [MDN — Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) |

#### 8.19.1 Critérios de aceite para navegação, grafo e dados

- **MUST** distinguir **foco de teclado, seleção, ativação e expansão** nos componentes; cada estado tem nome, papel e comportamento apropriado. Preferir HTML semântico e Disclosure para navegação comum; promover a padrões complexos somente quando houver tarefa que justifique.
- **MUST** registrar transições de foco em abrir/fechar overlay, excluir item da coleção, selecionar nós e alterar viewport, inclusive durante uma animação interrompida. Ver [MOTION.md](MOTION.md).
- **MUST** fornecer acesso aos relacionamentos e dados essenciais por modo estruturado/textual no grafo, com descrição de gráficos estáticos e alternativa operável quando necessário.
- **MUST** registrar comportamento de fallback de canvas, gráfico e PDF diante de erro, ausência de dados, bloqueio de API ou suporte insuficiente, com saída do loading e caminho de recuperação; não prometer capacidades inexistentes.
- **SHOULD** avaliar jornadas por **Cognitive Walkthrough**, rótulos/destinos por **Information Foraging Theory** e esforço de tarefas repetitivas pelo **Keystroke-Level Model** apenas quando a previsão de usuário experiente for pertinente. Nenhum substitui teste real nem métricas da ISO 9241-11.
- **MUST** separar em evidências: documentado / implementado / testado. Se só houver documentação, não registrar screenshots ou conformidade fictícias.

## 9. Referências catalogadas — 21 candidatos a skills + 1 agregador (auditoria em andamento)

Os 22 itens abaixo são **21 candidatos a skills e 1 agregador comunitário (M09)**; **não correspondem a 22 SKILL.md individuais verificados**, e não são extensões oficiais de Apple ou Google. **Catalogar URL não comprova leitura integral de cada SKILL.md, README e referências internas.** Não afirmar que os 22 foram verificados ou que cada resumo corresponde ao estado atual do repositório sem registro de arquivo/revisão/data. Esta integração é uma síntese preliminar enquanto a análise aprofundada de cada fonte não estiver documentada. Alguns estão voltados a Android/SwiftUI; nem todo trecho de código se aplica a um protótipo HTML/CSS/JS. Para números ou requisitos, confrontar com a documentação oficial **vigente**.

| # | Projeto / referência | Tema para conferência (não auditado individualmente) | Fonte |
|---|---|---|---|
| M01 | skydashnet — Material 3 UI | Checklists, hierarquia, tokens, auditoria | https://github.com/skydashnet/material-design-3-ui-skill |
| M02 | hamen — Material 3 | Roles, temas e componentes multiplataforma | https://github.com/hamen/material-3-skill |
| M03 | abhixv — M3 Expressive | Ênfase, escala de formas, motion spatial/effects | https://github.com/abhixv/google-m3-expressive-design-skill |
| M04 | Softengineit — Material Web | CSS tokens, React/Tailwind, auditoria estática | https://github.com/Softengineit/material-design-skill |
| M05 | gdlbo — Material | Hierarquia antes de estética, superfícies estáveis, gate expressive | https://github.com/gdlbo/material-skill |
| M06 | macsystems — M3 Agent | Mapa de papéis e componentes oficiais | https://github.com/macsystems/m3-agent-skill |
| M07 | yhongm — Material | Sistema multiplataforma, tipografia, motion e temas | https://github.com/yhongm/material-design-skill |
| M08 | shelbeely — Material Shape | Raios, formas expressivas, casos de uso | https://github.com/shelbeely/Shelbeely-Agent-skills/tree/main/skills/material-design-3-shape |
| M09 | majiayu000 — **agregador de skills, não skill Material individual confirmada** | Indexação de fontes; **localizar o projeto original e SKILL.md antes de atribuir conhecimento ou instalar** | https://github.com/majiayu000/claude-skill-registry |
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

**Fontes primárias para validação:** [Material 3](https://m3.material.io/), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/). As alegações técnicas dos skills e recomendações numéricas de terceiros devem ser revalidadas contra o arquivo original e a origem oficial antes de qualquer uso normativo. **Evidência de leitura integral dos 21 SKILL.md candidatos: não registrada nesta versão; M09 é um agregador.**

<!-- MATERIAL-APPLE-INTEGRATION:END -->
