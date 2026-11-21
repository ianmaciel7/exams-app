# ADR 0001: Protótipo estático, sem etapa de build

- Status: vigente
- Proveniência: `AGENTS.md` ("The prototypes are static HTML. No build step, no dependencies beyond Python 3."); SHA observado `9beadadd`.

## Contexto
O produto está em fase de protótipo. A versão 0.1.1 é um único `index.html` com cerca de 9 mil linhas, mais PDF.js e o motor de sincronização.

## Decisão
Os protótipos são HTML/CSS/JS estáticos servidos por `python -m http.server`, sem bundler nem dependências de runtime além de Python 3 para servir.

## Consequências
- Qualquer pessoa roda sem instalar nada. Facilita revisão visual.
- Não há componentização, testes de unidade do front nem tipagem. Cada mudança grande aumenta o risco de regressão.
- Migrar para framework é uma decisão futura; deve virar novo ADR com TO-BE separado.
