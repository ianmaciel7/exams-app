# QConcursos: fluxo de navegação

Confirmado = link presente na página pública. Inferência = destino ou ação deduzidos do rótulo.

## Mapa principal (públicas)
```
Home (/)
├── Concursos (/concursos)
│   ├── Carreiras: /concursos/carreira-{policial, bancaria, tribunal, legislativa, administrativa, controle-e-gestao}
│   ├── Estado: /concursos/estado-{uf}
│   └── Concurso: /concursos/{orgao}   (página do concurso)
├── Editais (/questoes-de-concursos/concursos?by_situation[]=1..4)
│   └── mapeamento 1 a 4 = Previsto, Autorizado, Aberto, Inscrições Abertas (Inferência: pela ordem dos rótulos)
├── Provas (/questoes-de-concursos/provas)
├── Disciplinas (/questoes-de-concursos/disciplinas)
│   └── /disciplinas/{disciplina}/{assunto}/questoes   (lista filtrada)
├── Bancas (/questoes-de-concursos/bancas)
│   └── /bancas/{banca}   (ex.: cespe-cebraspe, vunesp, ibfc)
├── Cargos (/questoes-de-concursos/cargos)
├── Áreas de atuação e formação (/questoes-de-concursos/atuacao, /formacao)
├── Questões (/questoes-de-concursos/questoes)   ← banco com filtros
├── Simulados (/simulados)
│   ├── Banco de simulados: app.qconcursos.com/simulados/banco
│   ├── Prova pronta: app.qconcursos.com/simulados/provas/{id}
│   └── Personalizar: app.qconcursos.com/simulados/personalizar
├── Aulas (/questoes-de-concursos/aulas; /aulas-em-texto: materiais-de-apoio-texto; /aulas/ao-vivo)
├── Cursos (/cursos); Mentoria (/l/mentoria-concursos)
├── Notícias (folha.qconcursos.com)
├── Planos (/planos-de-assinatura)
└── Conta: Entrar (Google, Facebook, e-mail) / Criar conta
```

## Fluxo 1: banco de questões (Confirmado: rotas e rótulos; Inferência: passos de filtro)
1. Questões → escolher segmento (confirmação de troca apaga filtros).
2. Aplicar filtros (disciplina, assunto, banca, instituição, ano, cargo, nível, área).
3. Ver lista com contador e paginação.
4. Responder questão → feedback de gabarito.
5. Adicionar a caderno ou ver estatísticas.

## Fluxo 2: simulado (Confirmado)
1. /simulados → "Quero praticar" ou "Confira todos os simulados".
2. Escolher simulado pronto ou "Gerar simulado personalizado".
3. Confirmar e-mail (gate).
4. Responder; ver análise geral de desempenho.

## Fluxo 3: conversão (Confirmado)
Home → "Quero estudar grátis" → cadastro; "Assinar" / "Assine agora" → planos. Pontos repetidos no topo, banner e rodapé.

## Fluxo 4: concurso (Confirmado: rota; Inferência: conteúdo)
Concursos → carreira ou estado → página do concurso (edital, situação, disciplinas, questões do concurso). Página de detalhe não capturada.

## Pontos a validar logado
Caminho de "Continuar" em simulados, histórico, caderno, estatísticas, comentários.
