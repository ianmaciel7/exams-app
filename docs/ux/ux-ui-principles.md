# Catálogo de leis, heurísticas e padrões UX/UI — Exam App

> **Status:** curadoria operacional inicial (14/11/2026), para uso por agentes; não representa o relatório final da Pesquisa Profunda em andamento. **Base consultada:** branch dev em 408271d7c56b088fefe9d17860a23c47731ff268. **Escopo:** documentação, sem alterar telas. Relacionado a [#102](https://github.com/ianmaciel7/exams-app/issues/102) e [arquitetura de navegação](arquitetura-informacao-navegacao.md).

**Animação e movimento:** os 12 princípios clássicos, as regras de motion para interfaces, os tokens do Exam App e os testes de movimento reduzido estão documentados em [MOTION.md](../../MOTION.md). São princípios artísticos e práticas de interação, não 12 leis normativas de UX.

## Como usar sem transformar heurísticas em dogmas

- **Norma técnica:** critério formal e testável; aplicar o nível e as exceções corretos. WCAG 2.2 AA é alvo de projeto, **não declaração de conformidade**. A norma ISO pode exigir acesso ao texto integral.
- **Estudo empírico:** descreve relação observada sob condições específicas; não é receita de UI.
- **Heurística:** princípio de revisão, sujeito a contexto e teste com usuários.
- **Padrão:** solução recorrente com pré-condições, sem obrigação universal.
- **Recomendação local:** decisão de produto a validar, não resultado científico.
- Em conflitos, priorizar acessibilidade, integridade dos dados, tarefa real e evidência de teste. Registre exceções justificadas na issue/PR.

## Catálogo (86 itens)

### 1. Cognição, decisão e percepção

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

### 2. Organização visual e Gestalt

| # | Princípio | Classe | Definição | Regra para o Exam App | Limites e exceções | Fonte |
|---:|---|---|---|---|---|---|
| 15 | Proximidade | Princípio perceptivo | Elementos próximos tendem a ser percebidos como grupo. | Agrupar filtros por disciplina, banca e situação. | Proximidade não substitui títulos e semântica. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 16 | Similaridade | Princípio perceptivo | Aparência semelhante sugere função ou categoria semelhante. | Padronizar botões e estados das alternativas. | Diferenciar visualmente ações com consequências diferentes. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 17 | Região comum | Princípio perceptivo | Um contêiner pode comunicar agrupamento. | Delimitar filtros avançados e resumo do simulado. | Evitar caixas em excesso e ruído de bordas. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 18 | Continuidade | Princípio perceptivo | Alinhamentos e sequências favorecem leitura de percurso. | Alinhar enunciado, respostas, correção e próxima questão. | A ordem semântica do DOM deve acompanhar a visual. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 19 | Fechamento | Princípio perceptivo | Pessoas completam formas visuais incompletas. | Usar indicadores de progresso simples e legíveis. | Nunca depender só de formas implícitas para informação crítica. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |
| 20 | Figura-fundo | Princípio perceptivo | Contraste ajuda distinguir elemento focal do entorno. | Dar prioridade visual à questão em resolução. | Manter contraste acessível, inclusive em dark mode. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles), [WCAG](https://www.w3.org/TR/WCAG22/) |
| 21 | Conexão uniforme | Princípio perceptivo | Linhas e conexões sugerem relação. | Indicar relações entre concurso, cargo e questões no grafo. | Conexões devem ter rótulos e alternativa textual. | [Gestalt](https://ixdf.org/literature/topics/gestalt-principles) |

### 3. Dez heurísticas de Nielsen, individualmente

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

### 4. Arquitetura da informação e navegação

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

### 5. Escolha de páginas e componentes

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

### 6. Busca, filtros, formulários e dados

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

### 7. Acessibilidade verificável

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

### 8. Desempenho, ética e validação

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


## Extensões sincronizadas de UX para formulários — catálogo do AGENTS.md §§13–15

**Escopo:** este documento continua contendo as **86 entradas aplicadas originais**. As tabelas a seguir espelham, sem renumerar as 86, os nomes e as fontes das adições ao [AGENTS.md](../../AGENTS.md) feitas nas seções 13, 14 e 15. **Não são 13+8+10+4+14+5 leis científicas independentes**: incluem leis empíricas, princípios, modelos, normas e orientações de implementação. Para o contrato de desenho visual e de persistência, consultar [DESIGN.md §8.10](../../DESIGN.md).

### A. Treze leis, modelos e frameworks complementares (§13)

| Nome original | Tipo / uso principal | Fonte |
|---|---|---|
| **Steering Law (Accot–Zhai)** | Modelo empírico; precisão exigida por trajetórias estreitas e arraste. | [Accot & Zhai](https://doi.org/10.1145/258549.258760) |
| **Law of Crossing** | Modelo de interação por cruzamento de limites, não regra universal de formulários. | [Shumin Zhai](https://www.shuminzhai.com/post/laws-of-action) |
| **Principle of Least Astonishment** | Princípio de previsibilidade de ações, teclado e efeitos de salvamento. | [GNOME](https://wiki.gnome.org/Projects/GnomeShell/Design/Principles) |
| **Gulf of Execution** | Modelo de compreensão de como realizar a ação. | [Don Norman](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| **Gulf of Evaluation** | Modelo de compreensão do resultado; alterações locais não equivalem a persistência. | [Don Norman](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| **Feedforward** | Pista anterior à ação sobre a consequência esperada. | [Encyclopedia of HCI](https://assets.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/affordances) |
| **Forcing Functions** | Mecanismos de restrição contra ação inválida/perigosa. | [Don Norman](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |
| **Fogg Behavior Model (B=MAP)** | Modelo motivação/capacidade/prompt, sem manipulação. | [BJ Fogg](https://www.behaviormodel.org/) |
| **Weber's Law** | Lei psicofísica; percepção de diferença depende do estímulo de referência. | [Corsini](https://doi.org/10.1002/9780470479216.corpsy1033) |
| **Just Noticeable Difference (JND)** | Conceito psicofísico relacionado a Weber, não lei independente. | [Corsini](https://doi.org/10.1002/9780470479216.corpsy0481) |
| **EAS Framework — Eliminate, Automate, Simplify** | Método de simplificação da entrada de dados. | [NN/g](https://www.nngroup.com/articles/eas-framework-simplify-forms/) |
| **Structure, Transparency, Clarity, Support** | Quatro princípios editoriais de design de formulários. | [NN/g](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) |
| **Seven Stages of Action** | Modelo dos estágios de ação, percepção e avaliação de resultado. | [Don Norman](https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/) |

### B. Oito critérios ergonômicos de Bastien & Scapin (§14.1)

| Nome original | Aplicação |
|---|---|
| **Guidance** | Orientação, legibilidade e feedback dos campos. |
| **Workload** | Redução de esforço, densidade e ações excessivas. |
| **Explicit Control** | Controle explícito e previsibilidade de ações automáticas e confirmações. |
| **Adaptability** | Flexibilidade para diferentes experiências. |
| **Error Management** | Prevenção, diagnóstico e recuperação de erros. |
| **Consistency** | Consistência de nomenclatura, componentes e fluxos. |
| **Significance of Codes (and Denominations)** | Significado claro de códigos, rótulos e ícones. |
| **Compatibility** | Adequação à tarefa e ao contexto do usuário. |

**Subcritérios registrados no AGENTS.md:** Prompting; Grouping/Distinction by Location; Grouping/Distinction by Format; Immediate Feedback; Legibility; Brevity; Concision; Minimal Actions; Information Density; Explicit User Action; User Control; Flexibility; User Experience; Error Protection; Quality of Error Messages; Error Correction. São parte da estrutura de avaliação ergonômica, **não novas leis**. Fonte de referência: [Bastien & Scapin (1993)](https://www.margaux-perrin.com/wp-content/uploads/2018/08/Bastien-and-Scapin-1993.pdf).

### C. Dez princípios cognitivos de Gerhardt-Powals (§14.2)

| Nome original | Aplicação |
|---|---|
| **Automate Unwanted Workload** | Automatizar esforço evitável. |
| **Reduce Uncertainty** | Explicitar consequência e estado. |
| **Fuse Data** | Unir dados relacionados. |
| **Present New Information with Meaningful Aids to Interpretation** | Dar apoio à interpretação. |
| **Use Names That Are Conceptually Related to Function** | Denominação relacionada à função. |
| **Group Data in Consistently Meaningful Ways** | Agrupamento semântico. |
| **Limit Data-Driven Tasks** | Reduzir comparação manual de dados brutos. |
| **Include Only Information Needed by the Operator** | Mostrar o necessário. |
| **Provide Multiple Coding of Data** | Não depender só de cor. |
| **Practice Judicious Redundancy** | Redundância somente quando útil. |

Fonte: [Gerhardt-Powals (1996)](https://doi.org/10.1080/10447319609526147). Parte do conteúdo se sobrepõe a Nielsen, Gestalt e normas existentes.

### D. Quatro normas ISO de escopo relevante (§14.3)

| Norma | Escopo do documento | Fonte |
|---|---|---|
| **ISO 9241-143:2012 — Forms** | Requisitos/recomendações para formulários conforme escopo normativo. | [ISO](https://www.iso.org/standard/53590.html) |
| **ISO 9241-161:2025 — Visual user-interface elements** | Elementos visuais de UI. | [ISO](https://www.iso.org/standard/85790.html) |
| **ISO 9241-115:2024 — Guidance on conceptual design, user-system interaction design, user interface design and navigation design** | Estrutura conceitual, interação e navegação. | [ISO](https://www.iso.org/standard/80773.html) |
| **ISO 9241-171:2025 — Software accessibility** | Acessibilidade do software. | [ISO](https://www.iso.org/standard/86308.html) |

**Não atribuir cláusulas específicas às normas ISO sem consultar o texto integral licenciado.**

### E. WCAG 2.2 — 14 critérios de formulários individualizados nas seções 14.4 e 15.1

| SC e nível | Nome oficial | Contexto principal |
|---|---|---|
| 3.2.2 (A) | On Input | Mudança de contexto inesperada ao alterar valor. |
| 3.3.3 (AA) | Error Suggestion | Sugestões de correção apropriadas. |
| 3.3.4 (AA) | Error Prevention (Legal, Financial, Data) | Verificação/reversão/revisão de submissão de respostas de teste e mudanças de dados. |
| 3.3.7 (A) | Redundant Entry | Evitar pedir novamente dados da mesma atividade, consideradas as exceções. |
| 3.3.8 (AA) | Accessible Authentication (Minimum) | Autenticação sem barreiras cognitivas indevidas. |
| 1.3.5 (AA) | Identify Input Purpose | Identificação programática de finalidades de campos pessoais aplicáveis. |
| 2.5.7 (AA) | Dragging Movements | Alternativa a arraste, quando exigida pelo critério. |
| 1.3.1 (A) | Info and Relationships | Semântica de grupos, campos e relações visuais. |
| 3.3.1 (A) | Error Identification | Identificar e descrever erros detectados. |
| 3.2.1 (A) | On Focus | Foco não deve mudar contexto por si só. |
| 2.5.3 (A) | Label in Name | Nome acessível deve conter o rótulo visível aplicável. |
| 3.2.6 (A) | Consistent Help | Consistência na ordem de mecanismos de ajuda repetidos. |
| 1.4.13 (AA) | Content on Hover or Focus | Conteúdo adicional acessível por hover/foco. |
| 2.4.13 (AAA) | Focus Appearance | Área/contraste de indicador de foco; **AAA, não AA**. |

Fonte: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/). **Aplicabilidade e exceções devem ser avaliadas por critério**; esta enumeração não substitui uma auditoria WCAG completa.

### F. Cinco técnicas oficiais para implementar formulários (§15.2)

| Nome publicado | Referência | Aplicação |
|---|---|---|
| **Grouping Controls** | [WAI](https://www.w3.org/WAI/tutorials/forms/grouping/) | Agrupar campos também semanticamente, não só visualmente. |
| **Form Instructions** | [WAI](https://www.w3.org/WAI/tutorials/forms/instructions/) | Associar instruções relevantes aos campos. |
| **Validating Input** | [WAI](https://www.w3.org/WAI/tutorials/forms/validation/) | Validação tolerante, acessível e também no servidor quando aplicável. |
| **Multi-page Forms** | [WAI](https://www.w3.org/WAI/tutorials/forms/multi-page/) | Etapas lógicas, progresso e possibilidade de retomada. |
| **Inline Validation** | [Primer](https://primer.style/product/ui-patterns/forms/) | Timing de erro e correção com foco e associação acessíveis. |

**Acréscimo de fontes específicas de design system:** [Ant Design — Form Page](https://ant.design/docs/spec/research-form/) (Efficient, Clear, Security); [Material Design 3 — Text Fields](https://m3.material.io/components/text-fields/guidelines) (Filled/Outlined); [GitHub Primer — Forms](https://primer.style/product/ui-patterns/forms/) (validação). São padrões contextualizados, não leis universais.

**Contrato de sincronização:** sempre que uma lei, norma ou regra de formulário for inserida no AGENTS.md, conferir este catálogo e a especificação de aparência do DESIGN.md. Documentação de princípios não comprova que o protótipo foi alterado ou testado.


## Extensões gerais verificadas para UX em 2026 — espelho da seção 16 do AGENTS.md

Este índice **não altera nem renumera as 86 entradas originais** nem o inventário de leis já documentado. Ele acrescenta nomes **publicados**, nas classes corretas: modelos de visualização, princípios de inclusão, norma ISO, orientação W3C, framework de métricas, padrões governamentais e padrões de design systems. Consulte [AGENTS.md §16](../../AGENTS.md) para as regras normativas por fluxo e [DESIGN.md §8.14](../../DESIGN.md) para componentes, paneamento, grafo e gráficos.

### G. Seven Principles of Universal Design (7)

| Nome original | Aplicação no Exam App |
|---|---|
| **Equitable Use** | Acesso equivalente a tarefas de estudo. |
| **Flexibility in Use** | Diferentes entradas, capacidades e ritmos. |
| **Simple and Intuitive Use** | Descoberta de ações sem precisar entender estruturas internas. |
| **Perceptible Information** | Estados e conteúdo compreensíveis além de cor/posição. |
| **Tolerance for Error** | Prevenção, recuperação e retomada. |
| **Low Physical Effort** | Reduzir arrastes, repetições e esforço motor. |
| **Size and Space for Approach and Use** | Espaço e acesso apropriados conforme o contexto e dispositivo. |

Fontes: [North Carolina State University — Center for Universal Design](https://design.ncsu.edu/research/center-for-universal-design/) e [UK Department for Education](https://accessibility.education.gov.uk/guidelines/universal-design). Princípios originalmente de design universal, estendidos à interface digital; **não são critérios WCAG**.

### H. Shneiderman — Visual Information-Seeking Mantra (1996)

**Nome original:** **Overview first, zoom and filter, then details-on-demand**. Tarefas do modelo: **Overview; Zoom; Filter; Details-on-demand; Relate; History; Extract**.

Uso: apresentar visão geral do grafo, filtros/zoom legíveis, seleção e relações contextuais, preservar histórico de navegação e permitir alternativa acessível/extrair dados quando pertinente. Não converter as sete tarefas em sete controles obrigatórios. Fonte: [The Eyes Have It, IEEE](https://doi.org/10.1109/VL.1996.545307).

### I. ISO 9241-11:2018 — Usability: Definitions and Concepts

Norma publicada e confirmada em 2023: estrutura de usabilidade considerando o **contexto de uso**, **eficácia**, **eficiência** e **satisfação**. Aplicação: medir sucesso de tarefas reais, custo e qualidade percebida, não apenas número de cliques, retenção ou aparência. Apenas resumo público da ISO foi consultado; **não alegar conformidade** sem acesso e avaliação da norma integral. [Fonte ISO](https://www.iso.org/standard/63500.html).

### J. Microsoft Inclusive Design — 3 princípios

| Nome original | Aplicação |
|---|---|
| **Recognize exclusion** | Identificar barreiras entre pessoa, contexto e interface. |
| **Learn from diversity** | Pesquisar/testar em contextos variados. |
| **Solve for one, extend to many** | Soluções para necessidades específicas podem beneficiar outras pessoas, se testadas. |

[Fonte Microsoft Inclusive Design](https://inclusive.microsoft.design/).

### K. W3C COGA — 8 objetivos de acessibilidade cognitiva

| Nome original | Aplicação |
|---|---|
| **Help Users Understand What Things Are and How to Use Them** | Clareza de função/controles. |
| **Help Users Find What They Need** | Encontrabilidade e navegação. |
| **Use Clear and Understandable Content** | Conteúdo legível e compreensível. |
| **Help Users Avoid Mistakes and Know How to Correct Them** | Recuperação de erros sem perda. |
| **Help Users Focus** | Gestão de distrações e retorno ao contexto. |
| **Ensure Processes Do Not Rely on Memory** | Reduzir esforço de lembrar passos e valores. |
| **Provide Help and Support** | Ajuda contextual e feedback. |
| **Support Adaptation and Personalization** | Adaptação e preferências sob controle do usuário. |

[Fonte W3C COGA](https://www.w3.org/TR/coga-usable/). **Working Group Note suplementar**; não cria critérios WCAG 2.2 adicionais.

### L. GOV.UK — 11 Government Design Principles (atualizados em 2025)

| Nome original |
|---|
| **Start with user needs** |
| **Do less** |
| **Design with data** |
| **Do the hard work to make it simple** |
| **Iterate. Then iterate again** |
| **This is for everyone** |
| **Understand context** |
| **Build digital services, not websites** |
| **Be consistent, not uniform** |
| **Make things open: it makes things better** |
| **Minimise environmental impact** |

Fonte: [GOV.UK Government Design Principles](https://www.gov.uk/guidance/government-design-principles). A sustentabilidade foi incluída em 02/04/2025. São princípios de serviço, não leis universais, e parte do conteúdo já sobrepõe Nielsen/ISO.

### M. HEART Framework — métricas centradas no usuário

**HEART = Happiness, Engagement, Adoption, Retention, Task Success**; **GSM = Goals–Signals–Metrics**. A escolha de métricas deve começar pelo objetivo de cada tarefa, passar por sinais e culminar em indicadores verificáveis. Não equiparar tempo na aplicação a facilidade de uso. Fonte original: [Google Research, CHI 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/); [Kerry Rodden](https://www.kerryrodden.com/heart/). Modelo de métricas, **não uma lei UI/UX**.

### N. WCAG 2.2 — 16 critérios gerais adicionais da seção 16.8 do AGENTS.md

| SC / nível | Nome oficial | Aplicação resumida |
|---|---|---|
| **1.3.2 A** | Meaningful Sequence | Ordem significativa da leitura e dos painéis. |
| **1.3.4 AA** | Orientation | Não impor orientação sem essencialidade. |
| **1.4.4 AA** | Resize Text | Texto redimensionável sem perda de conteúdo/função nas condições do SC. |
| **1.4.12 AA** | Text Spacing | Override de espaçamento não pode causar perda de conteúdo/função. |
| **2.1.2 A** | No Keyboard Trap | Sair por teclado de interações. |
| **2.1.4 A** | Character Key Shortcuts | Alternativas/restrições para atalhos de caractere único. |
| **2.2.1 A** | Timing Adjustable | Avaliar limites de tempo e exceção quando o tempo é essencial. |
| **2.4.1 A** | Bypass Blocks | Saltar regiões repetidas. |
| **2.4.2 A** | Page Titled | Título descritivo de página. |
| **2.4.4 A** | Link Purpose (In Context) | Destino de link compreensível. |
| **2.4.5 AA** | Multiple Ways | Mais de um caminho de localização quando aplicável, com exceções. |
| **2.5.1 A** | Pointer Gestures | Alternativa a gestos complexos quando exigida. |
| **2.5.2 A** | Pointer Cancellation | Regras de cancelamento de acionamento de ponteiro. |
| **2.5.4 A** | Motion Actuation | Alternativa e controle para ações baseadas em movimento quando aplicável. |
| **3.1.1 A** | Language of Page | Idioma principal programático. |
| **3.1.2 AA** | Language of Parts | Idioma dos trechos com exceções previstas. |

Fonte: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Níveis, escopo e exceções importam. **Não confundir documentação com testes aprovados.**

### O. Context7 + fontes oficiais — padrões de design atuais, não leis

| Fonte | Nome publicado | Relevância |
|---|---|---|
| [Material Design 3](https://m3.material.io/foundations/layout/layout-overview/overview) | **Adaptive Design / Layout Scaffold / Panes / Breakpoints** | Orientação atualizada em maio de 2026 para compor interfaces por espaço/contexto, não miniaturizar desktop. |
| [IBM Carbon](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/examples/EmptyState/EmptyState.mdx) | **Empty State Pattern** | Diferenciar indisponível, vazio e nenhum resultado. |
| [React Aria](https://react-spectrum.adobe.com/react-aria/interactions.html) | **Accessible, Adaptive, International** | Modos de entrada, foco, idiomas/RTL e responsividade. |
| [USWDS](https://designsystem.digital.gov/components/data-visualizations/) | **Data Visualizations** | Gráficos com leitura equivalente, mensagem principal textual, rótulos e alternativas tabulares/de dados. |

**Priorização da auditoria**: IA de navegação Questões/Simulados; adaptação de sidebar e painel direito; grafo com overview/filter/detail/history; gráficos com títulos/alternativas; leitura de PDFs; operações por teclado/touch; métricas de sucesso de tarefa. Validar antes e depois por cenários reais. Este índice é uma **curadoria documental**, não uma avaliação executada do protótipo.


### P. HCI, avaliação e widgets acessíveis — auditoria incremental Context7 (2026)

Espelho resumido de [AGENTS.md §17](../../AGENTS.md) e do contrato de implementação de [DESIGN.md §8.19](../../DESIGN.md). Os nomes abaixo **não alteram os 86 itens do catálogo original** e representam categorias diferentes de conhecimento, sem pretensão de que sejam leis científicas novas.

| Nome original publicado | Tipo, autoria / instituição | Uso no Exam App e limite | Fonte |
|---|---|---|---|
| **Information Foraging Theory** | Teoria de HCI; Pirolli e Card (1995/1999) | Avaliar pistas de navegação, agrupamento e encontrabilidade de Questões, Simulados, Revisão e Explorar. O conceito Information Scent já existia. | [Pirolli e Card (1995)](https://chi1995.acm.org/proceedings/papers/ppp_bdy.htm); [1999](https://doi.org/10.1037/0033-295X.106.4.643) |
| **Cognitive Walkthrough** | Método de inspeção; Polson, Lewis, Rieman e Wharton (1992) | Verificar cada etapa de descoberta/ação/feedback de um iniciante; não substitui teste com usuários. | [Artigo original](https://doi.org/10.1016/0020-7373(92)90039-N) |
| **Keystroke-Level Model (KLM)** | Modelo preditivo de desempenho; Card, Moran e Newell (1980) | Estimar esforço temporal em operação repetitiva de usuário experiente; não estima satisfação ou aprendizagem. | [Artigo original](https://doi.org/10.1145/358886.358895) |
| **Progressive Enhancement** | Filosofia de desenvolvimento web | Manter conteúdo/ações essenciais com fallback realista de APIs e visualizações avançadas. | [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) |
| **Disclosure (Show/Hide) Pattern** | W3C WAI-ARIA APG | Sidebar de grupos simples; botão com expansão, Enter/Espaço e foco consistente. | [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| **Tree View Pattern** | W3C WAI-ARIA APG | Hierarquia navegável por setas, foco e seleção; **não** aplicar automaticamente a sidebar comum ou grafo canvas. | [APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) |
| **Grid Pattern** | W3C WAI-ARIA APG | Grade realmente interativa com foco/células; preferir tabela HTML simples para dados estáticos. | [APG Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) |
| **Treegrid Pattern** | W3C WAI-ARIA APG | Somente para grade hierárquica interativa, com semântica e teclado completos. | [APG Treegrid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) |
| **Keyboard Interface / Focus in Composites** | Prática W3C APG | Distinguir foco, seleção, expansão, ativação e retorno de foco, inclusive em coleções que mudam. | [APG Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) |
| **Complex Images** | Tutorial W3C WAI | Texto equivalente para gráfico estático; para grafo interativo, alternativa em lista/tabela navegável. | [WAI Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) |
| **In-page Navigation** | Componente/padrão USWDS | Índice orientador para páginas longas, não tab duplicada. | [USWDS](https://designsystem.digital.gov/components/in-page-navigation/) |
| **Graceful Degradation** | Filosofia complementar de desenvolvimento web | Explicitar fallback e recuperação quando função avançada falhar, sem alegar suporte no-JS/offline não testado. | [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation) |

**Aplicação por prioridade:** P0 — perda de foco, seleção não recuperável, navegação por teclado inviável, visualização sem alternativa para dados essenciais; P1 — sidebar/árvore mal classificados, nomes que não comunicam destinos, erros sem fallback e primeiro uso confuso; P2 — previsão de esforço com KLM ou índice de página quando facilitar tarefas reais. A classificação é proposta de auditoria e **não declaração de falhas presentes no código**. Usar as evidências do board, do protótipo e de testes antes de abrir regressões ou afirmar implementação.

## Matriz de decisão por superfície

| Superfície | Padrão principal | Primeiro viewport e CTA | Secundário | Mobile e exceção | Verificação |
|---|---|---|---|---|---|
| Home | Dashboard orientado a tarefas | Continuar estudo, Resolver questões, Fazer simulado | Métricas, objetos recentes, Explorar | Priorizar 1 CTA por bloco, sem hardcode de concurso | Primeiro clique em tarefas reais |
| Banco de Questões | Página dedicada com filtros + lista paginada | Busca, contagem, filtros ativos, primeira questão/lista; CTA Responder | Salvar filtro, criar caderno e simulado com seleção | Filtros em drawer acessível; preservar URL e rolagem | Filtros/contagem/voltar reproduzíveis |
| Questão avulsa | Página de resolução focada | Contexto da questão, enunciado, alternativas, Responder | Explicação após resposta, notas e propriedades | Uma coluna; ações visíveis sem cobrir enunciado | Teclado, correção e próxima questão |
| Configurar simulado | Formulário curto; wizard só se necessário | Fonte, quantidade, regras, CTA Iniciar | Ordenação, filtros avançados | Uma coluna, labels persistentes e resumo | Validação de entradas e confirmação das regras |
| Executar simulado | Página dedicada imersiva | Progresso, tempo se aplicável, questão atual e respostas | Grade, marcar para revisão, finalizar | Grade recolhível; persistir tentativa | Retomar, teclado, sem revelar gabarito antes da entrega |
| Resultado | Página dedicada com seções | Nota/resultado compreensível, CTA Revisar erradas | Disciplina, histórico e detalhes | Seções empilhadas, sem tabs obrigatórias | Explicação dos cálculos e acesso às erradas |
| Revisão de erros | Banco filtrado e estado compartilhável | Contagem de erradas, filtros, CTA Revisar | Histórico, cadernos e métricas | Chips com remoção acessível | Não abrir banco sem filtro aplicado |
| Ficha de objeto Capacities | Página de entidade + painel contextual | Título, propriedades essenciais, ações da entidade | Relações, notas, grafo e propriedades avançadas | Painel vira seção/drawer; nunca esconder tarefa primária | Distinguir ficha de objeto de resolver questão |
| Explorar | Navegação por tipos e relacionamentos | Busca e categorias reconhecíveis | Grafo e filtros técnicos | Navegação simples antes de visualizações densas | Tree test e localização de objetos |

## Regras para escolher componente

| Escolha | Usar quando | Evitar quando | Fonte |
|---|---|---|---|
| Página/rota | Tarefa tem estado, histórico, retorno ou compartilhamento | É apenas confirmação ou opção breve | [GOV.UK Patterns](https://design-system.service.gov.uk/patterns/) |
| Seções na mesma página | Conteúdo é sequencial ou precisa de comparação | Há tarefas independentes com estados incompatíveis | [GOV.UK Patterns](https://design-system.service.gov.uk/patterns/) |
| Tabs | Painéis pares e alternativos de um mesmo objeto | O usuário precisa ler todos em sequência ou comparar lado a lado | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) |
| Accordion/details | Detalhe opcional e independente | Conteúdo essencial ou CTA primário | [GOV.UK Details](https://design-system.service.gov.uk/components/details/) |
| Drawer | Filtros ou navegação temporária em viewport estreita | A ação exige permanência e contexto profundo | [Material 3](https://m3.material.io/components/navigation-drawer/overview) |
| Painel contextual | Metadados acompanham tarefa central | Rouba espaço do enunciado ou cobre foco | [Carbon](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) |
| Modal | Decisão bloqueante, breve, de alta consequência | Formulário longo ou fluxo navegável | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| Wizard | Sequência longa e linear de decisões dependentes | Configuração curta ou fluxo não linear | [USWDS](https://designsystem.digital.gov/components/step-indicator/) |
| Paginação | Usuário precisa localizar, comparar, voltar ou compartilhar posição | Leitura linear curta sem necessidade de posição estável | [USWDS](https://designsystem.digital.gov/components/pagination/) |

## Mitos que agentes NÃO devem usar como requisito

1. **Três cliques:** não existe limite universal; avaliar sucesso, clareza e custo real da tarefa. [NN/g](https://www.nngroup.com/articles/3-click-rule/)
2. **Sete opções no menu:** 7 ± 2 não é regra para arquitetura de navegação. [Miller](https://doi.org/10.1037/h0043158)
3. **Sempre menos cliques:** um passo explicativo pode evitar erro; medir conclusão da tarefa. [NN/g](https://www.nngroup.com/articles/3-click-rule/)
4. **Tudo em uma página:** página, tab e wizard são escolhas condicionais, não ideologia. [GOV.UK](https://design-system.service.gov.uk/patterns/)
5. **Scroll é ruim:** rolagem pode ser apropriada; não esconder estado nem posição. [GOV.UK](https://design-system.service.gov.uk/patterns/)
6. **Tudo acima da dobra:** priorizar a ação inicial, sem mutilar conteúdo ou acessibilidade. [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/)
7. **Modal é sempre ruim:** modais servem a decisões bloqueantes, com foco acessível. [APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
8. **80/20 é lei do produto:** só priorizar com evidência de uso e necessidade. [Laws of UX](https://lawsofux.com/)
9. **Acessível porque tem ARIA:** semântica não substitui teste de teclado e tecnologias assistivas. [WCAG](https://www.w3.org/TR/WCAG22/)
10. **Padrão de concorrente prova melhor UX:** benchmark inspira hipóteses; não substitui teste com estudantes.

## Prioridade de revisão

- **P0 — bloqueio:** perda de respostas/tentativas; impossibilidade de completar tarefa; teclado/foco inviável; contraste e nomes semânticos críticos; ação enganosa; rota que promete revisar erradas mas não filtra; regressões de estado.
- **P1 — alta:** Questões/Simulados encontráveis; filtros consistentes e persistentes; loading/erro/vazio; estados de resultado; responsive sem obstrução; feedback e prevenção de erro.
- **P2 — evolução:** personalização, atalhos de especialistas, visualizações avançadas, microinterações, refinamento de métricas.

## Checklist para PRs de UI

- [ ] Registrar tarefa-alvo, usuário, caminho atual, hipótese e evidência; não justificar só com gosto visual.
- [ ] Conferir se CTA leva à ação prometida e se a rota é reproduzível.
- [ ] Distinguir fluxo de estudo e ficha de objeto sem duplicar fontes de questões.
- [ ] Verificar labels, estados, filtros aplicados, limpeza, zero resultados e retorno.
- [ ] Testar mouse, teclado, foco visível, leitor de tela quando aplicável, zoom e mobile.
- [ ] Verificar WCAG 2.2 AA aplicável; registrar exceções, sem declarar conformidade não testada.
- [ ] Simular erro, latência, tentativa interrompida e recuperação sem perda de dados.
- [ ] Inspecionar screenshots reais e registrar no board quando houver evidência visual; board.json é a fonte da verdade.
- [ ] Anexar testes e riscos ao PR/issue; indicar o que foi testado e o que não foi.
- [ ] Não introduzir emojis na UI; seguir a política SVG do AGENTS.md.

## Diversidade de fontes e rastreabilidade

A curadoria cruza psicologia experimental, W3C/WAI, NN/g, Laws of UX, IxDF, GOV.UK, USWDS, Carbon/IBM, Material/Google, Apple HIG, Atlassian, Fluent/Microsoft, Polaris/Shopify, web.dev, WebAIM, Deque e ISO. Fontes de design system são **padrões contextuais**, não validação independente de toda decisão. Acesso à página de algumas plataformas depende de JavaScript; links podem exigir navegação humana. O texto completo das normas ISO não foi adquirido nem reproduzido.

- [ISO 9241-110:2020 — princípios de interação](https://www.iso.org/standard/75258.html); [ISO 9241-112 — apresentação de informação](https://www.iso.org/standard/87518.html); [ISO 9241-115 — projeto de interação e navegação](https://www.iso.org/standard/80773.html): normas formais; consultar edição aplicável e texto integral antes de alegar requisito específico.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) é fonte normativa para critérios de sucesso; [APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) orienta implementação de padrões, não certifica conformidade.
- [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) e [Laws of UX](https://lawsofux.com/) fornecem heurísticas e sínteses; [Fitts](https://doi.org/10.1037/h0055392), [Hick](https://doi.org/10.1080/17470215208416600) e [Miller](https://doi.org/10.1037/h0043158) são literatura experimental original, com limites de generalização.
- [Guia específico de arquitetura e navegação](arquitetura-informacao-navegacao.md) registra as rotas atuais, propostas e issues. Não confundir proposta com funcionalidade implementada.

**Próxima revisão:** incorporar os resultados verificáveis do relatório final da Pesquisa Profunda quando disponíveis; conferir links e divergências antes de promover qualquer heurística a regra obrigatória.
