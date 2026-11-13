# Análise ExamTopics: funcionalidades para o banco de questões

*Análise sobre a 0.1.1 (v105), 13/11/2026. Nada foi implementado nem alterado no protótipo.*

## Resumo

O ExamTopics é, na prática, uma lista paginada de questões por exame (10 por página, intervalo "1–10 de 606", agrupamento por Topic). Ele quase não tem filtros. O valor dele para nós está em três ideias: **mostrar o total e o intervalo sempre**, **paginar de forma previsível** e **separar bem formato de resposta de contexto (Case Study)**. O resto da sua lista de filtros é nossa, não dele.

A 0.1.1 já cobre boa parte do essencial, mas em **duas telas diferentes** que não conversam: a página do tipo Questão (lista com 4 filtros, sem busca e sem paginação) e o Banco de questões da edição (busca, disciplina, situação, chips, "questões por vez", navegador numerado). A recomendação principal é **unificar as duas num só componente de lista de questões** e só então acrescentar o que falta.

## O que o app já tem hoje

| Recurso | Página do tipo Questão | Banco de questões da edição |
| --- | --- | --- |
| Total de resultados | sim ("N questões") | sim ("N questões encontradas", live region) |
| Busca por texto | **não** | sim (enunciado e disciplina) |
| Banca / Edição | sim | não (já é uma edição só) |
| Disciplina | sim | sim |
| Situação (todas, não resolvidas, que errei) | sim | sim |
| Chips de filtros ativos, remover um, limpar tudo | **não** | sim |
| Questões por página | **não** (lista inteira) | sim: 1, 5, 10, 20 |
| Paginação / intervalo "1–10 de 70" | **não** | sim (anterior/próxima + intervalo) |
| Ordenação | original ou aleatória (só afeta o simulado) | não |
| Navegador numerado | não | sim, com marca de respondida |
| Desempenho (tentativas, % acerto, mais erradas, disciplinas fracas) | sim | resumo (resolvidas, % acerto) |
| Fazer simulado a partir do filtro | sim, com contagem | sim (Simular prova) |

Dados realmente disponíveis nas questões hoje: banca, ano, edição, cargo, concurso, disciplina, enunciado, alternativas, gabarito e a resposta do usuário. **Não existem** campos de assunto, tópico, dificuldade, tipo de questão, tags, explicação, imagem, favorito, nem data de atualização.

## Aproveitadas

Ideias do ExamTopics que valem e que já estão total ou parcialmente no app. Ação: manter e padronizar.

1. **Total sempre visível.** Já existe. Padronizar o texto e deixá-lo no mesmo lugar nas duas telas.
2. **Intervalo e página atual ("11–20 de 70").** Existe só no banco da edição. Levar para a lista do tipo Questão.
3. **Questões por página.** Existe no banco da edição (1, 5, 10, 20). Manter, ver "Melhoradas".
4. **Fornecedor/Exame como eixo principal.** No nosso modelo é Órgão/Banca → Concurso → Edição. Já está nos objetos, cada valor é link. Nada a fazer.
5. **Número da questão como identificador.** Já existe (coluna de número e navegador).

## Melhoradas

1. **Unificar as duas listas num único componente de lista de questões.** Hoje o mesmo conceito tem dois comportamentos. Um componente só, com busca, filtros, chips, total, paginação e "por página", usado na página do tipo Questão e na página da edição (esta última só pré-filtrada). Segue a regra de consistência e a de "questão e cartão são o mesmo componente".
2. **Busca na página do tipo Questão.** Falta lá e é prioridade alta. Buscar no enunciado e nas alternativas, e aceitar número ("q42" ou "42"). Hoje a busca olha só enunciado e disciplina.
3. **Chips de filtros ativos, remover um a um, limpar tudo.** Já existe no banco da edição. Levar para a página do tipo Questão (comportamentos 8 e 9 do seu brief).
4. **Paginação na página do tipo Questão.** Hoje renderiza todas as linhas. Com um banco que cresce (certificações, questões do usuário) isso trava e quebra a leitura. Padrão: 20 por página, opções 10, 20, 50, 100; "1" continua existindo no modo uma por vez.
5. **Filtros e posição na URL.** Guardar filtros, ordenação, página e "por página" no hash (ex.: `#/tipo/questao?disc=...&p=2`). Assim voltar do detalhe da questão mantém tudo (comportamento 9 do brief) e o link pode ser compartilhado. Hoje os filtros são variáveis em memória.
6. **Contadores com global x filtrado.** Mostrar "12 de 70" quando há filtro e só "70" quando não há. Falta hoje: o rótulo diz só o filtrado.
7. **Contadores nas opções dos filtros.** "Língua Portuguesa (10)", "Que errei (7)". Ajuda a evitar escolher filtro que dá zero. Calculado sobre os outros filtros ativos.
8. **Ordenação separada de visualização.** Hoje "Ordem aleatória" só vale para o simulado e fica junto da ação principal. Passar a ser uma ordenação da lista (número, aleatória com semente fixa na sessão) e deixar o simulado herdar a ordem.
9. **Visualização como configuração, não como filtro.** Agrupar "por página", "lista ou uma por vez", "mostrar gabarito" num único menu de **Exibição** (ícone de ajustes), distinto do menu de filtros. Persistir por usuário. A "correção ao clicar" que já existe vira mais uma opção desse menu.
10. **Mensagem de sem resultados.** Já existe, mas a da página do tipo não oferece ação. Incluir "Limpar filtros" e, se houver busca, sugerir remover a busca.
11. **Acessibilidade.** Manter live region do total, `aria-label` em todos os selects, foco vai para o topo da lista ao trocar de página, alvos de 24 px, paginação como `nav` com página atual indicada. Filtros no celular em painel (drawer) em vez de 4 selects em linha.

## Adicionadas

Só o que tem dado correspondente ou custo pequeno. Ordem proposta de entrega.

### Prioridade alta (cabe nos dados atuais)

- **Filtro por Cargo** (já é propriedade da questão e objeto próprio). Útil quando a edição tem vários cargos.
- **Filtro "Respondidas" e "Puladas"** na Situação. Hoje há "Não resolvidas" e "Que errei". Faltam "Que acertei" e "Puladas" (precisa registrar o pulo no simulado; hoje só dá para inferir como "sem resposta no simulado"). Fazer "Que acertei" agora e deixar "Puladas" para depois do registro de pulos.
- **Filtro Ano** quando houver mais de uma edição. Com uma edição só (Dataprev 2026) seria um filtro sem utilidade, então entra **condicionado**: o controle só aparece se existirem 2 ou mais valores.

### Prioridade média

- **Favoritas e Marcadas para revisar.** Um único marcador "Salvar" (estrela) e outro "Revisar" geram duas listas úteis; o simulado já tem marcação, então só falta tornar persistente por questão. Coluna nova no objeto Questão (booleanos do usuário). Entra no filtro de Situação ou num filtro "Minhas marcações".
- **Tipo de questão** (única, múltipla, certo/errado, associação etc.). Hoje todas as 70 são escolha única. Criar o campo no modelo agora (valor padrão "Escolha única") para certificações; o **filtro só aparece quando houver 2 ou mais valores**. Seguir a regra do ExamTopics doc: tipo de resposta e contexto (Case Study) são dimensões separadas.
- **Dificuldade.** Não existe dado. Recomendo **derivar do desempenho do usuário** (taxa de erro nas tentativas) em vez de campo editorial: "Mais erradas" já existe em Desempenho. Evitar filtro Fácil/Média/Difícil sem fonte.
- **Indicadores de progresso** na lista: barra "resolvidas x total" por disciplina dentro do filtro de Disciplina, reaproveitando o que o Desempenho já calcula.
- **Assunto** (subitem de Disciplina, vindo do edital: ex. "Banco de dados > Normalização"). Estrutura útil, mas depende de classificar as 70 questões. Candidato a ser feito com IA (o app é AI-first) com revisão do usuário.

### Prioridade futura

- **Filtros salvos / Visões** (Capacities chama de queries): botão "Salvar filtro" que cria uma lista nomeada na sidebar. Só depois que os filtros base estiverem estáveis.
- **Filtro por número de tentativas** e **estatísticas por assunto**. Dependem de assunto e de mais histórico.
- **Recomendações de revisão por desempenho.** Ficam melhor como uma seção em Revisão ("Revisar hoje: disciplinas fracas") do que como filtro.
- **Atualização** ("mais recentes", "atualizadas recentemente"): só faz sentido com campo de data de atualização e bancos que mudem. Começar por "adicionadas por último" na ordenação, que usa a data de criação.

## Descartadas (ou adiadas por falta de dados/valor)

| Item | Por quê |
| --- | --- |
| Filtro **Fornecedor** | No nosso modelo é Órgão/Banca, e já são páginas e filtros. Outro nome para o mesmo filtro. |
| Filtro **Código do exame** | Redundante com Edição (a edição já é nomeada). Fica como propriedade visível na página, não filtro. |
| Filtros **Tópico e Subtópico** separados de Assunto | Uma hierarquia só: Disciplina > Assunto. Três níveis de filtro confundem e ninguém classificaria tudo. |
| **Tags** como filtro | O app já tem valores de propriedade clicáveis que listam tudo com aquele valor; tag livre duplica isso. Revisitar só se o usuário pedir. |
| **Texto das alternativas** como filtro separado | É parte da busca (item 2 de Melhoradas), não um filtro à parte. |
| Filtro **Número da questão** | Vira busca por número e salto "ir para questão"; não precisa de controle próprio. |
| Filtros **Com imagem / Com explicação / Sem explicação** | Não há imagens nem explicações nos dados atuais. Reavaliar se o app passar a ter explicação gerada por IA. |
| **Parcialmente correta** | Só existe com múltiplas respostas ou hotspot. Entra junto com tipo de questão, não antes. |
| Tipos **Hotspot, Drag-and-drop, Ordenação** | São componentes de resposta, não filtros. Só fazem sentido ao importar certificações. Fora do escopo agora. |
| **Contar questões por versão/ano/tipo** como bloco de números | Viram contadores dentro das opções de filtro (item 7 de Melhoradas); um painel separado só repete a informação. |
| Questões por página **5**, e **100** na lista do tipo | Excesso de opções. Ficar com 10, 20, 50, 100 na lista e 1 no modo uma por vez. |
| Comentários, discussão, votos da comunidade | Já decididos como fora do foco. |

## Critérios aplicados (seção 7 do brief)

- **Já existe?** Verificado item a item na primeira tabela.
- **Melhora a experiência?** Entrou só o que reduz esforço (busca, chips, retorno com filtros mantidos).
- **Redundância.** Fornecedor, código, tópico e tags saíram por duplicar o que o modelo de objetos já faz.
- **Filtro sem dado.** Dificuldade, tipo, imagem e explicação ficaram condicionados ao dado existir (controle só aparece com 2 ou mais valores).
- **Filtro x ordenação x exibição x indicador.** Separados em quatro grupos na proposta de interface abaixo.
- **Consistência, responsividade, acessibilidade.** Mesmo componente nas duas telas, filtros em drawer no celular, `nav` de paginação, live region do total.
- **Filtros e paginação juntos.** Mudar qualquer filtro volta à página 1; total e intervalo vêm sempre do resultado filtrado.

## Proposta de interface (para aprovar antes de implementar)

Barra única acima da lista:

1. **Busca** (grande, à esquerda).
2. **Filtros** (botão com contagem de ativos; abre painel com Disciplina, Banca, Edição, Cargo, Situação, e depois Tipo, Marcações).
3. **Ordenar** (menu: Número, Aleatória, Recentes).
4. **Exibição** (menu: por página, lista ou uma por vez, mostrar gabarito, corrigir ao clicar).

Linha de chips com filtros ativos e "Limpar filtros". Linha de resultado: **"21–40 de 53 (70 no total)"**. Rodapé com paginação.

## Ordem sugerida de implementação

1. Componente único de lista de questões (busca, filtros, chips, total global/filtrado, paginação, por página) + estado na URL.
2. Menu Exibição e Ordenar separados; contadores nas opções de filtro.
3. Filtro Cargo, "Que acertei" e Favoritas/Revisar.
4. Campos Tipo e Assunto no modelo (com classificação por IA) e filtros condicionados.
5. Filtros salvos, recomendações de revisão.

## Decisões que preciso de você

- **Unificar as duas listas num componente só** (recomendado) ou manter o banco da edição separado?
- **Dificuldade derivada do seu desempenho** (recomendado) ou campo editorial?
- **Assunto classificado por IA** a partir do edital: posso incluir já no passo 4?
