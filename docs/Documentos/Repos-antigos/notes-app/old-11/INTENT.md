# Intent: Notes App

## Firebase foundation

**Author:** Ian Maciel
**Status:** Complete
**Last Updated:** 2026-09-29
**Version:** 1.0

### Implemented scope

The repository currently implements the Firebase foundation described in
[`ARCHITECTURE.md`](./ARCHITECTURE.md): Firebase App, Firebase Authentication,
Firebase `User`, local Auth/Firestore emulators, and the Firestore client with
persistent local cache. It also implements the first product-domain vertical slice:
user-owned `Space` documents, creation/listening/switching UI, protected
`/[spaceId]` routing, and owner-isolated Firestore rules.

Current scope and non-goals are summarized in
[`docs/product-specs/index.md`](./docs/product-specs/index.md). Current vocabulary
is maintained in [`CONTEXT.md`](./CONTEXT.md).

`User` and `Space` are the only knowledge-workspace entities currently promoted
into the implementation. Objects, ObjectTypes, Relations, study entities, AI
entities, and the rest of the future proposal remain unimplemented.

---

## Knowledge and learning product

**Author:** Ian Maciel  
**Status:** Draft  
**Last Updated:** 2026-09-25  
**Version:** 1.0

The following original product-intent content is preserved in full as a draft for
future work. It describes the desired knowledge and learning workspace, not the
current Firebase foundation. Nothing in this section is an implemented requirement
until it is promoted out of draft status.

This document is the concise product-intent entry point. It owns the problem,
desired outcome, affected users, goals, non-goals, and success criteria.

Detailed requirements, invariants, phases, risks, decisions, and reference flows are
routed through [`docs/product-specs/index.md`](./docs/product-specs/index.md).
Canonical domain vocabulary lives in [`CONTEXT.md`](./CONTEXT.md).

Agents MUST use progressive disclosure: read this file first, then load only the
detailed product-spec sections needed for the task. Do not read the complete detailed
spec by default.

## 1. Summary (Proposed Outcome)

A **personal knowledge and learning workspace based on typed objects**, organized into isolated **Spaces**, which preserves the **provenance** of each piece of information and allows capturing, relating, retrieving, reviewing, and practicing the same knowledge — including with AI restricted to authorized context.

```text
Source → Exact excerpt → Highlight → Concept → Note → Question → Attempt → Review
         (each step preserves the link to the preceding one)
```

---

## 2. Problem

People learn from documentation, books, articles, PDFs, videos, courses, and question banks. Each step usually happens in a different tool: reading and highlights (Readwise Reader), notes and databases (Obsidian, Notion, Capacities), visual organization (Heptabase), retention (Anki, RemNote), AI over sources (NotebookLM, StudyFetch), and question practice (ExamTopics).

These capabilities already exist in isolation. **What gets lost is the context, provenance, and relationships between them.** Integrations between these tools are usually one-way exports: the exported copy ceases to track the source.

**Typical scenario:** A student misses a certification question, searches official documentation, finds the concept, highlights a passage in another tool, writes a note, and later creates a flashcard. Everything belongs to the exact same learning process, but no system records this chain.

**Questions the user cannot answer today** (mapped to success criteria in §8):

| ID | Question |
|---|---|
| P1 | Where did I learn this? |
| P2 | What is the original source of this information and which exact excerpt supports it? |
| P3 | Which notes, highlights, and concepts are related to this subject? |
| P4 | What have I already learned about this subject and what do I not yet understand? |
| P5 | What do I need to review right now? |
| P6 | Which questions do I keep missing and why? |
| P7 | What documentation or evidence justifies this answer? |
| P8 | What have I captured that I have not yet read or processed? |

**Core problem:** Fragmentation of knowledge, provenance, and learning context.

### Affected Users
- **Individual learners & self-taught students:** Mastering technical literature, programming, and complex domains requiring synthesis across multiple sources.
- **Certification candidates:** Studying for high-stakes professional exams (e.g. cloud certifications, engineering exams) needing evidence-backed question practice directly tied to official documentation.
- **Researchers and knowledge workers:** Managing heterogeneous source materials (PDFs, papers, web pages, videos) needing bidirectional traceability between notes and primary sources.

---

## 3. Goals and Non-Goals (Product Boundaries)

### Goals

| ID | Goal |
|---|---|
| G-1 | Model all relevant knowledge as **typed Objects** with properties, free-form content, and relationships. |
| G-2 | Isolate knowledge contexts into **Spaces**. |
| G-3 | Preserve **granular provenance** (source + exact location) across the entire flow. |
| G-4 | Enable multiple **representations** (views, whiteboards) of the same Objects without duplicating them. |
| G-5 | Support **retention** (flashcards and spaced repetition) linked to the knowledge of origin. |
| G-6 | Support **practice and assessment** (questions and attempts) connected to concepts and evidence. |
| G-7 | Enable **traceable AI** over the graph, restricted to authorized context and always citing sources. |
| G-8 | Ensure **portability**: user knowledge MUST be exportable and importable in open formats. |
| G-9 | Provide **low-friction capture** and a triage workflow for captured material. |

### Non-Goals

| ID | Non-Goal | Rationale |
|---|---|---|
| NG-1 | Fully replicate Capacities, Heptabase, Obsidian, Readwise, Notion, RemNote, Anki, NotebookLM, StudyFetch, or ExamTopics. | The differentiator is the connection across stages, not feature parity. |
| NG-2 | Real-time collaboration in the initial scope. | Personal product first; collaboration changes the permissions model. |
| NG-3 | Host, distribute, or facilitate sharing third-party question banks, especially content that could be from real exams. | Copyright and certification non-disclosure agreements (`INV-8`, `INV-13`). |
| NG-4 | Generic chatbot disconnected from the graph. | AI only adds value when grounded and traceable (`G-7`). |
| NG-5 | Third-party plugin ecosystem in the MVP. | First stabilize the core; maintain only internal extension points (`R-EXT`). |
| NG-6 | Use Markdown files as mandatory canonical storage. | Markdown is an export requirement, not a persistence requirement (see `Q-15`). |
| NG-7 | AI media generation (podcasts, videos, slides) in the initial scope. | Outside the core of traceable knowledge. |

---

## 8. Success Criteria

| Question (§2) | Verifiable Criterion |
|---|---|
| P1, P2 | From any Note, Concept, or Question, the original Source and Locator are reachable in ≤ 2 navigations. |
| P3 | A Concept page automatically lists, via contextual Queries, related Sources, Highlights, Notes, and Questions. |
| P4 | Concepts maintain learning status and Computed Properties (accuracy, retention) queryable via Query. |
| P5 | A due review queue exists per scope (Space, Concept, Query). |
| P6 | An aggregated error view exists per Concept and ancestors (e.g., topic → domain → Exam), incorporating recorded confidence. |
| P7 | Every answered Question can display its Explanation and the provenance of each Answer (`INV-9`). |
| P8 | The Inbox displays unprocessed Sources and overall reading progress. |

Initial non-functional targets (to validate via prototype):
- Full-text search p95 latency < 300 ms across a Space containing 50,000 Objects and 200,000 Relations.
- Opening an Object with 500 backlinks p95 latency < 500 ms.
- Web Highlight re-anchoring resilience after page mutations: ≥ 95% success rate in benchmark test suite.

---

## Open Questions

There are no currently unresolved product questions. Historical decisions and their
rationale are preserved in the detailed product specification. New unresolved product
questions belong here until decided; durable decisions move to the detailed spec and,
when architectural, to an ADR.
