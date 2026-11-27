# Dataset Status and Content Assessment — v0.1.0

Status: Technical assessment (High-Fidelity Wireframe stage; data source selection pending technical design).
Baseline commit: `17bc17e923551288b8a6510f6197b8881cd7dfb1`
Sources inspected: [PRODUCT.md](../../../../PRODUCT.md) · [Product Decisions](../product/README.md) · [GLOSSARY.md](../../../../GLOSSARY.md) · [QConcursos Archive Evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md) · [Brazilian Civil Service Exams Structure Reference](../../../references/2026-11-24-chatgpt-conversation-brazilian-civil-service-exams-structure.md) · [Evals README](../../../../evals/README.md) · [High-Fidelity Generator](../../../../scripts/high-fidelity-components.cjs)

## 1. Current Repository Dataset Status

Inspection of the repository at `17bc17e` confirms that **no production or prototype exam-question dataset exists yet**:

1. **Product baseline ([PRODUCT.md](../../../../PRODUCT.md)):** Explicitly states that `DATAPREV` and `PPSA` are illustrative examples, not a confirmed exam dataset. Competition-list data source and underlying ordering remain open technical-design items.
2. **Wireframe generator ([high-fidelity-components.cjs](../../../../scripts/high-fidelity-components.cjs)):** Contains only 2 illustrative competitions (`DATAPREV · 2026 · Analyst…`, `PPSA · 2025 · Analyst…`, with `PPSA`'s full position title still unconfirmed per [product/README.md](../product/README.md)) and 3 illustrative English IT multiple-choice questions (`q1`, `q2`, `q3`), plus 1 long-content retry question in Section 09.
3. **Evaluation fixtures ([evals/datasets/](../../../../evals/datasets/)):** Contains 3 prompt-evaluation JSON files (`delegation-contracts.json`, `mock-exam-rules.json`, `question-provenance.json`). `question-provenance.json` holds only 2 synthetic metadata-extraction test cases (`tc-prov-01-complete-metadata`, `tc-prov-02-anti-hallucination`) for agent anti-hallucination checks—not a rendered question bank.
4. **Archive evidence ([2026-11-25-qconcursos-archive-evidence.md](../../../references/2026-11-25-qconcursos-archive-evidence.md)):** Preserves screenshots and domain observations from QConcursos (`qconcursos_live_question_initial_state.png`, `qconcursos_live_question_answered_feedback.png`, filter/simulado captures) and historical Brazilian exam structure notes (`2026-11-24-chatgpt-conversation-brazilian-civil-service-exams-structure.md`), none of which constitute a runnable dataset in the current workspace.

### 1.1 Approved Data Contract Constraints for v0.1.0

Any dataset selected for the Interactive Prototype and v0.1.0 release MUST satisfy these approved decisions:

- **Competition label format:** `Name · Year · Position/exam`, rendered on one line with ellipsis + hover/focus full-name discovery on desktop, and wrapped without hover reliance in the mobile overlay drawer.
- **Competition ordering:** Presented in the order supplied by the list source; first available competition is auto-selected on entry. No client-side date/name sorting required.
- **Question ordering & pagination:** Original exam order; 10 questions per page (final page may hold 1–9 questions); pagination hidden when total questions `<= 10`.
- **Source-language fidelity:** Interface chrome supports `pt-BR` and `en` (device locale with `en` fallback), whereas exam questions, stems, alternatives, and competition provenance remain in their original source language without automated translation.

## 2. Content Format and Layout Risk Assessment

High-Fidelity Wireframe structural specimens (`740` max content width on desktop, `20` phone inset at `320` and `390` viewports, hanging option indent) were authored against short, text-only 5-option IT questions. Real Brazilian civil service exam content introduces six structural risks that the Prototype data schema and CSS layout must handle without horizontal page overflow:

| Content Dimension | Real Exam Evidence / Risk | Current Wireframe Coverage | Required Prototype / v0.1.0 Treatment |
| --- | --- | --- | --- |
| **Images and diagrams** | Civil service exams (FGV, Cebraspe, FCC) routinely include charts, UML/network diagrams, maps, or scanned figures inside stems or options. | Not rendered in static wireframe specimens (text-only stems). | Render inline responsive images constrained to `max-width: 100%; height: auto` inside the `<= 740px` question column; require `alt` text (or descriptive fallback when source lacks alt); preserve aspect ratio with zero horizontal viewport overflow at `320/390/768/1024/1280`. No lightbox/zoom modal in v0.1.0. |
| **Math, formulas, and code blocks** | Quantitative, logic, and IT exams (such as DATAPREV IT) contain inline equations, relational algebra, SQL queries, or multi-line code blocks. | Plain inline text only. | Support preformatted/code blocks and math text with safe line wrapping (`overflow-wrap: anywhere`) or locally bounded horizontal scrolling (`overflow-x: auto` on the code/formula block itself) so the outer page never scrolls horizontally on `320px` phones. |
| **Tables** | Accounting, statistics, and database questions often include multi-column tables in stems. | Not modeled in wireframe specimens. | Wrap data tables inside a horizontally scrollable inner container (`overflow-x: auto; max-width: 100%`) with readable padding and borderless/minimal structural contrast; never allow wide tables to expand the page viewport beyond `320/390/768`. |
| **Associated texts / passages** | Observed in [QConcursos archive evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md) (`associated-text control` in `qconcursos_live_question_initial_state.png`). Portuguese comprehension questions often share a multi-paragraph reading passage across multiple items. | Not modeled as a collapsible drawer/accordion; [GLOSSARY.md](../../../../GLOSSARY.md) excludes inline resource drawers/accordions from v0.1.0. | For v0.1.0, either inline the passage inside the question stem (and ensure vertical spacing scales dynamically with measured text height) or restrict the initial v0.1.0 dataset to standalone items until an associated-text pattern is scoped. Do NOT add an unapproved accordion or resource drawer. |
| **Variable option counts** | Current specimens hardcode 5 options (`A`–`E`, e.g., FGV). Brazilian exams also use 4-option (`A`–`D`) and 2-option True/False (`Certo` / `Errado`, e.g., Cebraspe) formats. | Generator `q()` and Section 09 hardcode `limit = 5` alternatives. | Render radio options dynamically from `question.options` (`2` to `5+` items) rather than assuming 5. Preserve full-row touch target (`44px` minimum height on phone), hanging letter indent, and left-aligned **Answer** directly beneath the final option regardless of count. |
| **Long labels and wrapped feedback** | Multi-line Portuguese stems/alternatives can push evaluated labels (`Correct` / `Your answer`) into collisions if positioned at fixed coordinates. | Section 09 models wrapped option B with `Correct` / `Your answer` on a separate line below option text. | Implementation MUST measure/flow option text and place option-level feedback (`Correct` / `Your answer`) in normal document flow below or cleanly aligned after wrapped option text—never overlapping text at fixed X offsets (remediated in `#14`). |

## 3. Explicit Deferral of Historical Out-of-Scope Features

In accordance with [PRODUCT.md](../../../../PRODUCT.md), [GLOSSARY.md](../../../../GLOSSARY.md), [Ideas Board](../../../boards/overview/README.md), and [QConcursos archive evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md), the following historical reference patterns are **explicitly deferred out of v0.1.0** and MUST NOT be introduced during High-Fidelity Wireframe, Mockup, or v0.1.0 Prototype work without a separate owner decision:

1. **Image zoom modal / lightbox:** Deferred. Images scale responsively within the question column; no modal image viewer is approved.
2. **PDF / booklet / HTML ingestion parsers:** Deferred (`archived-idea-20`). Automated scraping, PDF parsing, and admin import workflows are outside v0.1.0 UI scope; prototype data will use a clean structured JSON/API contract.
3. **Custom keyboard shortcuts:** Deferred. Only standard semantic HTML/ARIA keyboard navigation is in scope (`Tab`, arrow keys within radio groups, `Enter`/`Space` to activate controls, `Escape` to dismiss the mobile modal drawer). Global single-key shortcuts (e.g., `J`/`K`, `1`–`5` option hotkeys, `Enter` auto-advance) are out of scope.
4. **Timers and timed mock exam mode:** Deferred (`archived-idea-13`, `archived-idea-14`, `qconcursos_criar_simulado_config_modal.png`). No countdown timers, pause/resume, or auto-submit on timeout exist in v0.1.0.
5. **Filters, search bars, and sorting:** Deferred (`qconcursos_live_filter_builder_top.png`, `qconcursos_filter_disciplina_open.png`, `archived-idea-11`). No discipline/topic/board/year filters, keyword search, missed-question ("Errei") filter, per-page chooser, or sort dropdowns are approved.
6. **Question navigation tools and resource tabs:** Deferred (`qconcursos_dock_modo_foco.png`, `archived-idea-08`, `archived-idea-10`, `GLOSSARY.md`). Specifically excluded:
   - Non-linear question palette matrix
   - Focus mode / one-question-at-a-time dock
   - Option strike-through / elimination toggles
   - Gabarito Comentado (commented explanation drawers/tabs), per-question statistics, and error-report buttons
   - Clickable provenance links/routes and cross-session accuracy/attempt history

## 4. Open Technical-Design Items Carried Forward

Before Interactive Prototype implementation begins, technical design must resolve:

1. Exact competition-list and question-list data source (static bundled JSON vs local/remote API endpoint) and its deterministic original exam order.
2. Full position title confirmation for the illustrative `PPSA` example (or replacement with confirmed pilot competition records).
3. Dataset validation schema verifying `id`, `competitionId`, `orderIndex`, `stem` (plus optional safe structured content blocks), `options[]` (`>= 2`), and evaluation key/endpoint mapping.
