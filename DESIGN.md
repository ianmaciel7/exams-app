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
  - Física contínua e orgânica que nunca congela subitamente, preservando microflutuações sutis com baixo consumo de CPU (ver `MOTION.md`).
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
   - Botão de fechar aba (`✕`): área de 20px x 20px no canto direito da aba, visível permanentemente na aba ativa e no hover das abas inativas.
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
