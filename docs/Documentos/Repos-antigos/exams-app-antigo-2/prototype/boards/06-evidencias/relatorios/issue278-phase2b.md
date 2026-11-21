# Issue #278 — fase 2B: transferência de marcadores de metadados vazios

Baseline: `dev@b5a93e65b3c4643487801abeb37e15df7a8bc3c7` (17/11/2026). Esta etapa é **parcial** e não conclui a issue.

## Escopo executado

- **208 arquivos `.eN.json,by-others` com zero bytes** transferidos de `prototype/` para `prototype/boards/06-evidencias/relatorios/`, conforme o destino já proposto no manifesto da fase 2A.
- Todos os 208 têm o mesmo SHA de blob vazio Git, `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`. A movimentação é uma troca de caminho Git, sem criar novos bytes, sem reserialização, sem apagar proveniência ou IDs.
- Inventário histórico de 969 arquivos preservado no `phase2-navigation-map.json` (`path` imutável; `current_path` para os movidos). Permanecem **761 arquivos na raiz** aguardando revisão de consumidores.
- Não são capturas ou evidências visuais reais: os marcadores estão vazios. Imagens, PDFs, bundles, HTMLs, JS, dados canônicos, artifacts históricos, catálogos e servidores não foram movidos.
- Política `migration-hold` continua impedindo publicação Claude, mirror remoto e writers de evidência.

## Validações e evidências

- `scripts/validate-issue278-navigation.py` confere todos os 969 paths atuais a partir do índice Git, SHA de cada blob, unicidade sem diferenciar caixa, 208 mudanças permitidas, sete boards, links navegáveis, `e17000` e bloqueio de publicação.
- `tests/test_prototype_migration.py` valida os 208 arquivos vazios no destino, ausência do path antigo, inventário original e integridade SHA-256 dos arquivos da primeira renomeação usando o mapeamento corrente.
- Pipeline Ubuntu/Windows deve executar os testes antes de qualquer merge. **A aprovação ainda depende do status real do CI**; este documento não declara smoke visual, Windows 11 interativo, E2E, PDF ou storage testados.
- Sem integração externa nem acesso a arquivos fora do Git: não inferir recuperação de evidências externas.

## Próximas fases

1. Revisar por classe os outros 761 arquivos, especialmente dependências relativas, referências textuais e URLs dinâmicas. Não copiar documentos para `boards/` sem definir fonte canônica única.
2. Mover os históricos Claude apenas junto de HTML, PDF.js, workers, dados e PDFs, conservando rotas compatíveis e testando no navegador.
3. Revisar scripts, catalogação, geração de boards, links, `npm run dev/start`, Linux e Windows 11; guardar resultados PASS/FAIL no Board Mestre.
4. Preservar `migration-hold` até decisão independente sobre publicação.

## Reversão

Reverter o commit específico do PR desta fase, restaurando apenas os 208 paths anteriores, manifesto, validador e documentação. Não reverter as mudanças da fase 0/1 que desativaram publicação automática. Não acionar automações remotas no rollback.
