# #278 — fase 2A: navegação estruturada

Baseline: `dev@6848c309bfc67e086f81c7e09abe8c83ca643230` (17/11/2026). **Etapa incremental, não é encerramento da issue.**

## Preservado

- Inventário de **969/969** arquivos versionados na raiz `prototype/`, com `path`, Git blob SHA, tamanho e destino planejado. Grupos: boards 891, tools 9, archive 69.
- Sete diretórios temáticos indexados, incluindo `02-design/`, sem duplicar conteúdo dos boards e com entrada compatível `boards/index.html`.
- Índice de backups, ferramentas e esclarecimento de que `app/` não tem fonte aprovada do produto novo.
- Dados e IDs existentes do canvas, galeria e catálogos não alterados; `e17000` continua fonte histórica.
- Gates de Claude Artifact, mirror e escritores de evidência mantidos desabilitados.

## Validação

- `python scripts/validate-issue278-navigation.py`: verifica cobertura exata dos Git blobs, ausência de colisões, links nos 7 índices, dados e gate de publicação.
- Suíte de baseline original segue inalterada; workflow de migração executa em Ubuntu e Windows.
- Não há evidência visual de Chromium/Windows 11 interativo nesta etapa. Nenhum E2E, integração de storage, PDF ou publicação real é declarado como testado.
- Links e originais externos nunca versionados continuam pendentes; não afirmar recuperação ou zero perdas fora do Git.

## Resta fazer antes de fechar #278

1. Mover gradualmente conteúdo canônico para `boards/`, históricos para `archive/` e scripts migráveis para `tools/`, atualizando consumidores e links simultaneamente.
2. Garantir compatibilidade de URLs locais, assets do PDF.js, `npm run start/dev`, hooks, catálogos, geradores, testes e PRs.
3. Executar matriz PASS/FAIL de hashes, Git tree, Linux/Windows, E2E/browser, responsividade, teclado, PDF, proxy/storage e CI; guardar evidências reais.
4. Revisar e integrar os PRs na `dev`; manter bloqueio de publicação até decisão independente aprovada.

Rollback: reverter só este commit, já que a fase não moveu nem reescreveu fontes.
