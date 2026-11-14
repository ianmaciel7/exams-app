# Síntese da Pesquisa Profunda de UI/UX — 20 fontes

> **Escopo:** consolidação de achados da pesquisa solicitada em 14/11/2026, aplicada ao Exam App. **Não é inventário exaustivo** de cada página dos 20 sites, nem evidência de conformidade do protótipo.
>
> **Documentos canônicos:** [Catálogo de 86 itens](ux-ui-principles.md), [Arquitetura da informação e navegação](arquitetura-informacao-navegacao.md), [AGENTS.md](../../AGENTS.md). Este relatório os **complementa**, sem duplicar o catálogo de 30 entradas de Laws of UX, 10 Gestalt, 10 Nielsen e outras famílias já transcritas no AGENTS.md.

## Como interpretar a pesquisa

1. **Lei / resultado experimental:** relação estudada sob condições específicas (ex.: Fitts e Hick-Hyman); aplicar com hipóteses e medições, não números mágicos.
2. **Heurística:** orientação para inspecionar decisões (ex.: Nielsen); não é critério de aprovação automático.
3. **Princípio perceptivo ou modelo cognitivo:** ajuda a prever agrupamento, reconhecimento, expectativas e carga mental; verificar no fluxo real.
4. **Padrão de interface / design system:** solução de implementação dependente do dispositivo, tarefa, linguagem e contexto.
5. **Norma técnica:** consultar requisitos, versões e exceções concretos (WCAG 2.2 AA é meta; conformidade só após avaliação).
6. **Catálogo agregador:** ponto de partida para descobrir termos, não fonte independente de confirmação científica.

A pesquisa produziu uma síntese prática a partir de materiais públicos e citações de fontes como Laws of UX, Nielsen Norman Group, WCAG/W3C, Apple HIG, USWDS, Baymard e alguns catálogos. **Não foi demonstrado** que todas as entradas de todos os 20 catálogos foram acessadas, que paywalls foram superados ou que o número de leis exibido por cada site esteja atualizado. As URLs abaixo são inventário de *fontes de consulta*, não selo de revisão integral. Nomes semelhantes podem se referir ao mesmo conceito.

## O que aprendemos e como isso altera decisões do Exam App

| Tema | Fundamento | Aplicação obrigatória ou recomendada | Limites e como testar |
|---|---|---|---|
| Decisões e escolhas | Hick-Hyman, choice overload, divulgação progressiva | Priorizar **Questões**, **Simulados** e **Revisar**; agrupar filtros avançados sem ocultar o caminho principal | Não usar máximo de 5–7 itens: medir primeiro clique, conclusão e descoberta |
| Alvos de interação | Fitts; WCAG 2.2, critério 2.5.8; Apple HIG | Área clicável perceptível e confortável em respostas, avançar, filtros e ícones pequenos | WCAG AA define 24×24 **CSS px com exceções**; Apple sugere 44×44 **pt** para seus contextos, não equivalência universal |
| Modelos mentais | Jakob, recognition over recall, Nielsen H2/H4/H6 | Nomes e caminhos consistentes entre Home, sidebar, contexto do concurso e banco de questões; breadcrumbs quando úteis | Não adotar padrão de concorrente sem testar com estudantes |
| Redução de esforço | Chunking, carga cognitiva, Miller | Enunciado, alternativas e ação principal antes de metadados periféricos; agrupar em seções nomeadas | Miller 7±2 não determina número de tabs, menus ou cards |
| Interface sem excesso de linhas | Gestalt (proximidade, similaridade, região comum, conexão uniforme) | Usar **espaçamento, tipografia, alinhamento e diferença de superfície** para criar grupos; bordas só quando ajudam distinguir regiões | Não eliminar todos os separadores indiscriminadamente; testar compreensão de agrupamentos |
| Densidade e estética | Aesthetic-usability effect, Nielsen H8 | Reduzir decoração e CTAs concorrentes sem ocultar dados úteis; permitir densidade apropriada para usuários avançados | Preferência estética não prova usabilidade |
| Destaques visuais | Von Restorff, atenção seletiva, posição serial | Evidenciar CTA da tarefa, erro crítico e progresso real; preservar começo/contexto e fim/próximo passo | Não utilizar estímulos pulsantes ou cor como única informação |
| Continuidade e retomada | Peak-End, Zeigarnik, controle/liberdade | Preservar respostas, filtros, seleção e progresso; possibilitar retomada, cancelamento e confirmação de finalização irreversível | Não explorar ansiedade por tarefas incompletas; medir perda de dados |
| Formulários | Baymard (e-commerce), Nielsen, Postel com limites | Labels persistentes, grupos semânticos, erros específicos próximos ao campo, preservação de valores; começar por coluna única onde melhora leitura | Coluna única é recomendação contextual, não norma; não normalizar entrada ambígua ou insegura |
| Respostas e feedback | Nielsen H1/H5/H9; Doherty | Estados explícitos para salvar, enviar, processar, concluir, erro e recuperação; ação única contra envio duplo | Não impor 400 ms como SLA de todos os endpoints |
| Espera finita | Controle/liberdade, recuperabilidade e diretriz local existente | Timeout/deadline, retry limitado com backoff/jitter quando apropriado, cancelamento, erro útil e recuperação | Não exibir spinner infinito nem repetir operação não idempotente automaticamente |
| Responsividade e inclusão | WCAG 2.2, WAI-ARIA APG, Apple HIG, USWDS | Reflow, teclado, foco visível e não encoberto, semântica, zoom, contraste, alvo de toque e suporte à redução de movimento | Verificar critérios concretos e exceções; não declarar conformidade sem testes |
| Navegação por tarefas | Nielsen, progressive disclosure, arquitetura de informação | Separar **ficha de objeto** da jornada **resolver/revisar/simular** quando melhora clareza, preservando o mesmo modelo de dados | Página, tab, drawer, modal e wizard são escolhas contextuais |
| Ética e clareza | Controle/liberdade, prevenção de erros, padrões não enganosos | Não esconder cancelamento ou forçar o usuário a concluir prova; progresso verdadeiro e resultados interpretáveis | Evitar dark patterns; medir tarefas com pessoas reais |

### Regras de aplicação para agentes

- Antes de propor interface, declarar: **tarefa-alvo**, usuário, estado de entrada, decisão que ele precisa tomar, ação primária, saída/recuperação e dados que não podem ser perdidos.
- Antes de adotar uma lei, identificar **tipo da evidência**, fonte, hipótese no Exam App, limitações e teste que poderia refutar a proposta.
- Ao comparar com Capacities, Crucial Exams, QConcursos ou outros aplicativos, separar **benchmark** de **comportamento implementado no Exam App**. Evidências visuais reais devem seguir o protocolo existente de board.json/BOARD.md e issues.
- Não usar o catálogo para justificar obrigatoriamente "tudo na mesma página", "nenhum divisor", "exatamente um CTA", "três cliques", "sete itens" ou "400 ms".
- Prioridade de resolução de conflitos: **acessibilidade e segurança > integridade das tentativas/respostas > clareza e conclusão da tarefa > eficiência > estética**. Registrar exceções na issue/PR.
- **Documentar ≠ implementar.** Modificação deste guia não prova que o protótipo foi alterado ou testado.

### Matriz curta de validação por fluxo

| Fluxo | Evidência de sucesso esperada | Cenários adversos |
|---|---|---|
| Descoberta de questões | Encontrar Questões sem conhecer tipos de objeto, aplicar/remover filtro, iniciar resolução | Busca sem resultados, filtro incoerente, retorno que perde estado |
| Resolução de questão | Entender enunciado, selecionar, enviar, receber feedback e navegar | Latência, refresh, teclado, tela estreita, duplo clique, falha de envio |
| Simulado | Identificar configuração, iniciar, acompanhar progresso, interromper e retomar | Sessão expirada, timeout, perda de resposta, conclusão irreversível |
| Revisão de erradas | Encontrar resultados pertinentes, abrir apenas itens errados e voltar | CTA que não filtra, contagens contraditórias, estado vazio |
| Login e formulários | Labels/erros claros, recuperação e submissão única | Campo inválido, rede lenta, senha incorreta, foco perdido |

## Inventário das 20 URLs de pesquisa

A classificação indica **a utilidade da fonte**, não certifica auditoria integral do seu catálogo. Para verificar uma entrada, abrir a página específica e conferir data, referência original, termos e limitações.

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

## Referências primárias e páginas diretamente úteis

- [Fitts’s Law — Laws of UX](https://lawsofux.com/fittss-law/): tamanho e distância de alvos.
- [Nielsen — 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/): status, controle, consistência, prevenção e recuperação de erros.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [o que mudou](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/): contraste, operação, foco, alvos e demais critérios aplicáveis.
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/): comportamento e teclado dos padrões de componente.
- [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): distinção entre 44 pt da plataforma e outros requisitos.
- [Baymard — Form Design](https://baymard.com/blog/form-design): layout de campos, rótulos e redução de problemas de preenchimento.
- [USWDS](https://designsystem.digital.gov/): padrões públicos de interface e acessibilidade.

**Limites:** não há um inventário mundial fechado de "todas as leis de UI/UX". Os 20 links contêm sobreposição, conceitos não empíricos, diretrizes em mudança e possíveis conteúdos restritos. Para cumprir uma futura auditoria de cobertura *exaustiva*, levantar nomes e URLs de **cada entrada individual** por site, marcar acessível/não acessível, deduplicar por sinônimo e registrar evidência; não presumir que esta síntese já fez isso.
