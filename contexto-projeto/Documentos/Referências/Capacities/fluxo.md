# Capacities: fluxo de navegação

Mapa das páginas públicas e de como elas se ligam. Capturas em `capturas/`. Marcações: **Confirmado** (link lido na página) ou **Inferência**.

## Mapa de páginas públicas
```
capacities.io/                     (home)                       [captura 01, 05 mobile]
├── /product                       (produto, objetos, IA, mídia) [captura 02]
├── /pricing                       (planos, FAQ)                 [captura 03]
├── /why-capacities                (por que as pessoas trocam)   não capturada
├── /pro                           (recursos Pro)                não capturada
├── /believer                      (plano Believer)              não capturada
├── /visual-note-taking            (quadros)                     não capturada
├── /task-management               (tarefas)                     não capturada
├── /ai-knowledge-base             (conexão com IA)              não capturada
├── /faq, /help, /roadmap          (suporte)                     não capturadas
└── app.capacities.io/start        (cadastro, login)             NÃO ACESSADO (exige conta)

docs.capacities.io/
├── /reference/object-types        (tipos prontos)               [captura 04]
├── /reference/object-types/{tipo} (uma página por tipo)         não capturadas (amostra: Area, Project, Person)
├── /reference/object-properties
├── /reference/whiteboards, /reference/search, /reference/queries  não lidas
└── /developer/api                 (API pública, Pro)            não lida
```

## Caminho principal (Confirmado na home e /pricing)
1. Home → "Start Free" → app.capacities.io/start (cadastro sem cartão).
2. Home → "Discover Product" → /product → "Try free" (mesmo cadastro).
3. Qualquer página → "Compare plans" → /pricing → "Get started" (Basic) ou "Get Capacities Pro" (checkout).
4. /pricing → "Start free trial" no app (Settings > Subscription & Billing). Confirmado no FAQ.

## Fluxos de decisão (Inferência a partir de links)
- **Quem já usa outra ferramenta**: home → /why-capacities ("Why people switched from Notion and Obsidian") → cadastro.
- **Quem quer IA**: /product (seção AI) → /ai-knowledge-base → cadastro.
- **Quem pensa em pagar**: /pricing → comparação ("Compare every feature") → Pro ou Believer.
- **Quem quer apoio ao projeto**: /pricing → /believer.

## Navegação dentro do app
Não verificada (exige conta). Apenas o que o produto descreve publicamente: daily note como ponto de entrada (home) e painel de tarefas (/product).

## Fluxo do Exams App sugerido por este mapa (Inferência)
Mesma lógica de entrada, adaptada:
Início (dia de estudo) → Concurso ou edital → Tópico → Questão → Revisão → Estatísticas do tópico.
Cadastro só depois de o aluno ver valor (padrão do Basic: "Start free, upgrade when it earns its place").
