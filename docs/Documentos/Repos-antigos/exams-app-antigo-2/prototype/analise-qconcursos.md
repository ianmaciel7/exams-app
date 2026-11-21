# Análise QConcursos: funcionalidades para o banco de questões

*Análise sobre a 0.1.1 (v105), 13/11/2026. Nada foi implementado nem alterado no protótipo. Complementa a [Análise ExamTopics](https://claude.ai/artifact/5qJgzuASzvMgdcoLDqbXZP), que não é repetida aqui.*

## Resumo

O QConcursos é o oposto do ExamTopics: quase tudo nele é filtro. O que ele acrescenta em relação à análise do ExamTopics, e que vale para nós, é pouco e concentrado: **filtros salvos**, **cadernos** (coleções de questões que não mudam quando o filtro muda), **exclusões** (anuladas, desatualizadas, já em caderno ou simulado), **situação do usuário completa** (resolvidas, não resolvidas, acertei, errei) e **simulado gerado a partir do filtro**. A lista longa de filtros de classificação (assunto, nível, formação, atuação, leis) só entra quando houver dado.

A recomendação principal do ExamTopics continua sendo a base: **um único componente de lista de questões** (busca, chips de filtros ativos, total global x filtrado, paginação, estado na URL). Tudo abaixo é construído em cima dele, nada separado.

Confirmado nas páginas oficiais de suporte (todas marcadas como atualizadas há mais de um mês): o filtro é cumulativo (E); "Anuladas" e "Desatualizadas" vêm excluídas por padrão; há botões Filtrar, Limpar e **Aplicar último filtro**; depois de filtrar aparecem Salvar filtro, Gerar caderno, Meus cadernos, Meus filtros e Criar simulado; o simulado personalizado aceita de 1 a 12 disciplinas; o site avisa que passar de certos limites por categoria (ex.: 63 disciplinas, 51 bancas) pode quebrar o filtro, o que reforça manter filtros enxutos.

## O que o app já tem hoje

O inventário detalhado (duas listas, uma em cada tela) está na análise do ExamTopics. Em relação ao que o QConcursos faz:

| Recurso do QConcursos | Situação no app 0.1.1 |
| --- | --- |
| Disciplina, banca, ano, cargo, órgão como critérios | Disciplina e situação no Banco da edição; banca/edição/disciplina/situação na página do tipo Questão. Cargo, órgão e ano existem como objetos e propriedades, mas não como filtro |
| Busca por palavra-chave | Só no Banco da edição (enunciado e disciplina). Código da questão: não |
| Resolvidas, não resolvidas, acertei, errei | Só "não resolvidas" e "que errei" |
| Total encontrado | Sim, nas duas telas |
| Paginação e quantidade por página | Só no Banco da edição (1, 5, 10, 20) |
| Limpar filtros, remover um a um | Só no Banco da edição |
| Ordenação | Não existe na lista |
| Excluir anuladas, desatualizadas, de cadernos, de simulados | Não existe |
| Filtros salvos | Não existe |
| Cadernos | Não existe (o mais próximo é Revisão/caderno de erros e Coleção, planejada no modelo) |
| Simulado a partir dos filtros | Existe na página do tipo Questão ("Fazer simulado" com contagem) e "Simular prova" na edição; sem tempo configurável por filtro |
| Desempenho (acertos, erros, taxa) | Existe a seção Desempenho; falta por disciplina dentro do filtro |
| Gabarito comentado, aulas, anotações como filtro | Sem dado (sem explicação, sem aula, sem anotação por questão) |

**Dados hoje:** banca, ano, edição, cargo, concurso, disciplina, enunciado, alternativas, gabarito e resposta do usuário (70 questões Dataprev 2026). Não há assunto, dificuldade, modalidade, anulada/desatualizada, nem datas de criação.

## O que aproveitar do QConcursos

Ideias novas em relação ao ExamTopics, com o que fazer em cada uma.

1. **Situação completa do usuário** (Resolvidas, Não resolvidas, Acertei, Errei). Já temos duas das quatro; os dados existem (respostas). Esforço baixo. A ExamTopics doc sugere "Que acertei"; aqui acrescenta-se "Resolvidas". Manter "Puladas" para depois do registro de pulos no simulado.
2. **Exclusões como grupo próprio** ("Ocultar: das minhas coleções, dos simulados que já fiz, anuladas, desatualizadas"). Úteis para treinar só o que é novo. Entram em duas etapas: "já respondidas em simulado" e "já em Coleção" têm dado na hora que Coleção existir; "anuladas" depende de campo `situação da questão` (o gabarito preliminar da FGV de 13/10/2026 pode indicar anulações, a verificar). "Desatualizadas" só faz sentido com legislação, descartar por enquanto.
3. **Filtros salvos** (nome, listar, buscar pelo nome, reaplicar, editar, excluir). A análise do ExamTopics deixava como futuro; o QConcursos confirma que é o recurso que mais evita retrabalho. Proposta: tratar como **objeto "Visão"** (Capacities chama de query), que guarda os critérios e não as questões, com página própria e aparecendo na sidebar. "Aplicar último filtro" vira desnecessário se o estado ficar na URL e o app lembrar o último.
4. **Cadernos = Coleção de questões.** O modelo já prevê Coleção. Regra que importa: **o caderno guarda as questões, não os critérios**, então não muda quando você refaz o filtro. Fluxos: "Salvar resultado do filtro como Coleção" e "Adicionar esta questão a uma Coleção" (botão em cada questão). Pastas: adiar, usar Coleção dentro de Coleção ou etiqueta.
5. **Simulado a partir do filtro.** Já existe a ação. Falta dar tempo e quantidade dentro do mesmo diálogo (QConcursos: quantidade e tempo ao gerar) e manter o simulado como objeto separado da pesquisa, como o brief pede. O histórico "Meus simulados" já tem equivalente nos objetos Simulado e Resposta.
6. **Cinco níveis de dificuldade.** O QConcursos tem; nós não temos dado. Mantém a posição do ExamTopics: **derivar do desempenho real** (taxa de erro nas tentativas do usuário), em 5 faixas só quando houver amostra mínima. Nunca inventar.
7. **Modalidade** (múltipla escolha, certo/errado). Vira o campo `Tipo de questão` já proposto: criar no modelo com padrão "Escolha única" e mostrar filtro só com 2 ou mais valores. Certo/errado é a variação que faz diferença para CESPE/Cebraspe, então entra junto.
8. **Busca por código.** Aceitar "q42" ou "42" na mesma caixa de busca, sem filtro separado.
9. **Opções por página.** O brief propõe 1, 5, 10, 20, 50, 100. A análise do ExamTopics recomendava 10, 20, 50, 100 (e 1 só no modo uma por vez). Sugestão: manter 1 (uma por vez), 10, 20, 50 e 100. O 5 sai por não mudar nada em relação a 10.
10. **Ordenação.** Com dados atuais: número, aleatória, que errei primeiro. Data da prova e "adicionadas recentemente" só quando houver mais de uma edição ou data de criação. "Mais difíceis" depende de dificuldade derivada. "Relevância" só com busca ativa. "Gabarito comentado" não se aplica.
11. **Texto maior/menor.** Entra no menu Exibição, junto de modo foco e cronômetro. O cronômetro já existe no simulado.

## O que já existe e precisa melhorar

- **Unificar as duas listas** (recomendação do ExamTopics, mantida): sem isso, nenhum dos itens acima tem onde morar.
- **Estado na URL**, incluindo filtros salvos, ordenação, página e quantidade por página.
- **Contadores globais x filtrados** e contadores nas opções de filtro ("Que errei (7)"), mais simples que um painel de indicadores separado.
- **Desempenho**: o brief pede total, acertos, erros, taxa e tentativas; já existem tentativas e % de acerto. Falta separar *questão* de *tentativa* (item 13 do brief): mostrar "70 questões, 112 tentativas".
- **Filtro de situação vira multisseleção** (OR dentro da categoria, AND entre categorias), como no brief e no QConcursos.
- **Estados vazio, erro e carregando** com ação (limpar filtros, tentar de novo), já iniciados nas diretrizes de estados.

## Funcionalidades novas recomendadas

| Item | Prioridade | Depende de |
| --- | --- | --- |
| Componente único de lista (ver ExamTopics) | Alta | nada |
| Busca por palavra-chave e por número | Alta | componente único |
| Filtros Cargo e Ano (condicionados a 2+ valores) | Alta | componente único |
| Situação completa (Resolvidas, Acertei, Errei, Não resolvidas) | Alta | respostas já guardadas |
| Ordenação e menu Exibição (por página, tamanho do texto) | Alta | componente único |
| Limpar filtros e chips | Alta | componente único |
| Salvar filtro (objeto Visão) e listar na sidebar | Média | componente único e URL |
| Cadernos como Coleção, adicionar questão a Coleção | Média | tipo Coleção |
| Exclusões (em Coleção, em simulado, anuladas) | Média | Coleção e campo anulada |
| Tipo de questão/modalidade e 5 níveis de dificuldade derivados | Média | campos e histórico |
| Assunto (classificação por IA a partir do edital) | Média | decisão do Ian |
| Escolaridade, formação, atuação | Baixa | só útil com muitos cargos |
| Simulado com tempo e quantidade a partir de qualquer filtro | Média | simulado atual |
| Histórico detalhado de tentativas, comparação entre períodos, recomendações de revisão | Futura | mais histórico |

## O que descartar ou adiar

| Item | Motivo |
| --- | --- |
| Votação, respostas sugeridas, discussões, comentários (da comunidade) | Fora do escopo definido |
| Filtros "gabarito comentado", "aulas", "comentários", "meus comentários" | Sem dado. Reavaliar quando a explicação por IA existir; "minhas anotações" volta com anotações por questão |
| Segmentos (concursos militares, OAB, ENEM, vestibulares) | O modelo já cobre isso com Concurso, Banca e Espaços; não precisa de filtro de segmento |
| Questões "desatualizadas" | Exige monitorar legislação; sem fonte, não vale |
| Nível de escolaridade, formação e atuação como filtros agora | Com um único cargo seriam filtros sem uso; viram propriedades do Cargo |
| Aplicar último filtro | Coberto por URL e por lembrar o último estado |
| Limites por categoria (63, 51, 43) | Limitação técnica do site, não da experiência |
| Pastas de cadernos | Adiar; Coleções já aninham |
| Opções 5 questões por página | Ver item 9 |

## Diferenças que importam

- **Filtro**: cumulativo (E) entre categorias. O QConcursos deixa só um valor por filtro em alguns casos; nós permitimos vários (OU) dentro da categoria, como pede o brief.
- **Caderno x filtro x simulado**: o filtro é uma consulta, o caderno é uma lista fixa, o simulado é uma execução com tempo e nota. No app: Visão, Coleção e Simulado/Resposta, como objetos distintos, cada valor com sua página.
- **Exclusões** têm padrão ligado no QConcursos (anuladas, desatualizadas). Aqui o padrão seria ligado apenas para "anuladas" quando o dado existir.
- Nada de campo ou filtro sem dado: tudo condicionado a existir 2 ou mais valores, como na análise do ExamTopics.

## Ordem sugerida de implementação

1. Componente único de lista, com busca (texto e número), chips, total global/filtrado, paginação, por página e estado na URL (passo 1 do ExamTopics).
2. Menus Ordenar e Exibição; situação completa; contadores nas opções; filtros Cargo/Ano condicionados.
3. Coleção (caderno): salvar resultado do filtro e adicionar questão; exclusão "já em Coleção/simulado".
4. Visão (filtro salvo) com página e sidebar; simulado com tempo e quantidade a partir do filtro.
5. Campos Tipo, Anulada e Assunto (IA) e filtros condicionados; dificuldade derivada em 5 faixas.
6. Histórico, comparação entre períodos, recomendações de revisão.

## Decisões que preciso de você

- **Filtro salvo como objeto "Visão"** com página própria, ou só uma lista dentro da página Questão? (Recomendado: objeto.)
- **Caderno = Coleção**, sem pastas por ora? (Recomendado.)
- **Dificuldade em 5 níveis derivada do seu desempenho**, aparecendo só com amostra mínima, em vez de campo editorial? (Recomendado, igual ao ExamTopics.)
- **Opções por página:** 1, 10, 20, 50, 100, tirando o 5?

*Fontes: referências do projeto (qconcursos.md) e páginas oficiais de suporte do QConcursos de filtros, filtros salvos, cadernos e simulados personalizados, consultadas em 13/11/2026.*
