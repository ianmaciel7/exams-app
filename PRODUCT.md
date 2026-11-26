# Product

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

The [v0.1.0 decision register](docs/releases/v0.1.0/product.md#current-release-baseline) records release scope, evidence and acceptance checks.

- Version 0.1.0 is scoped to answering questions, mock exams, and progress tracking.
- In ordinary practice, allow the learner to choose automatic answer checking (represented as a toggle switch beside the question filters) or a manual Verify action. Mock exams reveal results only after completion.
- On Questions, show multiple questions in a scrollable list by default, with controls for quantity and a one-question view. Place filters below the Questions heading, with the automatic-check option nearby.
- The missed-questions filter includes questions whose latest checked attempt was incorrect. A later correct attempt removes the question from that filter while preserving every attempt in history and metrics.
- Ordinary question practice is scoped to one selected competition. Subject and topic filters remain on the questions page. Questions from different competitions may be combined only in mock exams; the configuration and ordering of mixed mock exams remain to be defined.
- For the prototype, questions will be supplied in a simple file. The user has exam materials in a ChatGPT project; their contents and exact ingestion process remain to be reviewed.
- An exam-specific mock should follow its real examination format. A mixed mock may draw questions from different competitions and must not be presented as reproducing one official exam. Scoring and exam-specific rules still need to be established.
- A reference is Dataprev 2026, IT Analyst — Software Development, objective exam, booklet type 1: 70 multiple-choice questions, five options per question, one correct answer, and four hours including answer-sheet marking. [Official FGV booklet, page 1](https://conhecimento.fgv.br/sites/default/files/concursos/analista-de-tecnologia-da-informacao-desenvolvimento-de-software-cns003-tipo-1.pdf), verified 2026-11-25. The [official competition page](https://conhecimento.fgv.br/concursos/dataprev26) also provides the final answer key and amended notice. Scoring and amendments still require review before treating the complete exam rules as final.
- Progress should show the percentage of correct answers and identify stronger and weaker areas, broken down by exam, subject, and topic. Accuracy counts all recorded attempts, displays correct and total attempts, and distinguishes practice from mock exams. Data with few attempts should be presented cautiously.
- Home is the entry page, separate from Performance. The initial information architecture gives Home a brief progress summary and competition selection. The avatar menu links to Performance.
- Filters, including the missed-questions filter, belong on the questions page alongside the questions, not on a separate filter page. Previously missed questions should also be accessible from the performance area. Selecting an exam opens its questions; selecting a weak topic leads to practice questions. Related information should be navigable through links throughout the system. Performance is the accepted working name for the initial information architecture and is a separate area rather than part of a profile.
- Mock exams are accessed within Questions and use the same question-page structure. The user can use the original exam question count when available or choose a count, use a timer, leave answers blank, and resume an interrupted session. Normally answers can be revisited and changed before finishing; verified exam-specific rules may restrict returning to certain questions. Results are shown at the end and include correct and incorrect answers and review of the correct answers. The initial mixed mock design selects two or more competitions with optional subject/topic narrowing. Interruption boundaries, persistence, question ordering, scoring and exam-specific rules remain open.
- When a mock exam is interrupted, pause its timer and resume from the remaining time when the user returns. When the allotted time expires, finalize it automatically with the answers recorded so far.
- Each question displays its source: exam, year, examining board, and organization when available, inspired by QConcursos. Never invent missing fields; the available fields must be checked against the actual source data.
- The personal prototype has no separate profile page. An avatar at the bottom of the sidebar opens a menu containing a link to Performance; other menu contents remain open. This decision does not establish authentication or limit future versions.
- The primary area names — Performance, Questions, and Mock exams — are accepted for the initial information architecture.
- A future object structure inspired by Capacities is an intention, not a v0.1.0 requirement. Plan for data evolution and migrations without assuming its eventual schema.

## Product Principles

- Keep the first version focused on the owner's actual study workflow.
- Make correct and incorrect answers and saved progress easy to follow.
- Treat unconfirmed capabilities and design decisions as open questions.
