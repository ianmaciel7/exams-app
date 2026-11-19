# Referências: páginas e fluxos de navegação

Levantamento feito com Firecrawl (página inicial de cada referência e seus links internos, em 2026-11-19).
Objetivo: servir de base para a arquitetura da informação e os fluxos do Exams App, sem copiar interfaces.

## Limites do levantamento
- Mapear **todas** as páginas de sites com milhares de páginas (ExamTopics, QConcursos) não é viável em uma passada; aqui estão as seções de primeiro nível e as páginas de entrada.
- Áreas logadas (painel do aluno, simulados, cronômetro) não foram acessadas.
- Próximo passo, se você quiser: raspar uma página de prova/concurso e uma sessão de simulado para detalhar o fluxo de questão.

## 1. ExamTopics (examtopics.com)
Estrutura: catálogo por **fornecedor → certificação**.
- Entrada: `/exams/` (lista de fornecedores)
- Fluxo: Início → Fornecedor (ex.: Microsoft, CompTIA, AWS, Cisco, Google, Databricks, Salesforce, ISACA, PMI, ITIL) → Certificação (ex.: AZ-900, SY0-701) → lista de questões da prova
- Conta: `/login/`, `/signup/`
- Dados: ~70+ fornecedores e centenas de certificações listadas na home
- Aprendizado para o Exams App: navegação por hierarquia fornecedor/certificação; busca por código de prova (ex.: "az-900").

## 2. QConcursos (qconcursos.com)
Estrutura: catálogo por **concurso/órgão**, com questões e aulas.
- Entrada: `/` (home), `/concursos` (lista de concursos), `/questoes-de-concursos/questoes` (banco de questões)
- Fluxo: Início → Concurso (ex.: Banco do Brasil, Receita Federal, TJ-SP, Polícia Federal) → Edital / cargo → Questões e aulas
- Seções da home: "Descubra concursos" filtrados por status (aberto, em breve, longo prazo)
- Conta: login por e-mail, Google ou Facebook; planos em `/planos-de-assinatura`
- Conteúdo editorial: `folha.qconcursos.com` (notícias de editais)
- Aprendizado: filtro por status do concurso; agrupamento por órgão; separação clara entre conteúdo grátis e planos.

## 3. Crucial Exams (crucialexams.com)
Estrutura: catálogo por **fornecedor → certificação → versão**.
- Entrada: home com grade de fornecedores
- Fluxo: Início → Fornecedor (CompTIA, Cisco, AWS, Microsoft, ISC2, PMI, GCP, EC-Council, PeopleCert…) → Certificação → "practice-tests-practice-questions"
- Recursos anunciados na home (âncoras): Achievements, WeakSpots (pontos fracos), AI, StudyMode, TestMode, PBQs (questões práticas), MobileApp, FAQ
- Conta/contato: `/contact`, `/tools/ai-bot`
- Aprendizado: modos de estudo distintos (estudo vs. prova simulada); painel de pontos fracos; questões práticas (PBQ) como tipo de questão próprio.

## 4. Capacities (capacities.io)
Estrutura: app de conhecimento por **objetos** conectados (não por pastas).
- Entrada: home → Produto (`/product`) e Por que (`/why-capacities`) → app (`app.capacities.io/start`)
- Fluxo: Landing → Cadastro → Início no app (objetos, notas, tipos de objeto)
- Aprendizado: organização do conhecimento por objetos e links, em vez de hierarquia de pastas; base para a "organização do conhecimento" do projeto.

## 5. Linear (linear.app)
Estrutura: site de marketing + produto em uma só navegação.
- Entrada: home → Plano (`/plan`), IA (`/ai`), Build (`/build`), Intake (`/intake`), Clientes (`/customers`), Changelog (`/changelog`), Download (`/download`)
- Conta: `/login`, `/signup`, `/contact/sales`
- Fluxo de conversão: Home → página de recurso → Cadastro (`/signup`) ou Vendas (`/contact/sales`)
- Aprendizado: navegação enxuta (poucos itens de topo), atalhos de teclado e foco em velocidade; changelog como página de novidades.

## 6. Readwise Reader (readwise.io/read)
Estrutura: leitor com biblioteca unificada.
- Entrada: `/read` (app), home `/` (marketing), `/pricing`, `/cli`, `/mcp`, `/changelog` (docs)
- Fluxo: Landing → Cadastro (`/accounts/signup/`) ou login (Amazon, senha) → `/read/authed` (biblioteca) → trial (`/read/trial/accept`)
- Termos e privacidade: `/terms-of-service`, `/privacy-policy`
- Aprendizado: biblioteca única para ler e marcar; grifos e busca; fluxo de leitura de PDFs/artigos relevante para o módulo de leitura do Exams App.

## Padrões comuns observados
1. **Hierarquia de catálogo**: fornecedor/órgão → certificação/concurso → questões. (ExamTopics, Crucial Exams, QConcursos)
2. **Entrada de conversão**: home → recurso → cadastro/planos. (Linear, Readwise, QConcursos)
3. **Login social e e-mail** como caminhos paralelos. (QConcursos, Readwise)
4. **Modos de estudo separados** (estudo x prova simulada). (Crucial Exams)
5. **Busca e filtro por código/status** do exame ou concurso. (ExamTopics, QConcursos)

## Implicações para o Exams App (rascunho para discussão)
- Hierarquia: Área/Órgão → Concurso/Certificação → Disciplina/Tópico → Questões.
- Fluxos principais: Cadastro/Onboarding → Escolher prova → Estudar questões → Simulado → Revisão de erros → Revisão espaçada.
- Leitura de PDFs como área própria, ligada a tópicos e notas (inspirado em Readwise Reader e Capacities).
