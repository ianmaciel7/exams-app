# Workspace

- Problema: organizar concursos, documentos e anotações em espaços isolados, com várias abas.
- Quem usa: estudante com mais de um objetivo.
- Status: implementado no protótipo 0.1.1 (abas, barra de tabs, painel direito com Explorar, Gráfico, Backlinks, Relacionados e IA). Evidência: `prototype/exam-app-0.1.1__index.html`.
- Fluxo principal: escolher espaço → abrir objeto em nova aba → navegar pela sidebar → usar painel direito.
- Relações: Espaço (isolamento), Objeto, Tipo ([dominio](dominio.md)).
- Issues e PRs relacionados: PR #250 (ARIA das abas), PR #249 (alvos de 24 px). Estado verificado via REST em 2026-11-16.
- Lacunas: leitura com leitor de tela (#226, #234) estava listada como pendência do responsável e está fechada no GitHub; a verificação de acessibilidade real não foi refeita aqui.
