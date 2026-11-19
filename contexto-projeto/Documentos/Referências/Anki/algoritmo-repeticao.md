# Repetição espaçada: como o Anki decide quando mostrar uma carta

## Ideia simples
Quem lembra de algo com esforço pode esperar mais para revisar. Quem esquece precisa revisar mais cedo. O algoritmo calcula o próximo intervalo a partir da resposta dada.

## SM-2 (Inferência: conhecimento geral, documentação do algoritmo não lida nesta etapa)
- Origem: algoritmo clássico de 1987 (SuperMemo 2), base de muitos apps.
- Cada carta tem um **fator de facilidade**. Acertar aumenta o intervalo, errar reduz.
- Anki usou variações do SM-2 em versões antigas do agendador. O manual cita isso em "Old scheduler versions" (menu, não lido).

## FSRS (Confirmado parcialmente: manual, "Deck Options" › FSRS)
- FSRS é o algoritmo mais recente que o Anki oferece como opção. Liga-se por deck options, em seção FSRS, globalmente.
- Parâmetros próprios por predefinição. Há botão "Optimize" que ajusta os parâmetros ao histórico da pessoa (Confirmado).
- **Retenção desejada (desired retention):** a proporção de cartas que a pessoa espera lembrar quando vencerem. Padrão 90% (Confirmado). Acima de 90% o volume de revisões cresce rápido; acima de 97% pode ficar pesado (Confirmado).
- O manual oferece "Compute minimum recommended retention" e um simulador (Confirmado: headers).
- Recomendação oficial: não tratar "Hard" como erro quando a pessoa esqueceu; use "Again" (Confirmado).

## O que isso significa para o Exams App (Inferência)
- A variável que o usuário controla deve ser clara: a meta de acerto (equivalente à retenção desejada), com padrão e explicação curta.
- O botão de avaliação precisa de rótulos que descrevam a lembrança, não a qualidade da pessoa. Confirmado no Anki: "Again" é esquecer; "Good" é lembrar com esforço.
- Para o Exams App, a avaliação de questões (acertou/errou/em dúvida) pode mapear para uma escala parecida, mas precisa de validação com usuários antes de virar regra.

## Fontes e pendências
- Manual oficial, "Deck Options" › FSRS (lido por trechos).
- Documentação técnica do FSRS e do SM-2: não lida nesta etapa. Antes de decidir algoritmo no produto, ler a fonte primária.
