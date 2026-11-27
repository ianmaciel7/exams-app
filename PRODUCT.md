# Product

## Scope reset — 2026-11-26

The product owner requested a fresh v0.1.0 release definition. **No feature is currently selected for the new scope.** Previous approvals, design baselines, and boards are preserved as historical evidence, not active release requirements. Review candidates in the [Ideas Board](https://github.com/ianmaciel7/exams-app/tree/dev/docs/boards/overview); only explicitly selected ideas enter the new release. Keep the version number v0.1.0. No prior implementation or validation status is transferred automatically.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The initial prototype will use simple HTML. Next.js is intended for a future project version; its adoption and timing remain open.

For the prototype, question data will come from a simple file. A Firebase administration panel is intended for the future; the database, import process, and migration tooling have not been selected.

## Users

For version 0.1.0, the sole intended user is the product owner, who is studying for a public-service competitive examination.

## Product Purpose

Support exam preparation by making it easier to answer questions, run mock exams, and track study progress, including questions answered correctly or incorrectly.

## Capabilities and Constraints

The [v0.1.0 decision register](docs/releases/v0.1.0/product/product.md#current-release-baseline) records release scope, evidence and acceptance checks.

- Version 0.1.0 is scoped to answering questions, mock exams, and progress tracking.
- In ordinary practice, show correctness feedback and retain evaluated attempts. The v0.1.0 answer-checking trigger remains open. Mock exams reveal results only after completion.
- Keep the competition heading on Questions and omit the redundant Questions subtitle.
- Ordinary question practice is scoped to one selected competition. Questions from different competitions may be combined only in mock exams. The configuration and ordering of mixed mock exams remain open.
- For the prototype, questions will be supplied in a simple file. The user has exam materials in a ChatGPT project; their contents and exact ingestion process remain to be reviewed.
- An exam-specific mock should follow its real examination format. A mixed mock may draw questions from different competitions and must not be presented as reproducing one official exam. Scoring and exam-specific rules still need to be established.
- A reference is Dataprev 2026, IT Analyst — Software Development, objective exam, booklet type 1: 70 multiple-choice questions, five options per question, one correct answer, and four hours including answer-sheet marking. [Official FGV booklet, page 1](https://conhecimento.fgv.br/sites/default/files/concursos/analista-de-tecnologia-da-informacao-desenvolvimento-de-software-cns003-tipo-1.pdf), verified 2026-11-25. The [official competition page](https://conhecimento.fgv.br/concursos/dataprev26) also provides the final answer key and amended notice. Scoring and amendments still require review before treating the complete exam rules as final.
- Progress should show the percentage of correct answers and identify stronger and weaker areas, broken down by exam, subject, and topic. Accuracy counts all recorded attempts, displays correct and total attempts, and distinguishes practice from mock exams. Data with few attempts should be presented cautiously.
- Home is the entry page, separate from Performance. The initial information architecture gives Home a brief progress summary and competition selection. Performance is accessed via top-level navigation, header actions, or dedicated views rather than a sidebar list or footer rail per V010-20.
- Selecting an exam opens its questions. Related information should be navigable through links throughout the system. The Performance area is separate from the profile.
- Mock exams are accessed within Questions and use the same question-page structure. The user can use the original exam question count when available or choose a count, use a timer, leave answers blank, and resume an interrupted session. Normally answers can be revisited and changed before finishing; verified exam-specific rules may restrict returning to certain questions. Results are shown at the end and include correct and incorrect answers and review of the correct answers. The initial mixed mock design selects two or more competitions with optional subject/topic narrowing. Interruption boundaries, persistence, question ordering, scoring and exam-specific rules remain open.
- When a mock exam is interrupted, pause its timer and resume from the remaining time when the user returns. When the allotted time expires, finalize it automatically with the answers recorded so far.
- Each question displays its source: exam, year, examining board, and organization when available, inspired by QConcursos. Never invent missing fields; the available fields must be checked against the actual source data.
- The personal prototype has no separate profile page. Settings, Profile, Dark/White Mode, and footer links are removed from v0.1.0 scope per V010-20. Performance is accessed via top-level navigation, header actions, or dedicated views rather than a footer rail. No account popover or footer navigation controls are part of the current design. This decision does not establish authentication or limit future versions.
- The primary area names — Performance, Questions, and Mock exams — are accepted for the initial information architecture.
- A future object structure inspired by Capacities is an intention, not a v0.1.0 requirement. Plan for data evolution and migrations without assuming its eventual schema.

## Product Principles

- Keep the first version focused on the owner's actual study workflow.
- Make correct and incorrect answers and saved progress easy to follow.
- Treat unconfirmed capabilities and design decisions as open questions.

## Current interface decisions (v0.1.0)

- The sidebar is a collapsible competition switcher; Home remains a conceptual entry destination, not a sidebar link. Mock exams is accessed from the competition workspace. See the [release baseline](docs/releases/v0.1.0/product/product.md#current-release-baseline).
- Question ID, subject, topic, subtopic when present, year, board, organization and exam have link affordances. Exact routes remain open. Show only available data and keep required supporting content inline.
- The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment.
- The latest [Sketch](docs/releases/v0.1.0/sketch/) uses abstract content, native editable notes and the project-launcher hand-drawn ink pass. Sketch approval is not implementation or usability approval.
