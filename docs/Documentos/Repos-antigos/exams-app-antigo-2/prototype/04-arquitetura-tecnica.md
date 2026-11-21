# 04 — Arquitetura técnica

> Visão de componentes e fronteiras. Experimentos com APIs privadas não são contratos públicos nem garantias de integração.

```mermaid
flowchart TB
  UI[Interface HTML e JS] --> ROUTES[Rotas e composição]
  ROUTES --> DOMAIN[Fluxos e modelo de domínio]
  DOMAIN --> GRAPH[Estado e isolamento do grafo]
  DOMAIN --> LOADING[Máquina de estados de carregamento]
  DOMAIN --> COMMANDS[Roteador de comandos]
  DOMAIN --> PDF[PDF.js e leitor]
  DOMAIN --> AI[Capacidade de IA do runtime]
  DOMAIN --> SYNC[Engine de sincronização]
  SYNC --> OUTBOX[Fila e Outbox]
  OUTBOX --> PROXY[Proxy local]
  PROXY -. endpoint privado e não documentado .-> CLOUD[Claude Artifact Storage]
  AGENTS[Codex - Claude - Antigravity] -. tooling de desenvolvimento .-> REPO[Repositório]
  DOMAIN --> REPO
```

## Fronteiras e cautelas

- Interface, rotas, domínio e integrações são responsabilidades distintas.
- Grafo, carregamento, comandos e PDF.js não devem virar um módulo genérico único.
- O relatório de Storage registra endpoint privado e não documentado; compatibilidade pode mudar sem aviso.
- A Browser Bridge foi considerada bloqueada por CSP/sandbox; não a descreva como integração funcional.
- Infraestrutura de agentes é tooling de desenvolvimento, não dependência do runtime do usuário.

## Documentos

- [Claude Pro Storage API](CLAUDE_STORAGE_API_INTEGRATION.md)
- [Investigação Storage Bridge](CLAUDE_STORAGE_BRIDGE_INVESTIGATION.md)
- [Fontes de verdade do board](FONTES.md)

## Blocos originais

- [e410 — Camada de IA](board-exam-app__index.html#e410)
- [e1248 — Infraestrutura de agentes](board-exam-app__index.html#e1248)
- [e1371 — Storage Bridge PoC](board-exam-app__index.html#e1371)
- [e1440 — Storage homologado](board-exam-app__index.html#e1440)
- [e1407 — Isolamento do grafo](board-exam-app__index.html#e1407)
- [e1450 — Máquina de estados de carregamento](board-exam-app__index.html#e1450)
