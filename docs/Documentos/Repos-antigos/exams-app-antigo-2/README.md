# exams-app-antigo-2

- **Branch recuperada:** `dev` (29 branches no total; `main` só tem `.gitignore`). Outras branches (`feat/*`, `docs/*`, `claude/project-thread-*`) não foram copiadas.
- **Stack:** HTML/CSS/JS estático sem build, `pdf.js`, scripts Python/Node para boards e proxy de storage. Sem framework.
- **Site base:** `prototype/exam-app-0.1.1__index.html` (app de estudos "Concurso de TI": Início, Questões, Simulados, Revisar erros, Meus Cadernos, Explorar, Leituras, Tipos de objeto, Gráfico, Lixeira) com dados em `prototype/exam-app-0.1.1__data__dataprev-2026-tipo1.json`. Versão anterior: `0.1.0` (leitor de edital).
- **Outras páginas:** `prototype/mestre.html` (central de boards), `gallery.html` (catálogo de evidências), `boards/index.html`.
- **Docs:** `DESIGN.md`, `MOTION.md`, `AGENTS.md`, `prototype/REUSE-MAP.md`, `prototype/boards/**` (7 boards temáticos em Markdown).
- **Como rodar:** `python3 -m http.server 8765 --directory prototype` e abrir `http://localhost:8765/exam-app-0.1.1__index.html`.
- **Omitido por tamanho:** ~360 PNGs, PDFs do edital, bundles git, `pdf.worker.min.js`, `mermaid.min.js`. Sem eles o leitor de PDF não carrega; os arquivos estão no repo original.
- **Capturas:** `capturas/` (desktop 1366 e mobile 390 do 0.1.1, 0.1.0, mestre e gallery).
