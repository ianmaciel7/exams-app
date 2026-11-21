# Matriz de seleção de modelos

Para cada pergunta, o modelo recomendado, quem usa, a fonte canônica, o custo de manter e quando **não** usar.

| Pergunta | Público | Modelo | Fonte canônica | Custo de atualização | Por que | Quando NÃO usar |
| --- | --- | --- | --- | --- | --- | --- |
| Como o sistema é organizado por fora? | Produto, eng. nova | C4 L1 (contexto) | Código + `prototype/c4.md` | Baixo | Mostra atores e sistemas externos sem detalhe interno | Para detalhar funções |
| Quais partes existem e como falam? | Eng. | C4 L2 (containers) | Código do protótipo | Médio | Separa runtime, armazenamento e capacidades | Quando não há separação real (o protótipo é um único HTML) |
| Quais componentes internos? | Eng. | C4 L3 | Código verificado | Alto | Só para módulos com fronteira real | Enquanto o código é um arquivo único sem módulos |
| Que objetos e relações existem? | Produto, eng., conteúdo | ER / tabela de tipos | `TYPES` em `index.html` | Baixo | Mostra Espaço → Objeto → Tipo e propriedades | Para regras de UI |
| Quais jornadas o usuário faz? | Produto, UX | Story map | Capturas e issues fechadas | Médio | Organiza por esforço do usuário | Para status de entrega |
| Que estados um objeto pode ter? | Eng., QA | Diagrama de estados | Código (ex.: estado do simulado) | Baixo | Explicita transições e erros | Para estados de servidor que não existem |
| Por que decidimos X? | Todos | ADR | Decisão + data + PR | Baixo (imutável) | Preserva contexto; nunca reescrever, só substituir | Para decisões ainda abertas (use issue) |
| Como usar o app? | Usuário final | Diátaxis (tutorial, how-to, referência, explicação) | Código e features | Médio | Separa os quatro tipos de conteúdo | Para roadmap |
| O que entra na próxima versão? | Produto | Opportunity Solution Tree | Issues e metas | Médio | Liga resultado → oportunidade → solução | Para lista de tarefas |
| O que construir primeiro? | Produto, eng. | User Story Mapping | Jornadas | Médio | Prioriza por fatia de valor | Para dependências técnicas |
| O que está planejado e entregue? | Todos | GitHub Issues, PRs, Milestones, Releases, Projects | GitHub (fonte de status) | Baixo | Status vem do GitHub, não de documento | Não duplicar status em Markdown |
| Diagrama no repositório? | Eng. | Mermaid | Texto versionado | Baixo | Diff legível, sem binário | Layout complexo: use SVG exportado com origem |
| Modelo de arquitetura editável por equipe? | Arq. | Structurizr DSL | — | Alto | Gera vistas consistentes | Sem ferramenta adotada no repo: não usar |

Fontes primárias para cada modelo: C4 (c4model.com), arc42, Diátaxis (diataxis.fr), ADR (Michael Nygard), Opportunity Solution Tree (Teresa Torres), User Story Mapping (Jeff Patton), GitHub Projects e Releases (docs.github.com), Mermaid (mermaid.js.org), Structurizr (structurizr.com).

Observação: as descrições acima são critérios de escolha, não resumos verificados das fontes. Antes de citar uma definição formal em outro documento, consulte a fonte primária.
