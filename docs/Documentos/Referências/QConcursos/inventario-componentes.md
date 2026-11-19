# QConcursos: inventário de componentes

Fonte: HTML renderizado das telas T1 a T4 (ver inventario-telas.md). **Confirmado** = presente no HTML. **Inferência** = nome ou função deduzidos. Estados (hover, foco, erro, carregando, selecionado) **não verificados**: exigem navegador.

| Componente | Onde aparece | Variações observadas | Estado | Observação para o Exams App |
|---|---|---|---|---|
| Cabeçalho com busca | T1, T3 | Campo "Buscar por disciplinas, concursos e provas"; botões Entrar, Central de ajuda, Assinar, "Quero estudar grátis" | Confirmado | Busca global por três tipos de entidade |
| Menu lateral/drawer | T1, T3 | Grupos por segmento (Concursos, Militares, OAB, ENEM, Vestibular) com submenus | Confirmado | Agrupar por segmento se houver mais de um |
| Seletor de segmento | T3 | Lista de 5 segmentos; aviso "Isso limpará todos os campos já preenchidos no filtro!" | Confirmado | Troca de contexto apaga filtros; avisar antes |
| Painel de filtros | T3 | Simples e avançado ("Mostrar filtro avançado"), Meus Filtros, Salvar Filtros, Limpar, Filtrar | Confirmado | Filtro salvo com nome |
| Filtro por chip/lista com busca rápida | T3 | Disciplina, Assunto, Banca, Instituição, Ano, Cargo, Nível, Área de Formação, Área de Atuação; campo "Busca rápida" e "OK" | Confirmado | Cada filtro tem busca interna |
| Contador de resultados | T3 | "Foram encontradas 2.957.583 questões" | Confirmado | Mostrar total após filtro |
| Seletor de itens por página | T3 | "Por página: 5" | Confirmado | Padrão baixo (5); avaliar 10 ou 20 |
| Ordenação | T3 | "Ordenar por" | Confirmado | Opções não lidas |
| Ações de página | T3 | Modo noturno, Imprimir, Configurações, A+ / A- (tamanho de texto) | Confirmado | A+/A- é acessibilidade útil |
| Cartão de questão | T3 | Código Q, breadcrumb, metadados (ano, banca, órgão, prova), enunciado, alternativas | Confirmado | Estrutura de cartão já mapeada |
| Breadcrumb de assunto | T3 | "Disciplina > Assunto" em tags | Confirmado | Tags clicáveis |
| Alternativas | T3 | A-D e assertivas I-V | Confirmado | Lista com letra; suportar romanos |
| Botão Responder | T3 | "Responder" | Confirmado | Ação principal do cartão |
| Feedback de resposta | T3 | "Incorreta. Gabarito oficial da banca" / "Parabéns! Você acertou!" + mensagem de incentivo | Confirmado | Feedback textual e por cor (verificar contraste) |
| Ações pós-resposta | T3 | "Adicionar a um caderno", "Ver estatísticas", "Ficou com dúvidas?" | Confirmado | Três ações de continuidade |
| Caderno | T3 (via ação) | "Salve essa questão em um caderno para revisar depois"; "Minhas Anotações" | Confirmado | Coleção de questões salvas |
| Modal de confirmação de e-mail | T2 | "Confirme seu e-mail para continuar"; alterar; enviar link; "Não encontrou? Confira a pasta de spam" | Confirmado | Gate; texto de ajuda útil |
| Cartão de simulado | T2 | Nome da prova, nº de questões, nível (Superior/Médio) | Confirmado | Cartão com metadados em linha |
| Gerador de simulado | T2 | "Gerar simulado personalizado" (disciplinas, assuntos, dificuldade) | Confirmado | Fluxo de configuração |
| Chip "Mais procurados" | T2 | Caixa Econômica, TSE Unificado, MPU, BNDES, PF, Correios | Confirmado | Atalhos por órgão |
| Banner de planos | T1, T2, T3 | Black Friday, "Assine agora", "Ver planos e preços" | Confirmado | Repetido em várias telas |
| Login social | T1, T2 | Continuar com Google, Facebook, e-mail; "Criar uma conta" | Confirmado | Três métodos |
| Rodapé | T1, T2, T3 | Assinar, Central de ajuda, Termos, Privacidade, Sobre, Trabalhe conosco; redes sociais | Confirmado | Padrão |
| Paginação | T3 | Número de página (ex.: 1, 2, 3) e contador | Confirmado | Não capturado o estado de página ativa |
