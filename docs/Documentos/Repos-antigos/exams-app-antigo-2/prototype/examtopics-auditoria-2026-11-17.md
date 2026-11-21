> **EVIDÊNCIAS CANÔNICAS:** [Board 06 — dossiê completo, 57 registros e cinco capturas](evidencias-examtopics-2026-11-17.md) · [Canvas de evidências](board-exam-app__index.html#e17000). O texto abaixo é a análise e não substitui o inventário por achado.

# Auditoria comparativa: ExamTopics × Exam App (`dev`) — 17/11/2026

> **Escopo:** benchmark público do ExamTopics e inspeção estática do código do protótipo Exam App 0.1.1 na `dev` (`41b6987a62e7cbcdede21a28dd9d73cba5b04cbd` no início). **Não é homologação de execução do Exam App**; os testes E2E citados são scripts existentes, não reexecutados nesta auditoria.

## 1. Método, proveniência e limites

- **ExamTopics, 17/11/2026:** extração de páginas públicas com Firecrawl (`map`, `search`, `scrape`) e inspeção não autenticada dos controles da rota AZ-900 com `interact`. Não foi criada conta, comprada assinatura, clicada ação de voto nem executado simulado pago.
- **Exam App:** GitHub, branch `dev`, leitura de `prototype/exam-app-0.1.1__index.html`, testes versionados e índices do board. **Presente no código** não implica **teste E2E aprovado neste dia**.
- **Evidência visual herdada:** `examtopics_az104_header_and_overview.png`, `examtopics_az104_question_card.png`, `examtopics_az104_solution_reveal.png`, `examtopics_az104_discussion_modal.png`, `examtopics_az104_pagination_and_footer.png`. Arquivos já existentes em `prototype/`; **não são capturas novas de 17/11**. A inspeção atual produz evidência textual/DOM e URLs reproduzíveis, não novos screenshots.
- **Fontes de verdade:** este relatório para a observação de 17/11; `examtopics-inventory.md` e `analise-examtopics.md` mantêm conteúdo/histórico anterior com ressalvas. `board.json` e `board-mestre.json` mantêm navegação; `examtopics-auditoria-evidencias-2026-11-17.json` indexa evidências sem declarar mídia inédita.

## 2. URLs oficiais verificadas (e finalidade)

| ID | Fonte | O que comprova | Tipo de acesso |
| --- | --- | --- | --- |
| ET-01 | [Catálogo](https://www.examtopics.com/exams/) | Fornecedores, número de exames por fornecedor, navegação | Público |
| ET-02 | [Fornecedor Google](https://www.examtopics.com/exams/google/) | Lista e códigos dos exames; rótulo Popular | Público |
| ET-03 | [Visão geral AZ-900](https://www.examtopics.com/exams/microsoft/az-900/) | Código, chamada para navegar por questões e alegações promocionais | Público |
| ET-04 | [Questões AZ-900, página 1](https://www.examtopics.com/exams/microsoft/az-900/view/) | Data de atualização, total de questões, alternativas, exhibits, revelar solução, comentários, votos, paginação | Público |
| ET-05 | [Questões AWS CLF-C02, página 1](https://www.examtopics.com/exams/amazon/aws-certified-cloud-practitioner-clf-c02/view/) | Mesmo padrão em outro fornecedor | Público |
| ET-06 | [AZ-900, página 2](https://www.examtopics.com/exams/microsoft/az-900/view/2/) | Em sessão anônima, solicita login/cadastro gratuito para continuar; oferece salvar histórico de visualização | Requer login para continuar |
| ET-07 | [AZ-900, página 30](https://www.examtopics.com/exams/microsoft/az-900/view/30/) | Exige login para ver exame completo | Requer login |
| ET-08 | [Discussão AZ-900 #401](https://www.examtopics.com/discussions/microsoft/view/93155-exam-az-900-topic-1-question-401-discussion/) | Voto, alternativa selecionada, resposta, réplica, denúncia, datas | Público para leitura |
| ET-09 | [Fórum Microsoft](https://www.examtopics.com/discussions/microsoft/) | Fórum por fornecedor, listagem paginada | Público |
| ET-10 | [Login](https://www.examtopics.com/login/) e [cadastro](https://www.examtopics.com/signup/) | Conta, recuperação e verificação | Público (formulários) |
| ET-11 | [Plano PRO](https://www.examtopics.com/unlimited/) | Oferta de até dez exames, 3 meses, discussões inline, sem CAPTCHA/MFA, atualizações no prazo de acesso | Oferta pública; uso não testado |
| ET-12 | [Checkout PRO](https://www.examtopics.com/pro/) e [termos](https://www.examtopics.com/terms/) | Compra de produto digital e condições | Oferta pública |
| ET-13 | [Blog](https://www.examtopics.com/news/) | Guias editoriais e notícias antigas | Público |

**Cuidado com marketing:** percentuais e depoimentos de aprovação são alegações do próprio site, **não métricas independentes**. O PRO exibe números promocionais distintos (800/1000+); não extrapolar cobertura contratual. Preço observado na oferta de 17/11: US$ 199,99 por três meses com renovação informada na página; valor variável e não um requisito do nosso produto.

## 3. Matriz funcional completa e decisão

Legenda do Exam App: **Código** = encontrado no protótipo atual; **Parcial** = suporte incompleto ou dependente de dados; **Não localizado** = ausência na leitura estática, não prova absoluta de inexistência; **Fora de escopo** = decisão de produto. ExamTopics é sempre descrito quanto ao acesso **público** verificado.

| Capacidade observada no ExamTopics | Estado Exam App `dev` | Código/evidência Exam App | Decisão |
| --- | --- | --- | --- |
| Catálogo de fornecedores e certificações | **Não localizado** catálogo AWS/Azure/Cisco | `CONCURSOS` e entidades Concurso/Edição são outra taxonomia | **Adiar**: uma camada opcional de Certificação/Fornecedor, sem substituir Concurso |
| Catálogo e navegação por exame/prova | **Código** no domínio de concursos | rotas de Concurso, Edição, Cargo; `scBody` | **Adaptar** |
| Pesquisa por nome/código de exame | **Parcial**: busca de questões existe; busca global por código de certificação não comprovada | `qfHTML`, `qfSyncURL` | **Condicionar** ao domínio de Certificações |
| Metadados de exame: código, total, data de atualização | **Parcial**: total e propriedades de concurso; `updatedAt` por banco de certificações não verificado | `qfParts`, `qfSyncURL` | **Adicionar** metadados com proveniência |
| Lista de questões por exame, número e assunto/tópico | **Código** para lista/número/disciplina; **Parcial** para assunto preenchido | `qObjs`, `qfHTML`, `QF_CATS` | **Manter**, modelar Disciplina > Assunto |
| Dez questões por página e intervalo X–Y de N | **Código** com configuração 1/5/10/20 e anterior/próxima | `renderPracticeList`, `qPer` | **Manter**; sem copiar limite do concorrente |
| Enunciado com alternativas e gabarito revelável | **Código**, com seleção/correção explícita mais útil | `sQuestionMarkup`, `qCorrect`, `qPedModule` | **Melhorar**, gabarito antes/depois da resposta sem vazamento |
| Questões com imagens/exhibits | **Parcial**: PDF original, `textoAssociado`, recursos rich-text; renderizador de exhibit em todas as questões não homologado | `qObjs`, PDF Reader | **Planejar** anexo acessível, legenda e zoom |
| Drag-and-drop/hotspot | **Não localizado** como resposta interativa | `sQuestionMarkup` produz `input[type=radio]`; `qfModal` é rótulo | **Adiar** até banco com esse tipo de dado |
| Escolha única/dupla, certo/errado e cenários | **Parcial**: modalidade configurável, mas resolução corrente por rádio | `qfModal`, `sQuestionMarkup` | **Separar** tipo de resposta de contexto/caso |
| Sugestão de resposta + percentual de votos | **Não localizado** | métricas em `qPedModule` são pessoais | **Rejeitar** votação anônima como gabarito oficial |
| Discussão por questão, comentários, réplicas e denúncias | **Fora de escopo** de comunidade; notas e comentários de estudo são locais | `qPedModule`, `qNote` | **Adaptar** para notas/justificativas curadas, sem fórum |
| Cadastro gratuito e verificação por email | **Não homologado**: protótipo tem persistência local/bridge, não um login equiparável ao ExamTopics | `store`, armazenamento e bridge são diferentes de auth real | **Planejar** autenticação separadamente |
| Cadastro para avançar após 10 perguntas | **Não localizado** como paywall; não obrigatório | navegação `renderPracticeList` | **Rejeitar** fricção artificial no fluxo básico |
| Oferta de salvar histórico ao criar conta | **Parcial**: respostas/histórico local; sincronização multiusuário não homologada | `histAll`, `store`, sync bridge | **Manter** histórico e definir política de persistência |
| Conta Premium/PRO e checkout | **Fora de escopo** atual | — | **Não copiar** |
| Discussões inline e acesso PRO sem CAPTCHA | **Fora de escopo** atual | — | **Não copiar** |
| Blog de certificações | **Não localizado** como feed editorial | documentos/PDF e home não são blog público | **Futuro opcional** |

## 4. Capacidades em que o Exam App supera o fluxo público inspecionado

- **Filtros combinados:** Disciplina, Assunto, Banca, Cargo, Ano, Órgão, Modalidade, Dificuldade, Concurso, Edição, Origem, Situação, opções de exclusão/inclusão e contadores por opção. `QF_CATS`, `QF_EXCLUSIONS`, `qfVals`, `qfHTML`. A exibição depende de haver dados; não inventar preenchimento.
- **Chips e URLs:** remover filtro por chip, limpar, busca em questões e estado da lista na URL (`qfSyncURL`).
- **Prática:** selecionar alternativa, confirmar e corrigir; histórico e métricas pessoais; marcar favoritas/para revisar; anotações. `sQuestionMarkup`, `qMetrics`, `qMarks`.
- **Cadernos:** salvar filtro, gerar caderno, retomar, refazer erradas e navegar por contexto (`sfAll`, `nbAll`).
- **Simulados reais no protótipo:** gerar a partir de filtro ou configurador, quantidade, ordenação, tempo, resposta ocultada até entrega, resultado e estatísticas por matéria (`startSim`, `sSimOpts`, `sExamQuestion`, `finishExam`).
- **PDF Reader e revisão:** funcionalidades próprias, não atribuídas ao ExamTopics.

Scripts já presentes para futura regressão: `tests/advanced-question-filters.e2e.mjs`, `tests/study-unification.e2e.mjs`, `tests/question-pedagogy.e2e.mjs`. **Não executados nesta auditoria**.

## 5. Pontos não confirmados no ExamTopics

No acesso público inspecionado **não foram identificados**: filtros de questões por ano/dificuldade/status, pesquisa dentro das questões, seleção e correção automática, simulado cronometrado, pontuação pessoal, dashboard, favoritos, revisão espaçada. **Não afirmar inexistência em sessões autenticadas**. No HTML/DOM público AZ-900, a pesquisa é para **nome ou código do exame**, não para o texto das questões.

A página de questões do AZ-900 contém uma atividade `DRAG DROP`, mas aparece como enunciado e imagem no trecho público; **isso não comprova uma interação drag-and-drop executável no navegador**. No Exam App, `modalidade` como dado não implica renderização interativa de todos os tipos.

## 6. Lacunas e riscos reais para releases

| Prioridade | Gap da `dev` | Critério verificável | Release proposta |
| --- | --- | --- | --- |
| P0 | Documentos de pesquisa contradizem o código atual: listagem unificada/filters/state em URL já implementados | Atualizar os inventários históricos sem apagar as versões; fonte de verdade com timestamp | Planejamento 0.1.0 |
| P1 | Falta teste abrangente de enunciado + imagem e zoom nos vários contextos | E2E com imagem, alt/legenda, mobile e teclado | Após núcleo de questões |
| P1 | Tipos de resposta múltipla, drag-drop, hotspot não homologados | Fixture real por tipo + componente semântico + critérios de correção | Futuro release de formatos |
| P1 | Domínio de certificações não evidenciado | Entidades Fornecedor/Certificação/Versão/Exame sem duplicar Concurso/Edição | Futuro release de certificações |
| P2 | Histórico exibido localmente, persistência multi-dispositivo não testada | Recarregar, trocar espaço/conta, migrar dados e testar conflito | Futuro release de conta |
| P2 | Versão/data de atualização e origem do gabarito por banco externo não normalizadas | Campo rastreável, fonte, data e política de atualização | Futuro release de catálogo |

**Escopo 0.1.0 desejado (produto mínimo):** catálogo simples de provas, lista de questões, filtros essenciais, leitura de enunciado/alternativas, resolução e gabarito, navegação e simulado básico. Não incluir fórum, votação popular, PRO nem dados de certificação inventados. **A versão 0.1.0/0.1.1 existente é histórica; não sobrescrever snapshots.**

## 7. Evidências e pendências de auditoria

- Índice estruturado: [examtopics-auditoria-evidencias-2026-11-17.json](examtopics-auditoria-evidencias-2026-11-17.json).
- Capturas **anteriores** reutilizáveis: [visão geral](examtopics_az104_header_and_overview.png), [card](examtopics_az104_question_card.png), [solução](examtopics_az104_solution_reveal.png), [modal de discussão](examtopics_az104_discussion_modal.png), [paginação](examtopics_az104_pagination_and_footer.png). O nome do arquivo não prova a data nem a versão da interface; comparar com a URL atual antes de alegar paridade.
- Falta pesquisa autenticada, verificação de plano pago, capturas novas desktop/tablet/mobile, teste de acessibilidade com leitor de tela e E2E executado no ambiente atual. Essas tarefas **não estão concluídas**.
- Issue histórica: [#28](https://github.com/ianmaciel7/exams-app/issues/28). O fechamento da issue não significa pesquisa autenticada exaustiva.

**Não usar este inventário como autorização para copiar conteúdo protegido de questões ou reutilizar gabaritos de terceiros sem permissão.**
