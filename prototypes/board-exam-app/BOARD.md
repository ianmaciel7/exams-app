# Board Exam App

> Gerado de `board.json` por `board_to_md.py`. Fonte da verdade: `board.json`. Ordem de leitura: de cima para baixo, da esquerda para a direita. Cada seção corresponde a uma seção (container) do quadro.

# Exam App

### App para estudar para exames: certificações (estilo ExamTopics) ou concursos. Sem foco fixo.

## 8. Layout de três painéis (Three-Pane Workspace)
<!-- container e500 @ (3300,-1000) -->

> **Esquerda: sidebar**
> navegação global, recolhível; espaços, tipos, fixados, busca e criar
> nova opção Gráfico (abre o grafo completo, estilo Capacities)
> 
> **Centro: área principal**
> barra superior com voltar/avançar, abas independentes (histórico e estado próprios) e botão nova aba
> estados de carregando, vazio e erro
> 
> **Direita: painel contextual**
> barra própria, abas independentes e botão +
> visões: Explorar, Gráfico, Backlinks, Relacionados, Assistente de IA
> visões empilhadas e redimensionáveis; ocultar e reabrir (Ctrl+\)

> **Regras de interação**
> abrir no painel não substitui a visão principal
> Ctrl/⌘+clique: nova aba; Shift+clique: painel lateral
> Alt+←/→: histórico da aba; Alt+T nova aba; Alt+W fecha aba; Esc fecha painel
> 
> **Responsivo**
> desktop largo: três regiões
> ≤1100px: sidebar vira gaveta e o painel vira sobreposição
> ≤820px: painel vira folha inferior
> 
> Regra visual: um único ambiente integrado, não três páginas

> **Roadmap**: layout de três painéis + Gráfico na sidebar entregue na 0.1.1. Pendente: refinos de fluidez e revisão do Ian.

## Feito
<!-- container e47 @ (0,230) -->

- Leitor de PDF com sidebar, busca e menus
- Documentos com + e ⋯ no hover (estilo Capacities)
- Ordenar manual ou alfabético
- Sem % de leitura nos PDFs
- Configurações com tema e zoom
- Espaço "Concurso de TI"
- Quadro só com PDFs
- Gabarito conferido e 70 questões extraídas

## Em andamento
<!-- container e48 @ (510,230) -->

- Modelar as entidades do app (diagrama abaixo)
- Adotar "tudo é um Objeto" (tipo e propriedades)
- Decidir onde ficam as questões
- Testar as telas no celular

## Pendente
<!-- container e49 @ (1020,230) -->

- Questões, simulado e revisão no app
- Metas
- Documentos de leitura com % de progresso (estilo Reader e Kindle)
- Espaços: criar, excluir (30 dias) e exportar
- Guardar o progresso na conta
- Extrair os cadernos tipo 2, 3 e 4
- Mostrar as figuras da prova junto do texto

## 0.1.0
<!-- container e4 @ (0,580) -->

### Documentos

![imagem e5](assets/inline-e5.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#edital))

![imagem e6](assets/inline-e6.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#ret1))

![imagem e7](assets/inline-e7.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#ret2))

![imagem e8](assets/inline-e8.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#cronograma))

![imagem e9](assets/inline-e9.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#tipo1))

![imagem e10](assets/inline-e10.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7#gabarito))

Edital de abertura

1ª retificação

2ª retificação

Cronograma

Caderno tipo 1

Gabarito preliminar

### Entidades

### Protótipo versão 1

> **Espaço**
> nome e ícone
> dono (conta)
> isolado: nada cruza entre espaços
> Ex.: Concurso de TI

> **Documento (PDF)**
> título
> classe: referência (fonte de verdade, sem % de leitura) ou leitura (com % de progresso, estilo Reader e Kindle)
> categoria: edital, retificação, cronograma, prova, gabarito
> arquivo
> espaço
> progresso e posição: só em leitura

![imagem e44](assets/inline-e44.jpg) ([abrir](https://claude.ai/artifact/X3QEzX9BgrXsTjySqSBnx7))

## 0.1.1
<!-- container e149 @ (1580,580) -->

### Protótipo 0.1.1

![imagem e151](assets/inline-e151.jpg) ([abrir](https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC))

Tipos de Objeto na 0.1.1:
- Concurso, Órgão, Banca, Edição, Cargo
- Arquivo → Documento → PDF
- Questão, Disciplina, Simulado
Barra lateral: seções livres ou por tipo, plural por padrão, arrastar para ordenar. Fixar só pelo menu ⋯.

Filtro de questões (0.1.1): botão Filtrar com popover pesquisável, vários valores por categoria (Banca, Disciplina, Edição, Origem, Situação), chips removíveis, busca por palavra, total filtrado de total e Limpar tudo. Mesmo componente na página do tipo Questão e nas abas Questões de Concurso, Edição e Cargo.

## 1. Estrutura: Espaço, Objeto e Tipo de Objeto
<!-- container e52 @ (0,1500) -->

> **Espaço (Space)**
> nome e ícone
> dono (conta)
> isolado: sem links nem busca entre espaços
> ao_abrir: onde parei, calendário ou objeto
> excluído_em (30 dias para restaurar)
> exportação: manual ou automática

> **Objeto (Object)**
> título
> espaço
> tipo de objeto
> conteúdo (quando houver)
> propriedades padrão: aliases, descrição, ícone, etiquetas, criado_em

> **Tipo de Objeto (Object Type)**
> nome e ícone
> lista de definições de propriedade
> Pode estender outro tipo e herdar suas propriedades
> Ex.: Arquivo → Documento → PDF

> **Definição de Propriedade (Property Definition)**
> nome
> tipo de valor: texto, número, caixa, data e hora, relação
> origem: padrão do sistema ou adicional

> **Valor de Propriedade (Property Value)**
> objeto
> definição
> valor (pode ficar vazio)

## 5. Referências (de onde tiramos as informações)
<!-- container e107 @ (1580,1500) -->



## 8. Análise ExamTopics → banco de questões
<!-- container e190 @ (3200,1500) -->

Análise (sem implementação). Aproveitar: busca, filtros básicos, chips ativos, total global x filtrado, paginação, por página, ordenação, estado na URL. Melhorar: unificar as duas listas de questões em um componente. Adicionar (condicionado a dados): tipo, dificuldade (derivada do desempenho), assunto, com imagem, com explicação, filtros salvos. Descartar: votos da comunidade, discussões, gabarito por votação.

[Análise ExamTopics: funcionalidades para o banco de questões](https://claude.ai/artifact/5qJgzuASzvMgdcoLDqbXZP)

Decisões pendentes (3): listadas no fim do documento. Nada foi alterado na 0.1.1.

## 9. Análise QConcursos → banco de questões
<!-- container e400 @ (3760,1500) -->

Análise (sem implementação), coerente com a do ExamTopics. O que o QConcursos acrescenta: Cadernos (Coleção que guarda questões fixas) e Filtros salvos (Visão que guarda critérios), 5 níveis de dificuldade (derivados do desempenho do próprio usuário), exclusões (já resolvidas, em simulados, anuladas, desatualizadas), histórico (resolvidas, acertei, errei) e modalidade. Filtros: E entre categorias, OU dentro de uma; só aparecem com 2 ou mais valores. Simulado personalizado a partir de filtro ou caderno. Descartar: comentários, votos, ranking e cópia da interface.

[Análise QConcursos: funcionalidades para o banco de questões](https://claude.ai/artifact/7AZNibg2dJCUmDEZb9ScLt)

Decisões pendentes (4): listadas no fim do documento. Nada foi alterado na 0.1.1.

## QConcursos
<!-- container e108 @ (1604,1562) -->

![imagem e109](assets/inline-e109.jpg)

![imagem e110](assets/inline-e110.jpg)

> **Estudo do usuário**
> usuário tem: prova salva, resumo, pasta, caderno, anotação,
> marcação, filtro salvo, comentário, simulado e curso
> caderno, anotação e marcação apontam para questão
> simulado → tentativa → resposta e resultado → estatísticas
> curso → progresso e trilha de estudos → aula → material didático

> **Conteúdo e questão**
> concurso: segmento, órgão e banca → edital, cargo e prova
> disciplina → assunto → questão; prova → questão
> opcionais: área de formação e de atuação, legislação, texto associado
> questão: modalidade, alternativas, gabarito, gabarito comentado,
> comentários, nível, dificuldade, situação e ano

![imagem e114](assets/inline-e114.jpg)

> **Questão em 4 grupos**
> metadados: prova ou concurso, disciplina e assunto, modalidade e dificuldade, situação
> conteúdo: texto associado, enunciado, alternativas ou itens, imagens e anexos
> correção: gabarito, explicação, comentários
> estudo: respostas do usuário, anotações, marcações, cadernos, aulas, estatísticas

## 2. Tipos de Objeto do app e suas relações (a seta aponta para o objeto relacionado)
<!-- container e104 @ (0,2140) -->

> **Etiqueta (Tag)**
> título (o assunto)
> sem texto livre
> objetos com a etiqueta: automático
> (vem da propriedade padrão etiquetas)

> **Edição (Edition)**
> concurso (relação)
> título e ano (ex.: Dataprev 2026)
> banca (relação)
> tipo (rótulo): concurso ou certificação
> documentos, cargos e provas: automático

> **Coleção (Collection)**
> título
> tipo de objeto (relação)
> membros: objetos desse tipo
> manual, sem aninhar
> visibilidade: privada ou pública
> Ex.: caderno de questões

> **Meta (Goal)**
> tipo: nota, % de acerto, questões, revisões em dia
> valor alvo
> período
> progresso

> **Documento (Document)**
> estende: Arquivo
> classe (rótulo): referência ou leitura
> categoria (rótulo): edital, retificação, prova...
> leitura: local, progresso e última posição
> idioma e nota do documento (conteúdo)
> edição e cargo (relações)

> **Prova (Exam Paper)**
> edição (relação)
> cargo (relação)
> ano e data de aplicação
> caderno: tipo 1, 2, 3 ou 4
> questões: automático

> **Simulado (Mock Exam)**
> edição e cargo (relações)
> ano
> questões em ordem
> tempo limite e modo: prova ou estudo
> tentativas: histórico de respostas e resultado

> **Disciplina (Subject)**
> título
> disciplina pai (relação, para o assunto)
> ordem
> questões: automático

> **Alternativa (Option)**
> título: texto da alternativa
> rótulo (letra A a E)
> imagem (opcional)
> correta (caixa)
> questão (relação)
> ordem

> **Questão (Question)**
> enunciado e instrução (conteúdo)
> formato: única, múltipla, certo/errado, lacuna
> gabarito e anulada (caixa)
> gabarito comentado (conteúdo)
> dificuldade e situação (rótulos)
> **origem (Source): Oficial, Gerada por IA ou Manual (rótulo); Oficial liga ao PDF da prova e à edição**
> ano (número)
> disciplina, banca, órgão, edição e cargo (relações)

> **Resposta (Answer)**
> questão (relação)
> simulado (relação, opcional)
> alternativa marcada
> acertou (resultado)
> respondida em

> **Cartão de revisão (Review Card)**
> questão de origem (relação)
> formato: pergunta e resposta ou lacuna
> frente e verso
> próxima revisão
> histórico: data e resposta
> resposta: esqueci, difícil, bom, fácil

> **Órgão (Agency)**
> título e sigla
> concursos: automático
> edições: automático
> (ex.: Dataprev)

> **Concurso (Contest)**
> título (ex.: Dataprev)
> órgão (relação)
> banca (relação)
> segmento (rótulo)
> edições: automático
> recorrente: uma Edição por ano

> **Banca (Exam Board)**
> título (ex.: FGV)
> concursos: automático
> edições: automático

> **Cargo (Position)**
> edição (relação)
> título (ex.: Analista de TI · Desenvolvimento de Software)
> vagas, remuneração e conteúdo
> prova e gabarito: automático

Relação é escrita em um lado só (a seta sai de quem guarda); o lado de volta é automático. Edição aponta para Concurso e Cargo aponta para Edição (setas omitidas para não cruzar). Etiqueta, Meta e Arquivo não têm seta.
Título, aliases, descrição, ícone, etiquetas e criado_em já existem em todo objeto. Verde: já é Tipo de Objeto na 0.1.1. Azul: futuro.

## ExamTopics
<!-- container e116 @ (1604,2562) -->

![imagem e117](assets/inline-e117.jpg)

> **Fluxo de questões**
> fornecedor → exame → tópico → questão
> questão tem: enunciado, imagem (exhibit),
> alternativas ou áreas de resposta,
> resposta sugerida, votação da comunidade e discussão
> discussão → comentários
> comentário tem: usuário, resposta selecionada, votos positivos
> 
> Já temos no modelo: fornecedor em Exame, exame → tópico → questão, alternativas.

> **Questão (Question): campos da página (v109)**
> métricas calculadas das Respostas: tentativas, acertos, erros, % de acerto, sequência, última resposta, alternativa errada mais marcada, simulados que a incluíram
> situação (rótulo): nunca respondida, acertei, errei ou para revisar
> para revisar e favorita (marcações)
> anotações (conteúdo)
> gabarito oficial (letra) com link ao PDF do gabarito
> posição na lista e questões relacionadas por disciplina
> falta: tempo médio, etiquetas

## Readwise
<!-- container e119 @ (1604,3102) -->

![imagem e121](assets/inline-e121.jpg)

![imagem e122](assets/inline-e122.jpg)

![imagem e124](assets/inline-e124.jpg)

> **Readwise em 4 diagramas**
> leitura (Reader): documento, vindo de fonte ou feed RSS, tem
> tag, destaque, anotação e progresso de leitura
> destaque: posição, texto destacado, nota e tag
> aprendizado (Highlights): destaque importado → anotação, tag,
> revisão e mastery
> biblioteca: tags, visualizações filtradas (consulta) e documentos
> revisão: destaque → cartão mastery (pergunta e resposta ou lacuna)
> → evento de revisão → avaliação de memorização
> 
> Já temos: documento de leitura com progresso, cartão de revisão, etiqueta.
> Destaque fica só como referência por enquanto.

![imagem e123](assets/inline-e123.jpg)

## 3. Hierarquia de tipos (herança)
<!-- container e99 @ (0,3340) -->

> **Arquivo (File)**
> título
> formato (MIME)
> tamanho
> checksum

> **Documento (Document)**
> estende: Arquivo
> classe: referência ou leitura
> categoria: edital, prova...
> progresso: só em leitura

> **PDF**
> estende: Documento
> nº de páginas
> camada de texto (busca)
> modo: original ou texto
> zoom e página atual

A seta vai do tipo base para o que o estende.
O filho herda as propriedades do pai e acrescenta as suas.
Cada objeto tem um único tipo: o mais específico (ex.: PDF).

## 4. Glossário das entidades
<!-- container e95 @ (0,3820) -->

| Termo | Significado |
| --- | --- |
| Espaço (Space) | Ambiente independente de uma conta. Nada cruza entre espaços: sem links nem busca. |
| Objeto (Object) | Unidade individual de informação: título, tipo, propriedades e conteúdo. Pertence a um Espaço. |
| Tipo de Objeto (Object Type) | Categoria do objeto (Documento, Questão, Edição...). Define quais propriedades ele tem. |
| Título (Title) | Nome principal do objeto, o que o usuário vê. |
| Conteúdo (Content) | Corpo principal do objeto, quando existe (ex.: anotações). |
| Propriedade (Property) | Característica que descreve o objeto de forma estruturada. |
| Definição de Propriedade | Diz o que a propriedade guarda (ex.: banca é texto). Compartilhada por todos os objetos do tipo. |
| Valor de Propriedade | A informação guardada em um objeto (ex.: banca = FGV). Pode ficar vazio. |
| Propriedade padrão (Default) | Fornecida pelo sistema: título, aliases, descrição, ícone, etiquetas e data de criação. |
| Propriedade adicional (Normal) | Criada para o tipo: texto, número, caixa de seleção, data e hora ou relação. |
| Relação (Relation) | Propriedade que aponta para outro objeto (ex.: Questão aponta para Edição). |
| Tipo de Objeto Básico | Predefinido pelo sistema (ex.: Documento). Oferece estrutura padrão para documentos, sem personalização. |
| Tipo de Objeto Personalizado | Criado pelo usuário conforme necessário (ex.: Questão, Concurso, Meta). Cada tipo guarda propriedades únicas. |
| Nome singular e plural | Cada tipo tem nomes singular e plural (ex.: Questão / Questões, Edição / Edições) para exibição na interface. |
| Todo Objeto possui um Tipo | Relação fundamental: cada objeto sempre pertence a exatamente um tipo, que define sua estrutura e propriedades. |
| Tipo de Propriedade | Determina como o valor é armazenado e interpretado. Tipos: Texto, Número, Caixa de Seleção (true/false), Data e Hora, Rótulo (seleção única/múltipla), Conteúdo com Blocos, Imagem de Capa, Seleção de Objetos (para relações). |
| Herança (Estende) | Um Tipo de Objeto pode estender outro e herdar suas propriedades, acrescentando as suas. Ex.: PDF estende Documento, que estende Arquivo. O objeto continua com um único tipo (o mais específico). |
| Texto (Text) | Informação textual, simples ou formatada. Endereços (URL) também ficam em Texto. Ex.: autor = Maria Silva. |
| Número (Number) | Valores numéricos: quantidades, preços, pontuações. Códigos e identificadores sem sentido de quantidade ficam em Texto. |
| Caixa de Seleção (Checkbox) | Marcado (true) ou desmarcado (false). Desmarcado ainda é um valor, não é vazio. Ex.: acertou. |
| Data e Hora (Datetime) | Uma data, data com horário ou intervalo de datas. Ex.: data da prova. |
| Rótulo (Label) | Escolha entre opções predefinidas, de seleção única ou múltipla. Ex.: dificuldade = difícil. |
| Conteúdo (Content) | Área estruturada com Blocos, não só um texto. Ex.: anotações, explicação de uma questão. |
| Seleção de Objetos (Object Select) | Propriedade que referencia outros objetos de um tipo definido. É a forma da Relação. |
| Alterar valor vs. definição | Mudar um valor afeta só aquele objeto. Mudar a definição (nome, tipo) afeta todos os objetos do tipo. |
| Etiqueta (Tag) | Palavra-chave que diz sobre o que o objeto trata (ex.: #python). É um objeto de tipo próprio, reutilizável e sem texto livre. |
| Etiqueta do objeto / do bloco | Do objeto: classifica o objeto inteiro. Do bloco: classifica um trecho do texto com #. |
| Página da Etiqueta (Tag Page) | Lista os objetos ligados à etiqueta, de qualquer tipo. É uma visão, não um documento para escrever. |
| Etiqueta vs. Tipo de Objeto | O tipo diz o que a informação é (Livro). A etiqueta diz sobre o que ela trata (Python). Aplicar etiqueta não move nem duplica o objeto. |
| Coleção (Collection) | Grupo manual de objetos de um único tipo (ex.: PDFs para Estudar). Um objeto pode estar em várias coleções, sem cópia. |
| Participação na Coleção | Liga um objeto a uma coleção. Remover o objeto da coleção não o exclui. Coleção não contém outra coleção. |
| Coleção vs. Etiqueta | Coleção: grupo manual, de um só tipo. Etiqueta: assunto, de qualquer tipo. Coleção não é propriedade do objeto. |

## 6. Decisões de modelagem (boas práticas)
<!-- container e152 @ (0,5310) -->

1. Alternativa é objeto próprio: guarda letra, texto, correta e estatística (% que marcou), como no QConcursos.
2. Resposta pode existir sem Simulado (questão resolvida avulsa ou na revisão). Simulado é opcional.
3. Cartão de revisão nasce de uma Questão ou de uma Nota. Um cartão por origem; guarda agendamento (próxima data, intervalo, facilidade).
4. Concurso → Edição → Cargo. Concurso é recorrente (Dataprev), Edição é cada ano (Dataprev 2026) e Cargo guarda prova, gabarito, vagas e conteúdo. Certificação é uma Edição (AZ-104). Prova = cada caderno do Cargo.
5. Disciplina é um tipo próprio, reaproveitado entre Edições (Português serve para vários concursos). Órgão e Banca também são tipos, não texto.
6. Meta: métrica (acerto %, nº de questões, nota em simulado, dias seguidos), alvo, período (dia/semana/mês), prazo e escopo opcional (Edição ou Disciplina).
7. Progresso de leitura fica no próprio Documento (só para categoria leitura). Referência não tem progresso.
8. Sem Destaque: trecho importante vira uma Nota que aponta para o Documento (com página/posição) e pode gerar Cartão.
9. Visualização filtrada (filtro salvo) fica para depois; Coleção já cobre o caderno manual.
10. Questão, Disciplina e Simulado já são tipos na 0.1.1 (70 questões da Dataprev).

## 7. Roadmap de versões (cada versão entrega uma camada do modelo)
<!-- container e154 @ (0,6000) -->

> **0.1.0 (feito)**
> Protótipo 1
> leitura e referência
> documentos, PDF, edital e gabarito

> **0.1.1 (feito)**
> Protótipo 2
> barra lateral com seções livres ou por tipo, nomes no plural, ordem por arrastar
> Concurso → Edição → Cargo, Órgão e Banca como tipos
> Cargo herda a Banca da Edição
> Arquivo → Documento → PDF
> Questão, Disciplina, Simulado e Resposta como tipos

> **0.2.0 (quase pronta)**
> Questões reais
> 70 questões do Dataprev 2026 como objetos, com filtros e navegador
> Simulado com tentativas e histórico
> Seção Desempenho
> Falta: gabarito por cargo

> **0.3.0**
> Organização
> Coleção (caderno) e Etiqueta
> disciplina e assunto
> listas filtradas, todo item é link

> **0.4.0**
> Estudo e revisão
> Cartão de revisão
> Meta e estatísticas

> **0.5.0**
> Leitura
> Documento de leitura com progresso %
> notas a partir do Documento
> referência sem progresso

> **1.0.0**
> Certificações e conta
> fornecedor e edição no estilo ExamTopics
> questões criadas pelo usuário
> exportar e restaurar o espaço

## 11. Camada de IA (Claude no protótipo 0.1.1)
<!-- container e410 @ (1580,6000) -->

### IA em 3 pontos do estudo

O protótipo chama o Claude direto, sem chave de API: o artefato usa a capacidade `sample`, na conta de quem abre. Se a IA não estiver disponível, os botões somem e o app segue igual.

> **Explicar com IA**
> Depois de responder: por que a certa está certa e as outras erradas, com macete. Na página da Questão.

> **Criar cartões**
> 3 cartões frente e verso a partir do conceito da questão. Dá para copiar.

> **Sugerir o que revisar**
> Lê o Desempenho e lista disciplinas (com link), motivo e ação.

**Próximos passos** (entram no roadmap, bloco 7)

> **0.4.0**
> Cartões gerados vão para a Revisão; assistente de estudo com a meta do dia.

> **0.5.0**
> Destaque em documento vira nota ou cartão; resumo do Documento.

> **1.0.0**
> Sugerir Disciplina e Assunto; gerar questões do próprio Documento.

## 8. Diretrizes de UI/UX (aplicadas na 0.1.1)
<!-- container e162 @ (0,6500) -->

> **Ordem de prioridade**
> 1. Organização visual
> 2. Acessibilidade (WCAG AA)
> 3. Densidade e espaçamento compactos
> 4. Estados: carregando, vazio, erro com nova tentativa
> 5. Manter todas as funções
> Resumo completo: referencias/diretrizes-ui-ux-2026.md

> **Feito na 0.1.1**
> Contraste ajustado nas cores de texto
> Link de pular para o conteúdo e rótulos de navegação
> Migalhas no lugar de caixas repetidas
> Navegação de seções fixa no topo
> Botão Continuar leitura (página x de y)
> PDF com limite de tempo e botão Tentar de novo
> Movimento reduzido respeitado
> **Falta:** banco de questões, filtros e simulados (ainda não existem)

> **2ª diretriz: estados, feedback e erros**
> Nem todo estado é erro (vazio, sem resultados, lento)
> Mensagem: o que houve, impacto, o que fazer
> Toast só para evento curto; erro tem ação de recuperar
> Sempre timeout, nunca carregamento infinito
> Resumo: referencias/diretrizes-estados-feedback-erros.md

> **Feito na 0.1.1**
> Carregando com aviso de demora e cancelar
> Erro de PDF explica causa e mantém o ponto de leitura
> Tentar de novo ou ir ao Quadro
> Documento não encontrado (link errado)
> Busca sem resultados com dica
> Aviso de sem conexão e de conexão de volta
> Toasts de erro ficam mais tempo
> **Falta:** erro inline em formulários, confirmação com diálogo próprio, estado desatualizado

> **3ª diretriz: componentes e padrões de interação**
> Escolher componente pela finalidade, não pela aparência
> Página, dialog, alert dialog, drawer, tabs vs navegação
> Ação destrutiva usa alert dialog com consequência clara
> Não mexer no código só porque o documento existe
> Resumo: referencias/diretrizes-componentes-interacao.md

> **Revisão das 3 diretrizes na 0.1.1 (feita)**
> Confirmações com alert dialog, foco seguro no cancelar e foco devolvido
> Erro de campo inline com aria-invalid
> Chips de filtros ativos nas questões, com contagem anunciada
> Teclado de árvore na barra lateral
> Contraste do botão principal e alvos de 24 px corrigidos
> Idioma pt-BR declarado
> **Falta:** role=tree completo, textos e datas com Intl, skeleton de carregamento

## 9. Prints do Ian e feedback (cada imagem com legenda e versão)
<!-- container e300 @ (0,7700) -->

### Redesign das páginas de objeto: antes e depois (0.1.1)

Prints em /mnt/project-files/prints/redesign-paginas-objeto/

![imagem e303](assets/467eb8f7f105cfc51e345390bbecd9c4.png)

![imagem e305](assets/b7e3a67f5e62b599877bb5b3174ea4c0.png)

Capturas enviadas por Ian durante a revisão da 0.1.1, em 12 e 13/11.

![imagem e313](assets/265be9aa9703f3cc57f43d3c62f96de1.png)

![imagem e315](assets/02126f3b520aaad9b5c9577b472379a8.png)

**0.1.1, tela grande.** Ian sente vazio em tela larga; documentos do Concurso precisam mostrar de qual edição são.

**0.1.1 (v97): "está um pouco estranho".** Painel direito apertado, rótulos quebrando, bloco Estudar repetindo as abas. Ajustado na v98.

![imagem e317](assets/5e04fb915ee94b2c67a5adb37585e685.png)

![imagem e319](assets/731ecd45a56634184b7bcd8df6de8c5b.png)

![imagem e321](assets/cc0093684c5ae6f612afbbf6b91bd674.png)

**0.1.1: "2026" e "Dataprev 2026" destacados juntos.** É o mesmo objeto aberto, igual ao Notion.

**0.1.1: menu ⋯ do item** (Desafixar, Renomear, Copiar link, Excluir). Regra: fixar só pelo ⋯ da sidebar.

**0.1.1: página da Edição** enviada junto com o mesmo feedback.

![imagem e323](assets/831c50665375ea7ebd6bb067f3e09c4e.png)

![imagem e325](assets/245371488f6e2d39a3dc98e934d488f4.png)

![imagem e327](assets/791462f4696e4cfd2e62304ca7520faf.png)

![imagem e329](assets/8852061c63b37547e1c657dda371bbee.png)

**0.1.1:** seta de expandir e recolher (circulada) no item Dataprev.

**0.1.1:** item "2026" (Edição) dentro do Dataprev.

**0.1.1:** Arquivo, Documento e PDF na árvore, com contagem.

**Referência:** item fixado com pin e ⋯ ao passar o mouse.

![imagem e331](assets/474678ed59f7cc5b7fbf3494dd75704f.png)

**Referência:** item com pin e ⋯ no hover.

### Referências do Capacities (sidebar)

O que Ian mostrou como modelo para a sidebar: tipos de objeto, ordenar, hover, lixeira.

![imagem e335](assets/5dd2843391f7c5827e8905be47daf12d.png)

![imagem e337](assets/8d42664c47e656b5f3b9c49ea3e6b134.png)

![imagem e339](assets/346da48cb8ad25f2a7857b2d30933368.png)

**Capacities:** cabeçalho "Tipos de objeto" com contagem, ⋯ e +. Ian: o + deve abrir diálogo para escolher o objeto.

**Capacities:** menu Ordenar manualmente ou alfabeticamente.

**Capacities:** lista de tipos de objeto.

![imagem e341](assets/cf85b4fdc73d3e37137c304ff737aadc.png)

![imagem e343](assets/c6f3efc2d1ce12dfa1331f679bdfb8a9.png)

![imagem e345](assets/a2e193b128aa82280b9e19b8ba5920be.png)

![imagem e347](assets/785ec225c4eb1d55dbb90821ab83bfe0.png)

**Capacities:** Fixados com ⋯ no hover.

**Capacities:** Lixeira fixa no rodapé. Ian prefere assim.

**Capacities:** sidebar completa.

**Capacities:** sidebar, hover nos itens.

![imagem e349](assets/84ae80e4902c3ad8907983654d8015b3.png)

![imagem e351](assets/748153cb0d733bded9a8c682d75eb22c.png)

**Capacities:** sidebar, item aberto.

**Capacities:** sidebar, ações no hover.

### Artefatos e Board (antes da 0.1.0)

Capturas da fase em que o Ian pediu um artefato só para o protótipo e outro para o Board.

![imagem e355](assets/9083d3341a57b970d09f1293fe724ffa.png)

![imagem e357](assets/946aec4deb45e6d0b1be13525eb558b0.png)

![imagem e359](assets/b58de1eeada0232a88aed896ece2168b.png)

**Mesma queixa:** "Estudo Dataprev 2026" e "Protótipo Dataprev 2026" lado a lado.

**Seletor de artefatos:** ficaram Board Exam App e Protótipo Exam App.

**Antes da 0.1.0 (12/11):** lista de artefatos com cards repetidos. Ian queria um artefato só.

![imagem e361](assets/f9c476ddeb52b075e841baacdff748f1.png)

**Board Exam App no canvas** (visão geral, 12/11).

## 23. Especificação do Painel de Propriedades (Capacities & Obsidian Properties v1.4+)
<!-- container e504 @ (0,8000) -->

### Modernização do Painel de Propriedades (Capacities & Obsidian Parity)

- **Container Estruturado (.props-card)**: Card com cantos arredondados (10px), borda sutil `var(--line)`, fundo secundário `var(--side)` e sombra delicada.
- **Cabeçalho Compacto & Recolhível (.props-head)**:
  - Título `Propriedades` acompanhado do contador de campos preenchidos (`• N`).
  - Chevron interativo `▾` para colapsar e expandir com animação suave e `prefers-reduced-motion`.
- **Linhas de Propriedade Tipadas (.op-prop)**:
  - Coluna 1 (130px): Ícone semântico por tipo de dado (Etiqueta para Tipo, Calendário para Edição/Data, Prédio para Órgão, Bandeira para Banca, Maleta para Cargo, Alvo para Vagas, Gráfico para Remuneração/Pontuação) + rótulo com tipografia discreta (`12px; var(--muted)`).
  - Coluna 2: Valor interativo (chip semântico com cor de entidade, badge, valor monetário/numérico ou placeholder clicável `+ Adicionar`).
  - Hover suave na linha com highlight e botão de edição rápido (`.op-pen` / `.op-ed`).
- **Governança & Preservação**:
  - Implementação compatível com handlers existentes (`data-edit-chip`, `data-edit-prop`, `data-edit-cv`, `data-add-prop`).
  - Memória contínua registrada no board conforme regra estrita de AGENTS.md.

**Concurso, antes e depois** (0.1.1). Ian: as páginas de objeto estavam feias e sem cara de 2026; pediu redesign.

**Edição, antes e depois** (0.1.1).

![imagem e307](assets/4916231707b4b56575f007bdc921fa91.png)

![imagem e309](assets/fc38ad7f1771ecbdbcc5341596b58f24.png)

**Cargo, antes e depois** (0.1.1).

**Tipo PDF, antes e depois** (0.1.1).

### Feedback do Ian sobre a 0.1.1 (prints do protótipo)

## 10. Arquivos do projeto (Dataprev 2026 e referências)
<!-- container e363 @ (0,12666) -->

| Arquivo | O que é | Pasta do projeto |
| --- | --- | --- |
| Edital de abertura (DOU 03/07/2026) | Edital oficial do concurso Dataprev 2026 (FGV) | concursos/dataprev-2026/edital-dou-03-07-2026.pdf |
| 1ª e 2ª retificações do edital | Mudanças no edital de abertura | concursos/dataprev-2026/edital-1a-retificacao.pdf, edital-2a-retificacao.pdf |
| Cronograma | Datas do concurso | concursos/dataprev-2026/cronograma.pdf |
| Edital completo (89 MB) | PDF que o Ian usou como referência do fluxo de prova | edital_concurso_dataprev_2026_0.pdf |
| Provas do Analista de TI, Desenvolvimento, tipos 1 a 4 | Caderno de questões, 70 questões cada | concursos/dataprev-2026/prova-objetiva-2026-analista-ti-dev/ |
| Gabarito preliminar FGV (13/10/2026) | PDF oficial, mais versão extraída em JSON e Markdown | concursos/dataprev-2026/gabarito/ |
| 70 questões extraídas (tipo 1) | Enunciados, alternativas e gabarito em JSON; já usadas na 0.1.1 | concursos/dataprev-2026/questoes/dataprev-2026-analista-ti-dev-tipo1.json |
| QConcursos, ExamTopics, Readwise e Reader | Modelos de entidades dos concorrentes (ver bloco 5) | referencias/qconcursos.md, examtopics.md, readwise-reader.md |
| Diretrizes de UI/UX 2026 | Leis de UX, estados e erros, componentes (ver bloco 8) | referencias/diretrizes-ui-ux-2026.md, diretrizes-estados-feedback-erros.md, diretrizes-componentes-interacao.md |
| Fonte do protótipo 0.1.1 | HTML do app e cópia antes do redesign das páginas | recuperado/prototipo-dataprev-2026/ e recuperado/versao-0.1.1-antes-redesign-paginas/ |
| Prints do redesign (antes e depois) | 4 imagens, também no bloco 9 | prints/redesign-paginas-objeto/ |

Fora do Board: 2 arquivos zip com o código do protótipo (enviados em 12/11, já publicados como 0.1.1; fonte em recuperado/), e duas cópias idênticas dos PDFs de prova na pasta de uploads.

## Relações (setas)

- **Espaço** nome e ícone dono (conta) isolado: nada cruza entre espaços → **Documento (PDF)** título classe: referência (fonte de verdade, sem %
- **Espaço (Space)** nome e ícone dono (conta) isolado: sem links nem bu → **Objeto (Object)** título espaço tipo de objeto conteúdo (quando houv
- **Objeto (Object)** título espaço tipo de objeto conteúdo (quando houv → **Tipo de Objeto (Object Type)** nome e ícone lista de definições de p
- **Objeto (Object)** título espaço tipo de objeto conteúdo (quando houv → **Valor de Propriedade (Property Value)** objeto definição valor (pode
- **Tipo de Objeto (Object Type)** nome e ícone lista de definições de p → **Definição de Propriedade (Property Definition)** nome tipo de valor:
- **Valor de Propriedade (Property Value)** objeto definição valor (pode → **Definição de Propriedade (Property Definition)** nome tipo de valor:
- **Documento (Document)** estende: Arquivo classe (rótulo): referência  → **Edição (Edition)** concurso (relação) título e ano (ex.: Dataprev 20
- **Prova (Exam Paper)** edição (relação) cargo (relação) ano e data de  → **Edição (Edition)** concurso (relação) título e ano (ex.: Dataprev 20
- **Simulado (Mock Exam)** edição e cargo (relações) ano questões em ord → **Edição (Edition)** concurso (relação) título e ano (ex.: Dataprev 20
- **Simulado (Mock Exam)** edição e cargo (relações) ano questões em ord → **Questão (Question)** enunciado e instrução (conteúdo) formato: única
- **Disciplina (Subject)** título disciplina pai (relação, para o assunt → **Edição (Edition)** concurso (relação) título e ano (ex.: Dataprev 20
- **Alternativa (Option)** título: texto da alternativa rótulo (letra A  → **Questão (Question)** enunciado e instrução (conteúdo) formato: única
- **Questão (Question)** enunciado e instrução (conteúdo) formato: única → **Prova (Exam Paper)** edição (relação) cargo (relação) ano e data de 
- **Questão (Question)** enunciado e instrução (conteúdo) formato: única → **Documento (Document)** estende: Arquivo classe (rótulo): referência 
- **Questão (Question)** enunciado e instrução (conteúdo) formato: única → **Disciplina (Subject)** título disciplina pai (relação, para o assunt
- **Resposta (Answer)** questão (relação) simulado (relação, opcional) a → **Simulado (Mock Exam)** edição e cargo (relações) ano questões em ord
- **Resposta (Answer)** questão (relação) simulado (relação, opcional) a → **Questão (Question)** enunciado e instrução (conteúdo) formato: única
- **Cartão de revisão (Review Card)** questão de origem (relação) format → **Questão (Question)** enunciado e instrução (conteúdo) formato: única
- **Concurso (Contest)** título (ex.: Dataprev) órgão (relação) banca (r → **Órgão (Agency)** título e sigla concursos: automático edições: autom
- **Concurso (Contest)** título (ex.: Dataprev) órgão (relação) banca (r → **Banca (Exam Board)** título (ex.: FGV) concursos: automático edições
- **Arquivo (File)** título formato (MIME) tamanho checksum → **Documento (Document)** estende: Arquivo classe: referência ou leitur
- **Documento (Document)** estende: Arquivo classe: referência ou leitur → **PDF** estende: Documento nº de páginas camada de texto (busca) modo:
