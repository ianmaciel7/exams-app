# Tipos e propriedades

- Problema: modelar concursos, editais, provas e questões com herança e propriedades.
- Quem usa: todas as pessoas do app.
- Status: implementado no protótipo 0.1.1 (constante `TYPES`, 13 tipos).
- Fluxo principal: abrir valor de propriedade → ver lista filtrada de tudo que compartilha o valor.
- Relações: ver [dominio.md](dominio.md).
- Lacunas: a regra "todo valor de propriedade é um link" está no contrato de UX do projeto; não há teste automatizado que a verifique.
