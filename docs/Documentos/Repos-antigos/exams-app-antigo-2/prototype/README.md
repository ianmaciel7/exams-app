# Prototypes

Protótipos e material de design do Exam App, baixados do Claude. Tudo aqui é arquivo comum: qualquer agente ou pessoa lê diretamente.

| Pasta | O que é | Como ler |
| --- | --- | --- |
| `exam-app-0.1.1__index.html` | Protótipo atual (HTML estático + PDFs + dados Dataprev) | Servir `prototype/` e abrir `/exam-app-0.1.1__index.html` |
| `exam-app-0.1.0__index.html` | Versão anterior | Servir `prototype/` e abrir `/exam-app-0.1.0__index.html` |
| `` | Canvas original e central de boards temáticos | Pessoas: `mestre.html`; canvas: `index.html` |
| `analises/` | Análises de QConcursos e ExamTopics | Markdown |

## Board do Exam App

- Comece pela central: `mestre.html` mostra mapa dos sete boards, filtros por tipo, documentos e diagramas.
- Mapa e leitura por assunto: `docs/board/README.md` e `docs/board/boards/00-mapa-geral.md`.
- Agentes: leia primeiro o mapa geral e o board temático da tarefa; abra `BOARD.md` apenas para detalhes do canvas original.
- `board.json`: fonte canônica dos blocos, imagens e setas.
- `BOARD.md`: Markdown gerado de `board.json`; não editar manualmente.
- `board-mestre.json`: índice temático; cada container aparece em exatamente um board.
- `board-mestre.md`: índice Markdown gerado.
- `index.html`: visualizador do canvas original; links `#ID` enquadram blocos.
- `mestre.html`: central visual com mapa, lista, galeria e busca.
- `prototype/`: imagens do canvas.

## Fonte única e sincronização

O canvas local não sincroniza automaticamente com Claude Whiteboards. Alterações remotas precisam ser exportadas e validadas. Os boards temáticos são índices e diagramas; não copiam o conteúdo das fontes canônicas.
