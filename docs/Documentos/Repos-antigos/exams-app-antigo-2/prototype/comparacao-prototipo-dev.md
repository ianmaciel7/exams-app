# Comparação: Estratégia Questões x protótipo em `dev` (issue #230)

**Arquivo lido:** `prototype/exam-app-0.1.1__index.html` na branch `dev` (commit `e247f29`, 9.247 linhas, ~820 KB).
**Método:** leitura por seções com busca por termos (`grep` com trecho curto) e leitura de faixas de linhas. O arquivo inteiro não foi carregado de uma vez.
**Rótulos:** **Presente** (código lido), **Parcial**, **Ausente** (não encontrado nas buscas), **Não verificado**.

## Localização das seções relevantes

| Seção | Linhas aproximadas | Conteúdo |
|---|---|---|
| Filtros de exclusão (`QF_EXCLUSIONS`) | 6353–6360 | Cadernos, simulados, anuladas, desatualizadas, comentado, anotações |
| Filtros de categoria (`qfHTML`, `qfSt`) | 6541, 6614–6622, 6649 | Painel de filtros, estado por chave, limpar |
| Cadernos e filtros salvos | 6385–6400, 6465, 6618 | "Salvar filtro", "Gerar Caderno", lista de cadernos |
| Simulado a partir da busca | 6618, 6688–6690, 7153 | "Criar Simulado", "Fazer simulado" |
| Sincronização de URL | 7299–7345 (`qfSyncURL`) | Busca, filtros, exclusões, posição, `per` na URL |
| Página de questão e estatísticas | 6754–6864 | Gabarito comentado, estatísticas pessoais, cadernos da questão |

## Comparação por recurso observado no Estratégia

| Recurso (Estratégia) | Dev | Evidência | Observação |
|---|---|---|---|
| Filtros por matéria, assunto, banca, ano, órgão, modalidade, dificuldade | **Presente** | `qfHTML`, categorias `disc`, `assunto`, `banca`, `ano`, `orgao`, `modalidade`, `dificuldade` (linha ~6592) | Dev não tem filtro por região; não verificado se o Estratégia tem |
| Excluir anuladas | **Presente** | `QF_EXCLUSIONS` `anuladas` (linha ~6355), ativo por padrão | Igual ao observado |
| Excluir desatualizadas | **Presente** | `desatualizadas` (linha ~6356) | |
| Filtro de exclusão: certo/errado, múltipla escolha, discursivas | **Parcial** | Certo/Errado aparece como opção de modalidade (linha ~5198) | Não há exclusão por tipo na lista de exclusões |
| Filtro de exclusão: sem solução, sem solução em vídeo, sem assunto | **Ausente** | não encontrado | Dev tem "Gabarito comentado" como inclusão, que cobre parte |
| Filtro: as que acertei / as que errei | **Parcial** | categoria "Situação" (linha ~6318 e seguintes) com pendentes, certas, erradas, resolvidas | Cobre a ideia, mas como categoria, não como exclusão |
| Filtro: dos meus cadernos e simulados | **Presente** | `cadernos`, `simulados` (linhas ~6354–6355) | Dev tem, Estratégia não confirmado nessa forma |
| Salvar filtro | **Presente** | `sfCreate`, "Salvar filtro de questões" (linhas ~6385–6391) | Estratégia: não observado |
| Gerar caderno a partir de filtros | **Presente** | "Gerar Caderno" (linhas ~6398, 6618) | |
| Criar simulado a partir de filtros | **Presente** | "Criar Simulado" (linha ~6618) | |
| Duplicar caderno (com erradas, acertadas, respondidas, não respondidas) | **Ausente** | não há "duplicar" para cadernos (linha ~9045 é duplicação de objeto do workspace, não de caderno) | Prioridade P1 no relatório |
| Caderno em pastas | **Ausente** | não encontrado | Decisão do Board: caderno = Coleção, sem pastas (pendente) |
| Paginação por 1, 5, 10, 20 | **Presente, com diferença** | `[1,5,10,20]` em `qPer` (linhas ~7299, 7345) | Estratégia observou 5, 10, 15, 20 e "uma por vez" |
| Estado da lista na URL | **Presente** | `qfSyncURL` (linha 7303): busca, categorias, exclusões, posição `at` e `per` | Base boa para P2 |
| Estatística por alternativa com dados de outros usuários | **Ausente** | estatísticas da questão são pessoais (linha ~6797: "Dados pessoais, não estatísticas globais") | P2 do relatório: exige amostra mínima |
| Comentário ou gabarito comentado do professor | **Presente** | `comentario`, `qped-comment` (linhas ~6844–6846) | |
| Impressão em PDF de caderno | **Ausente** | busca por `print`/`Imprimir` sem resultado | P3 |
| Atalhos de teclado | **Presente** | painel "Atalhos de teclado" (linha ~2145) | Não verificado se cobre os atalhos de questão |
| Modo offline | **Ausente** | não verificado | Só relevante se o app for PWA; fora do escopo atual |
| Solução em vídeo e fórum | **Ausente** | não encontrado | Não observado no Estratégia logado; fora do escopo |

## Lacunas da comparação

- A leitura foi por busca de termos e faixas de linhas. Um item marcado como **Ausente** pode existir com outro nome. Antes de implementar, confirmar com a busca específica na seção.
- Estratégia: nada foi verificado logado. Todos os itens "observados" vêm de páginas públicas ou de texto de 2021.
- O relatório base de 16/11/2026 listava "Salvar filtro" e "Gerar Caderno" como inventário QConcursos. Em `dev` estão presentes, então a matriz do relatório base fica resolvida neste ponto.

## Recomendações derivadas (sem mudar código)

1. P1: duplicar caderno com filtro de erradas ou acertadas (ausente).
2. P1: completar a exclusão por tipo (certo/errado, múltipla escolha, discursivas, sem solução, sem assunto) com opção só quando houver dados (parcial).
3. P2: estatística por alternativa com amostra mínima, rotulada como dados de outros usuários (ausente).
4. P2: alinhar paginação com 5/10/15/20 e modo uma por vez (parcial).
5. P3: impressão de caderno em layout sem navegação (ausente).
