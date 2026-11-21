# Arquitetura

Visão técnica do Exam App, derivada do código em `prototype/exam-app-0.1.1__*` na `dev` (SHA `9beadadd8be27c7d99d3ecdf5b5cf099137e23cc`, observado em 2026-11-16).

| Documento | Conteúdo | Status |
| --- | --- | --- |
| [modelos.md](modelos.md) | Matriz para escolher o modelo de documentação (C4, ADR, ER, estados etc.) | Referência |
| [c4.md](c4.md) | Contexto (L1) e containers (L2) do runtime **atual** do protótipo | AS-IS |
| [dominio.md](dominio.md) | Modelo de objetos (tipos e propriedades) extraído de `TYPES` | AS-IS |
| [adr/](docs__architecture__adr__README.md) | Decisões de arquitetura com proveniência | Histórico + vigente |

Regras:
- Diagramas são Mermaid, sem dependências novas; cada um traz fronteira, legenda, SHA e origem.
- AS-IS = o que o código faz hoje. TO-BE e experimentos ficam em seções separadas e não se misturam com o AS-IS.
- Não há Next.js, banco real ou serviço GCP no código da `dev`. Nada disso aparece como fato aqui.
- Status de issues, PRs e releases não é copiado para estes documentos; ver [../planning/](docs__planning__README.md).
