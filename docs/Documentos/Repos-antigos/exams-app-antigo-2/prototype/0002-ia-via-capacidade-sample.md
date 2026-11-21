# ADR 0002: IA via capacidade `sample` do visualizador

- Status: vigente
- Data da decisão: 2026-11-13 (registrada no projeto pelo responsável do produto)
- Proveniência: código `prototype/exam-app-0.1.1__index.html` (chamada `window.claude.use('sample')`, linha ~7530, classe `ai-on`); botões de IA sempre visíveis desde a versão 116 da prototipagem.

## Contexto
O app precisa de funções de IA (explicar questão, criar cartões, sugerir o que revisar, assistente). Não há backend próprio nem chave de API no repositório.

## Decisão
As funções chamam a capacidade `sample` do visualizador do Claude. Ela roda na conta de quem está vendo. Quando a capacidade não existe, os botões ficam esmaecidos com dica explicativa.

## Consequências
- Sem chave de API no repositório e sem custo fixo para o projeto.
- O custo e o limite de uso recaem sobre a conta de quem visualiza.
- Qualquer republicação do artifact deve declarar `sample`, ou as funções de IA desaparecem.
- Não é um contrato de API estável; se o visualizador mudar, o ADR precisa de revisão.
