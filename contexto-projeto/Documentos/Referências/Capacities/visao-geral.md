# Capacities: visão geral e funcionalidades

Fontes públicas lidas em 2026-11-19: capacities.io (home, /product, /pricing) e docs.capacities.io (/reference/object-types). Sem login. Marcações: **Confirmado** = está na página pública (fonte indicada). **Inferência** = minha leitura, não afirmada pelo produto.

## O que é
- **Confirmado** (capacities.io, home): app de notas e gestão de conhecimento que organiza ideias como **objetos conectados**, em vez de arquivos e pastas.
- **Confirmado** (metadados da home): disponível em Mac, Windows, Linux, iOS, Android e web.
- **Confirmado** (home): "Trusted by 50,000+ active knowledge workers". Número de marketing, não verificado.

## Modelo de dados: objetos e tipos
- **Confirmado** (/product, "Objects"): não se cria arquivo, cria-se **objeto** (pessoa, livro, projeto, ideia). Cada objeto tem estrutura e propriedades.
- **Confirmado** (/product): tipos personalizados ilimitados no plano Basic (/pricing: "Unlimited custom object types", Basic).
- **Confirmado** (docs, Object type reference): tipos prontos com modelo (template): Project, Person, Meeting, Organization, Area, Day, Week, Month, Book, Film, TV series, Podcast, Atomic note, Definition.
- **Confirmado** (/product): propriedades de data, avaliação, tags, links, números e caixas de seleção.
- **Confirmado** (/product): **templates por tipo**, para que novos objetos nasçam com a estrutura definida.
- **Confirmado** (/product): visualizações de lista, galeria, tabela e cartões sobre os mesmos dados.
- **Confirmado** (/product, "Media"): PDFs, fotos, gravações e links salvos são **objetos próprios** em todos os planos, não anexos.

## Links e grafo
- **Confirmado** (/product, "Networked Notes"): links bidirecionais automáticos ao mencionar um objeto pelo nome.
- **Confirmado** (/product): painel de **backlinks** em cada objeto.
- **Confirmado** (/pricing, Pro): **Related content and unlinked mentions**, ou seja, menções sem link que o app encontra.
- **Confirmado** (/pricing, tabela): **graph view** e daily notes, backlinks incluídos no **Basic (grátis)**.
- **Confirmado** (/product): tags válidas em todo o sistema, não restritas a uma base.

## Daily notes (caixa de entrada)
- **Confirmado** (/product, "Daily Notes"): uma nota por dia; captura rápida por WhatsApp, Telegram ou e-mail; linha do tempo.
- **Confirmado** (/product): cada objeto criado é carimbado com data e ligado ao dia.
- **Confirmado** (home, "Step 01"): "Your daily note is your inbox. No pressure to organize."

## Pesquisa
- **Confirmado** (/pricing, tabela): busca em texto completo no Basic.
- **Confirmado** (/pricing, Pro): busca inteligente por tipo, tag ou significado ("Smart search by type, tag, or meaning").
- **Confirmado** (/pricing, Pro): consultas inteligentes (Smart queries).

## Editor
- **Confirmado** (/product, "Editor"): editor por blocos (títulos, listas, toggles, citações, blocos de matemática, código, tabelas); atalho "/" para comandos.
- **Confirmado** (/product): embeds de imagens, PDFs, áudio e vídeo dentro da nota.
- **Confirmado** (/product): blocos de código com destaque de sintaxe e diagramas Mermaid.

## Mídia e leitura (plano Pro para análise)
- **Confirmado** (/product, "Media"): análise de imagens (texto em fotos e capturas pesquisável), PDFs com grifos e notas que apontam para a página, leitura de artigos em modo leitura, gravação de reuniões com transcrição e resumo. Marcado como Pro.
- **Confirmado** (/pricing, Pro): análise de imagem, PDF e link; integração Readwise e Kindle.

## Tarefas e calendário (Pro)
- **Confirmado** (/product, "Task management"): tarefa escrita em uma reunião ou projeto aparece no painel de tarefas, ligada à origem.
- **Confirmado** (/pricing, Pro): integração com calendário; envio de tarefas para Todoist, Things e outros.

## Quadros (whiteboards, Pro)
- **Confirmado** (/product, "Whiteboards"): cartões que são notas do próprio espaço, com linhas entre eles; o que é desenhado fica com a nota.

## IA (Pro e Believer, com orçamento mensal)
- **Confirmado** (/product, "AI Assistant"): chat ao lado de qualquer página; lê notas, segue links, busca na web; cria objetos, tarefas e consultas; edita blocos; resume, traduz e melhora textos. Mudanças exigem aprovação, salvo auto-aprovação.
- **Confirmado** (/product, "AI Connectors"): ChatGPT, Claude, Le Chat e Cursor podem ler e gravar no espaço escolhido.
- **Confirmado** (/pricing): orçamento de IA limitado no Pro; planos Pro+ e Believer+ aumentam o orçamento.

## Planos (confirmado em /pricing, 2026-11-19)
| Plano | Preço | Destaques |
|---|---|---|
| Basic | Grátis | Objetos e blocos ilimitados, tipos ilimitados, daily notes, backlinks, grafo, busca de texto, offline, exportação; mídia 5 GB e depois 100 MB por mês |
| Pro | US$ 9,99/mês (texto da página) | Quadros, tarefas, consultas, calendário, análise de mídia, versão histórica, API pública, mídia ilimitada (uso justo) |
| Believer | a partir de US$ 12,49/mês | Tudo do Pro, acesso beta a recursos novos |
- **Confirmado**: "A core product ... will remain free" (/pricing). Teste grátis do Pro dentro do app, sem cartão.
- **Confirmado**: sem plano para equipes ("designed for individuals", FAQ).

## Privacidade e dados (afirmações do próprio produto)
- **Confirmado** (/product, "Security"): servidores na UE, cópias diárias criptografadas, TLS, autenticação em dois fatores.
- **Confirmado** (/product): IA só nos espaços permitidos; provedores não treinam com o conteúdo.
- **Confirmado** (/product): exportação completa para Markdown e CSV, com links.
- **Confirmado** (home): sem investidores externos, financiado por assinaturas.

## Relevância para o Exams App (Inferência)
- Organização por objetos com tipos (Questão, Concurso, Tópico, Simulado, Edital) combina com a hierarquia que definimos (Área → Concurso → Tópico → Questões).
- Daily note como caixa de entrada pode virar "Diário de estudo" ou "Revisão do dia".
- Backlinks e "menções sem link" podem sugerir conexões entre questões erradas e tópicos do edital.
- Leitura de PDFs com grifo ligado à página é uma referência direta para o módulo de leitura.
- Cuidado: as funções de análise de mídia e IA são pagas no Capacities; no Exams App isso seria decisão de produto, não cópia.
