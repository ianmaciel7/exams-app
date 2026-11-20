# Design System do Exams App (v2)

Recriado em 2026-11-19, substituindo a versão anterior. Inspirado no *estilo* do Claude (calor editorial: fundo creme, tinta quase preta, acento terracota, títulos serifados), sem copiar marca, logotipo ou fontes proprietárias.

## Arquivos
- `tokens.json`: cor (claro/escuro), tipografia, espaçamento, raios, sombras, regras de acessibilidade.
- `componentes/preview.html`: botão, input, chip, questão com estados, navegação; abre no navegador, alterna tema.

## Decisões
- **Cores**: neutros quentes (creme `#faf9f5`, tinta `#141413`) e acento terracota. Os hex neutros vêm da paleta pública de brand guidelines da Anthropic; o terracota foi **escurecido** (`#b4492a`) porque o `#d97757` da marca dá ~2,9:1 sobre o creme e falha WCAG AA como texto. No escuro, o acento clareia (`#e8896a`).
- **Tipografia**: Styrene e Tiempos (Anthropic) são licenciadas. Usamos equivalentes livres: Source Serif 4 (títulos e enunciados, leitura longa) e Inter (interface). Enunciado em serifa a 1,6 de entrelinha e ~68 caracteres.
- **Estados de resposta**: selecionada (acento), correta (verde), incorreta (vermelho), marcada (azul). Sempre com ícone e rótulo, nunca só cor (WCAG 1.4.1).
- **Acessibilidade**: contraste medido por script (WCAG 2.2): texto/fundo 17,5:1 claro e 15,8:1 escuro; texto mudo ≥ 6,2:1; acento como texto ≥ 5,0:1; bordas de controle ≥ 3,3:1; estados ≥ 5,4:1. Alvos de toque 44px, foco visível 2px, tema pelo sistema com opção manual, layout fluido.
- Sombras discretas; hierarquia por borda e fundo, como no estilo de referência.

## Fontes consultadas
- Paleta e tipografia públicas de brand da Anthropic (skill brand-guidelines): github.com/ComposioHQ/awesome-claude-skills/blob/master/brand-guidelines/SKILL.md e academy.claude.com (Package your brand guidelines in a skill).
- Geist, estudo de caso Anthropic (Styrene + Tiempos): geist.co/work/anthropic.
- Recriação comunitária do estilo: github.com/rohitg00/awesome-claude-design (design-md/warm/claude.md) e github.com/jcmrs/claude-visual-style-guide.
- Claude Design, ajuda oficial: support.claude.com/en/articles/14604416-get-started-with-claude-design.
- Figma: não consultado (ver pendências).

## Pendências
- Criar também uma biblioteca no Figma? Aguardando decisão do Ian.
- Paleta de dados/gráficos e ícones ainda não definidas.
