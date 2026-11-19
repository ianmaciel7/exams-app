# QConcursos: visão geral e funcionalidades

Fonte principal: páginas públicas qconcursos.com (home, /simulados, /questoes-de-concursos/questoes), lidas em 2026-11-19 via Firecrawl (leitura de HTML renderizado; não é navegação de navegador).
Legenda: **Confirmado** = visto no texto/HTML da página. **Inferência** = deduzido de rótulos ou convenção; precisa de validação.

## O que é
- Plataforma brasileira de preparação para concursos (Concursos Públicos, Militares, OAB, ENEM, Vestibular). **Confirmado** (home, menu de segmentos).
- Modelo: parte gratuita com cadastro + assinatura (planos, "Black do QC"). **Confirmado** (botões "Quero estudar grátis", "Assinar").
- Conteúdo de terceiros organizado por concurso, banca, órgão, disciplina e cargo. **Confirmado** (filtros do banco).
- Subdomínio de notícias (folha.qconcursos.com) e app separado (app.qconcursos.com, onde ficam simulados e questões). **Confirmado** (links).

## Funcionalidades (públicas)
| Área | O que faz | Relevância para o Exams App |
|---|---|---|
| Concursos e editais | Lista por carreira (Policial, Bancária, Tribunal etc.), por situação (Aberto, Inscrições Abertas, Autorizados, Previstos) e por estado | Alta: filtro por situação do concurso |
| Banco de questões | Filtros por segmento, disciplina, assunto, banca, instituição, ano (2026 a 1994), cargo, nível (Fundamental, Médio, Superior), área de formação e área de atuação. Contador de resultados ("2.957.583 questões"). Paginação com "Por página" (5 por padrão) e ordenação | Alta: núcleo do pedido (banca, órgão, disciplina, ano) |
| Filtros salvos | "Meus Filtros", "Salvar Filtros", "Nome do novo filtro" | Média: caderno de filtros reutilizável |
| Caderno | "Adicionar a um caderno" para revisar depois; "Minhas Anotações" | Alta: equivale a caderno de revisão |
| Resposta e gabarito | Botão "Responder"; feedback "Incorreta. Gabarito oficial da banca" ou "Parabéns! Você acertou!"; link para estatísticas | Alta: feedback imediato e estatísticas |
| Comentários | "Ficou com dúvidas?" (acesso a comentário/explicação) | Média: comunidade/dúvidas |
| Simulados | Simulados prontos por cargo/banca (ex.: CESPE PRF 120 questões); "Gerar simulado personalizado" por disciplina, assunto, dificuldade; "Simuladão da semana" (exclusivo para assinantes); "Análise geral" de desempenho | Alta: simulado e análise |
| Aulas | Videoaulas, aulas em texto, playlists no YouTube, cursos e mentoria | Baixa para o escopo inicial (conteúdo, não recurso) |
| Guias e notícias | Guias de estudo, "Meu Primeiro Concurso", "Como usar o Qconcursos", notícias | Baixa |
| Conta | Login por Google, Facebook ou e-mail; criação de conta | Média: autenticação |
| Gate de confirmação | Modal "Confirme seu e-mail para continuar" antes de usar recursos (simulados) | Alta como padrão a evitar ou justificar (fricção) |

## Pontos de atenção para o Exams App
- Filtros são o principal caminho de descoberta: banca, órgão, disciplina, assunto, ano, cargo, nível. **Confirmado.**
- Caderno e "Meus Filtros" sugerem personalização por recorte de estudo. **Inferência** (nome dos botões; comportamento real exige conta).
- Estatísticas aparecem após responder, e a análise geral é um recurso separado. **Confirmado** (texto), detalhes **não verificados** (logado).
- Monetização e gate de cadastro são fortes na vitrine: o Exams App deve decidir o que fica livre. **Inferência** de posicionamento (decisão de produto).

## Não verificado (exige conta ou interação)
Resolução de questões logada, comentários, filtros aplicados, estatísticas, caderno, simulador em andamento, ordenação, modo noturno, hover e foco, responsividade mobile.
