# Issue #32 — pesquisa verificável sobre Capacities

Data da consulta: 2026-11-15. Este relatório registra documentação e páginas públicas encontradas em fontes primárias oficiais. Uma página oficial descreve o produto; isso não equivale a observação ao vivo em uma conta. Não foram acessados app autenticado, telas privadas, nem capturas novas. Afirmações abaixo são resumos/paráfrases, não medições de pixels ou inspeção do DOM.

## Critério de evidência

- **Oficial declarado**: documentação ou página do próprio Capacities, consultada nesta data.
- **Observado no repositório**: texto de issue/PR ou documento existente no GitHub.
- **Não verificado**: depende de conta, interação ao vivo, dispositivo/plano, ou material não aberto.
- **Inferência**: interpretação explícita dos dados acima, não uma afirmação sobre implementação interna.

## Fatos sustentados por fontes oficiais

| Área | Evidência consultada | Fato declarado pela fonte | Limite |
|---|---|---|---|
| Disponibilidade | [Device support](https://docs.capacities.io/faq/general/device-support) | Web app; apps desktop para Mac, PC e Linux; apps iOS/Android para telefones e tablets. | Não inspecionei cada binário nem paridade entre plataformas. |
| Estrutura conceitual | [Organizational structures](https://docs.capacities.io/reference/organizational-structures), [Glossary](https://docs.capacities.io/reference/glossary) | A documentação distingue spaces, objects, object types, tags, collections e queries. Descreve objetos como conteúdo composto por título, propriedades e blocos; coleções agrupam manualmente objetos de um tipo, enquanto tags podem relacionar conteúdo através de tipos. | Modelo conceitual documentado, não esquema interno de banco. |
| Navegação | [Navigation](https://docs.capacities.io/reference/navigation) | Objeto pode ser apresentado como página principal, preview modal ou painel lateral; tabs têm histórico próprio; retornar restaura view, filtros e scroll. A documentação lista gestos de teclado e drag-and-drop para organizar conteúdo no painel. | Comportamento descrito oficialmente; não testado ao vivo nesta sessão. |
| Tablet | [Tablet](https://docs.capacities.io/reference/tablet) | Layout semelhante ao computador sem painel lateral direito; suporta landscape/portrait, tabs próprias, queries e offline loading; não suporta abrir dois objetos lado a lado no app. | Fonte oficial, atualidade consultada em 15-11-2026; não valida cada versão de OS. |
| Offline e sincronização | [Offline Support](https://docs.capacities.io/misc/offline-support), [Synchronization Status](https://docs.capacities.io/misc/sync) | A documentação chama o produto de offline-first: conteúdo baixado no dispositivo, edições locais e sincronização ao reconectar. Media download tem configuração própria; estado Offline & Sync informa readiness. | É declaração do fornecedor. Não testei conflito simultâneo, recuperação ou comportamento de cache; não inferir algoritmo de sync. |
| Exportação | [Export](https://docs.capacities.io/reference/export) | Há export manual/automático; export por objeto em PDF, Markdown, Word e LaTeX; views como queries, tags, collections e objetos por tipo podem exportar CSV. A disponibilidade de mídia no export depende de ela estar baixada. | Não prova export round-trip sem perda. A mesma documentação deve ser lida integralmente antes de especificar cobertura exata. |
| Whiteboards | [Whiteboards](https://docs.capacities.io/reference/whiteboards) | Whiteboard é um tipo de objeto de canvas infinito; cards podem representar objetos existentes, com shapes/texto/linhas no quadro. A página declara disponibilidade de edição em Pro/Believer e suporte em telefone, tablet e computador; melhor experiência em computador. | Recurso oficial descrito; não observei UI, gestos ou diferenças detalhadas por dispositivo. |
| Propriedades | [Object Properties](https://docs.capacities.io/reference/object-properties), [Properties](https://docs.capacities.io/reference/properties) | Propriedades podem ligar-se a tipos de objeto via dropdown; documentação cita tipos de valor e configurações/limites. | Não reproduzir a lista completa sem abrir a documentação por seção; comportamento de migração de esquema não foi testado. |
| Planos e preços | [Pricing](https://capacities.io/pricing) | Página lista Basic gratuito, Pro e Believer; anuncia sincronização, tipos personalizados, import/export e full-text search no Basic; Pro inclui tarefas, AI assistant, integrações de calendário, smart queries e API. Também descreve orçamento mensal de IA e add-on. | Valores mudam por região/moeda e tempo; registrar preço apenas em nova consulta datada. Não assumir que checkout/localização mostra USD. |
| IA | [AI Assistant](https://docs.capacities.io/reference/ai-assistant), [AI and Privacy](https://docs.capacities.io/more/ai-privacy) | Documentação lista chat com notas, pesquisa em full-text search e ações como análise de mídia/autofill; página separada descreve provedores e compartilhamento de dados. | Não inferir consentimento, retenção ou tratamento além do texto específico da política. Requer auditoria granular por função/provedor e plano. |
| Importação | [Bulk Import Reference](https://docs.capacities.io/reference/bulk-import) | Página declara que importação não foi projetada como migração integral sem perdas e descreve limites/estados de erro; alguns sufixos/âncoras de arquivo são ignorados. | Não testei lote real nem fidelidade de links/propriedades. |

## Repositório e evidências anteriores

- **Observado no texto da issue #32**: corpo e dois comentários, consultados diretamente via GitHub em 2026-11-15. A issue se declara como inventário ainda por pesquisar. O comentário visual já cita uma captura na documentação oficial e uma imagem de terceiro; trata corretamente a última como evidência estática, não da física do grafo.
- **Observado em AGENTS.md na branch dev**: exige que evidências sejam persistidas no board e issue/PR e que não se declare inspeção/tela sem captura verificável. Para este relatório documental sem captura nova, não atribuo observação visual.
- **Observado no BOARD.md e DESIGN.md da dev**: projeto já usa conceitos de três painéis, objetos/tipos/propriedades, grafo e inspiração Capacities; board menciona esses itens como roadmap/decisões/propostas e o DESIGN.md descreve tokens/regras do Exam App. Isso é estado/proposta do Exam App, não prova de paridade com Capacities.
- **PR #61** (descrição consultada na busca de PRs): reporta dossiê comparativo anterior entre app Capacities ao vivo, shell atual e arquivos históricos, com screenshots e issues. Seu escopo cobre auditoria pontual anterior; esta issue #32 pede catálogo atualizado, pesquisa temática e fontes rastreáveis.
- **PR #73** (descrição consultada na busca de PRs): reporta blueprint de painel lateral/grafo baseado em issues de engenharia e auditoria QConcursos. Blueprint/requisitos do nosso projeto não equivalem a medições confirmadas do produto.
- **PR #93** (descrição consultada na busca de PRs): traz implementação do rodapé de sidebar “inspirado” em Capacities. Isso é uma adaptação no Exam App, não evidência de comportamento atual do Capacities.
- Limite desta revisão: li as descrições de PRs encontradas e documentos citados; não revisei aqui todos os diffs, screenshots anexos, comentários e issues históricas relacionadas. Não afirmo que os PRs estejam completos, corretos ou que as capturas persistidas representem a versão atual.

## Lacunas objetivas para a próxima rodada

1. **Observação ao vivo com sessão válida**: screenshots verificadas (>10 KB e inspeção visual) e notas textuais/URL para sidebar, home/space, object type, objeto, propriedades, coleção/query, busca, graph/Explore, painel, whiteboard, estados de erro e offline. Registrar device, viewport, tema, data e plano.
2. **Mobile / tablet**: testar tasks comparáveis com desktop e documentar diferenças observadas em vez de generalizar docs entre OS.
3. **Grafo**: documentação pública/visual disponível ainda não prova transições animadas, persistência de layout, física, performance, nós órfãos, zoom nem redução de movimento. A imagem de terceiro no comentário #32 é estática. Manter algoritmo interno como desconhecido.
4. **Objetos e esquema**: testar criar/renomear tipos e propriedades, modificar cardinalidade, alterar tipo de dado, excluir propriedade e efeitos em filtros/templates/objetos existentes.
5. **Queries/collections**: confirmar semântica, tipos de objetos suportados, limites, salvar/compartilhar e escopo de filtros na UI atual.
6. **Fidelidade de dados**: experimentar ciclo import → editar → export com relações, block refs, mídia e identificadores, incluindo export/import em outro space; não chamar de portabilidade perfeita sem comparação.
7. **Sync e conflito**: duas sessões/dispositivos offline/online, conflito simultâneo, readiness e restauração, somente com dados descartáveis e autorização apropriada. As páginas oficiais não substituem esses testes.
8. **IA / privacidade**: extrair a matriz exata feature→provedor→dados enviados→retenção/treinamento indicada pela política, limites de plano, orçamento e consentimento. Não alegar proteção sem citação literal e contexto.
9. **Concorrentes e reviews**: ainda sem pesquisa de terceiros neste relatório; reunir avaliações datadas e tratar experiências como relatos, não fatos universais.
10. **Paridade Exam App**: auditar implementação atual no commit escolhido, em seguida preencher matriz recurso→equivalente real→lacuna→dependência→adaptação para estudo→critério. BOARD.md atual contém propostas e estados mistos; não serve sozinho como auditoria do código.

## Conclusões de escopo

**Declarado oficialmente**: Capacities hoje documenta espaços e objetos tipados, três modos de abrir objetos, suporte multiplataforma, offline, exports, queries/collections, whiteboards e recursos de IA/planos.

**Não verificado nesta rodada**: aparência e comportamento atuais em sessão autenticada; cada fluxo; diferenças por versão/plano/OS; comportamento de grafo em movimento; paridade entre docs e app; qualquer arquitetura técnica interna.

**Inferência para o Exam App**: conceitos de objeto/tipo/propriedades e abertura contextual podem servir como referência de modelagem e navegação, mas cada adaptação deve preservar o fluxo de resolver/revisar questões. Não transportar sidebar, tokens, nomes de produto, conteúdo, layouts medidos ou código proprietário. Essa recomendação decorre da diferença entre os casos de uso e das regras já registradas no repositório; não é funcionalidade do Capacities.

## Referências principais

Fontes oficiais abertas nesta consulta: [device support](https://docs.capacities.io/faq/general/device-support), [organizational structures](https://docs.capacities.io/reference/organizational-structures), [glossary](https://docs.capacities.io/reference/glossary), [navigation](https://docs.capacities.io/reference/navigation), [tablet](https://docs.capacities.io/reference/tablet), [offline](https://docs.capacities.io/misc/offline-support), [sync status](https://docs.capacities.io/misc/sync), [export](https://docs.capacities.io/reference/export), [whiteboards](https://docs.capacities.io/reference/whiteboards), [object properties](https://docs.capacities.io/reference/object-properties), [properties](https://docs.capacities.io/reference/properties), [pricing](https://capacities.io/pricing), [AI assistant](https://docs.capacities.io/reference/ai-assistant), [AI privacy](https://docs.capacities.io/more/ai-privacy), [bulk import](https://docs.capacities.io/reference/bulk-import).

Fontes internas observadas: [issue #32](https://github.com/ianmaciel7/exams-app/issues/32), [PR #61](https://github.com/ianmaciel7/exams-app/pull/61), [PR #73](https://github.com/ianmaciel7/exams-app/pull/73), [PR #93](https://github.com/ianmaciel7/exams-app/pull/93), [BOARD.md](https://github.com/ianmaciel7/exams-app/blob/dev/prototype/BOARD.md), [DESIGN.md](https://github.com/ianmaciel7/exams-app/blob/dev/DESIGN.md), [AGENTS.md](https://github.com/ianmaciel7/exams-app/blob/dev/AGENTS.md).
