# Features

Uma página por feature, no template abaixo. O índice para o board está em [features-index.json](features-index.json).

**Regra de status:** o estado de entrega vem só do GitHub (issues, PRs, CI, releases). As páginas apenas apontam para os números. Não há data de release nem percentual aqui.

Status possíveis: `implementado` (existe no protótipo 0.1.1), `parcial`, `proposto`, `benchmark`, `não verificado`, `bloqueado`. Um item fechado no GitHub não significa, sozinho, feature disponível ao usuário.

## Template

```
# Nome da feature
- Problema: ...
- Quem usa: ...
- Status: (um dos valores acima), com evidência (arquivo, linha, SHA)
- Fluxo principal: 3 a 6 passos
- Relações: objetos e tipos (ver ../architecture/dominio.md)
- Issues e PRs relacionados: #n (estado vem do GitHub)
- Lacunas: o que não foi verificado
```

## Páginas

| Feature | Página | Status resumido |
| --- | --- | --- |
| Workspace (abas, sidebar, painel direito) | [workspace.md](workspace.md) | implementado |
| Questões e navegador | [questoes.md](questoes.md) | implementado |
| Simulados | [simulados.md](simulados.md) | parcial |
| Leitor de PDF | [pdf-reader.md](pdf-reader.md) | implementado |
| Revisão e cartões | [revisao.md](revisao.md) | parcial |
| Grafo da coleção | [grafo.md](grafo.md) | implementado |
| Tipos e propriedades | [tipos-propriedades.md](tipos-propriedades.md) | implementado |
| Sincronização (Claude Storage) | [claude-storage.md](claude-storage.md) | parcial, não verificado em produção |
