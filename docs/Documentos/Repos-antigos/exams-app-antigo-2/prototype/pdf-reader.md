# Leitor de PDF

- Problema: ler editais e provas dentro do app, com destaques.
- Quem usa: estudante que estuda a partir de documentos oficiais.
- Status: implementado no protótipo 0.1.1 com PDF.js (`pdf.min.js`, `pdf.worker.min.js`). Evidência: `index.html` linha ~4217 (carregamento com timeout e nova tentativa).
- Fluxo principal: abrir documento → navegar → destacar trecho → criar cartão a partir do destaque.
- Relações: PDF, Documento, Arquivo ([dominio](dominio.md)).
- Licença e atribuição: PDF.js e seus arquivos devem manter a atribuição original; não remover.
- Lacunas: não há teste de regressão de renderização registrado no repositório para PDFs grandes.
