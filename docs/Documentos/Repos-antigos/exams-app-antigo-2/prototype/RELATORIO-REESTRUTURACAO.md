# Relatório: reestruturação do board (fases 1–7)

## Problemas corrigidos
- **Integridade:** 8 elementos (e504–e511) estavam fora de `order` no `board.json`. Corrigido na PR #252.
- **Verificação automática:** `validate_board.py` checa `order`, setas e imagens referenciadas. Workflow "Validate board" roda em PRs para `dev`. PR #252.
- **Board Mestre:** índice compacto com 5 áreas e 35 cards, apontando para blocos existentes por ID. PR #253.
- **Navegação:** `mestre.html` com busca, filtro por área e estado, galeria e lista. `index.html` aceita `#ID` e enquadra o bloco. PR #254.
- **Evidências:** 4 capturas antes/depois copiadas para o repo, sem duplicatas (checado por hash), com miniaturas no Board Mestre. PR #257.

## Antes e depois
| Item | Antes | Depois |
| --- | --- | --- |
| Elementos do board fora de `order` | 8 | 0 |
| Ponto de entrada para navegar | canvas único de ~1500 blocos | Board Mestre com 5 áreas e cards |
| Acesso a um bloco | arrastar e ampliar o canvas | link do card abre o bloco enquadrado |
| Evidências no board | arquivos soltos no repo | miniaturas no card de evidências |
| Verificação do board | só manual | CI valida JSON, IDs e BOARD.md |

## Evidências preservadas
- Nenhum bloco do canvas foi movido ou apagado.
- Os arquivos originais de `prototype/`, `prototype/docs__archives__*` e `assets/` permanecem.
- As 4 capturas antes/depois ficam em `prototype/board-exam-app__assets__evidence__*`.

## Validações
- `validate_board.py`: 802 elementos, 802 em `order`, sem erros (rodado em CI).
- `render_board_mestre.py` e `board_to_md.py`: regeneração sem diferenças.
- Chromium headless, jornadas em `prototype/docs__board__jornadas__*`:
  - J1 busca "layout": 1 card.
  - J2 filtro "implementado": 14 cards; área 03: 7 cards.
  - J3 teclado: Tab alcança o botão "Lista" em 2 toques e Enter ativa a visão (`aria-pressed=true`).
  - J4 link de card para o canvas: `#e500` abre com zoom ajustado ao bloco.
  - J5 visão geral do canvas: o zoom inicial fica em 2%, ilegível. Limitação registrada.
  - J6 celular 390 e 320 px: sem rolagem horizontal.
  - Nenhum erro de página.

## Limitações
- **Claude Whiteboards: não sincronizado.** Nenhuma alteração remota foi verificada. Ver `prototype/FONTES.md`.
- **Visão galeria e filtros:** entregues no visualizador do Board Mestre, não no canvas.
- **Referências quebradas do catálogo:** a maioria aponta para capturas nunca versionadas (`issue74_*.png`, `issue55_*.png` etc.). Não há cópias no repo nem no `/mnt/project-files`. Ficam como pendência, sem substitutos inventados.
- **Falsos positivos:** referências dentro de `pdf.min.js` são código minificado.
- **Status dos cards:** classificação minha, a partir do conteúdo. Precisa de revisão.
- **Vínculos de evidência:** inferidos pelo nome do arquivo.
- **Canvas em 2% na visão geral:** o canvas é grande demais para caber legível na tela inicial. Não corrigido nesta rodada.
- **Keyboard completo no canvas:** não implementado. Só a navegação do Board Mestre foi testada com teclado.
- **Texto cortado no bloco 8:** conteúdo existente em células estreitas do canvas. Não alterado.

## Links
- PR #252 (integridade, CI): https://github.com/ianmaciel7/exams-app/pull/252
- Issue #251: https://github.com/ianmaciel7/exams-app/issues/251
- PR #253 (Board Mestre): https://github.com/ianmaciel7/exams-app/pull/253
- PR #254 (navegação): https://github.com/ianmaciel7/exams-app/pull/254
- PR #256 (catálogo de evidências, de outra thread): https://github.com/ianmaciel7/exams-app/pull/256
- PR #257 (evidências antes/depois): https://github.com/ianmaciel7/exams-app/pull/257
- PR #258 (fontes e relatório, fases 6 e 7): https://github.com/ianmaciel7/exams-app/pull/258
