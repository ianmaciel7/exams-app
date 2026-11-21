# Roteiro de tarefas de usabilidade: Estratégia Questões (issue #230)

**Objetivo:** comparar como um estudante encontra, responde, revisa e simula questões no Estratégia Questões, e identificar o que levar para o Exam App (sem copiar fluxos que dependem de assinatura sem limites claros).

## Participantes e método

- Mínimo de 3 pessoas que estudam para concurso, usando o próprio celular ou computador.
- Cada pessoa faz as 5 tarefas, sem ajuda, com o Estratégia Questões logado em conta de teste ou conta própria (com consentimento).
- Gravação de tela só com consentimento. Registrar tempo, erros e frases ditas em voz alta.
- Anotar, em cada tarefa: concluiu (sim/não), tempo em segundos, número de cliques, desvios de caminho, ajuda pedida.

## Tarefas

### T1. Encontrar questões de uma banca e um assunto
- **Enunciado para a pessoa:** "Encontre 10 questões da banca FGV sobre Banco de Dados, do último concurso dessa banca."
- **Ponto de partida:** página de questões logada.
- **Critérios de sucesso:** lista com 10 questões filtradas por banca e assunto, em até 90 s e sem usar busca de texto livre.
- **Métricas:** tempo, número de filtros usados, filtros removidos.
- **Observar:** se encontra o filtro de assunto sem ajuda, se entende que os filtros estão ativos, se consegue removê-los.

### T2. Responder e ver a explicação
- **Enunciado:** "Responda a primeira questão da lista e veja o comentário ou a solução."
- **Critérios de sucesso:** resposta registrada e comentário aberto em até 45 s.
- **Métricas:** tempo até responder, tempo até abrir a explicação, se perde a posição na lista ao voltar.

### T3. Revisar questões erradas
- **Enunciado:** "Revise só as questões que você errou no último treino."
- **Critérios de sucesso:** lista com apenas erradas, em até 60 s, sem refazer a busca.
- **Métricas:** existência de atalho direto, número de passos.
- **Observar:** se o filtro "erradas" ou "acertei/errei" é achado (no Estratégia há filtros de exclusão por acerto e erro).

### T4. Criar um caderno e duplicá-lo com erros
- **Enunciado:** "Crie um caderno com 5 questões de Direito Administrativo e depois faça uma cópia só com as questões que você errou."
- **Critérios de sucesso:** duas coleções independentes, a cópia com apenas erradas, em até 120 s.
- **Métricas:** tempo, passos, dúvidas sobre se a cópia é independente.

### T5. Fazer um simulado a partir de filtros
- **Enunciado:** "Monte um simulado de 20 questões de Português, com tempo de 30 minutos, e termine."
- **Critérios de sucesso:** simulado iniciado, concluído e resultado visto, em até 5 min para configurar e 30 min para responder.
- **Métricas:** tempo de configuração, se entende as opções de tempo e número, se acha o resultado depois.

## Dados a registrar

| Pessoa | Tarefa | Concluiu | Tempo (s) | Cliques | Desvios | Ajuda pedida | Frase relevante |
|---|---|---|---|---|---|---|---|
| P1 | T1 | | | | | | |

Consolidar em `resultados-usabilidade.md` com média de tempo e taxa de conclusão por tarefa.

## Critérios para levar ao Exam App

- Só registrar como problema o que aparece em pelo menos 2 de 3 pessoas.
- Cada problema vira item com: tarefa, passo, evidência, sugestão e critério de aceite.
- Não copiar fluxos de assinatura ou limites sem verificação.
