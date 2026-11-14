# Data Visualization e dashboards — princípios, padrões, skills e critérios de aceite (2026)

> **Status:** referência de design e QA para o Exam App; documentação, **não** implementação nem auditoria de conformidade.  
> **Consulta das fontes:** 2026-11-14. Reavaliar URLs, revisões e documentação das bibliotecas antes de executar código.  
> **Origem:** síntese do plugin privado `especialista-ui-ux` v1.2.0 + fontes acadêmicas, W3C, USWDS e Microsoft. Não reproduzir integralmente skills de terceiros.

## 1. Relação com os documentos já existentes

- [AGENTS.md](../../AGENTS.md): regras de agentes, evidência e fluxo PR; possui catálogo extenso de leis/teorias/heurísticas de UX.
- [Catálogo de leis e heurísticas UX/UI](ux-ui-principles.md): definições, fontes, exceções e o catálogo de 86 entradas, **sem supor que exista uma lista fechada de todas as leis**.
- [DESIGN.md](../../DESIGN.md): tokens, identidade, comportamento low-chrome, componentes e critérios visuais.
- [MOTION.md](../../MOTION.md): movimento reduzido, física do grafo e seus limites de performance.
- [Arquitetura de informação](arquitetura-informacao-navegacao.md): tarefas do estudante, filtros e escolha entre página, painel ou aba.

**Hierarquia:** WCAG/HTML/ARIA aplicáveis e integridade dos dados > necessidades e decisões do usuário > contratos existentes do projeto > orientação de design systems > sínteses e skills de terceiros. Diretrizes de autores não são normas ou leis universais.

## 2. O que é princípio científico, técnica, norma ou regra do projeto?

| Nome original | Categoria correta | Aplicação a dashboards/gráficos | Limite e fonte |
|---|---|---|---|
| **Graphical Perception (Cleveland & McGill, 1984)** | Pesquisa empírica de percepção gráfica | Para comparação quantitativa precisa, favorecer posições em escala comum e comprimentos legíveis antes de ângulos, áreas ou volumes | Ranking é contextual, não proíbe pizza em todos os cenários. [Artigo](https://doi.org/10.1080/01621459.1984.10478080) |
| **Cognitive Fit Theory (Vessey, 1991)** | Teoria de adequação representação–tarefa | Gráficos para comparação espacial/tendência; tabelas para valores exatos e operações simbólicas | Não declara que tabela ou gráfico é sempre superior. [Artigo](https://doi.org/10.1111/j.1540-5915.1991.tb00344.x) |
| **Visual Information-Seeking Mantra (Shneiderman, 1996)** | Heurística/estrutura para exploração de dados | Overview → zoom/filtros → detalhes; também relate, history, extract quando útil | Não obriga implementar sete widgets em cada tela. [Artigo](https://doi.org/10.1109/VL.1996.545307) |
| **Nested Model for Visualization Design and Validation (Munzner, 2009)** | Modelo de projeto/validação | Verificar domínio/tarefa → abstração dos dados/operações → encoding/interação → algoritmo/eficiência | Um gráfico tecnicamente correto pode resolver a pergunta errada. [Artigo](https://doi.org/10.1109/TVCG.2009.111) |
| **Gestalt: proximity, similarity, common region, continuity** | Princípios perceptivos | Agrupar filtros e visuais relacionados; distinguir séries, categorias e escopos | Agrupamento visual não substitui rótulos, semântica ou associação acessível. [Catálogo local](ux-ui-principles.md) |
| **Proximity Compatibility / Spatial Contiguity** | Princípios/modelos cognitivos | Próximos os visuais e definições que precisam ser comparados juntos; reduzir atenção dividida | Separar quando a tarefa, o fluxo ou a responsividade exigir. [Catálogo local](ux-ui-principles.md) |
| **Fitts's Law, Hick–Hyman Law, Steering Law** | Relações empíricas de controle motor/decisão | Tamanho real do alvo, filtros localizáveis, drag/zoom e menus sem trajetórias difíceis | Não impõem 44px universais, sete filtros, nem animação fixa. [Catálogo local](ux-ui-principles.md) |
| **Shneiderman's Eight Golden Rules / Nielsen's Ten Usability Heuristics** | Heurísticas de interface | Feedback, reversibilidade de filtros, consistência, controle do usuário e recuperação de erros | Método de revisão, não lei quantificável. [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| **ISO 9241-112:2025** | Norma internacional sobre apresentação da informação | Detectabilidade, distinção, concisão e compreensão da informação; conferir implementação contra conteúdo licenciado | Este documento não reproduz a norma nem prova conformidade. [ISO](https://www.iso.org/standard/87518.html) |
| **WCAG 2.2** | Recomendação técnica W3C com critérios verificáveis | Alternativas textuais, contraste, teclado, foco, reflow, status e alvos de controle | Conformidade exige avaliação aplicável, não simples presença de ARIA. [WCAG](https://www.w3.org/TR/WCAG22/) |
| **USWDS Data Visualizations** | Guideline de design system | Título/legenda claros, contraste, descrição de tendência, tabela acessível quando adequada | Orientação, não código pronto nem padrão universal de gráfico. [USWDS](https://designsystem.digital.gov/components/data-visualizations/) |
| **Data-ink ratio / small multiples / data storytelling** | Heurísticas/editoriais de dataviz | Reduzir decoração enganosa; comparar séries com escalas coerentes; dar contexto à conclusão | Não transformar “minimalismo” em remoção de grid, incerteza ou rótulos úteis. [Carbon](https://carbondesignsystem.com/data-visualization/overview/) |

**Atenção:** Cleveland & McGill, Cognitive Fit e Munzner são pesquisas/modelos; USWDS e Carbon são design systems; WCAG/ISO são referências normativas com escopos diferentes. Não chamar todos de “leis UX”.

## 3. Especificação de cada métrica/KPI (obrigatória)

Antes de criar um KPI, registrar em issue/PR, documentação ou teste:

| Campo | Pergunta verificável | Exemplo apenas ilustrativo, **não dado real** |
|---|---|---|
| Pergunta e decisão | O que o estudante precisa entender ou decidir? | “Onde concentrar a revisão?” |
| Nome e definição | O que conta como evento/caso? | “Questões respondidas com resultado validado” |
| Fórmula e denominador | Qual agregado, filtros e exclusões? | “Acertos / tentativas elegíveis” |
| Unidade e precisão | Contagem, porcentagem, minutos, percentil? | “% com 1 casa decimal” |
| Janela e fuso | Qual período e timezone? | “Últimos 30 dias, America/Bahia” |
| Escopo/segmentos | Simulado, banca, disciplina, usuário, status? | “Disciplina selecionada” |
| Fonte e atualização | API/dataset, coleta e instante de refresh? | “Dados do app, atualizado às…” |
| Comparador e direção | Meta, tendência, período anterior ou média? | “Variação contra período anterior” |
| Ausências e incerteza | O que fazer com zero, não respondido, dados incompletos? | “Sem dados disponíveis” |
| Privacidade/autorização | Que acesso autoriza exposição/exportação? | “Somente registros do estudante autenticado” |

**MUST:** nunca inventar resultados, progresso, nota, metas, percentuais ou tendências; não misturar tentativa concluída com rascunho, nem “sem dado” com zero.

## 4. Escolha de gráfico por pergunta

| Necessidade | Preferir | Evitar / qualificar |
|---|---|---|
| Valor exato, registros individuais | Tabela ordenável, rótulos claros | Gráfico sozinho quando a tarefa pede leitura exata |
| Comparar categorias | Barras horizontais/verticais e escala quantitativa explícita | 3D, barras com eixo truncado e muitos rótulos ilegíveis |
| Tendência temporal | Linha; pontos quando amostragem ou frequência importa | Ligação contínua entre datas sem dados; sugerir causalidade sem evidência |
| Distribuição e outliers | Histograma, boxplot quando público entende, dot plot | Muitas médias sem dispersão |
| Relação de duas variáveis | Dispersão com unidades e orientação | Linha temporal falsa; correlação tratada como causalidade |
| Composição/parte do todo | Barras empilhadas com totais e denominadores; tabela para precisão | Muitos setores de pizza; percentuais sem total |
| Matriz/cross-tab | Heatmap com legenda, tabela acessível e paleta interpretável | Usar apenas cor para comunicar valor |
| Várias séries comparáveis | Small multiples com escalas equivalentes | Dual-axis enganoso, muitas linhas sobrepostas |
| Hierarquia/estrutura de dependências | Árvore/treemap se tarefa justificar; lista como fallback | Áreas como substituto de leitura numérica exata |
| Relações entre objetos | Grafo de nós e arestas com busca, legenda, seleção, filtro | Force-directed sem propósito, grafo como única navegação |
| Tempo real/monitoramento | Série com freshness, janela e controle pause/resume | Atualizações contínuas sem necessidade, animação que atrapalha leitura |

**MUST:** título, escopo, período, unidades, legenda/labels e fonte dos dados quando relevantes. Dados quantitativos requerem base e limites de eixo não enganosos; a regra “sempre iniciar tudo em zero” é inadequada para vários gráficos de linha, mas barras que codificam comprimento precisam cuidado especial com baseline. Mostrar censura, sazonalidade, intervalos e valores ausentes quando alteram interpretação.

## 5. Contrato de dashboard interativo

1. **Objetivo primeiro:** identificar público, pergunta e decisão; organizar overview → anomalia/tendência → diagnóstico → ação sem impor uma única arquitetura de páginas.
2. **Hierarquia de leitura:** KPI útil no início, comparadores visíveis; evitar dezenas de cards para campos de banco. Nenhuma duplicação de tabs, filtros ou legendas sem necessidade funcional.
3. **Filtros coordenados:** todo visual dependente do filtro compartilha a definição temporal e de segmento; indicar chips/rótulos ativos, contagem, limpar filtros e contexto de retorno.
4. **Drill-down:** clique/teclado abre escopo correto, estado URL quando apropriado, breadcrumb/voltar, restauração da seleção e do scroll; nunca navegação silenciosa.
5. **Atualização e consistência:** indicar último refresh, staleness e origem; não combinar contadores de cache velho com séries novas sem sinalização.
6. **Interatividade verdadeira:** controles fazem o que prometem; estados loading, empty, zero, partial, erro, timeout, offline e permissão têm texto acionável e recuperação.
7. **Performance:** dados grandes usam agregação ou amostragem **documentadas**, preservando exceções e picos relevantes; resize/hydration não provocam gráfico zerado nem scroll jump.
8. **Responsividade:** reorganizar por espaço de contêiner e tarefa, não comprimir labels até ficarem ilegíveis; mobile pode trocar visualização por lista/tabela equivalente.
9. **Acessibilidade:** informações essenciais visíveis ou alcançáveis por teclado; tooltip não pode ser única forma de acessar valores; nomes e status acessíveis.
10. **Exportação:** registrar data, fuso, versão do dataset, filtros, unidade, fonte, cálculo e limitações, respeitando privacidade.

## 6. Acessibilidade de visualizações (WCAG + WAI + USWDS)

| Verificação | Requisito para o projeto | Fonte |
|---|---|---|
| Equivalente textual | Descrição breve do tipo/tema + descrição longa do que importa; tabela quando valores detalhados ajudam | [WAI Complex Images](https://www.w3.org/WAI/tutorials/images/complex/), [USWDS](https://designsystem.digital.gov/components/data-visualizations/) |
| Sem dependência exclusiva de cor | Rótulos, padrões, formas, traços, ícones ou texto além da paleta | [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) |
| Contraste de texto e elementos | Avaliar critérios aplicáveis 1.4.3 e 1.4.11; testar também forced colors | [WCAG](https://www.w3.org/TR/WCAG22/) |
| Operação por teclado | Filtros, seleção, zoom, pan e drill-down equivalentes, foco e retorno previsíveis | [WCAG 2.1.1 / 2.4.7](https://www.w3.org/TR/WCAG22/) |
| Reflow e ampliação | Zoom 200/400%, narrow viewport, fontes grandes; sem perda de dados essenciais | [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| Nomes e estado | Name/role/value para controles e anúncios de atualização quando pertinentes | [WCAG 4.1.2 / 4.1.3](https://www.w3.org/TR/WCAG22/) |
| Alvos | Aplicar 2.5.8 (24 CSS px ou exceções) ao escopo aplicável; não confundir com diretrizes de plataforma | [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Movimento | Respeitar reduced motion, pausas e animação útil; 2.3.3 é AAA, não AA | [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [MOTION.md](../../MOTION.md) |
| Tabela não basta sozinha | Resumo da tendência e insights em texto, não só dump de números | [USWDS](https://designsystem.digital.gov/components/data-visualizations/) |

Para grafos: oferecer busca, seleção por teclado ou lista de nós/arestas, indicação textual das relações e foco visível. Não transformar automaticamente um grafo canvas em `role=tree` (árvore ARIA tem hierarquia e teclado específicos). Para leitores de tela, validar empiricamente, não apenas inspecionar markup.

## 7. Regras de engenharia e modelo de interação

- **Protótipo atual:** `prototypes/exam-app-0.1.1/index.html` usa HTML/CSS/JS. Respeitar esta stack; não introduzir React, Next.js, D3 ou Power BI automaticamente.
- **Futuro React/Next:** primeiro verificar bibliotecas instaladas; considerar SSR/CSR, hydration, ResizeObserver, windowing, typed data, erros de série e cores semânticas; não confundir skill com dependência npm.
- **Grafo:** referenciar [MOTION.md](../../MOTION.md), inclusive o guardrail provisório de até 240 nós para simulação O(N²). Performance, teclado, zoom e atualização de posição requerem teste real.
- **Streaming:** oferecer pausa, cadência legível, status de dados atrasados e descarte/agrupamento explícito; não atualizar dezenas de vezes por segundo sem razão.
- **Formatos:** Intl/ECMA-402 para números/data/moedas conforme locale, período e timezone explicitados; internacionalizar legenda/aria-label.
- **Segurança:** não expor dados pessoais em tooltips, logs, screenshots, exports, datasets públicos ou snapshots E2E. Sanitizar valores vindos do backend; não interpolar HTML arbitrário em rótulos.
- **Fallback:** se Canvas/SVG/gráfico falhar, manter mensagem e dados estruturados acessíveis; não esconder a página atrás de spinner infinito.

## 8. Superfícies do Exam App — perguntas, visualizações e testes

| Superfície | Pergunta do estudante | Proposta condicional (não declarar implementado) | Critério de aceite |
|---|---|---|---|
| Home / dashboard | “O que faço agora?” e “Como progrido?” | Próximo CTA + poucos indicadores válidos + histórico útil | CTA funcional; KPI condiz com dados; sem excesso de cards |
| Resultado do simulado | “Onde errei? O que revisar?” | Resultado, progresso por disciplina, revisão de erros filtrada | Denominadores válidos; revisão abre conjunto correto |
| Histórico | “Melhorei ou piorei?” | Linha temporal com janela e frequência, comparação clara | Fuso, dados ausentes, filtros e unidades consistentes |
| Banco de questões | “Qual meu universo de questões?” | Contagem, filtros, distribuição opcional por disciplina | Alterar filtro atualiza contagem/lista/links corretamente |
| Ficha de concurso/objeto | “Que relações e dados este item tem?” | Lista de relações antes ou junto de grafo | Abrir nó, zoom, seleção, teclado e retorno sem perder estado |
| Grafo | “Que objetos estão conectados?” | Overview, busca, filtros por tipo, details-on-demand e lista | Relações verdadeiras, performance, reduced motion e fallback |

A preferência visual low-chrome e a estética do Crucial Exams/Capacities são **benchmarks**, não equivalem a testes de qualidade. Alteração de protótipo precisa screenshot real, especificação estrutural, board, testes e issue/PR conforme AGENTS.md; esta mudança documental não afirma captura ou teste de tela.

## 9. Casos de teste para dashboards e gráficos

| Dado/estado | Verificação obrigatória |
|---|---|
| Dataset vazio / somente zeros / todos nulos | Mensagem diferenciada, sem NaN ou gráfico enganoso |
| Valores negativos ou muito altos | Escala correta, sem corte de barra, arredondamento explicável |
| Outliers e amostragem | Pico preservado ou limitação declarada |
| Poucas e muitas categorias; rótulos longos | Layout legível, sem truncamento inacessível |
| Múltiplas unidades e percentuais | Unidade consistente, somas e denominadores auditáveis |
| Fuso, horário de verão, períodos sobrepostos | Data/janela explícitas e buckets corretos |
| Filtro rápido, troca de abas, voltar e refresh | Sem race de filtro, duplicação de controles ou estado fantasma |
| Loading prolongado e falha de rede | Timeout finito, retry limitado, erro terminal e recuperação |
| Teclado, leitor de tela, foco, high contrast | Dados e ações alcançáveis, sem depender de hover ou cor |
| Zoom, mobile, fonte grande, locale | Sem sobreposição ou perda da mensagem do gráfico |
| Reduced motion, tab oculta, scroll | Animador para, retoma corretamente e não bloqueia o input |
| Exportação / compartilhamento | Mesmo conjunto filtrado, privacidade e metadados preservados |
| Teste regressivo | Comparar cálculos, DOM, interações e screenshot; imagem isolada é insuficiente |

**Procedimento:** documentar cenário/fixture e evidência, rodar testes da stack existente, registrar resultado de fato; não marcar “WCAG validado” só por heurística, lint ou screenshot.

## 10. Catálogo de plugins e skills especializados (pesquisa 2026)

São **referências para agentes**, não dependências instaladas no repositório. Nomes e disponibilidade devem ser revalidados no README/SKILL.md e no commit antes de uso; não executar scripts de terceiros automaticamente.

| Plugin/bundle ou skill | Foco | Fonte | Situação |
|---|---|---|---|
| OpenAI — Build Web Data Visualization | Bundle para web, charts, dashboards, grafos, QA | [Repositório](https://github.com/openai/plugins/tree/main/plugins/build-web-data-visualization) | Público; integração com cliente não presumida |
| OpenAI — dashboards-and-real-time-visualization | KPIs, filtros e atualização | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/dashboards-and-real-time-visualization/SKILL.md) | Revalidar versão |
| OpenAI — react-and-nextjs-data-visualization | Charting React/Next | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/react-and-nextjs-data-visualization/SKILL.md) | Futuro stack React |
| OpenAI — d3-data-visualization | Gráficos D3 e SVG | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/d3-data-visualization/SKILL.md) | Condicional |
| OpenAI — typescript-data-visualization-engineering | Engenharia TS de visualizações | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/typescript-data-visualization-engineering/SKILL.md) | Condicional |
| OpenAI — node-link-and-diagram-layout | Grafos e disposição de nós | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/node-link-and-diagram-layout/SKILL.md) | Relevante para grafo |
| OpenAI — testing-data-visualizations | E2E, screenshots, regressão e dados | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/testing-data-visualizations/SKILL.md) | QA |
| OpenAI — accessibility-and-inclusive-visualization | A11y de charts e alternativas | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/accessibility-and-inclusive-visualization/SKILL.md) | QA |
| OpenAI — scrollytelling-and-parallax-data-visualization | Narrativa visual por rolagem | [SKILL.md](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/scrollytelling-and-parallax-data-visualization/SKILL.md) | Não é prioridade do app |
| Anthropic — Data Analyst / data | Bundle de dados e dashboards | [Repositório](https://github.com/anthropics/knowledge-work-plugins/tree/main/data) | Ferramentas Claude, não instaladas aqui |
| Anthropic — build-dashboard | Dashboard HTML interativo | [SKILL.md](https://github.com/anthropics/knowledge-work-plugins/blob/main/data/skills/build-dashboard/SKILL.md) | Protótipo; revalidar |
| Anthropic — data-visualization | Gráficos Python e guidelines | [SKILL.md](https://github.com/anthropics/knowledge-work-plugins/blob/main/data/skills/data-visualization/SKILL.md) | Condicional |
| Anthropic — create-viz | Criar gráficos Python | [SKILL.md](https://github.com/anthropics/knowledge-work-plugins/blob/main/data/skills/create-viz/SKILL.md) | Nome/caminho a reconfirmar |
| Microsoft — skills-for-fabric / powerbi-report-cli | Relatórios e visuais Power BI | [SKILL.md](https://github.com/microsoft/skills-for-fabric/blob/main/skills/powerbi-report-cli/SKILL.md) | Requer ambiente e credenciais próprios |
| Microsoft — semantic-model-authoring | DAX e modelagem, não UI web | [SKILL.md](https://github.com/microsoft/skills-for-fabric/blob/main/skills/semantic-model-authoring/SKILL.md) | Suporte para Power BI |
| Comunidade — dashboard-design | Design e QA de dashboards | [Repositório](https://github.com/abdiraimov-otabek/dashboard-design-skill) | Skill comunitária |
| Atlassian Labs — visualization | Plotly e gráficos Python | [Repositório](https://github.com/atlassian-labs/data-visualization-skill) | Skill comunitária/experimental |
| SvaraNova — data-visualization | Charts web, legibilidade e a11y | [Repositório](https://github.com/SvaraNova/skills) | Coleção comunitária |
| pbi-agent — powerbi / powerbi-audit | Power BI PBIP e auditorias | [Repositório](https://github.com/pbi-agent/skills) | Comunidade |
| xcrrr — chart-builder / dashboard-designer | Gráficos e composição analítica | [Repositório](https://github.com/xcrrr/claude-skills) | Comunidade |
| mthines — charting | Seleção de gráficos/bibliotecas | [Repositório](https://github.com/mthines/agent-skills) | Comunidade |

**Não confundir:** `interactive-dashboard-builder` aparece na documentação Anthropic como capacidade, mas seu `SKILL.md` isolado não foi verificado na pesquisa; `semantic-model-consumption` também requer reconfirmação. Não inventar comandos de instalação nem importar tudo num único agente. Skills externas não têm precedência sobre fontes primárias.

## 11. Fontes e estado da verificação

| Referência primária | Por que consultar |
|---|---|
| [Cleveland & McGill 1984](https://doi.org/10.1080/01621459.1984.10478080) | Pesquisa de comparação visual |
| [Vessey 1991](https://doi.org/10.1111/j.1540-5915.1991.tb00344.x) | Escolher gráfico ou tabela pela tarefa |
| [Shneiderman 1996](https://doi.org/10.1109/VL.1996.545307) | Overview, zoom/filter, details-on-demand |
| [Munzner 2009](https://doi.org/10.1109/TVCG.2009.111) | Modelo de projeto e avaliação de visualizações |
| [WAI Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) | Textos alternativos de gráficos complexos |
| [USWDS Data Visualizations](https://designsystem.digital.gov/components/data-visualizations/) | Prática de visualização acessível e narrativa |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Critérios normativos aplicáveis |
| [ISO 9241-112:2025](https://www.iso.org/standard/87518.html) | Estado/escopo da norma; texto completo sob licença |
| [Microsoft Power BI Accessibility](https://learn.microsoft.com/pt-br/power-bi/create-reports/desktop-accessibility-creating-reports) | Boas práticas específicas de relatórios Power BI |
| [Carbon Data Visualization](https://carbondesignsystem.com/data-visualization/overview/) | Padrões editoriais de gráficos |
| [ECMA-402](https://tc39.es/ecma402/) | Formatação regional de datas e números |

**Escopo de verificação:** foi confirmada a presença de diretrizes em fontes oficiais selecionadas e consultado o catálogo já publicado no plugin; **não** foi feita auditoria recursiva de todos os scripts/commits das skills externas, instalação delas, teste de interface, avaliação com leitores de tela, captura de screenshot/GIF nem medição de desempenho do Exam App. Separar “documentado”, “implementado”, “testado” e “publicado”.
