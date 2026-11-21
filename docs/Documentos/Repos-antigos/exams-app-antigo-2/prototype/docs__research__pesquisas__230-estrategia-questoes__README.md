# Issue #230: pesquisa Estratégia Questões (consolidação e pendências)

Data: 16/11/2026 · Issue: #230 · Pendência separada da #51.

Este diretório reúne o que foi possível fazer **na nuvem, sem login**:

| Arquivo | Conteúdo |
|---|---|
| [README.md](docs__research__pesquisas__230-estrategia-questoes__README.md) | Consolidação do relatório base, lacunas e status por item da issue |
| [roteiro-captura.md](roteiro-captura.md) | Roteiro executável de capturas desktop e mobile, com URLs, passos e critérios |
| [roteiro-usabilidade.md](roteiro-usabilidade.md) | Tarefas de usabilidade com passos, critérios de sucesso e métricas |
| [comparacao-prototipo-dev.md](comparacao-prototipo-dev.md) | Comparação com o protótipo em `dev` (`prototype/exam-app-0.1.1__index.html`), lida por seções |

Base: `/mnt/project-files/pesquisas/estrategia-questoes/relatorio-final.md` (16/11/2026).

## Status dos itens da issue

| Item pedido na issue | Situação | Onde está |
|---|---|---|
| Capturas desktop e mobile (home, filtros, busca, questão, explicação, caderno, simulado, resultado, estatísticas, configurações, vazio, carregando, erro) | **Pendente: depende do Ian** (precisa de sessão logada) | [roteiro-captura.md](roteiro-captura.md) |
| Planos e limites atuais, com data da verificação | **Não verificado** (preço visível só na página pública, sem data de verificação confiável) | Seção 1 abaixo |
| Mapa de navegação logado | **Pendente: depende do Ian** | [roteiro-captura.md](roteiro-captura.md), seção 3 |
| Tarefas de usabilidade | **Roteiro pronto**, execução pendente (precisa de sessão logada e de pessoas testando) | [roteiro-usabilidade.md](roteiro-usabilidade.md) |
| Comparação com o protótipo em `dev` | **Feita por seções** (ver lacunas) | [comparacao-prototipo-dev.md](comparacao-prototipo-dev.md) |

## 1. O que já foi observado em páginas públicas (sem login)

- **Observado** (16/11/2026, página pública): o "Sistema de Questões" é vendido como assinatura do Estratégia Concursos, com a frase "mais de 2 milhões de questões". Preços visíveis no momento da leitura: 1 ano, cartão em até 12x de R$ 39,90; 2 anos, cartão em até 12x de R$ 59,90; 10% de desconto no boleto; teste de 7 dias. A página não mostra data. Fonte: https://www.estrategiaconcursos.com.br/sistema-de-questoes
- **Observado** (página de assinaturas, com JavaScript, texto parcial): banner "Black Friday 2026", "18 mil cursos e 100 mil videoaulas". Preço do plano de questões não apareceu. Fonte: https://concursos.estrategia.com/assinaturas/
- **Observado** (artigo "Como utilizar", de 03/07/2021, texto antigo, não confirmado hoje): filtros por matéria, assunto, banca, área, dificuldade, ano e região; cadernos com criar, compartilhar, editar, excluir e duplicar; criar simulado; impressão em PDF; 5, 10, 15 ou 20 questões por página ou uma por vez; estatística por alternativa. Fonte: https://www.estrategiaconcursos.com.br/blog/como-utilizar-o-sistema-de-questoes-do-estrategia/
- **Relatado** (só título e URL de busca): vestibulares.estrategia.com e cj.estrategia.com têm sistemas de questões próprios.

## 2. Lacunas declaradas

- Capturas: nenhuma obtida. Dependem de sessão logada do Ian.
- Planos completos, limites de uso, política de cancelamento e data de verificação: não verificados.
- Artigo de filtros (`blog/filtros-no-sistema-de-questoes`): redireciona para página com erro, não foi lido.
- Reclame Aqui, Reddit e lojas de app: não lidos.
- Modo offline, IA, gabarito separado, ordenação e filtros salvos no Estratégia: **não observados** nas páginas públicas.

## 3. Como o Ian fecha as pendências

1. Abrir o Estratégia Questões logado no navegador do ian-pc ou na própria conta.
2. Seguir [roteiro-captura.md](roteiro-captura.md) e salvar as capturas com o nome indicado em cada item.
3. Enviar as capturas no projeto (ou colocar em `prototype/docs__research__pesquisas__230-estrategia-questoes__capturas__*`) e comentar nesta issue ou na thread.
4. Rodar [roteiro-usabilidade.md](roteiro-usabilidade.md) com pelo menos 3 pessoas e registrar os resultados no mesmo diretório.

Enquanto isso não acontece, esta issue fica aberta. Nada aqui representa captura de tela ou dado de conta logada.
