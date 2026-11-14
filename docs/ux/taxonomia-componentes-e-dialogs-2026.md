# Taxonomia de componentes de UI, dialogs e padrões de interação — 2026

> Pesquisa de 14/11/2026. Fontes: Context7 (W3C WAI-ARIA APG, Material Design 3, Adobe React Aria) e documentação primária adicional (IBM Carbon, GitHub Primer, MDN, Apple HIG, Atlassian, GOV.UK, USWDS). **É um inventário de famílias e variantes, não uma lista de leis científicas e nem a alegação de que todos os sistemas de design usam os mesmos nomes.** Documento complementar a [30 padrões W3C APG](componentes-ui-padroes-2026.md), [leis e princípios](ux-ui-principles.md), [AGENTS.md](../../AGENTS.md) e [DESIGN.md](../../DESIGN.md).

## 1. Modelo de classificação: não misturar quatro eixos

| Eixo | O que responde | Exemplos |
|---|---|---|
| **Semântica** | O que a interface significa para navegador, usuário e tecnologia assistiva? | Button, Link, Dialog, Alertdialog, Listbox, Tab, Grid, Combobox, Status |
| **Tarefa/objetivo** | O que a pessoa tenta realizar? | Confirmar, criar, selecionar, configurar, pesquisar, organizar, revisar, comparar, navegar, reordenar |
| **Apresentação** | Onde o componente aparece e quanto espaço recebe? | Inline, anchored popover, centered modal, side sheet, bottom sheet, full screen, panel, split view |
| **Interação/estado** | Como operar e como muda? | Focus, hover, expanded, selected, pending, invalid, loading, saved, canceled, drag, dropped, error |

A designação **Settings Dialog / Configuration Hub** descreve uma composição de produto, **não uma role WAI-ARIA própria**. De modo análogo, Wizard, Picker, Command Palette, Kanban e Gallery são padrões de composição/produto, não novas leis de UX e nem cada um um widget APG.

## 2. Dialogs e overlays — variantes publicadas e combinações possíveis

### 2.1. Variantes por semântica ou modalidade (fundamentos)

| Nome original | Natureza | Escolha correta | Fonte |
|---|---|---|---|
| **Dialog (Modal)** | Padrão W3C APG, role dialog e comportamento modal | Tarefa que realmente bloqueia a interação com fundo; foco contido, título acessível, Escape quando adequado, retorno de foco. | [W3C APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| **Alert and Message Dialogs / Alert Dialog** | Padrão W3C APG, role alertdialog | Mensagem importante que interrompe fluxo e exige resposta; texto breve e consequente, não para configurações longas. | [W3C APG Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| **Non-modal Dialog** | HTML dialog com show() ou composição não modal | Painel auxiliar que deixa a pessoa continuar interagindo com o restante da tela; não atribuir aria-modal=true. | [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |
| **Popover / Anchored Overlay** | Superfície contextual ancorada, não sinônimo de modal | Pequena ação, filtro, seletor ou informação relativa ao controle de origem; a semântica interna depende do conteúdo. | [React Aria Popover](https://react-aria.adobe.com/Popover), [Apple Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers) |
| **Basic Dialog / Full-screen Dialog** | **Duas variantes oficiais M3** | Basic: confirmação/seleção rápida; Full-screen: tarefa mais longa com múltiplas etapas; avaliar forma web/mobile. | [Material 3 Dialogs](https://m3.material.io/components/dialogs/overview) |
| **Side Sheet / Bottom Sheet** | Padrões de apresentação M3/Apple | Propriedades ou escolha contextual no lado/parte inferior; podem ser modais ou não conforme plataforma/padrão. | [M3 Side Sheets](https://m3.material.io/components/side-sheets/overview), [Apple Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) |
| **Action Sheet** | Padrão Apple, escolhas relativas a ação iniciada | Ex.: editar/excluir/salvar rascunho no mobile; não confundir com alert informativo. | [Apple Action Sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets) |

### 2.2. Variantes por propósito — IBM Carbon (nomes oficiais)

| Nome do Carbon | Propósito | Exemplo Exam App |
|---|---|---|
| **Passive Modal** | Informação relacionada ao trabalho, sem submissão. | Aviso contextual cuja leitura é importante; questionar se banner inline seria menos intrusivo. |
| **Transactional Modal** | Confirmar/enviar uma decisão ou formulário com ações explícitas. | Criar caderno, salvar configuração ou nomear coleção. |
| **Danger Modal** | Tipo de transactional para ação irreversível/destrutiva. | Excluir definitivamente objeto, PDF ou tentativa; consequências e alternativa segura. |
| **Acknowledgment Modal** | Solicitar confirmação de ciência (geralmente uma ação OK). | Informação urgente que precisa ser reconhecida antes de continuar. |
| **Progress Modal** | Processo de múltiplas etapas, com Próximo/Anterior/Concluir. | Assistente de importação de conteúdo; permitir recuperação e considerar rota quando longo. |

Fonte: [Carbon Modal — Guidelines, Variants](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines). Estes nomes são variantes **do Carbon**, não sub-roles W3C.

### 2.3. Composições frequentes em produtos — não inventar padronização W3C

| Padrão de produto / nome comum | O que contém | Melhor escolha inicial / ressalva |
|---|---|---|
| **Settings Dialog / Configuration Hub** | Busca, navegação por categorias à esquerda, formulário ou cards à direita, fechar e scroll interno. | Modal grande ou página dedicada; no narrow viewport, página full-screen/stacked; não usar alertdialog. |
| **Form Dialog / Edit Dialog** | Campos com validação e Cancelar/Salvar. | Dialog transacional **curto**; formulário longo ou permanente pode merecer página. |
| **Confirmation Dialog** | Consequência, ação primária e Cancelar. | Dialog modal simples; usar alertdialog quando breve e realmente urgente. |
| **Destructive Confirmation** | Consequência da perda de dados, Excluir, Cancelar. | Danger variant; foco inicial frequentemente em Cancelar para operação irreversível. |
| **Selection Dialog / Picker Dialog** | Busca, lista/grade de itens, seleção simples/múltipla, aplicar/cancelar. | Dialog, Combobox com popover, SelectPanel ou página, segundo escala e tarefa. |
| **Create Object Dialog** | Nome, tipo, template e campos básicos. | Dialog transacional; se envolver muitas dependências usar fluxo longo/página. |
| **Multi-step Dialog / Wizard** | Etapas, progresso, voltar, continuar, concluir. | Progress variant Carbon ou Full-screen M3; permitir manter estado, não fragmentar sem necessidade. |
| **Command Palette / Search Dialog** | Busca global, comandos/resultados, histórico, teclado. | Dialog/modal ou combobox com lista conforme escopo; listas de comandos não são menus nativos automaticamente. |
| **File Picker / Import Dialog** | Arquivo, origem, preview, validação, progresso, erro. | Picker/fluxo de importação com feedback e retry; usar input file HTML quando suficiente. |
| **Color/Icon Picker Dialog** | Paleta, preview, seleção e aplicação. | Picker com nome acessível por opção e seleção exposta, não só cor. |
| **Date/Time Picker Dialog** | Campo ou calendário/horário dentro do overlay. | Input nativo ou dialog com grid de calendário APG se necessário. |
| **Preview / Quick View Dialog** | Inspeção de conteúdo antes de abrir/editar. | Dialog ou popover; não bloquear tarefa em excesso. |
| **Authentication / Permission Dialog** | Login/solicitação de acesso/confirmação de permissão. | Priorizar clareza, recuperação, segurança e evitar falsificar UI do navegador. |
| **Error Recovery Dialog** | Descrição clara de falha, retry e alternativa. | Dialog somente quando interrupção indispensável; normalmente inline error/status resolve. |
| **Onboarding / Feature Education** | Orientação por etapas, spotlight, tooltip contextual. | Geralmente não modal; não usar onboarding para esconder fluxo principal. |
| **Bulk Action Dialog** | Resumo de N itens, efeitos, confirmação, undo quando possível. | Transactional ou Danger; evitar ação silenciosa em lote. |

### 2.4. Tipo de apresentação não determina automaticamente a semântica

- **Centered Modal, Full-screen Modal, Side Drawer, Bottom Sheet, Floating Panel, Inline Dialog, Popover, Inspector** descrevem **geometria ou padrão de produto**; perguntar sempre: modal ou não? qual tarefa? qual role? como fecha? quem recebe foco?
- **Primer Dialog** documenta posições **center, left, right, bottom, fullscreen**, variantes responsivas e tamanhos, inclusive retorno do foco. [Primer Dialog](https://primer.style/product/components/dialog/).
- **HTML dialog**: showModal() é modal e torna o fundo inerte; show() abre não modal; o atributo open isolado não cria um modal. [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
- **Popover API** cria apresentação/top layer, mas não transforma o conteúdo em Menu/Combobox/Dialog acessível por si só. [MDN Popover](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
- **Não** chamar confirmação simples, Settings Hub, Search Palette, Sheet e AlertDialog todos de “modal” como se tivessem contratos idênticos.
- **Não** criar nested modal indiscriminadamente; gerenciar retorno de foco, não perder alterações e garantir uma rota de escape.

## 3. Inventário amplo de famílias de componentes (nomes publicados + padrões de produto)

**Abrangência:** famílias reutilizáveis relevantes ao Exam App; não significa que todos são padrões W3C APG. Nomes derivados de [Primer Components](https://primer.style/product/components/), [Atlassian Components](https://atlassian.design/components), [USWDS Components](https://designsystem.digital.gov/components/), [GOV.UK Components](https://design-system.service.gov.uk/components/), [M3 Components](https://m3.material.io/components), [React Aria](https://react-aria.adobe.com/) e [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/).

| Nº | Família | Componentes e variantes a considerar | Pergunta de escolha |
|---:|---|---|---|
| 1 | **Ações** | Button, Icon Button, Toggle Button, Split Button, Filled/Outlined/Text/Tonal/Elevated Buttons (M3), Floating Action Button, Button Group | Executa uma operação ou navega? Há ação primária clara? |
| 2 | **Ações compostas** | Action Menu, ActionList, Toolbar, ActionBar, Overflow Menu, Context Menu, Command Menu | São ações sobre um item? Necessita teclado composto ou apenas botões? |
| 3 | **Navegação global** | Navigation Drawer, Navigation Rail, Navigation Bar, Sidebar, Tree Navigation, Navigation Link, Skip Link | Muda de destino ou só altera painel local? |
| 4 | **Navegação contextual** | Tabs, Breadcrumbs, Step Indicator/Stepper, Pagination, In-page TOC, Anchor Navigation | É hierarquia, etapas ou troca entre painéis da mesma tela? |
| 5 | **Texto e campos** | Text Field, Textarea, Search Field, Password Field, Number Field, OTP/Verification Input, Masked Input, Character Count | Entrada livre, valor restrito, formatação ou segurança? |
| 6 | **Seleção simples** | Radio Group, Select, Select-Only Combobox, Segmented Control, Listbox, Choice Tile | Quantas escolhas? Opções conhecidas? Aplicação imediata? |
| 7 | **Seleção múltipla** | Checkbox Group, Multi-select, Filter Chips, Tag Group, Selection List, Transfer List, SelectPanel | Aplicar na hora ou confirmar? Quantidade e busca? |
| 8 | **Alternâncias** | Switch, Toggle, Toggle Group, Checkbox, Disclosure | É estado ligado/desligado, seleção, ou visibilidade de conteúdo? |
| 9 | **Autocompletar** | Editable Combobox, Autocomplete, Suggestions Popup, Search/Select Panel | Permite valor arbitrário, sugestões ou apenas item permitido? |
| 10 | **Datas e números** | Date Picker, Date Range Picker, Time Picker, Calendar, Spinbutton, Slider, Range/Multi-thumb Slider | Precisão exata, intervalo ou ajuste aproximado? |
| 11 | **Organização de conteúdo** | Card, Tile, List, List Item, Accordion, Disclosure, Details, Divider, Section, Fieldset, Summary List | Informação correlata precisa ficar agrupada ou acessível sob demanda? |
| 12 | **Menus e superfícies** | Menu Button, Menu, Menubar, Context Menu, Popover, Anchored Overlay, Tooltip, HoverCard, Inline Dialog | Menu de comandos, explicação ou interação rica? |
| 13 | **Dialogs e sheets** | Modal Dialog, Alert Dialog, Non-modal Dialog, Full-screen Dialog, Side Sheet, Bottom Sheet, Settings Dialog, Form Dialog, Wizard | Deve interromper a tarefa ou permitir multitarefa? |
| 14 | **Mensagens e erros** | Inline Error, Error Summary, Alert, Banner, Notification, Toast/Snackbar, Flag, Status Message, Success Message | Precisa de foco, confirmação, recuperação ou somente anúncio? |
| 15 | **Carregamento e estado** | Progress, Meter, Spinner, Skeleton, Shimmer, Empty State/Blankslate, Error State, Offline/Retry State | É operação em progresso, medição ou ausência de dados? |
| 16 | **Visualizações de coleção** | List View, Gallery/Card Grid, Board/Mural, Kanban Board, Table, DataTable, GridList, Tree View, Treegrid | Muda apenas a apresentação ou também agrupamento e fluxo de trabalho? |
| 17 | **Gestão de coleções** | Search, Filter Bar, Filter Builder, Saved View/Query, Sort Menu, Group By, Column Chooser, Bulk Actions, Selection Toolbar | Filtros e seleção persistem em todos os modos? |
| 18 | **Visualização quantitativa** | Bar/Stacked Bar, Line, Area, Scatter, Histogram, Donut/Pie, Heatmap, Boxplot, Radar, Waterfall, Treemap, Funnel | Comparar valores, evolução, distribuição, composição ou correlação? |
| 19 | **Visualização relacional** | Network Graph, Node-Link Diagram, Hierarchy Tree, Sankey, Chord Diagram, Dependency Graph, Timeline, Gantt, Calendar, Map | Mostrar relações, fluxo, dependência, tempo ou geografia? |
| 20 | **Leitores e mídia** | Image Viewer, Gallery, Video Player, Audio Player, PDF Viewer, Document Reader, Lightbox, Zoom/Pan Controls | Precisa de leitura estruturada, zoom, captions, busca e alternativa textual? |
| 21 | **Arquivos e transferência** | File Upload, Dropzone, File Picker, Drag-to-Upload, Upload Queue, Import/Export Dialog | Como validar tipo, tamanho, progresso, cancelamento e erro? |
| 22 | **Edição** | Rich Text Editor, Markdown Editor, Inline Editor, Code Editor, Formatting Toolbar, Content Blocks, Block Embed | Há estados de edição/salvamento e histórico de alterações? |
| 23 | **Layout de aplicação** | App Shell, Workspace Tabs, Split View, Resizable Panel, Window Splitter, Inspector, Drawer, Side Panel, Status Bar | Preservar foco, seleção, scroll e medidas ao redimensionar? |
| 24 | **Manipulação direta** | Drag Handle, Sortable List, Drag Overlay, Drop Target, Reorder Controls, Resize Handle | Existe alternativa por pointer sem arraste, teclado e cancelamento? |
| 25 | **Identidade e contexto** | Avatar, Presence, Badge, Tag, Label, Chip, Breadcrumb, Entity Link, Status Dot, Type Icon | Identidade/estado compreensível sem depender de cor? |
| 26 | **Aprendizagem** | Quiz Question, Choice Answer, Flashcard, Explanation Panel, Progress Tracker, Review Queue, Timer, Results Summary | Tarefa pedagógica, resultado, feedback e recuperação explícitos? |
| 27 | **Assistência/IA** | AI Composer, Prompt Input, Streaming Response, Citation, Tool Result, Retry/Stop, Human Approval, Suggested Action | Estado, fonte, erro, cancelamento, revisão e efeito real da ação? |
| 28 | **Infraestrutura de acesso** | Skip Link, Landmarks, Focus Ring, Live Region, Keyboard Shortcuts Help, Announcer, Accessible Name | Existe caminho operável sem mouse e com tecnologia assistiva? |

**Nota para gráficos:** tipos de chart e visualizações complexas **não são widgets APG por nome**. Exigem título, unidades, legenda, interpretação, valores em texto/tabela e alternativa longa quando a imagem carrega informação essencial. [W3C WAI — Complex Images](https://www.w3.org/WAI/tutorials/images/complex/).

## 4. Regras de seleção: componentes que parecem iguais mas não são

| Conflito | Critério correto |
|---|---|
| **Link vs Button** | Link navega; Button executa ação. |
| **Tabs vs Navegação** | Tabs APG trocam painéis vinculados na mesma experiência; mudanças de rota podem usar links de navegação. |
| **Dialog vs AlertDialog** | AlertDialog é caso excepcional para interrupção breve importante; Settings/Editor usam dialog comum. |
| **Dialog vs Popover** | Modalidade/interrupção e tamanho da tarefa definem a escolha; popover ancorado não é automaticamente dialog. |
| **Tooltip vs HoverCard/Popover** | Tooltip é informação curta sem controles interativos; conteúdo rico e ações precisam superfície diferente. |
| **Menu vs Listbox vs Combobox** | Menu executa comandos; Listbox seleciona valor; Combobox combina campo e popup, possivelmente pesquisável. [W3C APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). |
| **Checkbox vs Switch vs Radio** | Checkbox seleciona condição; Switch altera configuração binária; Radio escolhe uma alternativa exclusiva. |
| **Table vs Data Grid vs CSS Grid** | Table organiza dados tabulares; Grid APG é interativo com contrato de teclado; CSS grid é layout, não role. |
| **Tree vs Graph** | Árvore é hierarquia navegável; grafo de conhecimento tem relações arbitrárias e precisa alternativa acessível própria. |
| **Progress vs Meter** | Progresso é conclusão de processo; meter é medida numérica em intervalo conhecido. |
| **List vs Gallery vs Kanban vs Table** | Modos sobre uma mesma coleção exigem consistência de dados, filtros, contagens, ações, seleção e URL/persistência. |
| **Side Sheet vs Sidebar** | Sheet é superfície temporária/contextual; sidebar é região estrutural de navegação, não necessariamente modal. |
| **Inline Error vs Toast vs Alert** | Erro de campo fica junto do campo; toast comunica estado não crítico; alert exige relevância e não deve roubar foco. |

## 5. Leis, teorias, efeitos e heurísticas que informam componentes (não inventar uma lei por componente)

| Nome original | Classe | Família/decisão útil | Limite |
|---|---|---|---|
| **Fitts's Law** | Lei empírica HCI | Tamanho/distância de buttons, icon buttons, drag handles, splitter thumbs e targets. | Não dita valores WCAG em pixels por si só. |
| **Hick–Hyman Law** | Lei empírica de escolha | Menu, selector, filter, listbox, action list; analisar incerteza de alternativas. | Menos itens nem sempre é melhor; sem “máximo de 7”. |
| **Steering Law** | Lei/modelo empírico de trajetória | Submenus em cascata, sliders e caminhos restritos de drag. | Não é regra geral para todo clique. |
| **Weber's Law** | Lei psicofísica | Diferenças perceptíveis entre estados/realces. | Não substitui contraste WCAG. |
| **Gestalt Proximity / Common Region / Similarity / Uniform Connectedness** | Princípios perceptivos (alguns chamados “law”) | Agrupar campos, toolbar, cards, relações e seleção. | A proximidade depende da tarefa, não de bordas obrigatórias. |
| **Jakob's Law** | Heurística de familiaridade | Adotar convenções reconhecíveis para dialog, tabs, select, menu. | Não prova conformidade ou eficiência. |
| **Tesler's Law** | Heurística de complexidade | Configurações avançadas, wizards e editores. | Não obriga esconder toda complexidade. |
| **Von Restorff Effect** | Efeito de isolamento | CTA principal e estado crítico distinguíveis. | Ressaltar tudo elimina hierarquia. |
| **Proximity Compatibility Principle** | Princípio experimental | Comparações/detalhes que precisam ser integrados na mesma tarefa. | Não determina número de panes da UI. |
| **Feature Congestion / Guided Search** | Modelos de atenção/busca | Menu denso, grid de configurações, muitas visualizações, toolbar. | Sem número mágico de cards/controles. |
| **Cognitive Fit Theory** | Teoria | Escolher gráfico vs tabela e representação conforme pergunta. | Validar em tarefa real. |
| **Recognition Rather Than Recall** | Heurística Nielsen | Rótulos, ícones, itens de menu visíveis e estados persistentes. | Ícone sozinho pode não ser reconhecível. |
| **Error Prevention / User Control and Freedom** | Heurísticas Nielsen | Confirmar ações perigosas, cancelamento, undo, retorno de foco, desabilitação com motivo. | São princípios; não normas técnicas por si. |
| **Progressive Disclosure** | Padrão/princípio | Esconder configurações avançadas sem ocultar o caminho ou estado. | Não criar fluxo labiríntico. |

Leis, heurísticas e padrões devem permanecer em **índices separados**. A decisão deve informar **tarefa → padrão → semântica → estados → testes**.

## 6. Aplicação à imagem enviada: Capacities “Tipos de objetos”

**Observável na captura do usuário, não teste DOM/JS do Capacities:** dialog grande aparentemente modal com scrim; coluna esquerda com **Search** e navegação por categorias/estados; coluna direita com título, suporte textual, link de ajuda e **tile/card grid de tipos de objeto** com ícones/cor e ação **Criar**; botão fechar no canto superior direito; conteúdo rolável.

**Classificação correta:** **Settings Dialog / Configuration Hub** (padrão de produto), com **Modal Dialog** como provável apresentação na captura, **Navigation List + Search Field + Choice/Action Tiles** como subcomponentes. **Não é AlertDialog**, nem uma única Listbox ou Tablist por aparência. O significado das opções depende do comportamento real: itens que mudam seção usam links/botões e podem indicar aria-current; tiles que abrem detalhes são botões/links; tiles que selecionam uma opção exigem estado de seleção semântico.

**Anatomia sugerida para Exam App:**
1. **Cabeçalho:** título de nível apropriado (“Configurações”), botão Fechar nomeado, posição inicial de foco deliberada.
2. **Navegação:** campo Buscar configurações, categorias Conta/Geral/Espaço, agrupamento com headings, item atual perceptível e programático; badges status “Ativo/Cancelada/Dica” não substituem texto.
3. **Conteúdo:** título “Tipos de objetos”, descrição, ajuda contextual, grade responsiva de tipos com nome legível/ícone e botão Criar; nenhuma tile falsa sem ação.
4. **Rolagem e responsividade:** largura de leitura, sidebar e conteúdo com áreas de scroll previsíveis; em mobile usar full-screen/stack com Voltar e preservação de item/scroll/foco.
5. **Persistência:** definir por controle se mudança salva automaticamente ou exige Salvar/Cancelar; avisar sobre alterações pendentes, falha, retry e recuperação; **não inferir auto-save pela imagem**.
6. **Modalidade:** se modal, fundo realmente inerte, tecla Escape com política clara, foco contido e retorno ao trigger; evitar atalhos do workspace vazando para a configuração.
7. **Acessibilidade/testes:** teclado, screen reader, zoom/reflow, tema claro/escuro, tradução e textos longos, teste de fechamento com alterações não salvas, foco lógico ao trocar categoria.

## 7. Pontos concretos a auditar no protótipo atual da dev

Fonte: [prototypes/exam-app-0.1.1/index.html](../../prototypes/exam-app-0.1.1/index.html) consultado na dev em 14/11/2026.

| Código/função atual | Comparação com a taxonomia | Estado |
|---|---|---|
| **dialog() e formDialog()** | Existem overlays modais e formulários, mas não seleção explícita de **tipo de dialog pela tarefa**, nem composição complexa equivalente ao Settings Hub da captura. | **Lacuna arquitetural/documental a testar em UI** |
| **Abrir Configurações** | Há dialog simples com opções de tema e outros ajustes; não reproduz uma navegação categorizada de Settings Hub com páginas de tipos. | **Não há paridade com captura** |
| **Type Studio** | Há seletor de tipos com busca, opções ARIA e preview. Verificar se o uso de listbox corresponde a seleção real e teclado antes de mudar. | **Existe implementação parcial** |
| **Selectores de visualização (Lista/Mural/Kanban/Galeria/Tabela/Incorporar)** | Não há um seletor funcional dos seis modos na página de tipo verificada; issue #56 já aberta. | **Feature pendente** |
| **Abas e painel contextual** | Existem abas e views distintas; auditadas anteriormente contra APG e issues #55/#66. | **Problemas semânticos e funcionais pendentes** |

## 8. Critérios de aceite dos agentes em qualquer componente

1. **Definir tarefa e classe** (primitiva HTML/APG, design-system variant ou composição de produto); nunca chamar tipo de dialog, nome da biblioteca ou visualização de “lei UX”.
2. **Escolher semântica antes da aparência** (nativo quando suficiente). Registrar Keyboard/Focus/Pointer/Touch, label, estados, loading, erro, persistência, Escape e fechamento.
3. **Não usar modal para mero aviso, tooltip para ações ou menu para formulário**. Evitar nested dialogs complexos e perda de dados por dismiss.
4. **Aplicar leis apenas como hipóteses**, com limite e verificação; WCAG 2.2, APG e HTML para contratos acessíveis. [W3C WCAG](https://www.w3.org/TR/WCAG22/).
5. **Coleções e gráficos** exigem dados consistentes e alternativas acessíveis; não criar modo visual de fachada nem gráfico sem origem, contexto, unidade e dados estruturados.
6. **Garantir estados completos**: default, hover, focus-visible, selected, expanded, invalid, pending, success, failed, disabled, empty e offline, quando aplicáveis.
7. **Mobile e zoom**: transformar disposição conforme espaço e interação, sem perder a tarefa ou criar overflow horizontal obrigatório.
8. **Evidência**: toda alteração de UI exige checagem real do HTML/CSS/JS, testes da jornada, screenshot/GIF e vínculo com issue/board. Este arquivo é documentação de pesquisa e **não afirma validação visual ou correção do protótipo**.

## 9. Fontes oficiais e verificação

- W3C [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/), [Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [AlertDialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/), [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- Google [Material Design 3 Dialogs](https://m3.material.io/components/dialogs/overview), [Side Sheets](https://m3.material.io/components/side-sheets/overview).
- IBM [Carbon Modal variants](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines).
- Adobe [React Aria Modal](https://react-aria.adobe.com/Modal), [Popover](https://react-aria.adobe.com/Popover).
- GitHub [Primer Components](https://primer.style/product/components/), [Dialog](https://primer.style/product/components/dialog/), [SelectPanel](https://primer.style/product/components/select-panel/).
- Apple [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts), [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [Action Sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets), [Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers).
- Atlassian [Components](https://atlassian.design/components), GOV.UK [Components](https://design-system.service.gov.uk/components/), USWDS [Components](https://designsystem.digital.gov/components/).
- MDN [dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [Popover](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
- W3C WAI [Complex Images / charts and diagrams](https://www.w3.org/WAI/tutorials/images/complex/).
