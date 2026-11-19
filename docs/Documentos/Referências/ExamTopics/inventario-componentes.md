# ExamTopics: inventário de componentes interativos

Fonte: HTML da lista de questões do AZ-900 (confirmado). Comportamento ao clicar = inferência, não testado (não há ferramenta de clique disponível nesta sessão).

## Cabeçalho e navegação (todas as telas)
| Componente | Tipo | Estados vistos | Comportamento |
|---|---|---|---|
| Login | link | padrão | abre modal (`data-toggle="modal"`) [confirmado no HTML] |
| Sign up | link | padrão | vai para /signup/ [confirmado] |
| Breadcrumb do fornecedor | link | padrão | vai para /exams/microsoft/ [confirmado] |

## Lista de questões (/view/)
| Componente | Tipo | Estados vistos | Comportamento |
|---|---|---|---|
| Cartão de questão | bloco | número, tópico, texto, imagem opcional | agrupa a questão [confirmado] |
| Opções de resposta (A, B, C, D ou Sim/Não) | lista | padrão; "Most Voted" oculto (classe d-none) | [confirmado] marcação, [inferência] seleção |
| Reveal Solution | botão primário | padrão | mostra bloco "Correct Answer" [confirmado no HTML: resposta já presente; revelação por JS = inferência] |
| Discussion (com contador) | botão secundário | padrão, contador (ex.: 98) | vai para a discussão da questão [inferência; href="#"] |
| Gráfico de votos da comunidade | barra | percentuais por letra (presente no HTML) | [confirmado] presença; visibilidade na tela não verificada |
| Mensagem de consistência ("resposta pode diferir…") | texto | padrão | informativo [confirmado] |
| Paginação ("Viewing page 1 out of 48") | texto + barra | padrão | informativo [confirmado] |
| Next Questions | botão | padrão | vai para /view/2/ [confirmado] |
| Indicador "Browse at least 50%" | texto | padrão | motivacional [confirmado] |

## Fórum, busca, PRO, login, cadastro
| Tela | Componente | Observação |
|---|---|---|
| Fórum | cards por fornecedor, link para discussões | [confirmado na lista de links] |
| Busca | campo de busca, login/cadastro | campo de busca não confirmado no HTML raspado |
| PRO | botão para /pro/ | [confirmado] |
| Login/Cadastro | formulários | conteúdo de formulário não inspecionado |

## Não verificado (exige interação)
- Ordenação de comentários da discussão
- Filtros e abas da busca
- "Show Suggested Answer" e reveal por JS
- Estados de hover, foco, erro, carregamento
