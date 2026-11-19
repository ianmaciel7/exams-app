# Método de mapeamento de fluxos (1 página)

Status: fontes consultadas por trecho de busca (não leitura integral). Itens marcados como [inferência] são decisões minhas, não citações.

## Fontes
- NN/g, "UX Maps: Glossary": define **user flow** como "o conjunto típico ou ideal de passos para completar uma tarefa comum com o produto"; **site map** (hierarquia de telas); **process map**; **wireflow** (fluxo + telas). Consultado: trecho de busca.
- NN/g, "User Journeys vs. User Flows": diferencia jornada (escopo amplo, inclui fora do produto) de fluxo (escopo dentro do produto). Consultado: trecho de busca.
- NN/g, "Information Architecture vs. Sitemaps": mapeamento de IA inclui **content inventory** (catálogo de todo o conteúdo) como primeiro passo. Consultado: trecho de busca.
- NN/g, "UX Deliverables: Glossary": **Hierarchical Task Analysis (HTA)** como decomposição de tarefa em subtarefas. Consultado: trecho de busca.
- Não consultados nesta etapa: Interaction Design Foundation, Material Design, WCAG 2.2 (estados de foco e nomes acessíveis). Ficam como pendência.

## Notação escolhida
1. **Sitemap / inventário de telas**: árvore de páginas com URL e hierarquia (`inventario-telas.md`).
2. **Inventário de componentes**: por tipo de tela, lista de elementos interativos (botão, link, filtro, paginação, aba, formulário, menu), com seu estado observado (`inventario-componentes.md`).
3. **Matriz de interações**: elemento → ação → resultado → destino (`matriz-interacoes.md`).
4. **Fluxo (user flow)**: diagrama de caminhos principais entre telas (`fluxo.md`).

## Estados a registrar por componente
Padrão, hover, foco, vazio, erro, carregando, selecionado/desabilitado. [inferência] Só registro o que consigo ver no HTML ou em captura; estados de hover, foco e carregamento exigem interação de navegador e ficam como não verificados.

## Regras de uso educado
- Poucas requisições, sem login, sem captcha, sem contornar limites. Áreas logadas fora do escopo.
- Cada tipo de página é capturado uma vez; repetições (outras provas, outras páginas de questão) são amostragem.
