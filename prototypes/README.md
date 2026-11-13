# Prototypes

Protótipos e material de design do Exam App, baixados do Claude. Tudo aqui é arquivo comum: qualquer agente (Claude, Codex, Antigravity) ou pessoa lê direto, sem copiar e colar.

| Pasta | O que é | Como ler |
| --- | --- | --- |
| `exam-app-0.1.1/` | Protótipo atual (HTML estático + PDFs + `data/dataprev-2026-tipo1.json`) | Rodar com `python -m http.server 8765` nesta pasta e abrir `/exam-app-0.1.1/` |
| `exam-app-0.1.0/` | Versão anterior | idem, `/exam-app-0.1.0/` |
| `board-exam-app/` | Quadro de planejamento (Claude Whiteboard) | **Agentes: ler `board-exam-app/BOARD.md`.** Pessoas: `/board-exam-app/index.html` no servidor local |
| `analises/` | Análises de funcionalidades do banco de questões (QConcursos, ExamTopics) | Markdown |

## Quadro (board-exam-app)

- `BOARD.md`: o quadro em texto (seções, tabelas, relações entre blocos, referências às imagens). É o que os agentes devem ler.
- `board.json`: dados completos. **Fonte da verdade.** O `BOARD.md` é gerado dele.
- `assets/`: imagens do quadro (`<id>.png` e `inline-<id>.jpg`).
- `index.html`: visualizador local aproximado (arrastar e zoom). Não é idêntico ao Claude; para a aparência exata use o PNG exportado pelo Claude (Share, Export, PNG).
- `board_to_md.py`: regenera o `BOARD.md` (`python board_to_md.py`, dentro da pasta).
- `data/`: elementos individuais como baixados (`board.json` os reúne).

O Claude não oferece exportação do Whiteboard além de PNG, nem importação. Se o quadro for alterado lá, é preciso baixar os dados de novo e rodar `board_to_md.py`.
