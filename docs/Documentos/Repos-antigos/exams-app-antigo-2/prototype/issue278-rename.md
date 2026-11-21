# Issue #278 — renomeação física de prototypes/ para prototype/

A pasta-mãe foi efetivamente renomeada. Base desta etapa: `dev@d586ba33a33e3d11f1d863732dc6e4cf8632342b` (PR #279 integrado).

## Resultado desta etapa

- Os **966 arquivos** existentes em `prototypes/` antes da renomeação estão mapeados um a um para `prototype/`, sem colisões ou descartes. Esse total inclui os cinco documentos/manifestos acrescentados pela fase 0; a baseline original tinha 961.
- `package.json`, `npm run dev`, `npm run start`, testes, scripts, serviços, workflows ativos, geradores, mapas, documentação e URLs GitHub da `dev` passam a usar `prototype/`.
- O servidor continua na porta 8765, com os mesmos basenames e rotas HTTP. Como `prototype/` é o document root, app, PDFs, assets, Board Mestre, canvas e galeria conservam suas URLs locais. Nenhum estado localStorage precisa mudar de porta ou origem.
- O catálogo preserva IDs `EV-*`, datas e hashes de mídia. A identidade histórica usa o prefixo original para derivar o ID, enquanto o caminho físico utiliza `prototype/`. Não há cópias dos assets.
- Os manifestos da fase 0 ficam byte a byte preservados, inclusive seus paths de origem. Links para commits/worktrees históricos continuam apontando para os paths existentes naquelas versões. Não substituir proveniência antiga pelo path atual.
- O mapa de 109 entradas mantém a coluna de origem anterior e atualiza destino e hash atual. Os cinco hashes desatualizados da baseline anterior continuam documentados no relatório da fase 0 e recuperáveis no Git da base desta etapa; não são apresentados como regressões da renomeação.
- O hold de publicação, mirror e writers de evidência permanece ativo. Nenhum Artifact, release ou tag é publicado.

## Manifestos e reversão

- [Baseline anterior à renomeação](issue278-before-rename.json): inventário exato do Git da base `d586ba3`.
- [Recibo de movimentação](issue278-rename-receipt.json): 100% dos 966 arquivos, origem → destino, hashes antes/depois, classe e motivo de alteração textual. Arquivos binários devem manter hashes idênticos.
- Para reverter esta etapa: reverter o commit do PR; a pasta e as referências voltam a `prototypes/`. O hold do PR #279 permanece. Não executar comandos de publicação como parte do rollback.

## Execução e validação

```sh
npm run dev
npm run start
npm run board
python prototype/validate_board.py
python prototype/validate_board_index.py
python prototype/validate_examtopics_evidence.py
python prototype/validate_feature_links.py
python scripts/validate-docs-architecture.py
python scripts/check-docs-migration.py
python scripts/validate-evidence-catalog.py
node --test tests/*.test.mjs
python -m unittest discover -s tests -p test_prototype_migration.py
```

`npm run dev` e `npm run start` foram iniciados com sucesso no Linux; o stack abriu HTTP e proxy local. Nove entradas (app, board, galeria, scripts PDF.js, worker, dados, sincronizador JS e PDF de prova) retornaram HTTP 200. Isso não comprova sincronização com o provedor remoto.

Smoke de navegador executado no Chrome do ambiente Linux: Board Mestre renderizou os sete boards; busca `ExamTopics` exibiu o container `e17000`; o app abriu a Home e o clique em Questões exibiu 70 questões; a galeria renderizou 374 mídias e os pares antes/depois. A verificação foi de carregamento e navegação, não auditoria completa de acessibilidade, PDF ou sincronização remota. O bloqueio de publicação impediu deploy real. Windows é validado no CI para a suíte de inventário; Windows 11 interativo ainda não foi executado.

## Escopo restante da #278

Esta é a primeira fase de movimentação, conforme a exigência de execução incremental. Ela resolve a pasta-mãe e os consumidores do prefixo antigo. A classificação interna em `app/`, sete diretórios temáticos em `boards/`, `tools/` e `archive/` continua sendo a próxima fase, com revisão de destinos e validação por lote. O app histórico permanece operacional, sem ser promovido a fonte aprovada do novo produto. A issue não deve ser encerrada só com a renomeação.
