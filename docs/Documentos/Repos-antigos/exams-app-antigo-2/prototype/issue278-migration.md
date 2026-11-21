> Histórico da fase 0. A renomeação física foi executada na fase seguinte; veja [estado atual](issue278-rename.md).

# Issue #278 — fase 0: baseline e bloqueio de efeitos remotos

**Estado: fase preparatória implementada; migração de paths NÃO iniciada.**
Fonte auditada: `dev@c9356bba56bcb019e7341f32c1c3724e267b44c7`.
Este documento não conclui a #278 nem aprova os protótipos históricos.

## Entregas verificáveis

- [Inventário integral](issue278-inventory.json): 1.150 arquivos versionados, dos quais 961 em `prototype/`; bytes, SHA-256 completo, tipo, modo, path de origem, origens do mapa anterior, referências lexicais e destino proposto. Nomes achatados preservados; colisões comparadas sem diferenciar maiúsculas. A classificação é proposta para revisão, não comando de movimentação.
- [Resultados dos comandos anteriores à alteração](issue278-baseline.json): saídas, códigos, comandos e durações.
- [Cobertura recalculada isoladamente](issue278-coverage-baseline.json): o JSON commitado estava antigo. Ele registrava 57 containers, 727 nós, 713 cobertos e 14 descobertos; o board atual tem **59 containers, 754 nós e 754 cobertos**, segundo o mesmo algoritmo `coverage_report.py`. Esse algoritmo usa contenção completa, diferente do centro geométrico de `board_to_md.py`; não igualar suas métricas.
- [Automações e pontos de entrada](issue278-dependencies.json): workflows escritores, paths, referências ao diretório antigo e URLs atuais.
- `.github/prototype-migration.json`: hold explícito. Workflow de sincronização agora só valida agentes, sem token, deploy, mirror ou force-push. Hooks conservam geração local de agentes; não publicam nem fazem push.
- `sync:artifact` bloqueia com código 1, inclusive se a política estiver ausente, inválida ou editada para enabled. `sync:all` usa `&&` e para nesse bloqueio. Retomar publicação exige mudança separada revisada, não variável de ambiente.
- Os 12 jobs históricos que commitavam/pushavam evidências estão explicitamente pausados. Os outros workflows de validação continuam ativos. Guards originais permanecem recuperáveis no Git.
- A suíte verifica também a existência dos 961 arquivos, os hashes dos 957 sem edição e todos os elementos/IDs e a ordem anterior do canvas. Quatro documentos/dados do board têm alterações intencionais revisáveis no diff. No Windows, a comparação de texto aceita somente a conversão reversível LF → CRLF do checkout; hashes de binários continuam exatos. O inventário continua calculado dos bytes Git, sem conversão. Testes negativos verificam corrupção binária, arquivo ausente, colisão de case, traversal, versões históricas e hooks com executáveis simulados. CI executa a suíte no Ubuntu e Windows; resultado remoto deve ser consultado, não presumido.

## Baseline: problemas anteriores e limites

**PASS**: 214 testes Node, 0 falhas/skip; integridade do canvas (835 elementos), sete boards (59/59 containers), features, inventário ExamTopics, documentação de arquitetura e catálogo de evidências.

**FAIL preexistente**: `python scripts/check-docs-migration.py` encontra cinco hashes antigos divergentes em `03-fluxos-de-estudo.md`, `05-pesquisa-e-decisoes.md`, `catalog.json`, `examtopics-inventory.md` e `analise-examtopics.md`. Não reescrever os hashes históricos para esconder a divergência: a próxima fase deve registrar transformação e proveniência.

O validador de catálogo retorna sucesso com **aviso de divergência na lista de referências quebradas**; ele também reescreve catálogo/galeria durante a execução. Esses efeitos locais foram desfeitos antes da implementação. Os 374 arquivos de mídia, 183 órfãos catalogados, 19 grupos de duplicatas, 17 JSONs de teste e 32 pares antes/depois são baseline, não regressões novas.

Referências `/mnt/project-files/` constam no inventário como externas, não recuperadas. O inventário cobre o Git; não atesta posse dos originais externos nem direitos de redistribuição. Nenhum bundle foi extraído ou republicado.

## Decisão de app e ADR

ADR 0001 segue vigente: HTML estático, sem build. `prototype/app/` é destino proposto, sem aplicação fictícia e sem cópia do HTML antigo como produto aprovado. As versões 0.1.0/0.1.1 devem ir para `archive/claude/` com seus arquivos completos, mantendo compatibilidade operacional durante a transição. Os novos releases 0.1.*, 0.2.*, 0.3.* permanecem distintos dos históricos. Não há tags/releases novos nesta fase.

## URLs e sistemas de referência — nenhuma mudança de path nesta fase

| Entrada | URL atual e de transição nesta fase | Destino proposto |
| --- | --- | --- |
| App histórico 0.1.1 | `http://localhost:8765/exam-app-0.1.1__index.html` | `prototype/archive/claude/0.1.1/exam-app-0.1.1__index.html` |
| Novo app | Não existe fonte aprovada | `prototype/app/` documentado |
| Board Mestre | `http://localhost:8765/mestre.html` | `prototype/boards/index.html` |
| Canvas | `http://localhost:8765/board-exam-app__index.html#e17000` | `prototype/boards/canvas/index.html#e17000` |
| Galeria | `http://localhost:8765/gallery.html` | `prototype/boards/06-evidencias/galerias/gallery.html` |

`board.json` permanece canônico; `BOARD.md` é regenerado. A nova evidência é documental; não representa screenshot, E2E ou validação visual executada. IDs anteriores, inclusive `e17000`, são preservados. DESIGN/MOTION/AGENTS e integrações exigidas na raiz permanecem na raiz. Ferramentas existentes não são movidas antes de validar chamadas e CI.

## Sequência restante e critérios para a próxima fase

1. Revisar e integrar primeiro o PR do hold em `dev`; proteção apenas na branch de trabalho não desliga a automação remota da `dev`. Não enviar uma migração de HTML à `dev` antes desse gate efetivo.
2. Revalidar HEAD/inventário; completar revisão semântica dos destinos propostos e de referências dinâmicas. Fechar matriz de movimentação por classes, manifesto de transformações e rollback antes de mover cada lote.
3. Migrar dados, visualizadores e documentos em lotes; ajustar geradores, links, âncoras, galeria e catálogo juntos. Nome futuro do segundo board: `02-design/`; Space é entidade de Produto, Workspace pode continuar como termo de layout histórico.
4. Migrar históricos completos e seus assets/PDFs; preservar storage/proxy e execução local, sem deploy Claude real. Não copiar o app histórico para `app/`.
5. Validar todos os geradores, inventários, hashes e diferenças baseline/resultado; rodar unitários/E2E e browser desktop/mobile, teclado e PDF. Registrar evidência real. Paths de workflows e ferramentas só mudam junto com seus consumidores.
6. Executar no Windows 11 PowerShell/Git Bash e Linux, inclusive `npm run dev`, `start`, hooks e ferramentas. CI Windows não substitui uma sessão Windows 11 comprovada. Esse ambiente de trabalho é Linux; Windows 11 ainda NÃO testado.
7. Conferir HEAD remoto e PR para `dev`; manter issue aberta até todos os critérios satisfeitos. Retomada de publicação exige revisão explícita de alvo e capabilities; nenhum Artifact público deve mudar por efeito colateral.

## Reprodução e rollback

```sh
python scripts/prototype-migration-inventory.py snapshot --ref c9356bba56bcb019e7341f32c1c3724e267b44c7 --output /tmp/issue278-reproduced.json
python -m unittest discover -s tests -p test_prototype_migration.py
npm run sync:artifact  # bloqueio esperado: exit 1, sem rede/publicação
```

`verify --manifest ...` compara bytes da árvore atual com a baseline; alterações intencionais nesta fase, como AGENTS e o board, aparecem como changed e exigem revisão do diff. Não significa que bytes alterados foram silenciosamente aprovados. O modo `--after` verifica destinos após uma futura movimentação; ainda não deve passar nesta fase.

Rollback desta fase: reverter o commit do PR, preservando logs e inventário. **Atenção:** isso restaura os escritores e o deploy automático antigos; revisar esse efeito antes de aplicar. Rollback da movimentação futura deve usar o mapa inverso com hashes, sem apagar evidências nem atualizar o Artifact. O hold só deve ser removido depois de uma decisão explícita.
