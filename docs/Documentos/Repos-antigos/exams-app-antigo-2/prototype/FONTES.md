# Fontes de verdade do board

Este documento define a responsabilidade de cada representação. Não há sincronização bidirecional automática com Claude Whiteboards.

| Fonte | Responsabilidade | Atualização | Sincronização |
| --- | --- | --- | --- |
| `prototype/board.json` | Canvas original: blocos, imagens e setas. Fonte canônica. | Edição direta em PR. | Gera `BOARD.md`; CI valida integridade. |
| `prototype/BOARD.md` | Leitura Markdown do canvas. | Gerado; não editar à mão. | `board_to_md.py`. |
| `prototype/board-mestre.json` | Índice dos sete boards, documentos e 53 containers. | Edição direta em PR. | Gera `board-mestre.md`; cada container aparece uma vez. |
| `prototype/board-mestre.md` | Índice Markdown para pessoas e agentes. | Gerado; não editar à mão. | `render_board_mestre.py`. |
| `prototype/*.md` | Diagramas Mermaid e mapas de leitura por assunto. | Atualização manual. | Apontam para fontes canônicas; não duplicam conteúdo. |
| `prototype/mestre.html` | Central visual com mapa, filtros, documentos e atalhos. | Código em PR. | Lê `board-mestre.json` e `board.json`. |
| `prototype/board-exam-app__index.html` | Visualizador do canvas original. | Código em PR. | Lê `board.json`; aceita `#ID`. |
| `prototype/catalog.json` | Catálogo estruturado de evidências. | `scripts/build-evidence-catalog.py`. | Validado pelo script do catálogo. |
| GitHub (issues, PRs, CI) | Estado de execução e entrega. | Fluxo de engenharia. | Não duplicar status no board. |
| Claude Whiteboards | Exploração visual remota. | Manual. | Não sincronizado automaticamente. |

## Regras de manutenção

1. Mudanças no canvas começam em `board.json`, nunca em `BOARD.md`.
2. Mudanças no índice começam em `board-mestre.json`, nunca em `board-mestre.md`.
3. Cada container do canvas pertence a exatamente um board temático. Referências cruzadas são links, não cópias.
4. Classifique por `kind` (modelo, pesquisa, evidência, fluxo, arquitetura). Não misture tipo de conteúdo com status.
5. Feito, Em andamento e Pendente são snapshots antigos; consulte GitHub para o estado atual.
6. Cada board temático deve ter diagrama Mermaid, documentos relacionados e links para IDs originais.
7. Evidências precisam de proveniência; não inferir issue/PR apenas pelo nome do arquivo.
8. Antes da PR: `python3 -I validate_board.py`, `python3 -I validate_board_index.py`, `python3 -I render_board_mestre.py` e `python3 -I board_to_md.py`.

## Limites

- Não há sincronização com Claude Whiteboards.
- O índice é uma camada de navegação; o canvas original permanece preservado e extenso.
- Diagramas são mapas de leitura. Para status atual, use GitHub; para conteúdo integral, abra a fonte canônica.
