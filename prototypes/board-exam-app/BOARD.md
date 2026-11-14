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

![imagem e319](assets/731ecd45a56634184b7bcd8df6de8c5b.png)

![imagem e321](assets/cc0093684c5ae6f612afbbf6b91bd674.png)

**0.1.1:** Arquivo, Documento e PDF na árvore, com contagem.

**Referência:** item fixado com pin e ⋯ ao passar o mouse.

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

## 24. Dashboard Central de Estudos (#/espaco) - Especificação de UX
<!-- container e506 @ (0,8600) -->

![imagem e313](assets/265be9aa9703f3cc57f43d3c62f96de1.png)

![imagem e315](assets/02126f3b520aaad9b5c9577b472379a8.png)

### Reformulação da Home (#/espaco) em Dashboard de Estudos

- **Hero do Concurso Alvo (Meta Principal)**:
  - Destaque do certame ativo: Dataprev 2026 · FGV · Analista de Tecnologia da Informação (Engenharia de Software).
  - Contagem regressiva em dias para a data da prova (13/10/2026).
  - Termômetro do Edital: barra dinâmica de cobertura programática baseada no total de questões vistas.
- **Seção Continuar de Onde Parou (Immediate Action Hero)**:
  - Card 1 (Leitura): Retomada com 1 clique do último PDF acessado com indicação de página e % lido.
  - Card 2 (Prática): Retomada com 1 clique da última sessão de resolução de questões ou simulado.
- **KPIs de Estudo**:
  - Taxa Geral de Acertos (com comparativo semanal).
  - Questões respondidas hoje (com acompanhamento da meta diária de 25 questões).
  - Ofensiva / Sequência de estudos (Streak em dias).
  - Simulados concluídos e pontuações obtidas.
- **Hub de Ações Rápidas**:
  - Atalhos diretos para Simulado Rápido, Caderno de Erros, Grafo do Concurso e Importação de novos Editais/PDFs.
- **Radar de Disciplinas Críticas**:
  - Identificação das matérias com menor aproveitamento e CTA imediato 'Treinar Matéria'.

**0.1.1, tela grande.** Ian sente vazio em tela larga; documentos do Concurso precisam mostrar de qual edição são.

**0.1.1 (v97): "está um pouco estranho".** Painel direito apertado, rótulos quebrando, bloco Estudar repetindo as abas. Ajustado na v98.

## 25. Telas Vitais: Navegação por Teclado, Grade Rápida e Relatório de Simulado
<!-- container e508 @ (0,9200) -->

![imagem e317](assets/5e04fb915ee94b2c67a5adb37585e685.png)

### Auditoria e Modernização de Telas Vitais (Issues #17 & #19)

- **Navegação por Teclado Completa**:
  - Atalhos 1..5 ou A..E selecionam alternativas instantaneamente sem atraso.
  - Tecla Enter confirma / avança de questão.
  - Teclas J (Próxima) e K (Anterior) permitem fluidez total sem uso obrigatório de mouse.
- **Navegador Rápido de Questões (Drawer / Grade)**:
  - Gaveta com matriz 10x7 de todas as 70 questões do edital.
  - Codificação semântica por cores: Verde (Acerto), Vermelho (Erro), Cinza (Pendente) e Borda Destacada (Questão Ativa).
  - Salto direto e responsivo com zero layout shift ou scroll jumping.
- **Relatório e Scorecard de Simulado**:
  - Painel com nota final, tempo médio por item, taxa global de acertos e termômetro de nota de corte (mínimo de 57,5 pontos).
  - Desempenho detalhado agrupado por disciplina com barras de progresso proporcionais.
- **Governança & Board**:
  - Alinhamento aos tokens de  e persistência no board.

**0.1.1: "2026" e "Dataprev 2026" destacados juntos.** É o mesmo objeto aberto, igual ao Notion.

**0.1.1: menu ⋯ do item** (Desafixar, Renomear, Copiar link, Excluir). Regra: fixar só pelo ⋯ da sidebar.

**0.1.1: página da Edição** enviada junto com o mesmo feedback.

![imagem e323](assets/831c50665375ea7ebd6bb067f3e09c4e.png)

![imagem e325](assets/245371488f6e2d39a3dc98e934d488f4.png)

![imagem e327](assets/791462f4696e4cfd2e62304ca7520faf.png)

![imagem e329](assets/8852061c63b37547e1c657dda371bbee.png)

**0.1.1:** seta de expandir e recolher (circulada) no item Dataprev.

**0.1.1:** item "2026" (Edição) dentro do Dataprev.

## 26. Integração do Explorar, Grafo Contextual e Navegação Tripartida (Issue #25)
<!-- container e510 @ (0,9800) -->

![imagem e331](assets/474678ed59f7cc5b7fbf3494dd75704f.png)

### Unificação de Descoberta e Navegação Contextual (Issue #25)

- **Explorar como Central de Descoberta**:
  - Busca integrada, filtros dinâmicos por tipo e contagens em tempo real.
  - Ações diretas e imediatas em cada item da listagem:
    - [🕸️] Abrir no Grafo Contextual direto da linha.
    - [🔗] Abrir Backlinks / referências.
    - [+] Abrir em Nova Aba.
- **Grafo Contextual por Objeto e por Tipo**:
  - Suporte nativo ao grafo local focado no objeto ativo e em suas relações primárias/secundárias.
  - Suporte à visualização de subgrafos para Coleções e Tipos de Objeto ().
- **Sincronização e Fixação de Contexto (Pin/Follow)**:
  - Botão 'Fixar neste objeto' () para congelar a inspeção enquanto o usuário navega livremente em outras abas.
  - Botão 'Seguir contexto' () para restaurar a sincronia automática com a aba ativa.
- **Navegação Coerente entre os 3 Painéis**:
  - Clique simples: abre no centro.
  - Shift + clique: abre ou foca no painel lateral.
  - Ctrl / Cmd + clique: abre em nova aba.
- **Preservação Contínua no Board**:
  - Especificação e descobertas gravadas de forma permanente no Planning Board.

**Referência:** item com pin e ⋯ no hover.

### Referências do Capacities (sidebar)

O que Ian mostrou como modelo para a sidebar: tipos de objeto, ordenar, hover, lixeira.

![imagem e335](assets/5dd2843391f7c5827e8905be47daf12d.png)

![imagem e337](assets/8d42664c47e656b5f3b9c49ea3e6b134.png)

![imagem e339](assets/346da48cb8ad25f2a7857b2d30933368.png)

**Capacities:** cabeçalho "Tipos de objeto" com contagem, ⋯ e +. Ian: o + deve abrir diálogo para escolher o objeto.

**Capacities:** menu Ordenar manualmente ou alfabeticamente.

**Capacities:** lista de tipos de objeto.

## 27. Auditoria Completa UI/UX Enterprise 2026 (Pós-PR #27 / Commit c92d2ca)
<!-- container e600 @ (1600,11000) -->

### Diagnóstico Especialista UI/UX Enterprise 2026 (Capacities, Linear, Raycast, Notion, QConcursos) — Issues #34 a #40 e #42

> **1. Proibição Total de Emojis na UI — Zero Emoji Policy (Issue #42)**
> - É estritamente proibido usar emojis Unicode (`💡`, `🎯`, `📅`, `📖`, `🎉`, `🔥`, `⚠️`, `🕸️`, `📄`, `🧭`) na UI, botões, KPIs ou docs. Todos devem ser substituídos por ícones `<svg>` vetoriais monocromáticos/semânticos (`stroke-width: 1.8`).
> **2. Shell & Barra Superior Unificada (Issue #34)**
> - Duplicação lado a lado de `[C Concurso de TI]` (na sidebar) e `[Concurso de TI]` (na topbar central) quando a sidebar está aberta.
> - Linha laranja residual `.readprog` visível em páginas que não são de leitura de PDF.
> - Barra `.bar` secundária redundante exibida durante `#/simulado/exec` e `#/simulado/resultado`.
> - Ausência de cartões de superfície flutuantes (`border-radius: 12px` sobre `--app-tab-bg-back`, padrão `notes-app-old-4`).
> **3. Quebra de Layout em `#/tipo/questao` e Inputs Nativos (Issue #35)**
> - Título `Questão` comprimido em `57.68px`, quebrando em 3 linhas (`Qu / est / ão`), e `<input type="radio">` nativos sem estilização.
> **4. Ergonomia de Resolução em `#/questao/*` (Issue #36)**
> - `.props-card` inicia expandido com 11 linhas (~320px), empurrando enunciado e alternativas A–E para fora da dobra (below the fold). Deve iniciar `is-collapsed` em questões.
> **5. Diagramação do Simulado `#/simulado/exec` e Scorecard `#/simulado/resultado` (Issue #37)**
> - Enunciado espremido em ~250px (4–6 palavras/linha) quando a grade de 70 questões divide espaço com o Painel Direito; disciplinas truncadas no resultado (`Língua Portu...`).
> **6. Colisão no Rodapé do Grafo `#/grafico` (Issue #38)**
> - Pílulas de filtro `.gv-leg` em 2 linhas colidem diretamente sobre `.gv-info` (`90 objetos · 299 relações`).
> **7. Corte de Rótulos em `.props-card` e Abas do Painel Direito (Issue #39)**
> - `dt` corta `'Cadastro de reserv'` e `'Remuneração inici'`; abas do painel direito truncam `'Navegar'` para `'ir'`.
> **8. Home `#/espaco` e Modais (Issue #40)**
> - KPIs com valores hardcoded (`5 dias`, `38 dias`, `5% lido`), grid 3+1 com card órfão, contraste fraco no Light Mode e falta de fechamento consistente com `Escape` em `#pal`.

![imagem e610](assets/audit2026_home_dark.png)

![imagem e612](assets/audit2026_home_light.png)

**Evidência 1:** Dashboard Home (#/espaco) em Dark Mode: KPIs 3+1, métricas estáticas e duplicação na topbar

**Evidência 2:** Dashboard Home (#/espaco) em Light Mode: botões cinzas pesados e baixo contraste de bordas

![imagem e614](assets/audit2026_cargo_props.png)

![imagem e616](assets/audit2026_questao_expanded.png)

**Evidência 3:** Cargo Analista de TI (#/cargo/dataprev-2026-ti-dev): corte nos rótulos 'Cadastro de reserv' e 'Remuneração inici' no .props-card

**Evidência 4:** Questão 1 (#/questao/q1): .props-card aberto por padrão com 11 linhas empurra enunciado e alternativas para fora da tela

![imagem e618](assets/audit2026_questao_collapsed.png)

![imagem e620](assets/audit2026_graph_collision.png)

**Evidência 5:** Questão 1 (#/questao/q1) com .props-card recolhido: enunciado e alternativas A-D cabem imediatamente na dobra

**Evidência 6:** Grafo Global (#/grafico): colisão direta entre pílulas de filtro (.gv-leg) e contador '90 objetos · 299 relações' (.gv-info)

![imagem e622](assets/audit2026_simulado_exec.png)

![imagem e624](assets/audit2026_simulado_resultado.png)

**Evidência 7:** Modo Simulado (#/simulado/exec): enunciado comprimido em ~250px ao lado da grade de 70 questões

**Evidência 8:** Scorecard Pós-Simulado (#/simulado/resultado): truncamento severo dos nomes das disciplinas ('Língua Portu...', 'Raciocínio Ló...')

![imagem e626](assets/audit2026_tipo_questao_wrap.png)

**Evidência 9:** Página Tipo Questão (#/tipo/questao): quebra do título em 3 linhas ('Qu / est / ão') e inputs radio nativos sem estilização

## 28. Dossiê Comparativo: Web Shell Atual (0.1.1) vs. Branches Antigas (docs/archives/) & Capacities Live (Issues #47 a #50 e #52 a #58)
<!-- container e700 @ (3300,11000) -->

### Anatomia Medida do Capacities Live (app.capacities.io) + Comparação com 15 Branches Históricas (notes-app-old a old-11)

> **1. Arquitetura de 3 Painéis com Ilhas Flutuantes (`AppShellSurface` — Issue #47)**
> - **Capacities Live (`app.capacities.io`) & `notes-app-old-3/4/6`:** Canvas global `--bg-back` (`#0d0e11` no Dark / `oklch(0.9856 0.0016 67)` `#faf9f7` no Light) onde repousam a Sidebar e o Top Rail de `46px`. Abaixo do Top Rail, tanto o Painel Central quanto o Painel Direito são **cartões flutuantes independentes** (`--bg-base`: `#16171a` Dark / `#ffffff` Light, `border: 1px solid rgba(255,255,255,0.07)`, `border-radius: 10px–12px`, outer gutter de `10px` e `gap: 10px` entre os cards).
> - **Erro em `0.1.1`:** Usa `div`s chapados encostados nas bordas (`inset: 0`) com divisores retos de `1px` e paleta sépia (`#FBFAF7`/`#F4F2EC`).
> **2. Divisão Estrita do Top Rail (`46px`) em 3 Cabeçalhos Independentes (Issue #48)**
> - `SidebarHeader` (`283px`): contém apenas o pill do Space Switcher (`121.8x31px`) e o botão Recolher Sidebar `[◧]` (`27.1x27.1px`).
> - `AppHeader` (Painel Central): quando a Sidebar está aberta, inicia direto em `<` `>` (`27.1x27.1px`), faixa de abas (`31-32px`), `+` Nova Aba, `[v]` overflow e `[◨]` Alternar Painel Direito. Quando a Sidebar está recolhida (`0px`), migram para o início do `AppHeader` apenas 3 botões de ícone: `[◧ Abrir sidebar]`, `[+ Novo]` e `[🔍 Buscar]`. Nunca há Space Switcher duplicado no `AppHeader` nem segunda barra `.bar`.
> - `AppSidePanelHeader` (Painel Direito): alinhado em `y=0..46px` sobre `--bg-back`, com abas do painel (`Explorar`, `Grafo`), `+` e `[◨]`.
> **3. Colapso Off-Canvas Real (`0px`) & Painéis Redimensionáveis (Issue #49)**
> - No Capacities e em `notes-app-old-4`, a Sidebar recolhe 100% off-canvas (`width: 0px`), **sem o trilho residual de `56px`** (`.app.collapsed .side{width:56px}`). Possui `ResizableHandle` (`224px–384px` na Sidebar; `240px–640px` no Painel Direito, virando `Sheet` abaixo de `1024px`).
> **4. Topo da Sidebar `[+ Novo] [🔍]` com `NewContentMenu` Pesquisável e Ações Globais de `31px` (Issue #50)**
> - Linha horizontal dividida: botão pill `[+ Novo]` (`228.5x33px`, `border-radius: 7px`) à esquerda + botão quadrado `[🔍]` (`33x33px`) à direita. Clicar em `[+ Novo]` abre o popover `NewContentMenu` com busca focado, lista de tipos com badges `20x20px` e rodapé `↑↓ para navegar · Esc para abortar · ↵ para selecionar`. Abaixo ficam `Calendário`, `Tarefas`, `Explorar` (`31px`).
> **5. Linhas de Tipos de Objeto (`29px`), Badges Quadrados `20x20px` (18 Tons OKLCH) e Menu `⋯` de `244-269px` (Issue #52)**
> - Cada Tipo de Objeto usa `ObjectIconBadge` (`20x20px`, `border-radius: 5px-6px`, fundo tingido `--tone-*-bg` e texto `--tone-*-text` dos 18 tons OKLCH de `notes-app-old-6`), revelando contagem e menu `⋯` (`Abrir >`, `Criar`, `Novo a Partir do Modelo >`, `Nova Query`, `Nova Coleção`, `Fixar na Barra Lateral >`, `Configurações`, `Importar Ctrl+I`) no hover.
> **6. Seção Utilitária Inferior & Rodapé Horizontal de Ícones (Issue #53)**
> - Substitui o card `.user-btn` estilo Notion por `Gráfico`, `Lixeira`, `Ajuda & Recursos` colapsável e barra fixa de ícones (`27.1x27.1px`): `[👤 Perfil] [Pro] [⚙ Config] [☼/🌙 Tema] [🔄 Sync] ... [⮹ Atalhos]`.
> **7. Contrato de Abas (`31-32px`), Painel Direito `Explorar` (Grid 3x2 + Conteúdo Relevante) e Grafo Local (Issues #54 e #55)**
> - Painel Direito abre em `Explorar` com Grid 3×2 de cards (`Grafo`, `Links de entrada`, `Objetos internos`, `Conteúdo relacionado`, `Chat de IA`, `Buscar`) + `Conteúdo relevante` (`🔍 Encontrar mais`). No `Grafo`, usa nós quadrados coloridos do tipo e pílulas flutuantes translúcidas no rodapé (`backdrop-filter: blur(8px)`).
> **8. Dashboard de Tipo de Objeto (`#/tipo/*`), Página de Objeto Individual e Space Home *Recall* (Issues #56, #57 e #58)**
> - `#/tipo/*`: Header `32x32px` badge + H1 + Split Button `[+ Novo | ⌄]`, sub-abas `[⊞ Visão geral]` / `[☰ Tudo]` e Galeria de Cards em 4 colunas.
> - Página de Objeto: `[Chip do Tipo] [⇆ Coleções]`, H1 `32px`, tags inline, propriedades compactas (sem caixa `.props-card`) com `HoverCard` de preview nos objetos referenciados e abas inferiores `[Links de entrada]` / `[Conteúdo relacionado]`.
> - Space Home (`#/espaco`): estética editorial *Monastic Knowledge Sanctuary* de `notes-app-old-10.png` (*Recall*).

![imagem e705](assets/capacities_live_3pane_explorar_grid.png)

![imagem e707](assets/capacities_live_3pane_local_graph.png)

**Evidência 10 (Capacities Live):** Arquitetura de 3 Painéis com Ilhas Flutuantes (`#0d0e11` canvas, `#16171a` cards, gutter `10px`), Página de Objeto e Painel Direito `Explorar` (Grid 3x2 + Conteúdo relevante) — Issues #47, #48, #54, #57

**Evidência 11 (Capacities Live):** Painel Direito na aba `Grafo` com nós em badges quadrados coloridos por tipo, tags e controles flutuantes translúcidos no rodapé — Issues #38, #54

![imagem e709](assets/capacities_live_collapsed_sidebar.png)

![imagem e711](assets/capacities_live_new_popover.png)

**Evidência 12 (Capacities Live):** Sidebar recolhida 100% off-canvas (`0px`, sem rail de 56px) com `[◧] [+ Novo] [🔍]` migrados para o início do `AppHeader` — Issues #48, #49

**Evidência 13 (Capacities Live):** Linha superior `[+ Novo] [🔍]` na Sidebar e popover pesquisável `NewContentMenu` com rodapé de teclado (`↑↓`, `Esc`, `↵`) — Issue #50

![imagem e713](assets/capacities_live_type_context_menu.png)

![imagem e715](assets/capacities_live_type_dashboard_gallery.png)

**Evidência 14 (Capacities Live):** Linhas de Tipo de Objeto de `29px` com badges quadrados `20x20px`, menu de contexto `⋯` (`244px`) e rodapé horizontal de ícones — Issues #52, #53

**Evidência 15 (Capacities Live):** Dashboard de Tipo de Objeto (`Azure · 43`) com sub-abas `Visão geral`/`Tudo`, Split Button `+ Novo | v` e Galeria de Cards em 4 colunas — Issue #56

![imagem e717](assets/capacities_live_object_page_anatomy.png)

![imagem e719](assets/archive_notes_app_old_3_capacities_shell.png)

**Evidência 16 (Capacities Live):** Anatomia da Página de Objeto com painel lateral fechado: coluna centralizada (`740px`), chip de tipo, `Coleções`, tags inline, propriedades compactas e abas `Links de entrada`/`Conteúdo relacionado` — Issue #57

**Evidência 17 (Archive `notes-app-old-3`):** Web Shell de paridade Capacities em Light Mode (`--bg-back`, cartões flutuantes `12px`, aba `Visão geral` de `Páginas` e painel direito `Explorar` 6 cards) — Issues #47, #54, #56

![imagem e721](assets/archive_notes_app_old_4_capacities_shell.png)

![imagem e723](assets/archive_notes_app_old_4_graph_sidepanel.png)

**Evidência 18 (Archive `notes-app-old-4`):** `AppShell` com `ResizablePanelGroup`, `AppHeader`, `AppSidePanelHeader` e `ObjectTypeWorkspace` — Issues #47, #48, #49, #55

**Evidência 19 (Archive `notes-app-old-4` `layout-current.png`):** `Visualização em grafo` no Painel Direito com controles inferiores (`Mostrar menos`, `Mostrar mais`, zoom, expandir) — Issue #54

![imagem e725](assets/archive_notes_app_old_10_recall_home.png)

**Evidência 20 (Archive `notes-app-old-10` Recall):** Estética editorial *Monastic Knowledge Sanctuary* para a Home do Espaço (`#/espaco`) com card Hero escuro `TODAY`, `Review today` e `Recent objects` sem emojis — Issue #58

## 29. Engenharia da Barra Direita & Motor de Grafo do Capacities + Central de Preparação & Questões do QConcursos Elite (Issues #64 e #66 a #72)
<!-- container e800 @ (5000,11000) -->

### Blueprint Técnico: Painel Direito & Grafo Retina 60fps (Capacities Live) + Home & Resolução de Questões (QConcursos Elite Live)

> **1. Remoção Definitiva do `#spTopBtn` Duplicado em `#wsTabs` (Issue #64)**
> - O botão `[💡 Concurso de TI ↕]` (`#spTopBtn`) foi injetado dentro de `#wsTabs` por engano no commit `7edd4ac` (PR #20) porque o autor não percebeu que `.side-top` já existia na Sidebar esquerda. Mesmo quando a Sidebar é recolhida (`0px`), o Capacities **NUNCA** mostra o Space Switcher na barra de abas — exibe apenas `[◧ Expandir sidebar]`, `[+ Novo]` e `[🔍 Buscar]`. `#spTopBtn` deve ser removido do HTML/CSS/JS.
> **2. As 6 Ferramentas Contextuais do Painel Direito, Overflow `Buscar abas` `[v]` e `ResizeObserver` (Issue #66)**
> - No Capacities Live, a Barra Direita tem calha invisível de `8px` (`col-resize`) que aciona `ResizeObserver` no canvas em tempo real sem borrar.
> - Quando há 5+ abas no painel direito, elas compactam para ícone e revelam o botão `[v]`, abrindo o popover `Buscar abas` (`256px`).
> - As 6 ferramentas de `Explorar` são: `Grafo`, `Links de entrada` (com snippet do bloco), `Objetos internos` (agrupados por tipo), `Conteúdo relacionado` (com pílula `[66 | ☰ ⌄ | ☵]`), `Chat de IA` (com chip do objeto ativo) e `Buscar`.
> **3. Motor de Grafo `<canvas>` 2D Retina (`devicePixelRatio`) & Taxonomia Visual de Nós em 3 Níveis (Issue #67)**
> - **Por que o grafo do Capacities é muito mais responsivo:** Usa um único motor `<canvas>` 2D a 60 FPS calibrado por `window.devicePixelRatio` tanto no Painel Direito quanto no Grafo Global (substituindo o `<svg class="rp-graph">` estático do nosso protótipo).
> - **Taxonomia em 3 Níveis:** (1) Nó Central: badge quadrado `36-42px` (`border-radius: 8px`) com ícone SVG do tipo, borda brilhante `2px` e rótulo em pílula escura (`rgba(20,20,20,0.85)`); (2) Nós Vizinhos: badges quadrados `24-28px` (`border-radius: 6px`) tingidos na cor OKLCH do Tipo de Objeto; (3) **Nós de Tags/Assuntos:** renderizados como **pílulas ovais coloridas** (`[vm group]`, `[logical container]`) com o texto dentro!
> - **Arestas & Física:** Arestas direcionais com rótulos de relação inline (`Relação`, `Equivalente do GCP`), spotlight no hover (`opacity: 0.15` nos demais) e física de molas amortecida (*spring damping* `< 1s`).
> **4. Barras Flutuantes de `27px` no Grafo, Popover de Filtros/Hubs, Profundidade `1..5` e Busca Auto-Zoom (Issue #68)**
> - Pílulas inferiores de `27px` (`backdrop-filter: blur(8px)`): à esquerda `[⤢ Fit] [☊ Re-layout]`; à direita `[🔍- | 100% ⌄ | 🔍+]` e `[📥 Export PNG | 🎛 Filtros | ● Profundidade 1..5]`.
> - Popover `[🎛]` com submenus pesquisáveis `Filtrar tipos de objeto >`, `Excluir tipos de objeto >` e checkbox `Ocultar objetos com muitos links` (evita poluição de hubs!). No Grafo Global: busca no topo com auto-zoom suave no cluster e `Reproduzir linha do tempo`.
> **5. QConcursos Elite — Central de Preparação na Home `#/espaco` (Issue #69)**
> - Card do Concurso com dados do edital + bloco acionável **`PRÓXIMA AÇÃO`** (`Continuar estudando →` / `Mapa do edital`), widget **`Seu ritmo hoje`** (`X questões respondidas hoje`, `Taxa de acerto`, `Taxa de erro` e barra semanal `Seg–Dom`) e seção **`Conteúdo do seu edital`** com 4 abas (`Disciplinas & Assuntos` Master-Detail, `Caderno de Questões`, `Raio-X da Banca` e `Caderno de Erros`).
> **6. QConcursos Elite — Construtor de Filtros Avançado, Tesoura nas Alternativas e Abas Pedagógicas (Issues #70, #71 e #72)**
> - Filtros rápidos (`Resolvidas`, `Não resolvidas`, `Acertei`, `Errei`), selects em cascata (`Disciplina -> Assunto`), chips `Filtrar por:` e barra de ações (`Salvar filtro`, `Gerar Caderno`, `Criar Simulado`).
> - Card da questão com cabeçalho compacto de 2 linhas (`[1 | Q1]` + Breadcrumb; `Ano · Banca · Órgão · Prova`), toggle `Texto associado ⊕/⊖`, **botão de Tesoura (`✂️ Descartar alternativa`)** com `line-through`, confirmação em 2 etapas via botão **`[Responder]`** e barra inferior de abas pedagógicas (**`Gabarito Comentado`**, **`Estatísticas`** com Donut + Barras A–E + Histórico, **`Cadernos`** e **`Anotações`** ricas).

![imagem e805](assets/bug_spTopBtn_duplicated_lightbulb.png)

![imagem e807](assets/capacities_live_right_panel_tab_overflow.png)

**Evidência 21 (Bug Reportado pelo Usuário — Issue #64):** Botão duplicado `#spTopBtn` (`💡 Concurso de TI ↕`) + `#wsSide` (`[◧]`) injetado dentro de `#wsTabs` pelo commit `7edd4ac` (PR #20)

**Evidência 22 (Capacities Live — Issue #66):** Painel Direito com 5+ abas compactadas por ícone e popover pesquisável `Buscar abas` aberto no botão `[v]`

![imagem e809](assets/capacities_live_right_panel_related.png)

![imagem e811](assets/capacities_live_graph_3tier_nodes_resized.png)

**Evidência 23 (Capacities Live — Issue #66):** Aba `Conteúdo relacionado` no Painel Direito com pílula `[66 | ☰ ⌄ | ☵]` e lista de objetos com badges quadrados `20x20px`

**Evidência 24 (Capacities Live — Issues #66, #67):** Painel Direito redimensionado via calha (`ResizeObserver` a `150%` zoom) exibindo taxonomia em 3 níveis: badges quadrados de objetos, pílulas coloridas de tags (`vm group`, `logical container`) e rótulos nas arestas

![imagem e813](assets/capacities_live_graph_filter_popover.png)

![imagem e815](assets/capacities_live_global_graph_constellation.png)

**Evidência 25 (Capacities Live — Issue #68):** Popover de Configurações do Grafo (`[🎛]`) com submenu pesquisável `Filtrar tipos de objeto >`, `Ocultar objetos com muitos links` e pílula de profundidade `[● 4]`

**Evidência 26 (Capacities Live — Issues #67, #68):** Grafo Global (`348` nós) com agrupamento em clusters orbitais por domínio e barra de busca flutuante no topo

![imagem e817](assets/capacities_live_global_graph_search_autozoom.png)

![imagem e819](assets/qconcursos_live_home_proxima_acao.png)

**Evidência 27 (Capacities Live — Issue #68):** Busca reativa `'Azure'` no Grafo Global atualizando contador (`306`), executando auto-zoom (`40%`) e exibindo botão de `Linha do Tempo`

**Evidência 28 (QConcursos Elite Live — Issue #69):** Central de Preparação (Topo): Card do concurso com dados do edital, bloco acionável `PRÓXIMA AÇÃO` (`Continuar estudando →`) e widget `Seu ritmo hoje`

![imagem e821](assets/qconcursos_live_home_ritmo_disciplinas.png)

![imagem e823](assets/qconcursos_live_home_raiox_curso.png)

**Evidência 29 (QConcursos Elite Live — Issue #69):** Cards `Taxa de acerto` / `Taxa de erro`, barra semanal `Seg–Dom` e visão Master-Detail de `Disciplinas & Assuntos` com badge `Recomendado`

**Evidência 30 (QConcursos Elite Live — Issue #69):** Aba `Raio X do Curso` analisando incidência histórica e relevância dos assuntos na banca

![imagem e825](assets/qconcursos_live_home_caderno_erros.png)

![imagem e827](assets/qconcursos_live_filter_builder_top.png)

**Evidência 31 (QConcursos Elite Live — Issue #69):** Aba `Caderno de Erros` reunindo automaticamente questões erradas para revisão ativa

**Evidência 32 (QConcursos Elite Live — Issue #70):** Construtor de Filtros com pílulas rápidas (`Resolvidas`, `Não resolvidas`, `Acertei`, `Errei`), selects em cascata (`Disciplina -> Assunto`) e checkboxes de exclusão

![imagem e829](assets/qconcursos_live_filter_actions_bar.png)

![imagem e831](assets/qconcursos_live_question_scissors_eliminated.png)

**Evidência 33 (QConcursos Elite Live — Issue #70):** Barra de chips ativos `Filtrar por:` e barra de ações (`Salvar filtro`, `Gerar Caderno`, `Meus Cadernos`, `Meus filtros`, `Criar Simulado`)

**Evidência 34 (QConcursos Elite Live — Issue #71):** Card de Questão com cabeçalho compacto de 2 linhas, toggle `Texto associado (+)` e **Tesoura (`✂️`) riscando a alternativa D** (`line-through`)

![imagem e833](assets/qconcursos_live_question_answered_feedback.png)

![imagem e835](assets/qconcursos_live_question_tab_estatisticas.png)

**Evidência 35 (QConcursos Elite Live — Issue #71):** Confirmação em 2 etapas via botão `Responder`, destacando a alternativa correta B em verde e exibindo a barra inferior de abas pedagógicas

**Evidência 36 (QConcursos Elite Live — Issue #72):** Aba pedagógica `Estatísticas` aberta sob a questão: gráfico Donut (`69% de acertos`), gráfico de barras `Alternativas mais respondidas (A–E)` e `Histórico de desempenho`

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
