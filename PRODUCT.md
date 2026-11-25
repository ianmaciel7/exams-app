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
- Exam selection, including choosing multiple exams and viewing their questions, has been discussed as part of the study experience; its precise behavior remains open.
- For the prototype, questions will be supplied in a simple file. The user has exam materials in a ChatGPT project; their contents and exact ingestion process remain to be reviewed.
- Mock exams should follow the format of the real competitive examination. Scoring and any exam-specific rules still need to be established.
- A reference is Dataprev 2026, IT Analyst — Software Development, objective exam, booklet type 1: 70 multiple-choice questions, five options per question, one correct answer, and four hours including answer-sheet marking. [Official FGV booklet, page 1](https://conhecimento.fgv.br/sites/default/files/concursos/analista-de-tecnologia-da-informacao-desenvolvimento-de-software-cns003-tipo-1.pdf), verified 2026-11-25. The [official competition page](https://conhecimento.fgv.br/concursos/dataprev26) also provides the final answer key and amended notice. Scoring and amendments still require review before treating the complete exam rules as final.
- Progress should show the percentage of correct answers and identify stronger and weaker areas, broken down by exam, subject, and topic. Calculation details remain open.
- The preferred starting point is progress. In the initial version, questions are found by exam; other ways to find them may be added later.
- Filters, including the missed-questions filter, belong on the questions page alongside the questions, not on a separate filter page. Previously missed questions should also be accessible from the performance area. Selecting an exam opens its questions; selecting a weak topic leads to practice questions. Related information should be navigable through links throughout the system. Performance is the accepted working name for the initial information architecture; whether it belongs in a profile is undecided.
- Possible navigation for v0.1.0: offer starting or viewing mock exams from the exam questions page near its filters. This is a proposal, not a finalized interaction or placement.
- When more than one exam is selected, combining their questions in one list is a tentative direction; ordering and labeling remain open.
- For this personal prototype, a separate profile is not currently needed; this is a recommendation pending confirmation, not a restriction on future versions.
- The primary area names — Performance, Questions, and Mock exams — are accepted for the initial information architecture.
- A future object structure inspired by Capacities is an intention, not a v0.1.0 requirement. Plan for data evolution and migrations without assuming its eventual schema.

## Product Principles

- Keep the first version focused on the owner's actual study workflow.
- Make correct and incorrect answers and saved progress easy to follow.
- Treat unconfirmed capabilities and design decisions as open questions.
