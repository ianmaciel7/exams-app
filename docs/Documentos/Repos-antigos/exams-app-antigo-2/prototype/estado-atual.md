# Estado atual do GitHub

Consulta em 2026-11-16 via REST, repositório `ianmaciel7/exams-app`, branch `dev` em `9beadadd8be27c7d99d3ecdf5b5cf099137e23cc`.

| Item | Resultado | Observação |
| --- | --- | --- |
| Issues abertas | 0 | Consulta REST `issues?state=open` sem itens que não sejam PR. |
| Issues citadas como pendência do responsável | #226, #230, #231, #234 fechadas | Verificado uma a uma. A verificação em leitor de tela (#226, #234) não é evidência de uso real. |
| PRs recentes em `dev` | #246 a #259 fechadas | Lista das últimas 15 PRs. Mais antigas não listadas. |
| Tags | nenhuma | Consulta `repos/…/tags` vazia. |
| Releases publicadas | nenhuma | Consulta `repos/…/releases` vazia. |
| Milestones | nenhum | Consulta `repos/…/milestones?state=all` vazia. |
| GitHub Projects | não consultado | A API de projetos do usuário retornou 403 neste ambiente. |

## Consequências para o planejamento
- Não há versão publicada. A versão 0.1.1 existe apenas como protótipo no artifact e no arquivo da `dev`.
- Não há data de release. Não criar uma sem decisão do responsável.
- Para acompanhar ideias ainda sem issue, use o Board, não um documento de status.
