# Release v0.1.0 — product discovery

This record preserves the thinking for this release as it was captured on 2026-11-24. It is a working discovery record, not evidence that the release is implemented. `PRODUCT.md` describes the evolving product; this file preserves release-specific context even if that description later changes.

## Initial direction

- **User:** the product owner, studying for a public-service competitive examination.
- **Problem:** it is difficult to keep track of correct and incorrect answers, preserve progress, and practice with mock exams.
- **Scope:** answer questions, take exam-like mock exams, and track progress. The preferred starting point is progress.
- **Question discovery:** initially by exam; additional approaches may come later. Multiple exam selection has been discussed, with exact behavior still open.
- **Review:** previously missed questions should be accessible through a questions-page filter and from the performance or metrics area. The area's name and whether it belongs in a profile are undecided.
- **Progress:** show accuracy and strengths and weaknesses by exam, subject, and topic. The calculation rules are undecided.
- **Prototype:** simple HTML with questions supplied in a simple file. Next.js and a Firebase administration panel are future intentions, not requirements for the initial prototype. The database and migration tooling are undecided.
- **Future direction:** consider data evolution and migrations with a possible Capacities-inspired object structure in mind; do not assume that structure is part of v0.1.0.

## Reference and evidence limits

- A local Dataprev 2026 IT Analyst — Software Development exam, booklet type 1, states 70 questions, five alternatives with one correct answer, and a four-hour duration including answer-sheet marking. The complete exam rules, scoring, amendments, and other files still require review.
- The user reported that source materials are in the Codex project. Not all project sources were accessible in this session.

## Open questions at capture

- How should the user start a mock exam and select the exam it follows?
- When selecting a weak topic in metrics, should the app open questions for immediate practice?
- What are the exact exam rules, scoring, and progress calculation methods?
- How should question data and progress be stored and migrated?

## Subsequent decisions

Append dated decisions here as they are made, including context and what they supersede. Preserve earlier entries rather than rewriting them to match the latest product direction.

- **2026-11-24 — Navigation direction:** Select an exam to open its questions. Selecting a weak topic should lead to its practice questions. Related information should be navigable through links across the system. The working name for the metrics area is **Performance**; placement relative to a profile remains open. This resolves the weak-topic question above, while the mock-exam entry point remains open.
- **2026-11-24 — Question filters:** Filters appear on the same page as the questions, not as a separate destination. Qconcursos and ExamTopics are user-provided reference products; exact behavior and scope must be verified before copying any particular feature.
- **2026-11-24 — Release organization:** Keep the release's information architecture board in `docs/releases/v0.1.0/information-architecture/`, alongside this product record. Later stage artifacts belong under this release directory; runnable prototypes remain under `prototypes/`.
