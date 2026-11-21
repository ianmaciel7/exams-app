# Auditoria #231 — leitura dos 21 candidatos a skills M3/Apple + agregador M09

- Issue: #231 (pendência da #156)
- Data da leitura: 2026-11-16
- Método: leitura pública via `raw.githubusercontent.com` (branch padrão). A API do GitHub (`api.github.com`) respondeu 403 no ambiente de sessão, então **não foi possível obter SHA de commit, data do último commit nem metadados do repositório**. Onde o SKILL.md foi lido, o conteúdo é o do branch padrão no momento da leitura, sem SHA registrado.
- Licença: indicada apenas pela presença do arquivo `LICENSE` (ou pelo campo `license:` do frontmatter quando existe). O texto da licença não foi lido em detalhe.
- Escopo desta rodada: frontmatter, índice de seções e cabeçalhos de cada SKILL.md. **Leitura integral de cada arquivo e de suas referências internas (`references/`) não foi feita.** Por isso nenhum item abaixo está marcado como "auditado integralmente".

## Status por item

| # | Projeto | URL lida | SKILL.md | Licença | Nível de confiança | Observação |
|---|---|---|---|---|---|---|
| M01 | skydashnet — Material 3 UI | github.com/skydashnet/material-design-3-ui-skill (main/SKILL.md) | Lido (v1.1.1, atualizado 2026-10-01) | LICENSE presente | Média | Frontmatter e fluxo de 10 passos; referências progressivas não lidas |
| M02 | hamen — Material 3 | github.com/hamen/material-3-skill | Não encontrado em main/master na raiz | LICENSE presente (master) | Baixa | Pendência: localizar o caminho do SKILL.md |
| M03 | abhixv — M3 Expressive | github.com/abhixv/google-m3-expressive-design-skill | Não encontrado na raiz | LICENSE presente | Baixa | README público lido: foco em tokens, geometria e motion do M3 Expressive; SKILL.md em caminho não localizado |
| M04 | Softengineit — Material Web | github.com/Softengineit/material-design-skill | Não encontrado na raiz | LICENSE presente | Baixa | Pendência: caminho do SKILL.md |
| M05 | gdlbo — Material | github.com/gdlbo/material-skill (main/SKILL.md) | Lido (cabeçalhos: hierarquia, papéis, gate Expressive, verificação) | Sem LICENSE na raiz | Média | Sem licença explícita: não usar código sem confirmar |
| M06 | macsystems — M3 Agent | github.com/macsystems/m3-agent-skill (main/SKILL.md) | Lido (name: material-design-3-expert) | LICENSE presente | Média | Skill curta (~2,6 KB) |
| M07 | yhongm — Material | github.com/yhongm/material-design-skill (master/SKILL.md) | Lido (~20 KB) | LICENSE presente (master) | Média | Cabeçalhos não extraídos nesta rodada |
| M08 | shelbeely — Material Shape | github.com/Shelbeely/Shelbeely-Agent-skills (skills/material-design-3-shape/SKILL.md) | Lido | Apache-2.0 (frontmatter) | Média | Tema: formas e containers M3 Expressive |
| M09 | majiayu000 — agregador | github.com/majiayu000/claude-skill-registry | Não é skill Material; README e LICENSE públicos lidos | LICENSE presente | Não aplicável | **Agregador. Projeto original não localizado.** Não atribuir conhecimento nem instalar antes de localizar a fonte primária |
| M10 | MadAppGang — Design References | github.com/MadAppGang/claude-code (plugins/dev/skills/design/design-references/SKILL.md) | Lido (v1.0.0) | Não verificada | Média | Referências predefinidas incl. M3 para revisões de UI |
| A01 | gotired — Apple Design Skills | github.com/gotired/Apple-Design-Skills (main/SKILL.md) | Lido (cabeçalhos: índice de arquivos, princípios, revisão, fontes) | Sem LICENSE na raiz | Média | Nota de licença sobre SF Symbols e fontes Apple |
| A02 | oye-rahul — Apple Web Design | github.com/oye-rahul/Apple-Design-Skill (main/SKILL.md) | Lido (v0.1.0; Liquid Glass, lente, motion) | Sem LICENSE na raiz | Média | Afirma "derived from Apple HIG" sem arquivo de licença |
| A03 | BuilderIO — Apple Design | github.com/BuilderIO/agent-native-product-visuals (.agents/skills/apple-design/SKILL.md) | Lido | Não verificada | Média | Foco em springs, gestos, sheets |
| A04 | bowen31337 — Apple Design Web | github.com/bowen31337/apple-design (main/SKILL.md) | Lido (seção de proveniência e crédito presente) | Sem LICENSE na raiz | Média | Roteamento para referências não lidas |
| A05 | dickwu — Apple Design | github.com/dickwu/apple-design-skill (main/SKILL.md) | Lido (cita 123 páginas do developer.apple.com) | Sem LICENSE na raiz | Média | Processo de revisão em 5 lentes; referências não lidas |
| A06 | tzzs — Apple Design | github.com/tzzs/apple-design-skill (main/SKILL.md) | Lido ("Grounded, or guessing") | LICENSE presente | Média-alta | Índice de referências e regra de citar apenas o que é verificável |
| A07 | sharmahr — iOS HIG | github.com/sharmahr/ios-human-interface-guidelines (main/SKILL.md) | Lido (name: apple-hig) | Sem LICENSE na raiz | Média | Escopo predominantemente iOS |
| A08 | ykswang — Apple HIG | github.com/ykswang/apple-hig-skill | SKILL.md não encontrado em main/master; README público lido | Não verificada | Baixa | Pendência: caminho do SKILL.md |
| A09 | alirezarezvani — Apple HIG Expert | product-team/apple-hig-expert/SKILL.md | 404 no caminho indicado | Não verificada | Baixa | Pendência: caminho atual no repositório |
| A10 | ehmo — Platform Design iOS | github.com/ehmo/platform-design-skills (skills/ios/SKILL.md) | Lido (name: ios-design-guidelines) | MIT (frontmatter) | Média | Escopo iPhone/SwiftUI/UIKit |
| A11 | rshankras — Apple Design Skills | github.com/rshankras/claude-code-apple-skills (skills/design/SKILL.md) | Lido (last_verified 2026-07-18) | LICENSE presente | Média | Liquid Glass, animação, microcopy |
| A12 | Sunwood-ai-labs — Apple HIG | github.com/Sunwood-ai-labs/design-with-apple-hig (main/SKILL.md) | Lido (fluxo evidence-first) | LICENSE presente | Média-alta | Nota explícita: licença de código separada dos direitos sobre texto e ativos Apple |

## Resumo

- SKILL.md lido nesta rodada: 16 de 22 itens (M01, M05, M06, M07, M08, M10, A01 a A07, A10, A11, A12).
- SKILL.md não localizado no caminho testado: M02, M03, M04, A08, A09. M03 e M04 têm README e LICENSE públicos.
- Agregador M09: projeto original **não localizado**. Pendência.
- Não testados nesta rodada: M09 (localização da origem), A03 (leitura confirmada apenas do cabeçalho). Dos 22, os itens com caminho ainda não confirmado são listados como pendência.

## Pendências para o Ian

1. Confirmar caminhos atuais de SKILL.md para M02, M03, M04, A08 e A09, ou indicar a versão correta do repositório.
2. Localizar o projeto original do agregador M09 antes de usar qualquer conteúdo atribuído a ele.
3. Decidir sobre licenças ausentes (M05, A01, A02, A04, A05, A07): sem LICENSE, não reutilizar código; referenciar apenas como fonte de consulta.
4. Leitura integral (incluindo `references/`) de cada SKILL.md, com SHA de commit. Exige acesso à API do GitHub, que estava bloqueada nesta sessão.
