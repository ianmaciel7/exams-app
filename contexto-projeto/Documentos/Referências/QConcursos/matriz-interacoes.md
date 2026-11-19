# QConcursos: matriz de interações (elemento → ação → resultado → destino)

Fonte: rótulos e links do HTML (2026-11-19). Destino = URL confirmada no HTML. Resultado = **Inferência** quando não foi executado.

| Elemento | Tela | Ação | Resultado | Destino | Status |
|---|---|---|---|---|---|
| Buscar por disciplinas, concursos e provas | T1, T3 | digitar + enter | resultados de busca (não testado) | /busca (não verificado) | Inferência |
| Seletor de segmento | T3 | escolher outro segmento | aviso; limpa filtros; recarrega lista | mesma rota | Confirmado (aviso); Inferência (recarga) |
| Filtro Disciplina/Assunto/Banca/... | T3 | escolher opção ou busca rápida + OK | lista reduzida; contador atualiza | parâmetros na URL (não confirmado) | Inferência |
| Ano | T3 | escolher ano (2026 a 1994) | lista de questões daquele ano | parâmetro de ano | Inferência |
| Mostrar filtro avançado / simples | T3 | alternar | mostra ou esconde filtros | mesma tela | Confirmado (rótulo) |
| Meus Filtros / Salvar Filtros | T3 | salvar com nome | filtro reutilizável | área logada | Inferência (exige conta) |
| Por página | T3 | escolher quantidade | mais ou menos itens por página | mesma tela | Confirmado (rótulo) |
| Modo noturno | T3 | ativar | tema escuro | mesma tela | Confirmado (rótulo) |
| A+ / A- | T3 | aumentar ou reduzir texto | tamanho de fonte muda | mesma tela | Confirmado (rótulo) |
| Imprimir | T3 | imprimir | diálogo de impressão | — | Confirmado (rótulo) |
| Responder (alternativa) | T3 | marcar alternativa e Responder | gabarito e feedback | mesma tela | Confirmado (texto de feedback) |
| Adicionar a um caderno | T3 | clicar | questão salva para revisão | caderno (área logada) | Confirmado (rótulo); destino Inferência |
| Ver estatísticas | T3 | clicar após responder | desempenho na questão | área logada | Confirmado (rótulo); Inferência |
| Ficou com dúvidas? | T3 | clicar | comentários ou explicação | não verificado | Inferência |
| Quero praticar | T1, T2 | clicar | banco de simulados | app.qconcursos.com/simulados/banco | Confirmado |
| Simulado (cartão) | T2 | clicar | prova pronta | app.qconcursos.com/simulados/provas/{id} | Confirmado |
| Gerar simulado personalizado | T2 | clicar | configuração de simulado | app.qconcursos.com/simulados/personalizar | Confirmado |
| Pratique grátis com até 5 simulados | T2 | clicar | cadastro ou simulado (limite 5) | não verificado | Confirmado (texto); destino Inferência |
| Confirmar e-mail (Enviar link de confirmação) | T2 | clicar | envia link | — | Confirmado (rótulo) |
| Continuar com Google / Facebook | T1, T2 | clicar | login social | /conta/auth/google_oauth2 e /facebook | Confirmado |
| Continuar com e-mail | T2 | clicar | formulário de e-mail | #!/signin-email | Confirmado |
| Quero estudar grátis / Assinar | Cabeçalho | clicar | cadastro ou planos | /planos-de-assinatura?... | Confirmado |
| Assinar agora / Conheça nossos planos | T2, rodapé | clicar | página de planos | /planos-de-assinatura | Confirmado |
| Carreira (Policial, Bancária...) | T1 | clicar | lista de concursos da carreira | /concursos/carreira-{x} | Confirmado |
| Situação (Aberto, Autorizados, Previstos...) | T1 | clicar | lista filtrada por situação | /questoes-de-concursos/concursos?by_situation[]=n | Confirmado |
| Estado (sigla) | T1 | clicar | concursos do estado | /concursos/estado-{uf} | Confirmado |
| Concurso em destaque | T1 | clicar | página do concurso | /concursos/{órgão} | Confirmado (URL); conteúdo não lido |
| Disciplina | T3, rodapé | clicar | questões da disciplina | /questoes-de-concursos/disciplinas/{d} | Confirmado |
| Banca (ex.: CESPE) | rodapé, bancas | clicar | página ou questões da banca | /questoes-de-concursos/bancas/{b} | Confirmado (URL); conteúdo não lido |
| Notícias | cabeçalho, rodapé | clicar | portal de notícias | folha.qconcursos.com | Confirmado |
| Central de ajuda | cabeçalho, rodapé | clicar | suporte | suporte.qconcursos.com/pt-BR | Confirmado |
| Abrir menu / Buscar | mobile | clicar | menu ou busca | — | Confirmado (rótulo "Abrir menu", "Abrir busca") |
