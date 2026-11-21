# Planejamento e releases

Esta pasta descreve **como** planejar e liberar. O estado real (issues, PRs, CI, tags, releases, milestones) fica no GitHub; não copie status para cá.

- [estado-atual.md](estado-atual.md): o que o GitHub mostra hoje, com data e método de consulta.
- [template-feature.md](template-feature.md): modelo para abrir uma feature.
- [template-release.md](template-release.md): modelo para preparar uma release.

Fluxo vigente (do projeto): issue → branch de trabalho → PR contra `dev` → CI verde → squash merge → issue fechada com comentário apontando a PR. `main` não é alvo de PR.
