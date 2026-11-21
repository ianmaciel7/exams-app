# Central de boards do Exam App

> Comece pelo mapa geral. Cada board temático reúne documentos e blocos do canvas relacionados ao mesmo assunto. Diagramas são mapas de navegação, não uma segunda fonte de requisitos.

## Mapa

- [00 — Mapa geral](00-mapa-geral.md)
- [01 — Produto e domínio](01-produto-e-dominio.md)
- [02 — Workspace e UX](02-workspace-e-ux.md)
- [03 — Fluxos de estudo](03-fluxos-de-estudo.md)
- [04 — Arquitetura técnica](04-arquitetura-tecnica.md)
- [05 — Pesquisa e decisões](05-pesquisa-e-decisoes.md)
- [06 — Evidências e qualidade](06-evidencias-e-qualidade.md)
- [07 — Entrega e arquivo](07-entrega-e-arquivo.md)

## Como navegar

1. Escolha o board pelo assunto ou funcionalidade.
2. Leia o diagrama e os documentos relacionados.
3. Abra os blocos do canvas original somente quando precisar do detalhe visual ou histórico.
4. Use o catálogo para evidências e o GitHub para o estado atual de issues, PRs e CI.

## Fonte única

- `board.json` é a fonte canônica dos blocos, imagens e setas do canvas original.
- `BOARD.md` é gerado de `board.json` e não deve ser editado manualmente.
- `board-mestre.json` indexa os sete boards e os 53 containers; não replica o conteúdo.
- Os diagramas organizam a leitura e apontam para documentos canônicos.
- `prototype/catalog.json` é a fonte estruturada de mídias.
- Issues, PRs e CI são a fonte do estado de execução; colunas antigas de status são históricas.

Não crie uma cópia de um documento que já existe. Adicione uma referência no board temático correspondente.
