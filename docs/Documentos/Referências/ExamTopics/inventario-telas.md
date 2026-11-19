# ExamTopics: inventário de telas públicas

Confirmado = visto no HTML ou captura. Inferência = deduzido de links ou de convenção.

| Tipo de tela | Exemplo (URL) | Conteúdo confirmado | Imagem |
|---|---|---|---|
| Home | https://www.examtopics.com/ | Login, cadastro, fornecedores, busca, PRO | 01 |
| Catálogo de fornecedores | /exams/ | Lista de fornecedores (~150 na home) | 02 |
| Fornecedor | /exams/microsoft/ | Lista de certificações do fornecedor | 03 |
| Certificação (resumo) | /exams/microsoft/az-900/ | Descrição, link para lista de questões | 04 |
| Lista de questões (paginada) | /exams/microsoft/az-900/view/ | 474 questões, 10 por página, 48 páginas, "Next Questions" | 07 |
| Página seguinte | /exams/microsoft/az-900/view/2/ | Link confirmado; conteúdo não raspado | — |
| Fórum (todas as categorias) | /discussions/ | Lista de categorias por fornecedor, com discussões de exemplo | 08 |
| Discussão de questão | /discussions/microsoft/view/309545-.../ | Título "Exam SC-100 topic 5 question 14", link para prova | 11 |
| Busca | /search/ | Página com login/cadastro; resultados só após consulta (não testado) | 09 |
| PRO (landing) | /unlimited/ | Oferta PRO, link para /pro/ | 10 |
| PRO (checkout) | /pro/ | Página de checkout | 12 |
| Login / Cadastro | /login/, /signup/ | Formulários | 05, 06 |

## Não capturadas
- /exams/microsoft/sc-100/view/ (link da discussão 11)
- Páginas 2 e seguintes de questões
- Notícias e termos: não aparecem nos links públicos
- Contato: só e-mail (team@examtopics.com)
- Áreas logadas

## Atualização (2026-11-19, rodada de captura 22–37)
| Tela | URL | Status | Imagem |
|---|---|---|---|
| Lista de questões, página 2 | /exams/microsoft/az-900/view/2/ | 200, capturada | 28 |
| Prova SC-100 (lista de questões) | /exams/microsoft/sc-100/view/ | 200, capturada | 29 |
| Discussão SC-100 (hover no badge) | /discussions/microsoft/view/309545-.../ | 200, capturada | 30 |
| Home, rodapé | / | 200, capturada | 23 |
| Home mobile (390×844) | / | 200, capturada | 34 |
| Prova AZ-900 mobile | /exams/microsoft/az-900/ | 200, capturada | 35 |
| Lista de questões mobile | /exams/microsoft/az-900/view/ | 200, capturada | 36 |
| Estado de carregamento da lista | /exams/microsoft/az-900/view/ | captura em 150 ms após início | 37 |

## Sem captura (com motivo)
- **/contact/**: HTTP erro na navegação ("ERR_HTTP_RESPONSE_CODE_FAILURE"). Não é página pública confirmada.
- **/terms/**: navegação interrompida; sem página confirmada.
- **/news/**: navegação interrompida pelo redirecionamento; sem página confirmada.
- **Menu de usuário logado**: exige conta; fora de escopo. O menu sem login mostra apenas Login | Sign up (confirmado no HTML).
