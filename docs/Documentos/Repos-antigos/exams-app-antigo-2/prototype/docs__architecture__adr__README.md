# Registros de decisão de arquitetura (ADR)

Formato: contexto, decisão, consequências, proveniência. Um ADR não é reescrito: se a decisão mudar, cria-se um novo ADR que substitui o anterior, e o antigo recebe o campo `Substituído por`.

| ADR | Título | Status | Proveniência |
| --- | --- | --- | --- |
| [0001](0001-prototipo-estatico-sem-build.md) | Protótipo estático, sem etapa de build | Vigente | `AGENTS.md` (seção "Run the prototype") |
| [0002](0002-ia-via-capacidade-sample.md) | IA via capacidade `sample` do visualizador | Vigente | Decisão registrada no projeto em 2026-11-13; código `index.html` linha ~7530 |
| [0003](0003-persistencia-offline-first-outbox.md) | Persistência offline-first com fila de saída (Outbox) | Vigente no código | Cabeçalho de `js/claude-storage-sync.js` |

Template para novo ADR: título, status, data, contexto, decisão, consequências, proveniência (arquivo, linha, SHA ou issue/PR).
