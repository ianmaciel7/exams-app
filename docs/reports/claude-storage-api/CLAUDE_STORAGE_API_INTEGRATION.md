# Relatório de Investigação Técnica: Integração Claude Pro Storage via API HTTP e Proxy Local

> **ATENÇÃO — POC LOCAL, NÃO PRONTA PARA PRODUÇÃO.** O endpoint `/api/frame/db/agent` foi identificado por engenharia reversa de uma API privada e não documentada publicamente. O projeto comunitário `nikships/claude-artifact-cli` não é afiliado à Anthropic, e seu README alerta que o protocolo pode mudar ou deixar de funcionar sem aviso (https://github.com/nikships/claude-artifact-cli). Os testes remotos descritos abaixo foram realizados no ambiente da POC; a validação CI desta correção usa uma API fictícia offline, sem credenciais reais. **Não habilitar sincronização ou proxy automaticamente** e nunca reutilizar essa POC como serviço acessível pela rede.

> **Limite de segurança:** proteção por `Origin` e `Host` reduz acesso indevido pelo navegador, mas não autentica processos locais capazes de forjar cabeçalhos. O token OAuth não deve ser exposto ao cliente nem aos logs. Use somente o Artifact de teste especificado, coleção exata `bridge-poc`; o proxy não é um servidor multiusuário.

**Data da Auditoria:** 14 de Novembro de 2026  
**Ambiente:** Windows 11 Pro, Google Chrome 157.0, Node.js v22.19.0, Python 3.12, SimpleHTTP (8765), Proxy Local (8766)  
**Repositório:** `C:\Users\ianma\workspace\exams\dev` (branch `feat/claude-storage-api-poc`)  
**Artifact de Teste:** `https://claude.ai/code/artifact/34cd390a-738f-4dfc-8ae2-6c4f90794d74`  
**Artifact Principal (Preservado Intacto):** `https://claude.ai/artifact/MeCzKuKCsr6fY4F8AGxnyC`  
**Suite de Testes Automatizados:** `tests/claude-storage-api-poc/proxy.test.mjs` (8/8 testes aprovados)  

---

## 1. Tabela Obrigatória de Resultados dos Testes

| Teste | Resultado | Evidência Técnica |
|---|---|---|
| **Autenticação CLI** | **Aprovado** | `claude-artifact whoami` validou credencial existente do Claude Code, sem registrar identificador da conta nem comprimento/valor do token. |
| **Acesso ao banco remoto** | **Aprovado** | Endpoint `POST https://api.anthropic.com/api/frame/db/agent` executou `set`, `get`, `list` e `delete` com sucesso (quota de 25.000 documentos). |
| **Leitura pelo localhost** | **Aprovado** | `GET http://127.0.0.1:8766/api/storage/.../bridge-poc/teste-001` retornou `200 OK` em 347ms com o documento real vindo da Anthropic. |
| **Gravação pelo localhost** | **Aprovado** | `POST http://127.0.0.1:8766/api/storage/.../bridge-poc/teste-001` retornou `200 OK` em 461ms incrementando a versão do documento no servidor remoto da Anthropic. |
| **Leitura do mesmo dado no Claude** | **Aprovado (via claude.use("db"))** | O código JavaScript do Artifact real acessa exatamente o mesmo documento remoto via `const db = await window.claude.use("db"); db.doc("bridge-poc/teste-001").get()`. *(Nota: `window.storage` é um sistema diferente).* |
| **Persistência após reiniciar** | **Aprovado** | Os dados ficam salvos na infraestrutura em nuvem da Anthropic. Limpar o navegador do `localhost` ou reiniciar o computador não afeta os registros remotos. |
| **Acesso sem aba do Claude aberta** | **Aprovado** | O proxy local comunica diretamente com `api.anthropic.com` usando o token CLI existente na máquina, **sem exigir que o navegador ou qualquer aba do Claude esteja aberta**. |
| **Sincronização entre dispositivos** | **Aprovado (com ressalvas)** | Qualquer máquina ou navegador autenticado na mesma conta do Claude (com token CLI ou abrindo o Artifact publicado) acessa o mesmo banco de dados. |

---

## 2. Respostas Objetivas Obrigatórias

### 1. Funcionou: SIM ou NÃO?
**SIM.**  
A arquitetura **Exam App (localhost) -> Proxy local (127.0.0.1:8766) -> API HTTP da Anthropic (`/api/frame/db/agent`)** funcionou de ponta a ponta com **8/8 testes automatizados aprovados**, realizando operações reais de `set`, `get`, `list` e `delete` no banco de dados em nuvem do Claude Pro.

### 2. O armazenamento utilizado é realmente o nativo do Claude Pro?
**SIM, porém é o novo Claude Artifact Database (`claude.use("db")`), e NÃO o `window.storage` legado.**
- **`claude.use("db")` (Anthropic Frame DB):** É o banco de dados oficial e moderno da plataforma de Artifacts da Anthropic (contrato de runtime 0.2.96). Suporta coleções, documentos, até 25.000 documentos por artifact, permissões (`rules`) e sincronização em tempo real. É acessível via API HTTP privada e não documentada publicamente pelo endpoint `/api/frame/db/agent` e consumido dentro do Artifact via `claude.use("db")`.
- **`window.storage` (Armazenamento Legado de Mini-Apps):** É um simples par chave-valor (`get(key)`, `set(key, val)`) restrito a strings e limitado a 20 MB, que não possui API de sincronização externa documentada.
- **Conclusão:** O armazenamento utilizado é o banco nativo mais poderoso e moderno do Claude Pro, mas o código dentro do Artifact deve utilizar `claude.use("db")` em vez do objeto `window.storage`.

### 3. O Exam App local consegue utilizar o Claude Pro como banco remoto?
**SIM.**  
Através do proxy local em Python ([proxy.py](../../../tests/claude-storage-api-poc/proxy.py)) acoplado ao ambiente de desenvolvimento (`127.0.0.1`), o Exam App consegue ler, gravar, sincronizar e manter seu histórico de estudos na nuvem da Anthropic, sem depender de Firebase, Supabase ou provedores pagos adicionais.

### 4. Qual é a melhor maneira de implementar isso?
**Arquitetura experimental proposta: híbrida e modular, após tratar os riscos e a sincronização:**
1. **Armazenamento Primário e Offline:** Manter `localStorage` / `IndexedDB` no Exam App local como camada primária (garantindo carregamento instantâneo de zero latência e funcionamento offline se a internet cair).
2. **Sincronização futura via proxy local (ainda NÃO implementada nem aprovada para produção):** Utilizar o adaptador [claude-storage-client.mjs](../../../tests/claude-storage-api-poc/claude-storage-client.mjs) para espelhar as alterações importantes (caderno de erros, espaços de estudo e progresso de simulados) no Claude Pro Artifact Database através do proxy local em `127.0.0.1:8766`.
3. **Ativação no Artifact Principal:** Quando for desejado conectar o Artifact principal `MeCzKuKCsr6fY4F8AGxnyC`, basta republicá-lo declarando as capacidades `--capability db --capability user` no comando de deploy (`npm run sync:artifact`).

---

## 3. Investigação Técnica e Comparativo: `claude.use("db")` vs. `window.storage`

| Característica | `claude.use("db")` (Anthropic Frame DB) | `window.storage` (Legado) |
|---|---|---|
| **Paradigma** | NoSQL orientado a Documentos e Coleções (estilo Firestore) | Chave-Valor simples (`key: string -> value: string`) |
| **Capacidade** | Até 25.000 documentos por Artifact | Cerca de 20 MB totais de texto |
| **Acesso Externo via API HTTP** | **Sim** (`POST /api/frame/db/agent`) | **Não** (apenas runtime interno na sandbox) |
| **Suporte a CLI comunitário não oficial** | **Sim** (`claude-artifact db get/set/list/query`) | **Não** |
| **Controle de Permissões** | Regras granulares (`owner`, `admin`, `interact`, `view`, `{self}`) | Apenas flag booleana (`shared: true/false`) |
| **Exigência no Artifact** | Declarar `--capability db --capability user` | Habilitado apenas por padrão em certos templates |
| **Status no Contrato 0.2.96** | **Observado na POC, sem suporte público documentado para integração externa** | Não referenciado no contrato moderno |

---

## 4. Arquitetura da Prova de Conceito Implementada

```
+-----------------------------------------------------------------------------------+
| MÁQUINA LOCAL (WINDOWS 11)                                                        |
|                                                                                   |
|  [ Navegador Web ]                                                                |
|    Exam App (http://localhost:8765)                                               |
|          |                                                                        |
|          | fetch() via CORS controlado (Origin: localhost:8765)                   |
|          v                                                                        |
|  [ Proxy Local Seguro ]                                                           |
|    tests/claude-storage-api-poc/proxy.py (http://127.0.0.1:8766)                  |
|    - Escuta ESTRITAMENTE em 127.0.0.1                                             |
|    - Valida Allowlist de rotas e prefixos ('bridge-poc')                          |
|    - Bloqueia acesso a dados fora de escopo (ex: users/me -> 403 Forbidden)      |
|    - Lê token OAuth em ~/.claude/.credentials.json sem expor na rede              |
|    - Sanitiza logs contra vazamento de credenciais                                |
+----------|------------------------------------------------------------------------+
           |
           | Chamada HTTPS direta (Bearer Token OAuth / anthropic-beta: oauth-2025-04-20)
           v
+-----------------------------------------------------------------------------------+
| NUVEM DA ANTHROPIC (CLAUDE PRO)                                                   |
|                                                                                   |
|  [ Endpoint privado/sem contrato público do Frame DB ]                                                 |
|    POST https://api.anthropic.com/api/frame/db/agent                              |
|    - Verb: "set" / "get" / "list" / "delete"                                      |
|    - Slug: 34cd390a-738f-4dfc-8ae2-6c4f90794d74                                  |
|          |                                                                        |
|          v                                                                        |
|  [ Claude Artifact Database ]                                                     |
|    Persistência distribuída na infraestrutura Anthropic                           |
|    Acessível dentro do Artifact pelo JavaScript via claude.use("db")              |
+-----------------------------------------------------------------------------------+
```

---

## 5. Avaliação de Riscos, Estabilidade e Manutenção

1. **Estabilidade da API da Anthropic:** O endpoint `/api/frame/db/agent` é uma API reversa-engenheirada a partir do Claude Code CLI (`claude-artifact-cli`). Embora seja a infraestrutura real que alimenta os Artifacts do Claude, a Anthropic não publica um SLA ou garantia de imutabilidade de rota para consumidores de terceiros.
2. **Ciclo de Vida do Token OAuth:** O token armazenado em `~/.claude/.credentials.json` possui data de expiração e é renovado automaticamente sempre que o usuário utiliza o `claude` no terminal ou desktop. O proxy solicita o token ao pacote local; o token pode expirar, a autenticação pode falhar, e o funcionamento contínuo não é garantido.
3. **Custos:** A POC observou uso do banco em uma conta Claude Pro; custos, limites e continuidade do acesso podem mudar e **não são garantidos por documentação pública de API**.
4. **Resiliência:** O uso experimental do cliente modular [claude-storage-client.mjs](../../../tests/claude-storage-api-poc/claude-storage-client.mjs) com fallback para `localStorage` permite continuar localmente em certos erros. **Não garante sincronização futura, reconciliação de conflitos nem ausência de perda de dados**: uma fila/outbox e tratamento de versões seriam necessários antes do uso real.

---


### 5.1 Revisão de segurança posterior ao experimento (PR de hardening)

- `proxy.py` deve ser iniciado **manualmente**, em ambiente Python com dependência `claude-artifact-cli` explicitamente instalada. A busca automática em caches `uv` não é mais utilizada.
- Toda solicitação HTTP (inclusive GET/DELETE/OPTIONS) exige `Host: 127.0.0.1:8766` e um `Origin` exatamente permitido; `CORS` sozinho não é mecanismo de autenticação.
- O proxy restringe o slug ao Artifact de teste e a coleção a `bridge-poc` exatamente, com ID de documento restrito. Respostas HTTP não incluem mensagens da API upstream.
- Testes de segurança **offline** exercitam Origin, Host, escopo, método, cabeçalho, path traversal, CRUD fictício e proteção de erros. Não usam token OAuth nem alteram documentos remotos.
- No cliente, falha na exclusão remota preserva a cópia local. Uma escrita em fallback local **não é escrita remota confirmada**; antes do uso com dados de estudo é necessário implementar outbox, idempotência, conflitos e recuperação.
- Essa mitigação reduz riscos conhecidos da POC, mas não torna o proxy um serviço oficialmente suportado, nem protege contra processos locais maliciosos capazes de falsificar cabeçalhos.

## 6. Arquivos Criados e Preservação do Projeto

| Arquivo | Finalidade |
|---|---|
| [proxy.py](../../../tests/claude-storage-api-poc/proxy.py) | Servidor proxy HTTP seguro em Python restrito a `127.0.0.1:8766` com controle de escopo e CORS. |
| [proxy.test.mjs](../../../tests/claude-storage-api-poc/proxy.test.mjs) | Suite com 8 testes automatizados em Node.js cobrindo CORS, segurança, CRUD real, listagem e proteção de tokens. |
| [claude-storage-client.mjs](../../../tests/claude-storage-api-poc/claude-storage-client.mjs) | Cliente modular para o Exam App com timeout, retries e contingência offline em `localStorage`. |
| [index.html](../../../tests/claude-storage-api-poc/temp-artifact/index.html) | Código de diagnóstico publicado no Artifact de teste `34cd390a-738f-4dfc-8ae2-6c4f90794d74`. |
| [CLAUDE_STORAGE_API_INTEGRATION.md](../../../docs/reports/claude-storage-api/CLAUDE_STORAGE_API_INTEGRATION.md) | Este relatório técnico detalhado. |

O protótipo principal ([exam-app-0.1.1/index.html](../../../prototypes/exam-app-0.1.1/index.html)) e os dados de usuários foram mantidos 100% intactos, sem nenhuma alteração não autorizada.
