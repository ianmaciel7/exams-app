# ExamTopics: matriz de interações

Legenda: Confirmado = vi no HTML ou na lista de links. Inferência = deduzido. Não testado = não executado.

| Elemento | Tela | Ação | Resultado | Destino | Status |
|---|---|---|---|---|---|
| Login | todas | clique | modal de login | /login/ | confirmado (modal no HTML) |
| Sign up | todas | clique | página de cadastro | /signup/ | confirmado |
| Fornecedor (card) | /exams/ | clique | lista de certificações | /exams/{fornecedor}/ | confirmado (links) |
| Certificação | /exams/{fornecedor}/ | clique | resumo da prova | /exams/{fornecedor}/{prova}/ | confirmado (links) |
| "Questions" / ver questões | resumo | clique | lista paginada | /exams/{fornecedor}/{prova}/view/ | confirmado (link) |
| Reveal Solution | /view/ | clique | mostra resposta correta | mesma página | inferência |
| Discussion | /view/ | clique | discussão da questão | /discussions/{fornecedor}/view/... | inferência (href="#") |
| Next Questions | /view/ | clique | próximas 10 questões | /view/2/ | confirmado (link) |
| Discussão de questão | /discussions/.../view/ | clique em link da prova | prova | /exams/{fornecedor}/{prova}/view/ | confirmado (link na página) |
| Categoria do fórum | /discussions/ | clique | discussões do fornecedor | /discussions/{fornecedor}/ | confirmado (links) |
| Busca | /search/ | digitar e enviar | resultados | não testado | não testado |
| Ordenar comentários | discussão | clique | nova ordem | não testado | não testado |
| Show Suggested Answer | discussão | clique | mostra sugestão | não testado | não testado |
| PRO (oferta) | /unlimited/ | clique | checkout | /pro/ | confirmado (link) |
| Checkout | /pro/ | preencher | pagamento | não testado | não testado (fora do uso educado) |

## Fora do escopo deste mapeamento
Interações que exigem conta, pagamento ou envio de dados não são testadas.

## Interações confirmadas (Playwright + Chromium local, 2026-11-19)
Ferramenta: Playwright com o Chromium já instalado no ambiente, sem chave de API, sem login, sem captcha. Poucas requisições (cerca de 8 carregamentos de página). Viewport 1920×1080.

| Elemento | Tela | Ação | Resultado confirmado | Destino | Imagem |
|---|---|---|---|---|---|
| Reveal Solution (Q1) | /view/ | clique | resposta correta aparece; botão vira "Hide Solution" | mesma URL | 14 |
| Discussion (Q1) | /view/ | clique | abre modal com "Exam AZ-900 topic 1 question 1 discussion" e comentários | mesma URL (modal, não navega) | 15 |
| Fechar modal (×) | modal de discussão | clique | modal fecha | mesma URL | 20 |
| Next Questions | /view/ | clique | navega para página 2 | /exams/microsoft/az-900/view/2/ | 16 |
| Ícone de busca (topo) | qualquer página | clique | abre campo de busca | mesma URL | — |
| Campo de busca + "azure" + Enter | /search/ | digitar e enviar | página de resultados | /search/?q=azure | 21 |
| Busca direta (preencher campo da página /search/) | /search/ | preencher | falhou: campo oculto até abrir o ícone | — | 19 |
| Badge "Most Recent" | /discussions/microsoft/view/... | clique | sem mudança de URL nem de lista; é rótulo, não controle | mesma URL | 18 |

## Não encontrado (confirmado)
- **Ordenação Most Voted / Highly Voted / Most Recent como controle:** não há controle de ordenação no modal de discussão (só o botão ×) nem na página de discussão. "Most Recent" aparece como badge no primeiro comentário. Os nomes "Most Voted" e "Highly Voted" não aparecem como controles.
- **Show Suggested Answer:** não encontrado com esse texto. A página usa "Reveal Solution" e "Hide Solution".

## Pendente
- Estados de hover, foco e carregamento não foram capturados.
- Página 2 de questões e o conteúdo da busca com resultados não foram inspecionados em detalhe (só a URL e a imagem da tela).
- Discussão da SC-100 (página própria) não teve interação de ordenação confirmada.

## Hover e foco (capturados, 2026-11-19)
| Elemento | Estado | Imagem | Observação |
|---|---|---|---|
| "EXAMTOPICS PRO" (menu do topo, home) | hover | 22 | estado capturado |
| Reveal Solution (Q1) | hover | 24 | estado capturado |
| Reveal Solution (Q1) | foco (via teclado/focus()) | 25 | estado capturado |
| Discussion (Q1) | hover | 26 | estado capturado |
| Next Questions (paginação) | hover | 27 | estado capturado |
| Badge "Most Recent" (discussão SC-100) | hover | 30 | estado capturado |

Efeito visual de hover/foco não comparado pixel a pixel com o estado padrão; as imagens mostram o estado após a ação.

## Carregamento
- Lista de questões (imagem 37): captura em 150 ms após início da navegação. Mostra o estado inicial, não um spinner confirmado.

## Não capturado nesta rodada
- Hover e foco nos cartões de fornecedor: não testado.
- Página de discussão SC-100 com ordenação: não há controle de ordenação (já confirmado antes).
