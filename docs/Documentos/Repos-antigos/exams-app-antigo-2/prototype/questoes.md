# Questões e navegador

- Problema: praticar questões por banca, ano, disciplina e concurso.
- Quem usa: estudante em preparação.
- Status: implementado no protótipo 0.1.1 (70 questões reais do Dataprev 2026, filtros e navegador). Evidência: `index.html` e `/concursos/dataprev-2026/questoes/` no projeto.
- Fluxo principal: filtrar → abrir questão em tela própria → responder → ver gabarito.
- Relações: Questão, Disciplina, Banca, Edição, Cargo ([dominio](dominio.md)).
- Regra de UX: o cartão de questão é o mesmo componente usado em revisão.
- Issues e PRs relacionados: nenhum item específico encontrado via REST em 2026-11-16.
- Lacunas: paginação unificada e nível de dificuldade ainda são decisões pendentes do responsável.
