# Inventário e Análise do ExamTopics — Arquitetura, UI/UX, Funcionalidades e Ecossistema

- **Documento:** `docs/research/examtopics-inventory.md`
- **Issue relacionada:** #28
- **Data da Observação:** Novembro de 2026
- **Status:** Concluído e Integrado ao Planning Board

---

## 1. Escopo, Posicionamento e Ecossistema

O **ExamTopics** (`examtopics.com`) é uma das maiores plataformas globais de preparação para exames de certificação em TI (AWS, Microsoft Azure, Google Cloud, Cisco, CompTIA, Kubernetes, etc.) e exames profissionais.

### 1.1 Proposta de Valor e Público-Alvo
- **Proposta central:** Disponibilizar bancos de questões extraídos ou inspirados em exames oficiais de certificação, acompanhados de discussões extensas da comunidade e gabaritos votados por usuários.
- **Público-alvo:** Profissionais de tecnologia, engenheiros de nuvem, arquitetos e administradores de sistemas buscando aprovação rápida em certificações de alto custo.
- **Cobertura geográfica e linguística:** Principalmente em inglês, com alcance global.

### 1.2 Diferenciação de Funcionalidades (Público vs. Autenticado vs. Premium)
- **Acesso Público / Visitante:** Visualização parcial de questões (geralmente limitada a um número pequeno de perguntas por tópico, ex: primeiras 5 ou 10 questões), acesso restrito às discussões completas em tópicos populares.
- **Usuário Autenticado (Free):** Permite participar de discussões, votar em respostas e ver um volume um pouco maior de conteúdo gratuito.
- **Membros Premium (Paid):** Acesso ilimitado a todo o catálogo de questões, discussões completas sem restrições de paginação, simulações de exames sem anúncios e acesso a atualizações recentes de exames.

---

## 2. Arquitetura de Informação / Sitemap

### 2.1 Hierarquia de Navegação
```
Home (examtopics.com)
 ├── Vendors (Fornecedores: AWS, Microsoft, Cisco, etc.)
 │    └── Exame Específico (ex: AWS Certified Solutions Architect - Associate - SAA-C03)
 │         ├── Visão Geral / Informações do Exame
 │         ├── Lista de Tópicos / Seções
 │         └── Questões (Paginadas ou por Tópico)
 └── Discussions / Community
```

### 2.2 Padrões de URL e Rotas Observadas
- `/discussions/amazon/` ou `/exams/amazon/`
- Estrutura típica de URL para exames e questões: `/discussions/<vendor>/exam-<exam-code>-topic-<topic-num>-question-<q-num>`

---

## 3. UI e Design System — Detalhamento por Componente

### 3.1 Layout de Questão e Comunidade
- **Cards de Exame:** Exibem título do exame, código, ícone do fornecedor, número total de questões, porcentagem de conclusão ou atualização recente.
- **Layout de Questão:**
  - **Enunciado:** Texto claro, suporte a código formatado e imagens/exhibits (diagramas de arquitetura, capturas de tela de consoles cloud).
  - **Alternativas:** Lista de opções com letras (A, B, C, D, E) em caixas demarcadas.
  - **Resposta Sugerida vs. Voto da Comunidade:** Um dos maiores diferenciais (e pontos polêmicos) do ExamTopics é exibir uma "Suggested Answer" oficial da plataforma/moderadores e, logo abaixo, a porcentagem de votos da comunidade (ex: *Community vote: 85% chose C*).
  - **Bloco de Discussão / Comentários:** Secção estilo fórum abaixo de cada questão onde usuários debatem por que a resposta sugerida pode estar errada, citando documentação oficial.

---

## 4. Comparativo Minucioso: ExamTopics vs. Exam App (`dev`)

| Dimensão / Funcionalidade | ExamTopics | Exam App (`dev`) | Decisão para o Exam App |
| :--- | :--- | :--- | :--- |
| **Gabarito por Votação da Comunidade** | Central (votos de usuários definem a "resposta da comunidade") | Ausente (gabarito curado / oficial baseado em PDF e editais) | **Rejeitar.** O Exam App prioriza gabaritos oficiais e fundamentados em editais públicos / bancas (ex: Cespe/Cebraspe, FGV, FCC). |
| **Discussões e Fórum por Questão** | Extensas, com milhares de comentários por questão | Notas de estudo / comentários locais estruturados | **Adaptar.** Manter anotações e explicações curadas por professores/especialistas em vez de fórum aberto não moderado. |
| **Busca e Filtros** | Busca por código de exame e tópicos | Busca avançada por banca, órgão, ano, cargo, disciplina, chips ativos, URL state | **Aproveitar e Expandir.** O sistema de filtros do Exam App é superior em usabilidade estruturada. |
| **Exibição de Exhibits (Imagens/Diagramas)** | Suporte a imagens de arquitetura e telas | Suporte a PDF viewer integrado e anexos | **Aproveitar.** Integrar visualização de PDF nativa ao lado da questão (diferencial competitivo fortíssimo). |

---

## 5. Recomendações para o Exam App
1. **Consolidar o leitor de PDF integrado** como visualizador primário de editais e provas originais.
2. **Manter o rigor de curadoria de gabarito** (sem depender de votação de usuários anônimos).
3. **Aprimorar o sistema de URL state e filtros rápidos** (chips) inspirado na fluidez de navegação de grandes catálogos.

