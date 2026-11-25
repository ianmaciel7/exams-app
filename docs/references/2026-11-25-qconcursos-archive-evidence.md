# QConcursos question interface — archive evidence

Retrieved on 2026-11-25 from the [Exams Archive snapshot release](https://github.com/ianmaciel7/exams-app-archive/releases/tag/exams-app-2026-11-23-complete), asset `exams-app-dev-snapshot.tar.gz` (SHA-256 `9266ed7b3e04aa33e7192073bfd27ab863e201796bb709017b70c86c25109d15`). The branch inventory identifies `ianmaciel7/exams-app@dev` at commit `dfc277cd98239c92d2a6b9f6dea44393b15a626b`.

The original paths are under `docs/Documentos/02-referencias/qconcursos/imagens/recuperadas/`:

- [Initial question](assets/qconcursos/qconcursos_live_question_initial_state.png), Git blob `cd856f284a586092c5839ea8be1c55f62b0c2145`.
- [Answered question](assets/qconcursos/qconcursos_live_question_answered_feedback.png), Git blob `42d4bcf11b354065a14db11e8daf6e1db954203d`.

The images were visually inspected. The historical initial state shows a question number and ID, subject/topic breadcrumb, year, board, organization and exam metadata, associated-text control, statement, vertically arranged lettered options, answer and error-report actions, and resource tabs beneath. The answered state shows correct-answer and textual feedback. These screenshots establish the captured appearance, not current behavior or approved Exam App features. Question tools shown in the sketch are reference-only proposals until scoped for the release.

## Additional visual evidence

- [Expanded filters](assets/qconcursos/qconcursos_live_filter_builder_top.png), Git blob `be0ce95ad69a470b00992714dfcae731e50c2320`: response-status filters, keyword search and filter selectors; topic selection is disabled until a subject is selected.
- [Subject selector](assets/qconcursos/qconcursos_filter_disciplina_open.png), Git blob `0232b9b940dc781ca28b1c03462e5ea849e6ceb5`: searchable multi-select with checkboxes and its own scroll area. Another captured filter state shows removable selection chips and Clear and Filter actions.
- [Focus mode](assets/qconcursos/qconcursos_dock_modo_foco.png), Git blob `4086fbbd9f627a0ed141770c1a7c234d2fef58ef`: a toggle described as showing one question at a time.
- [Mock exam configuration](assets/qconcursos/qconcursos_criar_simulado_config_modal.png), Git blob `0943bb44ca13072bc599b2d456ca479cc3c11d65`: name, question count per subject and duration, including an unlimited-time option.

These are historical reference patterns, not additional v0.1.0 requirements. The question list also shows a result count, a per-page control, sorting and a Create mock exam action. A captured answer shows feedback and an eliminated alternative; none of the inspected evidence establishes automatic answer checking. Some filenames imply open menus or dialogs that the corresponding images do not actually show. The archived written inventory and logged-in captures also report different counts and page sizes; they reflect different captured states and do not establish a single default.
