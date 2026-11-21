# ADR 0003: Persistência offline-first com fila de saída (Outbox)

- Status: vigente no código
- Proveniência: cabeçalho de `prototype/claude-storage-sync.js` (SHA `9beadadd`).

## Contexto
O estudo precisa funcionar sem rede e não pode perder alterações. O estado remoto pode chegar fora de ordem.

## Decisão
Cada alteração é gravada localmente de imediato e entra em uma fila de saída com `opId`. A operação só sai da fila após confirmação. Alterações recebidas durante o envio são preservadas. Em artifact, usa `window.claude.use('db')`; em localhost, aponta para um proxy em `127.0.0.1:8766`.

## Consequências
- Robusto a queda de rede; a fila cresce se o envio falhar.
- O endpoint de localhost não está nesta pasta; verifique antes de depender dele.
- Não há evidência, neste repositório, de testes de concorrência executados contra o banco real. Marque como não verificado até que exista teste.
