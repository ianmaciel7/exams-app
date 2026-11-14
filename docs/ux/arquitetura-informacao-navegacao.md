# Arquitetura da informação, navegação e composição de telas — Exam App

> **Issue:** [#102](https://github.com/ianmaciel7/exams-app/issues/102) · **Auditoria:** 14/11/2026 · **Baseline da branch dev no início:** `bae7aca21afd57c7e8248b34e99105574449d70a`
>
> **Tipo de entrega:** pesquisa aplicada, modelo de navegação e plano de validação. Este documento **não implementa** as telas futuras nem comprova conformidade WCAG. O código continua sendo a fonte da verdade sobre aquilo que já funciona; `board.json` é a fonte da verdade para evidências visuais.
>
> **Decisão principal:** *Questões* e *Simulados* são jornadas de usuário; *Questão*, *Simulado*, *Concurso*, *Edição* e *Cargo* também são tipos de objeto. Os modelos coexistem sem que a pessoa precise conhecer a taxonomia antes de começar a estudar.

## 1. Rastreamento e método

Fontes internas inspecionadas na `dev`: `prototypes/exam-app-0.1.1/index.html`, `DESIGN.md`, `prototypes/analises/analise-qconcursos.md`, `prototypes/analises/analise-examtopics.md`, `prototypes/board-exam-app/board.json` e `BOARD.md`. Evidências da issue #97 são 48 capturas do shell em `prototypes/board-exam-app/assets/lowchrome_97_*.png` e matriz de estados em `lowchrome_97_manifest.json`.

**Termos de status:**

- **Implementado (I):** há caminho executável no HTML/JS da `dev`, mesmo que parcial ou limitado a Dataprev.
- **Parcial (P):** há entrada/código real, porém não atende ao contrato proposto.
- **Proposto (R):** requisito/rota/fluxo ainda não entregue; vincular à issue responsável.
- **Benchmark (B):** comportamento documentado por outro produto, sem inferir existência no Exam App.
- **Não verificado (NV):** faltam captura real, teste de interação ou comprovação atual.

### 1.1 Princípios e rastreabilidade

| Princípio | Classe | Fonte primária | Consequência para Exam App | Evidência/código atual | Verificação |
|---|---|---|---|---|---|
| Navegação consistente e identificação previsível | Norma WCAG 2.2 AA (`3.2.3` e `3.2.4`) | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Questões/Simulados sempre com o mesmo nome e ordem na sidebar, Home e breadcrumbs | `#questionsRow`, `#examsRow` e `route()`, alterados no PR #101 | A mesma ação não muda de nome em 3 telas; teste de navegação entre contextos |
| Foco operável e perceptível | Norma WCAG 2.2 (`2.1.1`, `2.4.3`, `2.4.7`, `2.4.11` AA) | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Foco visível, ordem lógica, não escondido pelo cabeçalho, modal ou painel | `:focus-visible`, `.ws-tabs`; **não significa conformidade validada** | Percorrer teclado em desktop/mobile e registrar foco e sobreposição |
| Alvo de toque mínimo | Norma WCAG 2.2 `2.5.8` AA (com exceções) | [W3C: alterações da 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | Botões compactos devem respeitar alvo 24×24 CSS px ou exceção válida; 44 px é preferência ergonômica local, não o mínimo normativo geral | `DESIGN.md` cita alvos; verificar chips, tabs e botões `+` | Medir bounding boxes e separação; documentar exceções |
| Estado do sistema, prevenção e recuperação | Heurísticas, não norma | [NN/g: 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/) | Loading finito, confirmação ao descartar simulado e recuperação de falhas | `showStudyRoute`, `startSim`, `saveExam` | Falha de carregamento explícita e retry, interrupção segura |
| Reconhecimento em vez de memorização | Heurística | [NN/g: 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/) | Visibilidade de Questões e Simulados sem exigir conhecer “Tipos de Objeto” | Entradas do PR #101 na Home/sidebar | Primeiro clique e teste de árvore sem pistas |
| Divulgar detalhes conforme necessidade | Heurística de progressive disclosure | [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Enunciado e ação de responder no foco; metadados avançados e análises como secundários | `renderPractice()` versus `questaoTipoPage()` | Pessoa localiza resposta sem expandir propriedades |
| Não impor a regra de 3 cliques | Pesquisa/heurística crítica | [NN/g: regra de 3 cliques é falsa](https://www.nngroup.com/articles/3-click-rule/) | Minimizar confusão/desvios, não estabelecer limite absoluto de cliques | Antes do #101 havia redireção para tipo; corrigida | Medir sucesso, primeiro clique, desvios e tempo até a tarefa |
| Um painel por tab e navegação acessível | Padrão WAI-ARIA, não substitui WCAG | [APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Somente conteúdo alternativo em tabs; setas, `aria-selected`, ``tablist/tab/tabpanel` coerentes | `ws-tab`, `rp-tabs` | Teste de teclado e leitor de tela, sem presumir conformidade |
| Clareza do percurso e adequação da apresentação | Norma de ergonomia | [ISO 9241-110:2020](https://www.iso.org/standard/75258.html), [ISO 9241-112](https://www.iso.org/standard/87518.html), [ISO 9241-115](https://www.iso.org/standard/80773.html) | Organizar ações e prioridades conforme tarefa e contexto | `DESIGN.md`, `opEspacoPage` | Revisão de interface + teste com usuários; texto integral ISO depende de acesso à norma |
| Escolher padrões pelo contexto | Padrão de design | [GOV.UK Patterns](https://design-system.service.gov.uk/patterns/), [Tabs](https://design-system.service.gov.uk/components/tabs/) | Não usar tabs quando a pessoa precisa ler tudo sequencialmente ou comparar seções | `scopedPage()`, `opNav()` | Testar versão com todas as seções visíveis antes de ocultá-las |

**Atenção epistemológica:** WCAG define critérios testáveis; ISO é norma formal; NN/g traz heurísticas e pesquisa; GOV.UK e APG são orientações/padrões; as decisões de produto abaixo são hipóteses locais. Não tratar “Hick”, “Jakob” ou “Tesler” como lei obrigatória ou como justificativa para número fixo de controles.

## 2. Mapa atual reproduzível na branch dev

**Fonte de implementação:** `route()` próximo da linha 4058; `showStudyRoute()` próximo da 3941; `showObjs()` próximo da 3792; `qObjs()` próximo da 3614; `scopedPage()` próximo da 3254; `opEspacoPage()` próximo da 3337. Números de linha são localizadores aproximados, não API.

| Caminho/entrada | O que a pessoa realmente encontra | Status | Ponto fraco conhecido |
|---|---|---|---|
| `#/espaco` (também hash vazio) | Home do espaço, atalhos “Resolver questões” e “Fazer simulado”, continuar leitura, KPIs, objetos | I | Informações de estudo ainda fortemente orientadas ao banco Dataprev; #69 |
| Sidebar **Questões** → `#/questoes` | Tela de prática com enunciados e respostas da prova Dataprev carregada por `renderPractice()` | I/P | Questões manuais ficam fora deste fluxo; #100 |
| Sidebar **Simulados** → `#/simulado` | Configurador do simulado Dataprev; opção de continuar tentativa; `renderExamHome()` | I/P | Configuração global diferente de contextual e do conjunto unificado; #100 |
| `#/questoes/erradas` | Prática com filtro de erradas ativado na entrada da rota | I/P | Não unifica erros de questões manuais; estado de filtro não está totalmente na URL |
| `#/simulado/exec` | Execução com cronômetro, respostas, grade de questões, confirmação de entrega | I | Fluxo baseado em estrutura de tentativa existente, sem contrato genérico |
| `#/simulado/resultado` | Resultado e análise por disciplina após entrega | I | O relatório depende do formato da tentativa existente |
| `#/concurso/:id`, `#/edicao/:id`, `#/cargo/:id` | Ficha do objeto, propriedades, relações, abas contextuais | I | Não são substitutos do ponto de entrada direto de Questões |
| `#/concurso/:id/questoes` (idem edição/cargo) | Lista contextual com formulário/manual e filtros; `scBody()` usa `qfHTML()` | I/P | Segundo caminho de lista e filtros; apenas alguns contextos têm banco oficial |
| `#/concurso/:id/simulado` (idem edição/cargo) | Configuração por contexto com banco oficial + questões próprias | I/P | Configuração difere da entrada global |
| `#/tipo/questao` | Catálogo único de *objetos* via `qObjs()` (questões oficiais + próprias), filtros e comando para iniciar simulado | I | Catálogo não é o mesmo que prática inline global |
| `#/questao/:id` | Ficha da questão, alternativas, respostas e metadados | I | Não confundir “objeto” com tarefa de prática |
| `#/tipo/:tipo`, `#/disciplina/:id` | Catálogo de tipos e entidade contextual | I | Navegação focada em taxonomia |
| `#/revisao` | Redireciona a `#/tipo/questao` | P | Revisão de erros não tem jornada própria; #76 |
| `#/grafico`, `#/explorar` | Grafo global/exploração | I/P | Melhorias de motor e controles #67/#68 |
| `#/quadro` | Quadro visual do espaço | I | Não é o fluxo principal de resolução |

**Verificação de cliques (reproduzível):** abrir o protótipo servido em `/exam-app-0.1.1/index.html#/espaco`; selecionar “Questões” na sidebar e verificar hash `#/questoes`; voltar e selecionar “Simulados” para `#/simulado`; no botão “Caderno de Erros” verificar `#/questoes/erradas`. Na Home, conferir os mesmos dois caminhos. Em `#/tipo/questao`, procurar questão criada manualmente, abrir `#/questao/:id`; observar que não aparece na prática global. Isso é um **roteiro de reprodução**, não um E2E já executado.

### 2.1 Grafo do percurso atual

~~~mermaid
flowchart TD
  A["Home #/espaco"] --> B["Questões #/questoes (oficial)"]
  A --> C["Simulados #/simulado (Dataprev)"]
  A --> D["Concurso / Edição / Cargo"]
  D --> E["Questões contextuais"]
  D --> F["Simulado contextual"]
  B --> G["Responder questão"]
  C --> H["Execução #/simulado/exec"]
  H --> I["Resultado #/simulado/resultado"]
  D --> J["Tipo de objeto Questão"]
  J --> K["Ficha #/questao/:id (oficial + manual)"]
  A --> L["Revisão #/revisao (redireciona para Tipo)"]
~~~

Os dois bancos não são bases de dados necessariamente distintas: `qObjs()` já concatena oficiais e manuais. O **problema é duplicação de superfícies de tarefa, estado de filtro e modos de resposta**.

## 3. Arquitetura proposta — jornadas primeiro, objetos preservados

A navegação primária deve ser orientada por intenção. Tipos de objeto e grafo permanecem acessíveis como **exploração e organização**, não como pré-requisito da prática.

~~~mermaid
flowchart TD
  H["Início: continuar + próxima ação"] --> Q["Questões: banco único"]
  H --> S["Simulados: meus simulados / configurar"]
  H --> R["Revisar erros"]
  Q --> F["Busca + filtros + cadernos"]
  F --> P["Questão focada: responder sem perder contexto"]
  F --> S
  P --> R
  S --> X["Executar / retomar"]
  X --> Y["Resultado + revisar questões"]
  H --> C["Conteúdo / concursos / cargos / PDF"]
  C --> Q
  C --> S
  C --> G["Explorar: tipos / propriedades / grafo"]
~~~

**Proposta de sidebar (nomenclatura local):** `Início`; grupo `Estudar` contendo `Questões`, `Simulados`, `Revisar erros` e `Meus cadernos` quando estes existirem; grupo `Conteúdo` com Concurso/Edição/Cargo/PDF/Disciplina; `Explorar` para tipos de objeto e grafo. Não exibir entradas inertes como se fossem funcionalidades concluídas. O painel direito é opcional/contextual (propriedades, anotações, backlinks, grafo local); não deve conter CTA primário escondido.

**Invariantes:** um repositório lógico de questões com IDs únicos, origem e escopo; um mecanismo de filtros; um mecanismo de resposta/histórico; um construtor de simulado que recebe o conjunto filtrado. A questão é um objeto reutilizado em prática, simulado, caderno e revisão. Múltiplas **vistas** não implicam múltiplos **bancos**.

### 3.1 Contrato de páginas e hierarquia

| Tela (rota alvo conceitual) | Propósito e conteúdo prioritário visível no início | CTA primário; secundário | Detalhes sob demanda | Estados e mobile |
|---|---|---|---|---|
| Início `#/espaco` (I/P, #69) | “Continuar onde parei”, última tentativa, próxima disciplina útil, questões feitas hoje; concurso ativo | **Continuar estudo** / **Resolver questões**; ver edital | KPIs avançados, radar, objetos recentes | Sem atividade: começar questão/importar; mobile em coluna única |
| Questões `#/questoes` (I/P, #100) | Busca, status rápido (Todas/Não resolvidas/Acertei/Errei), filtros, contagem, primeira questão | **Responder**; salvar filtro/gerar caderno/simulado | Banca/ano/órgão/cargo, análise por opção, comentários | Sem resultados com limpar, loading/erro, filtros em drawer mobile |
| Questão focada `#/questao/:id` (I/P) | Contexto mínimo (número, disciplina e fonte), enunciado, alternativas, progresso | **Responder**; anterior/próxima | Metadados detalhados, explicação, anotações, histórico | Foco não salta, mobile com ações fixas não cobrindo alternativas |
| Revisão `#/questoes?status=erradas` (R #76; atalho atual `#/questoes/erradas`) | Lista de erros, critérios de recuperação, progresso | **Revisar questão**; gerar caderno de erros | Histórico e métricas | Vazio: “nenhuma questão errada”; sem promessa de motor já feito |
| Simulados `#/simulado` (I/P #100) | Continuar tentativa em andamento ou configurar nova; tentativas recentes | **Continuar** (se existe) ou **Configurar simulado**; ver resultados | Histórico, tipos e duração | Exibir riscos de substituição antes de recomeçar |
| Configurador (R #100) | Filtro comum, quantidade, ordem, duração, escopo/cargo, resumo | **Iniciar simulado**; salvar configuração | Regras avançadas | Validação, disponibilidade, preview da quantidade |
| Execução `#/simulado/exec` (I) | Enunciado, alternativas, cronômetro, número atual, status de respostas | **Próxima** / **Entregar prova**; marcar revisão | Grade de salto, instruções | Interrupção/retorno e aviso de prazo; mobile sem painel excessivo |
| Resultado `#/simulado/resultado` (I) | Total, acertos, não respondidas, desempenho por disciplina | **Revisar erros**; refazer | Análise por questão, histórico | Sem dados/expirado/erro; acessibilidade de gráficos |
| Concurso/Cargo (I/P, #69) | Nome, edital, datas, banca, vagas/cargo, contexto | **Resolver questões desse escopo**; fazer simulado | PDFs, propriedades, relações, objetos | Abas de contexto quando forem alternativas; mobile rolagem natural |
| Tipo de objeto `#/tipo/:tipo` (I) | Nome do tipo, busca, lista/galeria, contagem | **Novo objeto**; filtro/layout | Propriedades, herança, backlinks | Sem itens e erros explicativos; não ser gateway obrigatório para estudar |
| PDF/leitor (I/P #77–#80) | Documento, página atual, ferramentas essenciais | **Ler/retomar**; pesquisar | Grifos, TTS, notebook, IA | Estados download/falha e alternativa de leitura; propostas não implementadas |

**“Acima da dobra” não é um tamanho fixo:** refere-se à primeira região visível na viewport real. CTA, título e contexto mínimo devem ficar descobertos sem exigir scroll inicial em 1366×768, 1024×768 e celular, mas não é preciso comprimir toda a página na dobra.

## 4. Matriz de escolha: página única, múltiplas páginas e outros padrões

| Padrão | Usar quando | Evitar quando / risco | Exemplo Exam App | Verificação |
|---|---|---|---|---|
| **Página única contínua** | Informação correlata, leitura sequencial, comparação de partes, poucos saltos de contexto | Conteúdo heterogêneo muito grande e sem âncoras | Ficha Concurso com resumo → cronograma → cargos (I/P) | Escaneabilidade, headings e posição ao voltar |
| **Múltiplas páginas/rotas** | Objetivos com estado e duração próprios; link compartilhável; interrupção/retomada | Fracionar uma única tarefa em telas artificiais | Configurador → execução → resultado de Simulado (I/P/R) | Histórico/back/refresh e recuperação |
| **Tabs** | Vistas alternativas do **mesmo** objeto e contexto, sem necessidade de comparar simultaneamente | Conteúdo necessário sequencial ou tabs demais | Visão geral / Questões / Simulado contextual (I) | WAI-ARIA APG, setas, `aria-selected`, foco |
| **Accordion/details** | Seções independentes que raramente precisam de atenção conjunta | Esconder enunciado/CTA/gabarito essencial | Propriedades secundárias da ficha (I/P) | Encontrabilidade sem instrução |
| **Popover** | Escolha curta, transitória e ancorada no controle | Formulário complexo, texto longo, navegação difícil por teclado | Categorias do construtor de filtros `qfHTML()` (I) | Escape, foco, fechamento e leitor de tela |
| **Drawer** | Controles acessórios em tela pequena sem trocar de tarefa | Substituir página principal ou ocultar conclusão essencial | Filtros estruturais no mobile (R); navegador de questões (I/P) | Abrir/fechar, restaurar foco e scroll |
| **Painel contextual** | Consultar metadados, grafo local, anotações mantendo conteúdo em foco | Forçar o aluno a alternar para ler a questão | Painel direito Capacities-like (I/P #54/#66) | Recolher, redimensionar, responsivo e teclado |
| **Modal de confirmação** | Decisão destrutiva/reversão de alto custo que interrompe tarefa | Navegar entre questões ou mostrar dados informativos comuns | Descartar tentativa em andamento (I) | Foco preso ao modal, Escape/cancelamento, texto claro |
| **Wizard/etapas** | Configuração longa com dependências/validação por etapa e revisão final | Simulado com poucos campos; “3 cliques” arbitrários | Gerador avançado de simulado, **somente se pesquisa justificar** (R) | Teste comparativo contra formulário único |

**Regra de decisão:** primeiro verificar se o usuário está em uma única tarefa ou mudando de objetivo; depois se o conteúdo precisa ser comparado, lembrado ou compartilhado; então selecionar o padrão mais simples que preserva contexto, foco e estado. Testar antes de ocultar seções atrás de tabs/acordeões. Referência: [GOV.UK tabs](https://design-system.service.gov.uk/components/tabs/) e [accordion](https://design-system.service.gov.uk/components/accordion/).

## 5. Contrato de filtros, tarefas e preservação de contexto (#70, #75, #100)

**Um mecanismo de busca/filtro, várias vistas.** Consumidores: banco de questões, questões por cargo/edição, cadernos, gerador de simulado e revisão. Estado proposto:

- **Estado rápido:** Todas / Não resolvidas / Acertei / Errei; acessível sem abrir popover. Não é “disciplina”.
- **Facetas estruturais:** Disciplina → Assunto (cascata), concurso/edição/cargo, banca, órgão, ano, origem e texto; expostas em filtro avançado com agrupamentos legíveis.
- **Barra de resultados:** quantidade real filtrada, chips removíveis, limpar tudo, estado vazio com recuperação, ordem e tamanho de página.
- **URL:** estado serializado em valores legíveis e codificados, por exemplo `#/questoes?status=erradas&banca=FGV&disciplina=Portugues&pagina=2` (**R, não implementado**). Back/Forward e reload restauram filtros, página e questão focada; links não dependem de sessão em memória.
- **Persistência:** preferências de visualização podem ir para storage; URL vence para estado navegável. Uma nova busca reseta paginação de forma previsível; voltar restaura posição de scroll.
- **Banco e histórico:** `qObjs()` já forma um ponto de normalização de questões oficiais/manuais, mas `renderPractice()` permanece oficial-only. Consolidar modelos e respostas antes de ligar “Gerar Caderno”, “Criar Simulado” e “Revisar erros” a filtros.
- **Ação contextual:** em concurso/cargo/edição, “Resolver questões” abre a **mesma** jornada global com escopo pré-aplicado, não um segundo motor.

**Benchmark verificado por documentação oficial do Qconcursos (B):** [filtros](https://suporte.qconcursos.com/pt-BR/articles/12118570-como-usar-os-filtros-de-questoes) incluem status, palavra-chave, disciplina/assunto e atributos da prova; após filtrar há ações como salvar filtro, gerar caderno e criar simulado. [Simulados personalizados](https://suporte.qconcursos.com/pt-BR/articles/11655126-como-criar-um-simulado-personalizado) usam filtros antes de configurar quantidade/tempo. Trata-se do produto referenciado, **não** de funcionalidade já entregue no Exam App.

## 6. Estados de interface e acessibilidade

| Estado | Mensagem/ação obrigatória | Não fazer |
|---|---|---|
| Loading | Informar tarefa em andamento, impor deadline/retry limitado com backoff e saída controlada para erro | Spinner infinito, repetição automática sem limite |
| Erro de carregamento | Mensagem específica, “Tentar novamente”, caminho de retorno sem perder contexto | Página vazia ou alerta genérico |
| Sem questões no filtro | “Nenhuma questão corresponde aos filtros”; chips visíveis, “Limpar filtros” | Exibir 0 sem explicação |
| Sem respostas / início de uso | CTA “Resolver primeira questão” e breve explicação | KPIs 0 sem próxima ação |
| Simulado em andamento | Cronômetro e respostas preservados, “Continuar” prioritário, aviso explícito ao descartar | Recomeçar automaticamente |
| Simulado concluído | Resultado, não respondidas, origem do gabarito, revisão | Confundir pontuação didática com resultado oficial |
| Sem banco para escopo | Informar disponibilidade, oferecer cadastrar/importar questão/PDF | Prometer simulado com 0 questões |
| Mobile | Painéis acessórios colapsáveis, foco não oculto, alternativas tocáveis, sem overflow | Copiar as 3 colunas do desktop |
| Teclado/leitor de tela | Rotas, tabs, popover, modal, controles e mensagens operáveis, com nome/role/estado | Assumir conformidade por usar `aria-*` |

**Critérios de teste WCAG 2.2:** 1.3.1 (semântica), 2.1.1 (teclado), 2.4.3 (ordem de foco), 2.4.6 (cabeçalhos/rótulos), 2.4.7 (foco visível), 2.4.11 (foco não oculto, AA), 2.5.8 (tamanho mínimo de alvo, AA), 3.2.3/3.2.4 (consistência), 3.3.1/3.3.2 (erros/rótulos), 4.1.2/4.1.3 (nome/papel/valor e status). **Sem testes auditados, status é “não verificado”**, não “conforme”.

## 7. Benchmarks — evidência e limites de inferência

| Produto | Observação verificável | Fonte e natureza | Transferência proposta | Limites |
|---|---|---|---|---|
| Qconcursos | Navegação para “Questões” direto da sidebar; filtro, resolver, corrigir, ações pós-resposta; simulado personalizado a partir de filtros | [Suporte: resolver](https://suporte.qconcursos.com/pt-BR/articles/11649035-como-resolver-questoes-na-central-de-preparacao), [filtros](https://suporte.qconcursos.com/pt-BR/articles/12118570-como-usar-os-filtros-de-questoes), [simulado](https://suporte.qconcursos.com/pt-BR/articles/11655126-como-criar-um-simulado-personalizado) — documentação oficial consultada em 14/11/2026 | Fluxos diretos e estado único de filtro | Não prova layout pixel a pixel nem disponibilidade em toda modalidade/plano |
| ExamTopics | Revisão local de lista/paginação, navegação de questões e padrões de visibilidade | `prototypes/analises/analise-examtopics.md` — análise interna; exemplo [página de exame](https://www.examtopics.com/exams/microsoft/az-305/view/) | Progresso claro, número/posição, anterior/próxima | **Sem captura nova nesta auditoria**; não afirmar estado atual da UI sem inspeção |
| Capacities | Tipos de objeto, dashboards de tipos, listagem “All”, propriedades, queries/collections dinâmicas | [Object types](https://docs.capacities.io/reference/content-types), [Queries](https://docs.capacities.io/reference/queries), [Collections](https://docs.capacities.io/reference/collections) — documentação oficial | Modelo de objetos e painel contextual convivem com jornadas de estudo | Algumas queries dependem do plano Pro; não inferir implementação, HTML/JS internos ou animações atuais |
| Exam App, shell | Separadores decorativos removidos com teste de responsividade e estados de painel | [PR #103](https://github.com/ianmaciel7/exams-app/pull/103), `board.json` seção 31, 48 imagens reais Playwright do próprio protótipo | Manter UI low-chrome sem sacrificar controles | Screenshots **não** equivalem a teste moderado de UX ou auditoria WCAG |

**Proveniência:** nenhuma captura nova de Qconcursos, ExamTopics ou Capacities foi realizada **nesta** execução. Não fabricar fotos, GIFs ou atributos de DOM. Ao inspecionar benchmarks futuramente, registrar URL, data, viewport, ação realizada, estado antes/depois, nome de arquivo em `prototypes/board-exam-app/assets/`, ID de elemento em `board.json` e sincronização gerada em `BOARD.md`. As evidências locais já presentes no board só sustentam as observações com procedência documentada.

## 8. Testes com usuários — protocolo antes de impor metas

### 8.1 Teste de árvore (*tree testing*) e primeiro clique

Criar duas árvores de navegação **sem aparência visual**: “Atual em dev” e “Proposta”. Usar rótulos exatos do mapa, sem explicações sobre tipos de objeto. Pedir à pessoa onde clicaria primeiro, depois onde esperaria chegar. Executar separadamente a primeira escolha na UI real.

| ID | Tarefa neutra | Destino esperado na IA proposta | Principal risco atual |
|---|---|---|---|
| T1 | “Quero resolver uma questão nova agora” | Questões → primeira questão | Escolher Tipo de Objeto antes de Estudar |
| T2 | “Quero simular uma prova com tempo marcado” | Simulados → configurar | Confundir simulados contextuais com global |
| T3 | “Errei questões e quero revisá-las” | Revisar erros / filtro Errei | Redirecionamento `#/revisao` para tipo |
| T4 | “Quero editar uma questão que eu mesmo criei” | Questões → localizar objeto → editar | Separação de banco manual e prática |
| T5 | “Quero treinar apenas questões do meu cargo” | Conteúdo → cargo → resolver questões **ou** Questões → cargo | Filtro de contexto escondido |
| T6 | “Quero continuar uma prova interrompida” | Simulados → continuar tentativa | Recomeço e perda de respostas |

Registrar por participante: árvore A/B, primeira escolha, destino final, sucesso sem ajuda, desvios, retorno à árvore, duração, hesitação/verbalização, descobribilidade do rótulo. **Não adotar meta universal de “até 3 cliques”.** Comparar sucesso e erros antes/depois; somente após piloto e tamanho de amostra definido estabelecer metas numéricas factíveis.

### 8.2 Teste moderado de tarefa na UI

Ordem contrabalanceada quando possível, sem instruir controles: (1) iniciar questão; (2) selecionar um filtro e remover apenas um chip; (3) responder e confirmar; (4) abrir outra rota e usar Voltar, verificando posição/filtros; (5) criar simulado a partir de filtro; (6) responder 2 itens, sair e retomar; (7) entregar e revisar erros; (8) localizar questão criada manualmente; (9) executar fluxo por teclado; (10) repetir tarefas críticas em 390px mobile. Incluir participantes que usam teclado ou tecnologia assistiva, quando disponíveis; não usar só usuários experientes.

Para cada tarefa coletar: sucesso independente/assistido/falhou, tempo, primeiro clique, desvios, estado de URL e de scroll, perdas de dados, erros de interface, satisfação e trechos de fala. Testar estados vazios e falhas artificiais de carregamento. Usar a mesma base de conteúdo e instruções nos dois desenhos; estabelecer baseline na `dev` atual **antes** de fixar qualquer limiar de melhoria. Anexar logs/screenshots/GIF com autorização e sem dados pessoais no board.

### 8.3 Checklist de QA de navegação antes de fechar #100

- [ ] Questão oficial e manual aparecem na **mesma lista filtrável**, mantendo identidade/origem.
- [ ] Resolver, corrigir, revisar e simular usam o mesmo conjunto/estado.
- [ ] Filtro na URL, reload, Back/Forward, scroll e foco restaurados.
- [ ] Home/sidebar/contextos levam às mesmas jornadas sem rota morta ou mudança enganosa de rótulo.
- [ ] Simulado iniciado/interrompido/retomado não perde respostas; não é sobrescrito sem confirmação.
- [ ] Estado vazio, erro/timeout, teclado, mobile e foco visual testados.
- [ ] Evidência E2E e screenshots em board com procedimento reproduzível.

## 9. Roadmap, responsabilidades e prevenção de sobreposição

| Prioridade | Issue | Entrega delimitada | Bloqueia / depende |
|---|---|---|---|
| **P0** | [#100](https://github.com/ianmaciel7/exams-app/issues/100) | Banco unificado, rotas por tarefa, prática e simulado com estado compartilhado, E2E | Pré-requisito para fluxo consistente de #70/#75/#76 |
| **P1** | [#70](https://github.com/ianmaciel7/exams-app/issues/70) | Filtros estruturais avançados, quick status, serialização/contagem/limpar | Reusar contrato de #100, não implementar segundo filtro |
| **P1** | [#75](https://github.com/ianmaciel7/exams-app/issues/75) | Cadernos e filtros salvos, gerar a partir do resultado filtrado | Depende de #100/#70 |
| **P1** | [#76](https://github.com/ianmaciel7/exams-app/issues/76) | Motor de revisão de erros e recuperação por acerto | Depende de histórico/IDs da #100 |
| **P1** | [#71](https://github.com/ianmaciel7/exams-app/issues/71), [#72](https://github.com/ianmaciel7/exams-app/issues/72) | Foco de questão, feedback pedagógico e tabs de análise | Não criar novo armazenamento de resposta |
| **P2** | [#69](https://github.com/ianmaciel7/exams-app/issues/69) | Home de próxima ação, ritmo real e métricas | Consumir dados já consolidados de #100/#76 |
| **P2** | [#54–#58](https://github.com/ianmaciel7/exams-app/issues/54), [#66–#68](https://github.com/ianmaciel7/exams-app/issues/66) | Refinar shell, painéis e grafo | Não deslocar CTA de resolver/simular para painel secundário |
| **P2** | [#77–#84](https://github.com/ianmaciel7/exams-app/issues/77) | Ferramentas de leitura, notas, revisão espaçada e core PKM | Avaliar isoladamente, sem misturar à jornada principal |

**Relação com #21:** considerar a Home estrutural concluída da #21 como baseline; #69 é evolução da hierarquia pedagógica, não reabertura de #21. **#102 não contém alterações funcionais.** Screenshots, grafos e componentes adicionais devem ser evidência de teste, não justificativa de produto por si só.

## 10. Auditoria final / limites

- **SHA inicial (14/11/2026):** `bae7aca21afd57c7e8248b34e99105574449d70a`.
- **SHA final:** registrar o HEAD real de `dev` ao concluir este PR; se divergir, revisar tabela de rotas e código antes de marcar a issue como concluída.
- Este documento verifica **código e documentação**, não atribui conformidade WCAG, não substitui estudo de campo e não altera a interface além do que já entrou em PRs anteriores.
- Melhorias que dependem de dados próprios, screenshots externos ou entrevistas permanecem como **hipóteses** até haver evidência rastreável.
