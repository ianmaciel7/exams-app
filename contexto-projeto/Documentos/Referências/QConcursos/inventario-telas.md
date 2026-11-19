# QConcursos: inventário de telas públicas

Coleta: 2026-11-19, leitura de HTML renderizado via Firecrawl (3 páginas). Status: **200** = conteúdo lido. Sem capturas de tela (ver nota no final).

| # | Tela | URL | Status | Conteúdo confirmado |
|---|---|---|---|---|
| T1 | Home | https://www.qconcursos.com/ | 200 | Menus por segmento, explorar concursos (carreiras, editais, estados), acesso rápido, aulas, playlists, cursos, notícias, login, CTA cadastro. Links: 155 |
| T2 | Simulados (landing) | https://www.qconcursos.com/simulados | 200 | Hero, desafios semanais, 5 simulados grátis, lista "Mais procurados" (11 disponíveis, 8 listados no HTML), gerador personalizado, "Simuladão da semana" (planos), guia textual, modal de e-mail |
| T3 | Banco de questões | https://www.qconcursos.com/questoes-de-concursos/questoes | 200 | Seletor de segmento, painel de filtros (disciplina, assunto, banca, instituição, ano 2026–1994, cargo, nível, área de formação, área de atuação), contador, paginação "Por página", ordenação, lista de questões com metadados e alternativas, feedback de gabarito, CTA de cadastro |
| T4 | Detalhe de questão | (dentro de T3) | 200 | Código Q, breadcrumb de assuntos, banca, órgão, prova, enunciado, alternativas, "Responder", "Adicionar a um caderno", "Ver estatísticas" |

## Não capturado nesta rodada
- Página de concurso (/concursos/{órgão}), página de banca, página de disciplina, página de prova: links confirmados, conteúdo não lido.
- Planos, cursos, aulas, notícias, central de ajuda, termos, política de privacidade, sobre: links confirmados, conteúdo não lido.
- Telas logadas (app.qconcursos.com, simulador em andamento, caderno, estatísticas, comentários): fora de escopo, exigem conta.

## Nota sobre capturas (Playwright)
- Tentativa com Playwright (Chromium de /opt/pw-browsers) em https://www.qconcursos.com/ e /questoes-de-concursos/questoes retornou **HTTP 403** da proteção Cloudflare ("Attention Required!"). robots.txt respondeu 200.
- Não contorni a proteção. Por isso não há capturas PNG desta rodada. Opções: (a) aceitar só texto, (b) capturas pontuais liberadas manualmente pelo Ian, (c) usar outra fonte de imagem, com decisão do Ian.
