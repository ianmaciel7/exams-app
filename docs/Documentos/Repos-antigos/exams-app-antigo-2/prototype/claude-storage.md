# Sincronização (Claude Storage)

- Problema: não perder alterações e sincronizar sem backend próprio.
- Status: parcial. O motor offline-first com Outbox existe em `js/claude-storage-sync.js` (ADR 0003). Não há evidência, neste repositório, de sincronização verificada com o banco real.
- Fluxo principal: alteração local → fila de saída → envio com `opId` → remoção da fila após confirmação.
- Relações: ADR [0003](0003-persistencia-offline-first-outbox.md).
- Status de sincronização do Board: não verificado. Não há sincronização automática com Claude Whiteboards (`prototype/FONTES.md`).
- Lacunas: o endpoint `127.0.0.1:8766` não está nesta pasta; a fila e a concorrência não têm teste automatizado registrado.
