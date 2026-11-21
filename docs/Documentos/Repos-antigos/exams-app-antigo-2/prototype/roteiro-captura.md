# Roteiro executável de capturas: Estratégia Questões (issue #230)

**Para quem:** Ian, com a conta logada (navegador do ian-pc ou navegador próprio).
**Data de referência:** 16/11/2026. Anotar a data de cada captura no nome do arquivo.

## Regras de captura

- Desktop em 1440 px de largura e mobile em 390 px (iPhone) ou equivalente.
- Tela cheia, sem extensões, tema claro e, se existir, também tema escuro (anotar qual).
- Nome do arquivo: `NN-tela-estado-viewport-AAAAMMDD.png`, por exemplo `03-busca-filtros-aberto-desktop-20261116.png`.
- Não capturar dados pessoais (nome, e-mail, CPF). Tarjar se aparecerem.
- Para cada captura, anotar em `capturas/LEIA-ME.md`: URL exata, se logado, plano atual e data.

## 1. Entrada e navegação

| # | Tela | URL de partida | Passos | Captura |
|---|---|---|---|---|
| 01 | Home logada | https://www.estrategiaconcursos.com.br/sistema-de-questoes (depois de logar) | Abrir e esperar carregar | desktop e mobile |
| 02 | Menu ou navegação logada | a partir da home | Abrir o menu principal | desktop e mobile |
| 03 | Busca com filtros aberta | página de questões | Abrir o painel de filtros | desktop e mobile |
| 04 | Busca com filtros fechada | página de questões | Fechar o painel de filtros | desktop e mobile |
| 05 | Resultado de busca | página de questões | Filtrar por banca e assunto | desktop e mobile |

## 2. Questão

| # | Tela | Passos | Captura |
|---|---|---|---|
| 06 | Questão antes de responder | Abrir uma questão da lista | desktop e mobile |
| 07 | Questão depois de responder (certa) | Responder com a alternativa correta | desktop e mobile |
| 08 | Questão depois de responder (errada) | Responder com alternativa errada | desktop e mobile |
| 09 | Explicação ou comentário | Abrir "Ver solução e comentários" | desktop e mobile |
| 10 | Estatística por alternativa | Abrir a área de estatística da questão | desktop e mobile |

## 3. Cadernos, simulado e resultados

| # | Tela | Passos | Captura |
|---|---|---|---|
| 11 | Lista de cadernos | Abrir "Cadernos" | desktop e mobile |
| 12 | Criar caderno (diálogo) | Usar "Criar caderno" a partir de uma busca | desktop e mobile |
| 13 | Caderno com questões | Abrir um caderno com itens | desktop e mobile |
| 14 | Duplicar caderno | Abrir o menu do caderno e escolher duplicar | desktop |
| 15 | Criar simulado | Usar "Criar simulado" (nome, tempo, número de questões) | desktop e mobile |
| 16 | Simulado em andamento | Iniciar e responder duas questões | desktop e mobile |
| 17 | Resultado do simulado | Concluir o simulado | desktop e mobile |
| 18 | Estatísticas pessoais | Abrir "Meu desempenho" ou similar | desktop e mobile |

## 4. Configurações, planos e estados

| # | Tela | Passos | Captura |
|---|---|---|---|
| 19 | Configurações | Abrir a área de conta ou configurações | desktop e mobile |
| 20 | Planos e preços | Abrir a página de planos logado | desktop, com data e preço anotados |
| 21 | Estado vazio | Abrir um caderno ou simulado sem itens (conta nova ou filtro sem resultado) | desktop e mobile |
| 22 | Estado carregando | Recarregar a lista e capturar logo após o clique (usar pausa de rede se possível) | desktop |
| 23 | Estado de erro | Desconectar a rede por alguns segundos e tentar carregar uma lista | desktop e mobile |

## 5. Mapa de navegação logado

Registrar em `capturas/mapa-navegacao.md` a árvore de menus logados: cada item do menu principal, submenu e a URL final. Não é preciso capturar se a lista de texto estiver completa.

## Critério de conclusão

- Todas as 23 telas com estado indicado, ou marcadas como "não existe nesta conta".
- Planos com data de verificação e preço por período.
- Mapa de navegação em texto.
- Comentar na issue #230 com o caminho da pasta ou os arquivos enviados.
