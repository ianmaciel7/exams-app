---
name: subagent-issue-orchestrator
description: Orquestra a resolução automatizada de issues do GitHub em paralelo utilizando subagentes especializados (Gemini Flash), auditando rigorosamente cada entrega, validando código, testes e Zero Emoji Policy, atualizando o Planning Board, e realizando squash & merge de Pull Requests com sincronização contínua com a branch remota e artefatos.
---

# Subagent Issue Orchestrator Skill

Esta skill descreve o protocolo padrão para orquestrar a resolução autônoma, paralela e validada de issues do repositório utilizando subagentes especializados.

## 1. Triagem e Descoberta de Trabalho
1. **Listar estado atual:**
   - `gh issue list --limit 100` para mapear todas as issues abertas.
   - `gh pr list` para verificar PRs pendentes ou em conflito.
   - `git fetch origin` e alinhar branch local com `origin/dev`.
2. **Agrupamento para Paralelização:**
   - Identificar issues que tocam módulos ou áreas independentes (ex.: UI Shell, Questões/Simulados, Grafo/Canvas, Leitor/Reader).
   - Issues que tocam trechos idênticos de código podem ser resolvidas em sequência ou em branches isoladas com merge sequencial.

## 2. Invocação de Subagentes em Paralelo
1. Utilizar a ferramenta `invoke_subagent` passando múltiplos subagentes na lista `Subagents`:
   - `Model: 'flash'` (alta velocidade e eficiência para tarefas bem especificadas).
   - `Role: 'Issue <N> Specialist'`
   - `Prompt`: Deve conter o número da issue, título, requisitos funcionais exatos, referências históricas (`docs/archives/`) ou de design, e regras mandatórias do repositório.
2. Cada subagente deve criar uma branch temática `fix/<tema>-issue-<N>`, comitar suas alterações, opcionalmente abrir o PR e reportar o resultado detalhado ao orquestrador.

## 3. Protocolo de Auditoria do Orquestrador (Quality Gate)
Para CADA subagente que reportar conclusão, o orquestrador DEVE verificar:
1. **Inspeção de Diff:**
   - `gh pr diff <num>` ou `git diff dev..branch`.
   - Confirmar que as mudanças atendem fielmente aos critérios de aceite e não introduzem regressões.
2. **Validação Técnica & Sintaxe:**
   - Em arquivos estáticos/HTML: extrair scripts e rodar `node --check`.
   - Em apps Node/Python: rodar testes e linters do projeto.
3. **Zero-Emoji UI Policy (Regra Mandatória #42):**
   - Executar scanner regex `[\U00010000-\U0010ffff]` no código-fonte alterado.
   - Garantir 0 emojis Unicode na interface do usuário (usar apenas ícones vetoriais SVG monocromáticos com `currentColor` e `stroke-width="1.8"`).
4. **Planning Board & Governança (Zero Information Loss):**
   - Garantir que decisões arquiteturais e evidências visuais estejam registradas em `prototypes/board-exam-app/board.json`.
   - Regenerar documentação com `npm run board`.

## 4. Resolução de PRs e Fechamento de Issues
1. Abrir PR se ainda não estiver aberto: `gh pr create --base dev --head <branch> --title "..." --body "..."`.
2. Verificar mergeabilidade: `gh pr view <num> --json mergeable,mergeStateStatus`.
3. Squash & Merge: `gh pr merge <num> --squash --delete-branch`.
4. Fechar issue: `gh issue close <num> --comment "Resolvido no PR #<num>."`.
5. Atualizar branch local e espelhar no Claude Cloud:
   - `git checkout dev && git reset --hard origin/dev`
   - `git push origin dev:claude/project-thread-6zihkn`

## 5. Próxima Onda de Paralelismo
Repetir o ciclo para o próximo lote de issues em paralelo até que todas as pendências e PRs estejam integralmente concluídos.
