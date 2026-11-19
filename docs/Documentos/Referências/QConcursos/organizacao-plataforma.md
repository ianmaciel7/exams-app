# QConcursos: organização da plataforma

Confirmado = visto na home ou em /simulados e /questoes-de-concursos/questoes (2026-11-19). Inferência = dedução.

## Eixos de organização do conteúdo
1. **Segmento** (topo): Concursos Públicos, Militares, OAB, ENEM, Vestibular. Muda o menu e o conteúdo. **Confirmado**
2. **Concurso / Órgão / Instituição**: ex. Câmara dos Deputados, Receita Federal, TJ-SP; agrupado por carreira e estado. **Confirmado**
3. **Prova**: nome composto "Banca - Ano - Órgão - Cargo" (ex.: "AMEOSC - 2026 - Prefeitura ... - Professor de Artes"). **Confirmado**
4. **Disciplina → Assunto**: ex. "Saúde Pública > Epidemiologia e Saúde Coletiva > Políticas Públicas..."; hierarquia de até 3 níveis. **Confirmado** (breadcrumb de cada questão)
5. **Banca organizadora**: CESPE/CEBRASPE, FCC, VUNESP, IBFC, IBADE, Consulplan, AOCP, IBFC. **Confirmado**
6. **Cargo** e **Área de Atuação** (ex.: Policial, Tribunal, Bancária). **Confirmado**
7. **Nível**: Fundamental, Médio, Superior. **Confirmado**
8. **Área de Formação** (ex.: Direito, Engenharia Civil, Pedagogia): lista longa. **Confirmado**

## Metadados por questão
Código (ex. Q4452960), ano, banca, órgão, prova, disciplina e assuntos, enunciado, alternativas A a D (ou I a V para assertivas), gabarito, resposta do usuário, comentários. **Confirmado** (campos visíveis na listagem)

## Estrutura de menus
- Menu principal (mobile e desktop): Concursos, Provas, Disciplinas, Questões, Aulas em vídeo, Aulas em texto, Cursos, Cargos, Bancas, Áreas de Atuação, Áreas de Formação, Instituições, Guias de Estudo. **Confirmado**
- Acesso rápido: Comece aqui, Simulados, Disciplinas, Bancas, Cargos, Carreiras. **Confirmado**
- Rodapé: Assinar, Central de ajuda, Termos de uso, Política de privacidade, Sobre, Trabalhe conosco; redes sociais. **Confirmado**
- Apêndice: Bancas, Cargos, Instituições, Áreas de Formação, Áreas de Atuação. **Confirmado**

## Separação de produtos
- Site público (qconcursos.com): conteúdo, vitrine e catálogo. **Confirmado**
- App (app.qconcursos.com): simulados, banco e resolução com conta. **Confirmado** (links)
- Notícias (folha.qconcursos.com): subdomínio separado. **Confirmado**

## Implicações para o Exams App (Inferência, decisão de produto pendente)
- Vale um modelo de dados com Banca, Órgão, Concurso, Prova, Disciplina > Assunto, Ano, Cargo e Nível, em vez de uma única tag. Isso sustenta os filtros pedidos.
- Simulado e caderno são coleções de questões com ordem e contexto diferentes; o modelo deve permitir as duas.
- Sem login não há histórico. Confirmar com o Ian antes de definir o que é público.
