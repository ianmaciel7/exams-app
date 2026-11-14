
# Padrões de componentes UI em 2026 — catálogo verificável e relação com leis de UX/HCI

> **Revisão:** 14/11/2026. **Escopo:** referências oficiais W3C WAI-ARIA APG, HTML/MDN, Material Design 3, GitHub Primer e Adobe React Aria consultadas com Context7 e web. **Natureza:** referência documental para agentes do Exam App; não atesta que o protótipo implementa ou cumpre os padrões. **Links canônicos:** [AGENTS.md §22](../../AGENTS.md), [DESIGN.md §8.25](../../DESIGN.md), [catálogo de UX/UI](ux-ui-principles.md).

## Critérios de classificação obrigatórios

- **Lei empírica:** relação quantitativa/reprodutível com autor, domínio e limites — consultar [AGENTS.md §0](../../AGENTS.md); não chamar comportamento de componente de lei.
- **Heurística/modelo/efeito:** princípios perceptivos, modelos e descobertas como Jakob, Gestalt, Choice Overload e reconhecimento; são hipóteses de decisão a validar.
- **Padrão WAI-ARIA APG:** contrato publicado de semântica, estados e teclado; **não é uma nova WCAG ou garantia automática de conformidade**.
- **Componente de design system:** solução da plataforma/produto, não obrigação universal. Material 3 Android não determina implementação web; Primer React e React Aria servem como referências mesmo quando o protótipo usa HTML/CSS/JS.
- **Primitiva nativa HTML/CSS:** recurso web com compatibilidade e semântica próprias; usar HTML nativo adequado antes de reimplementar ARIA complexo.


## Complemento de 2026: variantes, dialogs e taxonomia de todas as famílias

Para além dos **30 padrões APG** listados abaixo, consultar a [taxonomia de 28 famílias de componentes e variantes de dialogs](taxonomia-componentes-e-dialogs-2026.md). A nova pesquisa separa **semântica, finalidade, apresentação e estado**, incluindo **Basic/Full-screen M3**, **cinco variantes Carbon**, **Settings Dialog**, Form Dialog, Wizard, Picker, Sheets, Popovers, Menu, tabelas e gráficos. **Esses nomes adicionais não são novas roles APG nem novas leis científicas.**

## A. Inventário integral dos 30 padrões publicados no W3C WAI-ARIA APG

Fonte principal: [WAI-ARIA APG — Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/). **Total neste catálogo W3C: 30 padrões (lista consultada em 14/11/2026)**. Alguns padrões têm exemplos em desenvolvimento; não confundir documentação de padrão com implementação nativa disponível em todos os browsers.

| Nº | Nome oficial e documentação | Uso / escolha do componente | Contrato ou risco a verificar |
|---:|---|---|---|
| 01 | [Accordion (Sections With Show/Hide Functionality)](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | Seções expansíveis em filtros, FAQ e metadados; não transformar tudo em accordion. | Cabeçalhos, botões, estado expandido, foco, Enter/Espaço. |
| 02 | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) | Aviso importante não bloqueante. | Anunciar sem roubar foco; não alertar toda mudança banal. |
| 03 | [Alert and Message Dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) | Confirmação ou mensagem crítica que requer resposta. | Modalidade verdadeira, texto claro, foco, saída e ações seguras. |
| 04 | [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) | Hierarquia real de localização dentro de concurso/edição/cargo. | Links e item atual indicados, sem duplicar trilha quando desnecessária. |
| 05 | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | Acionar operação, alternar estado ou submeter. | Nome acessível, ativação por teclado, estado pressed quando toggle. |
| 06 | [Carousel (Slide Show or Image Rotator)](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) | Série de slides quando houver ganho comprovado, não como substituto de listagem. | Controles de avançar/parar, pausa, foco e acessibilidade. |
| 07 | [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) | Seleções independentes ou estado parcial em grupos. | Estados checked/unchecked/mixed e label. |
| 08 | [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | Campo com sugestões/popup, por exemplo busca de concursos. | Input vs popup, aria-expanded, teclado, autocomplete/seleção/foco. |
| 09 | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Tarefa que realmente interrompe o fluxo, como confirmação crítica. | Tab contido, Escape quando pertinente, foco inicial e retorno, conteúdo externo inerte. |
| 10 | [Disclosure (Show/Hide)](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Abrir/fechar uma região simples ou grupo de links da sidebar. | Botão com aria-expanded e Enter/Espaço; considerar `<details>` nativo. |
| 11 | [Feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/) | Fluxo contínuo de artigos/itens com carregamento incremental, somente se houver esta semântica. | Navegação/posição de leitura e carregamento sem perda de foco. |
| 12 | [Grid (Interactive Tabular Data and Layout Containers)](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) | Células ou coleção verdadeiramente interativas. | Navegação por setas e seleção; não aplicar `role=grid` para CSS grid ou tabela comum. |
| 13 | [Landmarks](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/) | Regiões principais da página. | main/nav/header/aside/complementary nomeados e sem landmarks redundantes. |
| 14 | [Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) | Navegar para outra página/rota/recurso. | Usar `<a href>`; não usar botão simulando navegação sem necessidade. |
| 15 | [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) | Escolher uma ou várias opções numa lista composta. | Arrow keys, tipo de seleção, nome e foco; não colocar conteúdo interativo complexo dentro das opções. |
| 16 | [Menu and Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) | Menu de comandos estilo aplicação com navegação por setas. | Não usar como `nav` de site comum; exige semântica, foco e teclado específicos. |
| 17 | [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) | Botão que abre menu de ações, como "..." de um objeto. | Estado aberto, retorno de foco, Escape, setas. |
| 18 | [Meter](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) | Medida escalar em faixa conhecida, por exemplo indicador de desempenho. | Valor e limites compreensíveis; **não** usar para progresso de operação. |
| 19 | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | Seleção exclusiva entre poucas alternativas visíveis. | Grupo semântico, um selecionado, teclado e label. |
| 20 | [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Ajuste aproximado de um valor em escala quando precisão exata não é central. | Teclado e alternativa quando interação por toque/AT for difícil. |
| 21 | [Slider (Multi-Thumb)](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) | Escolher limites de intervalo, se melhor que dois campos numéricos. | Dois focos/valores, ordem Tab constante, testes com AT touch. |
| 22 | [Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) | Quantidade numérica discreta com incremento/decremento. | Incremento previsível, entrada por teclado, limites e validação. |
| 23 | [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) | Alternar configuração ligada/desligada com efeito identificável. | Estado on/off, label estável e reversibilidade; não confundir com checkbox multi-seleção. |
| 24 | [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) | Dados tabulares estáticos, leitura e comparação. | `<table>` semântico preferível; cabeçalhos/unidades e responsive. |
| 25 | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Uma aba ativa entre painéis relacionados dentro da mesma superfície. | tablist/tab/tabpanel, setas, focus/selection, conteúdo sincronizado. **Links para rotas não são automaticamente tabs APG.** |
| 26 | [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) | Grupo de comandos frequentes, como edição de documento/PDF. | Botões rotulados e navegação por setas conforme padrão; não usar `role=toolbar` só por alinhamento CSS. |
| 27 | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) | Explicação breve ao hover/foco, sem controles interativos. | Persistência/dismissibilidade WCAG 1.4.13; conteúdo interativo deve ser popover/dialog adequado. |
| 28 | [Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) | Hierarquia de objetos/pastas navegável por setas. | Foco/seleção/expandido e teclas; **grafo relacional ≠ árvore ARIA automaticamente**. |
| 29 | [Treegrid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) | Tabela hierárquica interativa com linhas expansíveis. | Semântica mista de árvore/grade, teclado especializado e estados. |
| 30 | [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) | Separador que redimensiona painéis da aplicação. | Alça com teclado e valores acessíveis; **APG informa que a revisão e o exemplo funcional estão pendentes**, portanto validar cuidadosamente. |

## B. Escolha de componentes parecidos — decisões de semântica, não estética

| Caso | Preferir | Evitar | Fonte |
|---|---|---|---|
| **Navegação entre rotas** | Links sob `nav`; usar tabs visualmente sem forçar `role=tab` quando links mudam de página. | Tabs APG para shell de rotas sem contrato de tab/tabpanel. | [APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Primer TabNav](https://primer.style/product/getting-started/rails/components/tab_nav/) |
| **Sidebar expansível** | Disclosure/Accordion sobre links, quando o grupo pode ser colapsado. | Menu/Menubar ou Tree View só porque parece explorador de arquivos. | [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [APG Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) |
| **Escolher valor simples** | Select HTML, radio group, checkbox conforme dado. | Combobox custom, popup menu ou diálogo sem necessidade. | [WAI APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| **Escolher valor pesquisável** | Combobox ou Select Panel com filtragem e navegação previsíveis. | Input com lista visual sem semântica, teclado, foco ou retorno. | [Primer SelectPanel](https://primer.style/product/components/select-panel/) |
| **Ações "..." do item** | Menu Button / Action Menu com ações rotuladas. | Simular link para ações destrutivas ou menu invisível só no hover. | [APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [Primer DataTable](https://primer.style/product/components/data-table/) |
| **Mostrar pequena ajuda** | Tooltip não interativo para explicação curta. | Tooltip com formulário, botão ou conteúdo interativo. | [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) |
| **Ajuda interativa** | Popover não modal ou diálogo contextual apropriado. | Modal para toda ajuda curta, ou hover como único acesso. | [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) |
| **Operação crítica** | Dialog modal/Alert Dialog quando interação bloqueante e explícita for pertinente. | `aria-modal=true` sem realmente bloquear interações externas. | [APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [APG Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| **Feedback de persistência** | Status de operação, estado pending/success/error e ação para recuperar; alert para erro urgente quando apropriado. | Toast apenas visual que desaparece e é o único registro de erro. | [APG Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/), [WCAG Status Messages](https://www.w3.org/TR/WCAG22/#status-messages) |
| **Progresso ou medição** | `<progress>` para conclusão de tarefa; `<meter>` para valor em faixa (desempenho). | Medidor de pontuação como se fosse progresso de salvamento. | [MDN progress](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress), [APG Meter](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) |
| **Resultado tabular** | Tabela nativa semântica; DataTable se há ordenação/colunas/ações complexas. | `role=grid` em tabela que não navega por células. | [APG Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/), [Primer DataTable](https://primer.style/product/components/data-table/) |
| **Seleção vs ativação de linha** | Estados separados, padrões de teclado claros e ação explícita quando linha tem ações. | Clique ambíguo em linha que simultaneamente seleciona, navega e abre editor. | [React Aria GridList](https://react-aria.adobe.com/GridList), [Selection](https://react-aria.adobe.com/selection) |
| **Painel de propriedades** | Pane contextual persistente só com espaço/uso; alternativa por drawer/side sheet ou página. | Painel direito espremendo conteúdo ou focus trap quando não modal. | [M3 Side Sheets](https://m3.material.io/components/side-sheets/overview), [APG Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) |
| **Reordenação** | Drag handle com alternativa de clique/toque sem arraste e teclado. | Exigir somente gesto de arrastar ou somente keyboard sensor para cumprir WCAG 2.5.7. | [React Aria DnD](https://react-aria.adobe.com/dnd), [WCAG 2.5.7](https://www.w3.org/TR/WCAG22/#dragging-movements) |

## C. Componentes de design systems relevantes em 2026 fora do inventário APG

Esses nomes são **padrões de produto/sistema**, não um padrão W3C por nome e nem leis científicas.

| Fonte | Nome publicado e uso | Cuidados |
|---|---|---|
| [Material Design 3 — Navigation](https://m3.material.io/components/navigation-drawer/overview) | **Navigation Bar / Navigation Rail / Navigation Drawer** para destinos primários, conforme contexto. | Diferenciar de Tabs para categorias do mesmo conteúdo; não copiar diretamente padrão Android para Web. |
| [Material Design 3 — Search Bar](https://m3.material.io/components/search/overview) | **Search Bar / Search View** e sugestões/resultados para descoberta de questões. | Busca, filtragem e seleção são tarefas diferentes; preservar contexto. |
| [Material Design 3 — Segmented Buttons](https://m3.material.io/components/segmented-buttons/overview) | Alternar modos/opções comparáveis visíveis. | Radio/checkbox semântico conforme exclusividade; não usar em muitas opções. |
| [Material Design 3 — Side Sheets](https://m3.material.io/components/side-sheets/overview) | **Side Sheets** para propriedades ou detalhes de objeto. | Modalidade e foco precisam corresponder ao comportamento real. |
| [Material Design 3 — Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview) | **Bottom Sheets** para ação contextual em dispositivos estreitos. | Não esconder conteúdo essencial nem bloquear botão de saída. |
| [GitHub Primer — DataTable](https://primer.style/product/components/data-table/) | Cabeçalhos, colunas e ações por linha em dados estruturados. | Ações com nome acessível e sem duplicação de controles; avaliar densidade e mobile. |
| [GitHub Primer — SelectPanel](https://primer.style/product/components/select-panel/) | Seletor filtrável simples ou múltiplo. | Controlar seleção pendente/cancelada/aplicada; evitar estado falso de persistência. |
| [Adobe React Aria — GridList](https://react-aria.adobe.com/GridList) | Coleções com seleção, ação, loading e drag; comportamento de teclado especializado. | **Não** requer instalação: estudar o padrão mesmo em HTML/JS. |
| [Adobe React Aria — Drag and Drop](https://react-aria.adobe.com/dnd) | Operação por mouse, touch, teclado e tecnologia assistiva. | Alternativa por ponteiro único sem arraste segue sendo analisada separadamente. |

## D. Tecnologias nativas Web atuais — status e compatibilidade em 2026

| Nome técnico | O que resolve | Estado/limite |
|---|---|---|
| **HTML `<dialog>` + `showModal()`** | Dialog modal com semântica e foco gerenciados pelo browser. | Amplamente suportado; não abre como modal só por usar o elemento ou atributo `open`. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |
| **HTML `<details>` / `<summary>`** | Divulgação simples nativa com teclado e estado aberto. | Não substitui um accordion com regras específicas de heading/abertura em todo contexto. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) |
| **Popover API — `popover`, `popovertarget`** | Popovers não modais, top layer, abertura/fechamento declarativo. | **Baseline desde 2025**, não componente automaticamente acessível por mera presença do atributo; estruturar conteúdo/foco. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) |
| **CSS Anchor Positioning — `anchor()`, `position-anchor`** | Posicionamento de menus/popovers perto do controle invocador. | `anchor()` com status **Baseline 2026** e `position-anchor` com status **Baseline setembro/2026**; conferir support/fallback. [MDN anchor()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/anchor), [MDN position-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor) |
| **Customizable `<select>` — `appearance: base-select`, `::picker(select)`** | Estilizar select com comportamento nativo, inclusive options ricas. | **Disponibilidade ainda limitada em 2026** e possíveis problemas com SSR/hydration; manter fallback para select nativo e testar browser/AT. [MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) |
| **HTML `<progress>`, `<meter>`, `<output>`** | Semântica nativa para progresso, medição e resultado calculado. | Escolher o elemento pelo significado dos dados; nenhum substitui mensagens de falha/persistência. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) |

**Notas de status:** o APG é orientação de padrões, não uma versão “APG 2026” que obriga um componente em todos os produtos. **WAI-ARIA 1.3 permanece Working Draft no contexto pesquisado**, não substituir automaticamente recomendações estáveis por rascunho. Novidades HTML/CSS não são leis de UX. Sempre testar no conjunto de navegadores e tecnologias assistivas alvo.

## E. Quais leis/efeitos realmente se aplicam a componentes?

Este é o **mapeamento** pedido; não descobrimos uma lei científica nova para cada tipo de componente. Os nomes já constam do [AGENTS.md §§0–3](../../AGENTS.md) e nos complementos de layout.

| Nome original | Classe correta | Componentes/hipóteses de aplicação | Contraexemplo/limite |
|---|---|---|---|
| **Fitts's Law** | Lei empírica de controle motor | IconButton, CTA, handle, slider thumb, row actions; alvo maior/mais próximo pode ser alcançado mais rápido. | Não define isoladamente 24/44 px nem legibilidade/foco. |
| **Hick–Hyman Law** | Lei empírica de reação de escolha | Menus, Action Menu, select, combobox e listas; avaliar tempo/incerteza para encontrar opção. | Não diz que menos opções sempre é melhor, nem obriga 5 ou 7 itens. |
| **Steering Law** | Lei/modelo empírico de trajetória | Menu em cascata, submenu, slider de precisão, drag/resize por corredor estreito. | Não se aplica como fórmula universal a ações por clique isolado. |
| **Weber's Law** | Lei psicofísica | Estados selecionados, intensidade visual de indicadores, diferenças entre superfícies. | Não substitui medições WCAG de contraste. |
| **Law of Proximity / Common Region / Similarity / Uniform Connectedness** | Princípios perceptivos Gestalt (apesar do termo “Law”) | Agrupamento de toolbar, campos, cards, filtros, row actions e painéis. | Não exige bordas para todos os grupos e não comprova usabilidade. |
| **Jakob's Law** | Heurística conhecida | Foco, teclado e interação previsíveis em Tabs/Menu/Dialog/Select. | Familiaridade não substitui semântica e testes de uso. |
| **Tesler's Law** | Heurística conhecida | Editor e configurações com dependências: deslocar complexidade para apoio contextual, não escondê-la. | Não é fórmula da quantidade correta de campos. |
| **Von Restorff Effect** | Efeito de percepção/memória | Destaque de ação primária ou erro crítico com diferenciação proporcional. | Destacar todos os CTAs elimina hierarquia; evitar dependência só de cor. |
| **Aesthetic-Usability Effect** | Efeito psicológico | Estilo coerente e confiança visual de componentes. | Aparência não corrige teclado, estado, acessibilidade ou ação errada. |
| **Feature Congestion / Guided Search** | Modelo de busca/atenção, não lei | Excessos em toolbar, table, sidebar, cards; testar encontrar controle específico. | Não se traduz em um limite universal de botões, badges ou divisores. |

## F. Decisões prioritárias por superfície do Exam App

| Superfície | Componentes relevantes | Problema a verificar antes de alterar código |
|---|---|---|
| **Sidebar principal e painel direito** | Nav links + Disclosure, Menu Button, Side Sheet, Window Splitter | Navegação versus ações; modo compacto; resize por teclado; foco; não usar treeview/menubar indevidamente. |
| **Abas superiores e abas dos gráficos** | Navegação por links ou Tabs APG (escolher pelo comportamento) | Abas duplicadas, seleção inconsistente, scroll horizontal, perda de estado. |
| **Questões / Simulados** | Radio Group, Buttons, Progress, Alert Dialog, Tabs/Disclosure quando pertinentes | Integridade da resposta, conclusão, timer essencial versus sessão, estados e recuperação. |
| **Filtros / buscas de questões** | Search/Combobox, Select/SelectPanel, Checkbox, Chips, Disclosure | Escopo, filtros ativos, limpeza, teclado, duplicidade entre filtro e seleção. |
| **Dashboard e resultados** | Table/DataTable, Meter, Progress, Tooltip, Popover | Mensagem do dado, eixo/unidade, diferenças entre percentual, andamento e status persistido. |
| **Grafo / objetos** | GridList/Tree para hierarquias reais, toolbar, painel, alternativa textual | Grafo relacional não vira role tree; seleção/ativação e zoom/pan por modalidades equivalentes. |
| **Leitor PDF** | Toolbar, Breadcrumb/In-page navigation, Dialog/Popover para ações, Window Splitter | Foco, scroll, página/zoom, teclas, leitor de tela e modal versus barra de comandos. |
| **Reordenação de cards/propriedades** | Drag Handle, Menu Button, mover sem drag, GridList | Keyboard sensor **não** substitui alternativa de ponteiro único sem drag WCAG 2.5.7. |

## G. Critérios para PR, protótipo e testes

1. **MUST:** indicar para cada componente **nome, classe (HTML/APG/design system), tarefa, estados, semântica, foco, teclado, mouse/touch, leitor de tela quando possível, mobile e erro/recuperação**. Não chamar APG de “lei”.
2. **MUST:** preferir HTML nativo semanticamente correto quando suficiente; não atribuir `role=menu/tab/grid/tree` só para reproduzir aparência de software desktop.
3. **MUST:** distinguir **rota/ação/seleção/expansão**: Link navega; Button executa; Tab muda painel; Switch liga/desliga; Checkbox seleciona; Progress indica andamento; Meter representa medição.
4. **MUST:** usar WCAG 2.2 aplicável e APG como fontes de comportamento, com auditoria de teclado/foco/nome/estado e de processos; **APG não garante conformidade**.
5. **MUST:** avaliar diálogo modal, popover não modal e sheet pela **modalidade real**; não adicionar focus trap em painel não modal, nem deixar modal interagir atrás.
6. **MUST:** documentar estados **idle / hover / focus-visible / selected / expanded / pending / success / error / disabled / read-only / empty**, conforme pertinência; não usar visual ou animação como único sinal.
7. **MUST:** testar diferentes layouts e browsers, inclusive fallback de `base-select`/CSS anchor; não instalar bibliotecas só para reproduzir um componente simples.
8. **MUST:** mapear quando relevante a lei empírica ou heurística que motivou um design, declarar **hipótese de ganho e teste**; não usar Fitts/Hick para aprovar sem medir.
9. **MUST:** em alterações reais, anexar screenshot ou vídeo/GIF de estado e interação ao board, com resultado de teste e link para issue/PR. **Este documento foi criado por pesquisa documental; não contém evidência inventada nem testes do protótipo.**

### Fontes canônicas adicionais

[W3C APG — Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/); [W3C APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/); [WCAG 2.2](https://www.w3.org/TR/WCAG22/); [MDN HTML reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element); [Material 3 components](https://m3.material.io/components); [GitHub Primer Components](https://primer.style/product/components); [Adobe React Aria](https://react-aria.adobe.com/).
