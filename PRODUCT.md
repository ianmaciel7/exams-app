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

- Version 0.1.0 is scoped to answering questions, mock exams, and progress tracking.
- Ordinary question practice is scoped to one selected competition. Subject and topic filters remain on the questions page. Questions from different competitions may be combined only in mock exams; the configuration and ordering of mixed mock exams remain to be defined.
- For the prototype, questions will be supplied in a simple file. The user has exam materials in a ChatGPT project; their contents and exact ingestion process remain to be reviewed.
- An exam-specific mock should follow its real examination format. A mixed mock may draw questions from different competitions and must not be presented as reproducing one official exam. Scoring and exam-specific rules still need to be established.
- A reference is Dataprev 2026, IT Analyst — Software Development, objective exam, booklet type 1: 70 multiple-choice questions, five options per question, one correct answer, and four hours including answer-sheet marking. [Official FGV booklet, page 1](https://conhecimento.fgv.br/sites/default/files/concursos/analista-de-tecnologia-da-informacao-desenvolvimento-de-software-cns003-tipo-1.pdf), verified 2026-11-25. The [official competition page](https://conhecimento.fgv.br/concursos/dataprev26) also provides the final answer key and amended notice. Scoring and amendments still require review before treating the complete exam rules as final.
- Progress should show the percentage of correct answers and identify stronger and weaker areas, broken down by exam, subject, and topic. Accuracy counts all recorded attempts, displays correct and total attempts, and distinguishes practice from mock exams. Data with few attempts should be presented cautiously.
- The entry page is separate from Performance and shows a brief progress summary and a path to choose a competition; the avatar menu links to the separate Performance area.
- Filters, including the missed-questions filter, belong on the questions page alongside the questions, not on a separate filter page. Previously missed questions should also be accessible from the performance area. Selecting an exam opens its questions; selecting a weak topic leads to practice questions. Related information should be navigable through links throughout the system. Performance is the accepted working name for the initial information architecture and is a separate area rather than part of a profile.
- Offer a Mock exams entry on the exam questions page, where the user can start a mock exam or view prior mock exams. Mock exams also show progress, metrics and relevant results. The initial mixed mock design selects two or more competitions with optional subject/topic narrowing; detailed ordering, timing and scoring remain to be defined.
- Each question displays its source: exam, year, examining board, and organization when available, inspired by QConcursos. Never invent missing fields; the available fields must be checked against the actual source data.
- The personal prototype has no separate profile page. A top avatar opens a dropdown containing a link to Performance; other menu contents remain open. This decision does not establish authentication or limit future versions.
- The primary area names — Performance, Questions, and Mock exams — are accepted for the initial information architecture.
- A future object structure inspired by Capacities is an intention, not a v0.1.0 requirement. Plan for data evolution and migrations without assuming its eventual schema.

## Product Principles

- Keep the first version focused on the owner's actual study workflow.
- Make correct and incorrect answers and saved progress easy to follow.
- Treat unconfirmed capabilities and design decisions as open questions.
