# Performance and account menu research

Research for Exam App v0.1.0, consulted on 2026-11-25. The recommendations below are proposals for a personal study prototype, not decisions or evidence that the interface exists.

## Performance

The intended questions are: how am I doing, which topics need attention, and what should I practice next? A compact analytical overview can show correct answers alongside evaluated attempts, with breakdowns by exam, subject, and topic, and links to practice the relevant questions. Show both numerator and denominator; no evaluated attempts means no data, not zero accuracy. Separate free practice from mock exams when their scoring rules differ.

- [NN/g: Dashboards — Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/): dashboards support rapid interpretation; position and length are useful encodings for quantitative comparison. A list or horizontal bars are options for comparing topics.
- [W3C WAI: Complex Images](https://www.w3.org/WAI/tutorials/images/complex/): charts that communicate substantial information need an accessible textual equivalent conveying relevant values and relationships.

Metric definitions are open: counting all attempts, first attempts, or the latest attempt per question leads to different percentages. Distinguish questions from attempts and show limited evidence rather than treating a small sample as proven mastery. Coverage requires a defined syllabus; time requires a reliable time record. No target score or threshold has been selected.

## Account menu

The user suggested a top avatar opening a dropdown. This is a possible account or global-settings menu, not necessarily a separate profile page. For the personal prototype, actual actions, authentication, synchronization, and the placement of Performance remain open. Do not imply that login or account functions exist.

- [Carbon: Disclosures — Profile menu](https://www.carbondesignsystem.com/building-blocks/core/patterns/disclosures): describes a profile menu in the UI shell for account and session options, particularly where the product offers login.
- [Carbon: UI shell header](https://www.carbondesignsystem.com/building-blocks/core/components/ui-shell-header/code): documents the shared header component; the page lists a 2026 update. A design-system pattern is guidance, not proof that every application needs an avatar.

## Question-origin imagery

The user asked to inspect historical question images through Exams Archive. The historical visual catalog points to Qconcursos and ExamTopics captures, but the original image files were not retrieved or inspected in this research. Their appearance and displayed metadata therefore remain unverified. The proposed source label on each question comes from the user's request; exact fields are not finalized.

Archive starting points: [repository README](https://github.com/ianmaciel7/exams-app-archive/blob/main/README.md) and [historical index](https://github.com/ianmaciel7/exams-app-archive/blob/main/reports/FULL-INDEX.md). The historical index alone does not establish image contents.

**Later update, 2026-11-25:** Historical QConcursos question screenshots were subsequently recovered and inspected. See [archive evidence](2026-11-25-qconcursos-archive-evidence.md) for source, images and limits. This update supersedes the earlier retrieval limitation; ExamTopics screenshots have not been recovered in this investigation.

## Sidebar account placement — archived visual evidence

The user chose the bottom of the sidebar for the avatar, superseding the earlier top-avatar placement. In the [2026-11-23 archive snapshot](https://github.com/ianmaciel7/exams-app-archive/releases/tag/exams-app-2026-11-23-complete), `exams-app-dev-snapshot.tar.gz` has SHA-256 `9266ed7b3e04aa33e7192073bfd27ab863e201796bb709017b70c86c25109d15`; its inventory identifies `ianmaciel7/exams-app@dev` commit `dfc277cd98239c92d2a6b9f6dea44393b15a626b`. The following original screenshots were visually inspected and retained:

- [Sidebar prototype, default](assets/sidebar/sidebar-default.png), [open account menu](assets/sidebar/sidebar-avatar-menu.png), and [mobile drawer](assets/sidebar/sidebar-mobile.png): the account appears at the sidebar bottom; the desktop menu opens above it. Original paths: `docs/Documentos/01-planejamento/revisao/sidebar-prototipo/capturas/`.
- [Space shell account menu](assets/sidebar/space-shell-avatar-menu.png): another historical prototype places the account at the sidebar bottom and opens its menu above. Original path: `docs/Documentos/01-planejamento/revisao/space-shell/desktop-claro-5-menu-usuario.png`.
- [Readwise Reader home](assets/sidebar/readwise-reader-home.png): account appears at the lower end of the left sidebar. Original path: `docs/Documentos/02-referencias/readwise-reader/imagens/recuperadas/readwise_reader_home_dashboard.png`.
- [Capacities workspace](assets/sidebar/capacities-workspace.png): footer controls are visible, but this image alone does not establish that an avatar is present there. Original path: `docs/Documentos/02-referencias/capacities/imagens/recuperadas/01-capacities-workspace-baseline.png`.

These are selected historical examples, not a count of all products or proof of current behavior. The archive contains many more images; the existing notes remain historical rather than a mandate to copy other menu actions.
