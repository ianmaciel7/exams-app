# Análise de gaps: referências e repositórios antigos

Data: 2026-11-20. Só leitura: nenhum outro arquivo foi criado ou alterado, e nada aqui é decisão de produto. Legenda: **Confirmado** = está escrito numa fonte lida; **Inferência** = dedução minha, precisa da sua validação.

## O que foi lido (e o que não foi)
- **Referências** (`Documentos/Referências`): lidos por inteiro `navegacao-referencias.md`, e as visões gerais, fluxos e organização de QConcursos e Crucial Exams, o fluxo/telas/método de ExamTopics, README e "o que aprender" do Anki, README e visão geral do Readwise Reader e Linear. Capacities, matrizes de interação e inventários de componentes: só consultados por listagem, não relidos.
- **Repos**: `notes-app` (README com 11 branches `old-*`; na `old-10` li `intent.md` e `spec.md` em grande parte), `shadcn-firebase-template` (PRODUCT, DER, GLOSSARY), `exams-app-old` (README é o padrão do create-next-app; só listei raiz e branches). `exams-app-antigo-2` e `shadcn-template`: só listei a raiz e as branches; **não li o conteúdo** (a `main` do antigo-2 só tem `.gitignore`; o código está em `dev`/`prototype`). As branches `old-1…11` do notes-app, exceto a `old-10`, só foram vistas pela descrição do README.

## 1. O que já está coberto
| Tema | Onde | Observação |
|---|---|---|
| Catálogo e navegação (fornecedor/certificação, concurso/órgão) | ExamTopics, Crucial Exams, QConcursos | Confirmado, páginas públicas |
| Filtros do banco de questões (banca, órgão, disciplina, assunto, ano, cargo, nível) e metadados da questão | QConcursos | Confirmado, só o público |
| Modos de estudo vs. prova, navegador numerado, marcar para revisão, demo sem cadastro | Crucial Exams | Confirmado até a questão; o resultado final **não foi visto** |
| Simulado pronto/personalizado, análise geral | QConcursos | Confirmado o rótulo; o conteúdo logado não |
| Repetição espaçada (conceitos, SM-2 vs FSRS, retenção, limites diários) | Anki | Documentação oficial parcial |
| Leitura e grifos, PDFs, filtros, IA | Readwise Reader | Só páginas públicas; o app em si é inferência |
| Organização por objetos e links | Capacities | Documentação e capturas; mais material nas imagens recuperadas |
| Navegação por teclado, comando, listas densas | Linear | Visão geral curta; sem workspace logado |
| Design system | `Design`, `Design-claude-ia`, `Design-v2-rascunho` | Rascunhos; estado não verificado por mim |

## 2. O que falta (gaps)
Nada abaixo existe ainda como requisito ou decisão do Exams App atual.

1. **Modelo de dados de questões.** Tipos (única, múltipla, lacuna, associação, prática/PBQ), alternativas, gabarito, comentário, versão da questão, vínculo com banca/ano/órgão/cargo. As referências listam *campos visíveis*, não um modelo. O `old-10` tem um rascunho (ver seção 3).
2. **Origem e licença do conteúdo.** De onde virão as questões (autoria própria, importação, parceiros)? Concursos têm direitos autorais de bancas e editoras; ExamTopics é conteúdo de comunidade. Nenhuma referência responde isto.
3. **Simulados e cadernos como entidades.** Configuração (escopo, quantidade, tempo, modo), correção final, tela de resultado, retomar simulado, caderno de revisão e filtros salvos. Só vimos o *começo* do fluxo (Crucial) e rótulos (QConcursos).
4. **Estatísticas e desempenho.** O Anki e o QConcursos têm, mas ninguém leu as telas logadas. Falta definir métricas (acerto por disciplina, pontos fracos, evolução, tempo por questão).
5. **Algoritmo de repetição espaçada.** Anki apresenta SM-2 e FSRS; o `old-10` escolheu SM-2, enquanto `old-5/8/9` usaram FSRS. Falta decisão, escala de nota e como erros de questões viram cartas.
6. **Leitura de PDFs.** Falta: upload e armazenamento, OCR, grifos ancorados (posição no PDF), ligação grifo → questão/nota/tópico, limites de tamanho. As referências só cobrem a vitrine do Reader.
7. **Importação e exportação.** Importar questões (CSV/JSON/PDF), exportar decks (Anki?), backup. O `old-8` tinha backup JSON.
8. **Offline e sincronização.** Local-first (Dexie/IndexedDB nos antigos) vs. servidor (Firebase). Conflitos, PWA, app mobile. Nenhuma referência foi lida sob este ângulo; o Anki `syncing` ficou como pendência.
9. **Monetização e o que é grátis.** Crucial: premium + vitalício + vouchers; QConcursos: gate de cadastro e Black; ExamTopics: PRO. Sem preços reais verificados. O `old-10` decidiu "núcleo grátis, monetização adiada".
10. **Colaboração e comunidade.** Comentários/discussões (ExamTopics, QConcursos) vs. app 100% pessoal. O `old-10` decidiu espaços privados, sem votos nem discussões na v1.
11. **Contas, privacidade e LGPD.** Login (Google/e-mail/código mágico), dados de estudo, exclusão de conta. Sem referência.
12. **IA.** Crucial tem tutor, Reader tem Ghostreader, `old-5` gerava cartões por IA. Falta decidir se haverá IA, em quê, e custo.
13. **Conteúdo editorial brasileiro.** Editais, situação do concurso, calendário de provas (QConcursos). Só relevante se o foco for concursos e não só certificações — **decisão de escopo aberta**.
14. **Acessibilidade e mobile.** Poucas capturas mobile (ExamTopics, Capacities); resto não verificado. Sem testes de usabilidade ou pesquisa com usuários (não há personas, só inferências).
15. **Linear e Crucial sem imagens recuperadas**; Linear está superficial (7 arquivos curtos).
16. **Anki:** estatísticas, editor de notas, sincronização, complementos e a documentação técnica do FSRS **não foram lidos**.

## 3. O que os repos antigos têm de aproveitável
Tudo como *referência de aprendizado*, não para copiar código (regra do projeto).
- **`notes-app`, branch `old-10` ("Recall")** — o mais relevante. Tem `intent.md` e `spec.md` com: problema, objetos (questão, exame, tag, coleção, nota, citação), formatos de questão (MVP: única, múltipla, lacuna, associação; reservados: ordenação, hotspot, simulação), ligações bidirecionais entre objetos (coleção `object_links`), registros de estudo (`nextReviewDate`, `interval`, `easeFactor`, `history`), modos de sessão (prática vs. simulado cronometrado, com janela de tolerância), moderação por denúncia, API de leitura (MCP) com chaves por espaço, estados vazios/erro/carregamento e a seção §9 com ~23 conflitos e decisões. Aprendizados duros registrados lá: SM-2 vs FSRS discordavam entre branches, editor (TipTap vs Plate) nunca decidido, e local-first vs servidor com modelos de propriedade incompatíveis.
- **`notes-app`, outras branches (só pela descrição do README, não lidas):** `old-5` (local-first Dexie, leitura de documentos, flashcards FSRS, cartões por IA), `old-8` (baralhos e backup JSON), `old-7` (login Google), `old-2/3/4/6` (layout inspirado no Capacities, editor, Ladle), `old-9/11` (base Firebase + i18n).
- **`shadcn-firebase-template`:** base com Next.js, Firebase (login com vários provedores, MFA), i18n en/es/pt-BR, shadcn com Base UI, e um conjunto grande de documentos de engenharia (ARCHITECTURE, CODING_STANDARDS, TESTING, SECURITY, DESIGN, ADRs). **Confirmado:** `DER.md` e `GLOSSARY.md` dizem "pendente: sem modelo de produto". Ou seja, serve de *fundação técnica e de processo*, não de domínio. Também carrega muita ferramenta de qualidade (knip, stryker, semgrep, etc.): possível excesso para "evitar complexidade".
- **`shadcn-template`:** versão sem Firebase do mesmo molde (só vi a raiz).
- **`exams-app-old` e `exams-app-antigo-2`:** `main` praticamente vazia; o conteúdo está nas branches `dev`/`prototype`/`feat/*`. Em `antigo-2` há nomes de branches como grafo unificado, troca de espaço, "raio-x de erros" automático, histórico; **não li nada disso**, então não afirmo o que existe. Em `exams-app-old` há um ADR em `docs/adr` (não lido).

## 4. Confirmado vs. inferência
- **Confirmado:** estrutura pública de catálogo e filtros (QConcursos, ExamTopics, Crucial), existência de simulados/cadernos/estatísticas como *recursos anunciados*, conceitos de repetição espaçada do Anki, as decisões e o rascunho do `old-10`.
- **Inferência (não verificada):** comportamento real de caderno/estatísticas/comentários/simulador logado; estados "Later/Archive/Inbox" do Reader; destinos de links não clicados; que os filtros salvos funcionam como imaginado; qualquer preço.
- **Decisões do `old-10` não valem para o novo app** até você confirmar (ex.: "um exame por usuário", espaços privados, SM-2). Eram do projeto antigo.

## 5. Perguntas para o Ian
1. **Escopo:** concursos, certificações, ou os dois desde o início? Isso muda o gap 13 (editais, bancas) por completo.
2. **Conteúdo:** as questões serão suas, importadas de arquivos seus, ou o app é só a ferramenta e o usuário traz o conteúdo?
3. **Quem usa:** só você (uso pessoal), ou outros usuários e grupos de estudo? Isso define contas, colaboração e monetização.
4. **Plataforma e offline:** só web, PWA, ou app mobile? Precisa funcionar sem internet?
5. **Repetição espaçada:** quer que eu compare SM-2 e FSRS com fontes e traga uma recomendação, ou já tem preferência?
6. **PDFs:** o uso principal é ler material e grifar, ou importar questões a partir de PDFs de provas?
7. **IA:** quer IA no produto (explicar questões, gerar cartões)? Se sim, em quais pontos?
8. **Modelo de negócio:** é um projeto pessoal, ou pretende cobrar? O que ficaria grátis?
9. **Aproveitar o `old-10`:** posso ler a fundo o `spec.md` e as ADRs (incluindo `exams-app-antigo-2` e `exams-app-old`) e listar o que reaproveitar como *proposta*, sem preencher nada sozinho?
10. **Pesquisa:** prefere que eu aprofunde as referências logadas (que exigem conta) com a sua permissão, ou considera as públicas suficientes?

## 6. Fontes sugeridas (só indicação, não adicionadas às referências)
- Anki: `docs.ankiweb.net/manual/syncing`, `/stats`; documentação do FSRS (open-spaced-repetition no GitHub).
- Interação de teste/simulado: páginas de ajuda do QConcursos (`suporte.qconcursos.com`) e FAQ do Crucial Exams.
- Acessibilidade e fluxos: WCAG 2.2 (w3.org/TR/WCAG22) e NN/g, já citados em `ExamTopics/metodo-mapeamento.md` como pendência.
