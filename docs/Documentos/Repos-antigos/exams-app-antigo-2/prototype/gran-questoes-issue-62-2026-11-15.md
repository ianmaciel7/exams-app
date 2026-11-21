# Gran Questões — suplemento de evidências públicas e critérios pendentes

**Data da verificação:** 2026-11-15 (UTC).  
**Escopo:** auditoria documental e navegação pública sem sessão autenticada. Complementa o atlas e o relatório de benchmarking publicados nos [comentários 1](https://github.com/ianmaciel7/exams-app/issues/62#issuecomment-6869759991) e [2](https://github.com/ianmaciel7/exams-app/issues/62#issuecomment-6869766192) da issue #62.  
**Baseline Exam App:** branch `dev`, SHA `69179a590f0073e4e3b2374a54570d873488a672` (confirmado pela API GitHub durante esta pesquisa).  
**Não executado:** login/conta, app instalado, fluxo de resolução autenticado, testes de teclado/leitor de tela/contraste/motion, captura própria de tela, reprodução dos screenshots da loja, browser back/refresh em filtro com estado privado. A área gerenciada não disponibilizou shell/browser; nenhuma captura é apresentada como observação própria.

## Conclusão

O conjunto existente já entrega pesquisa documental ampla, atlas com imagens oficiais/promocionais e backlog priorizado. A observação pública adicional confirma a navegação e filtros renderizados sem login e revela contagens dinâmicas atuais: **3.307.575 questões** e **137.593 provas** nas páginas examinadas em 15/11/2026. Esses números são contagens do estado público observado naquela data, não métricas auditadas de cobertura/qualidade nem prova de liderança.

A conclusão apropriada é **fase documental concluída com evidências públicas**, mantendo a pesquisa aberta para verificações que requerem autenticação e interação real. Não marcar a issue concluída enquanto os critérios explicitamente críticos de atlas atual autenticado e fluxos funcionais permanecerem sem evidência.

## Matriz de aceitação da issue #62

| Critério | Estado em 2026-11-15 | Evidência / limite |
|---|---|---|
| Identidade, planos e limites | Documentado; plano atual parcialmente documentado | Central atualizada em 06/08/2026 enumera Básico e Premium e recursos incluídos. FAQ gratuito é de 08/08/2024, portanto não resolve sozinho limites atuais por plano. Sem login/checkout. |
| Mapa de navegação | Observado publicamente, não autenticado | Página Questões mostra navegação Provas, Questões, Discursivas, Simulados, Disciplinas, Concursos, Programa de Estudo, Raio-X, Planos e Tutoriais. Guia oficial de menu é de 19/09/2025 e pode anteceder mudanças. |
| Facetas e busca | Observado publicamente na listagem de questões/provas | HTML público expõe filtros e ações; não se verificou multi-select, persistência, comportamento dos chips, URL, mobile ou resultados de combinação. |
| Banco, provas, estado de resposta | Parcial observado | Listagem pública exibe identificador de questão, disciplina/assunto, ano, banca, prova, alternativas, botão Responder e ações Comentários/Marcadores/Anotações/Estatísticas/Reportar erro. Não testar resposta ou conteúdo protegido. |
| Simulados, cadernos, histórico, resultados | Documentado; fluxo funcional não verificado | Ajuda oficial descreve menu e planos. Necessário login para observar construir, iniciar, concluir e revisar. |
| Comentários e IA | Documentado em páginas oficiais | Artigo IA (30/01/2026) descreve fontes usadas, acesso e elegibilidade; a própria página detalha limites e avisos. Não gerar/comparar comentário real. |
| App e offline/sync | Documentado por ajuda oficial e ficha Play Store | Ajuda diz respostas offline sincronizam ao reconectar; é declaração do fornecedor, sem teste instalado, estados de conflito ou sync. Play Store mostra 1 mi+ downloads e 97,8 mil avaliações no momento observado; indicador de alcance da loja, não ranking de usuários. |
| Mobile, acessibilidade, dark mode | Imagens promocionais/documentação, sem teste | Imagens vinculadas no comentário 1 são material oficial da loja/landing; não são capturas independentes atuais de instalação. A11y, zoom, leitor, teclado, touch e reduced motion seguem não verificados. |
| Notoriedade / métricas | Sem ranking comparável | Contadores públicos/marketing variam por rota e data. Nenhum número único comparável ou auditoria independente foi localizada. Não inferir liderança. |
| Tecnologia / arquitetura interna | Não verificado | Não inferir stack, API, backend ou desempenho a partir do HTML visível. |
| Comparação com #51/#31 e Exam App | Parcial documental | Matriz do comentário 2 usa documentação e protótipo. A comparação completa das pesquisas anteriores não foi repetida nem os protótipos testados funcionalmente nesta rodada. |
| Impeccable / Operate | Auditoria documental degradada | Comentário 2 declara corretamente ausência de sessão, detector e testes de acessibilidade. Sem nota de conformidade. |
| Backlog P0–P3 | Documentado | Critérios de aceite constam no comentário 2. Precisam ser refinados contra evidência autenticada e prioridades do produto antes de implementação. |
| Capturas próprias atuais desktop/mobile | Pendente | O atlas atual inclui imagens que o fornecedor publica, algumas promocionais. Não atende ao requisito de capturar fluxos atuais autenticados com dispositivo, viewport, estado e data próprios. |

## Observações públicas reproduzíveis

1. A rota pública [Questões](https://questoes.grancursosonline.com.br/questoes), consultada em 15/11/2026, apresenta as facetas: Disciplina, Assunto, Banca, Instituição, Cargo, Ano, Carreira, Área de formação, Escolaridade, Dificuldade; Comentários (professores, alunos, meus comentários e vídeo); estado pessoal (resolvidas, não resolvidas, certas, erradas); tipo (certo/errado e múltipla escolha); inclusão de anuladas e desatualizadas. Também exibe Limpar filtro, Salvar filtro e Filtrar questões. O contador retornou **3.307.575 questões encontradas**.
2. A rota pública [Provas](https://questoes.grancursosonline.com.br/provas), consultada na mesma data, apresenta Palavra-chave, Banca, Instituição, Cargo, Ano, Carreira, Área de formação, Escolaridade, Esfera e UF, com Limpar filtro, Salvar filtro e Filtrar Provas. O contador retornou **137.593 provas encontradas**.
3. As páginas são conteúdo renderizado publicamente acessível. Não se conclui que os filtros persistem, que as quantidades são totais deduplicados, nem que login gratuito vê os mesmos resultados.

## Divergências de contagem: conservar data e escopo

- Ajuda oficial de planos, atualizada em 06/08/2026, declara **mais de 3 milhões de questões** e **mais de 115 mil provas**.
- As rotas de resultados consultadas em 15/11/2026 renderizaram 3.307.575 e 137.593, respectivamente.
- O relatório original registrou números diferentes de outra visita e também menção a materiais com outros totais. Contadores são mutáveis e as rotas podem contar escopos distintos. Não agregar nem substituir silenciosamente: a afirmação estável é apenas que cada fonte exibiu sua contagem naquela data.

## Fontes primárias consultadas

- [Página pública de Questões](https://questoes.grancursosonline.com.br/questoes) — navegação, filtros, ações e contador em 15/11/2026.
- [Página pública de Provas](https://questoes.grancursosonline.com.br/provas) — navegação, filtros e contador em 15/11/2026.
- [Planos Gran Questões](https://grancursosonline.zendesk.com/hc/pt-br/articles/54070534003483-Quais-s%C3%A3o-os-planos-do-Gran-Quest%C3%B5es-e-o-que-est%C3%A1-incluso-em-cada-um) — ajuda publicada/atualizada em 06/08/2026; escopo Básico/Premium.
- [Benefícios do acesso gratuito](https://grancursosonline.zendesk.com/hc/pt-br/articles/21167597658779-Como-usu%C3%A1rio-gratuito-do-Gran-Quest%C3%B5es-quais-s%C3%A3o-os-benef%C3%ADcios-funcionalidades-aos-quais-tenho-direito) — última atualização mostrada em 08/08/2024; usar com ressalva temporal.
- [Menu principal e funcionalidades](https://grancursosonline.zendesk.com/hc/pt-br/articles/21167529168795-Conhe%C3%A7a-as-funcionalidades-do-menu-principal-da-plataforma-do-Gran-Quest%C3%B5es) — atualizado em 19/09/2025; documentação de painel, provas, questões e filtros.
- [Comentários por IA](https://grancursosonline.zendesk.com/hc/pt-br/articles/46067371232923-Coment%C3%A1rios-por-Intelig%C3%AAncia-Artificial-no-Gran-Quest%C3%B5es-tire-suas-d%C3%BAvidas) — atualizado em 30/01/2026; descreve entrada usada, acesso e elegibilidade.
- [Downloads no app Gran Questões](https://grancursosonline.zendesk.com/hc/pt-br/articles/39488620388251-Quais-as-op%C3%A7%C3%B5es-dos-menus-Minha-Conta-e-Meus-Downloads-no-app-Gran-Quest%C3%B5es) — atualizado em 30/07/2025; declaração de resposta offline e sincronização posterior.
- [Ficha do app no Google Play](https://play.google.com/store/apps/details?hl=pt_BR&id=br.com.grancursosonline.questoes.app) — 1 mi+ downloads, 97,8 mil avaliações e imagens publicadas pela listagem no momento da consulta.

## Próxima coleta necessária (acesso autorizado)

- Registrar para cada captura: URL, data/hora, dispositivo/viewport, plano/estado, etapa da tarefa e se é screenshot própria ou imagem oficial promocional.
- Com uma conta autorizada, capturar desktop e mobile de: filtros abertos/com chips, resolução antes/depois, comentários/fontes, cadernos, construtor/execução/resultado de simulado, painel/Programa/Raio-X, perfil/configurações, gating Premium, loading/vazio/erro.
- Repetir filtro multi-faceta, salvar/reabrir, refresh, link profundo e browser back; verificar se contexto e posição são preservados.
- Testar offline, resolução no dispositivo e reconciliação ao reconectar; observar conflito e duplicação.
- Executar percurso de teclado/leitor de tela, foco, zoom, contraste, dark mode e reduced motion; reportar achados com evidência, sem declarar WCAG sem teste.
- Confirmar elegibilidade e limites dos planos nas telas correntes; distinguir feature de Gran Questões de outros produtos Gran.
- Atualizar a comparação #51/#31 com os mesmos estados (observado/documentado/implementado/planejado/não verificado) após consultar as fontes e os protótipos atuais.

**Estado da pesquisa:** documental/publica concluída. Validações autenticadas e acessibilidade permanecem pendentes; não declarar o escopo total da #62 concluído nem fechar a issue.
