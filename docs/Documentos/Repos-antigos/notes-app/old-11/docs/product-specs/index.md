# Product Specifications

This directory contains product proposals behind the concise `INTENT.md` entry
point. The current implementation scope is intentionally smaller and is owned by
`INTENT.md`, `ARCHITECTURE.md`, and `CONTEXT.md`.

Use progressive disclosure: resolve a task from `INTENT.md` and `CONTEXT.md`
first, then read only the relevant section below. Section numbers are intentionally
stable so existing IDs and historical references remain valid.

| Stable section | Canonical owner | Purpose |
| --- | --- | --- |
| Current scope | `INTENT.md` | implemented Firebase foundation, initial Space slice, and current non-goals |
| Current vocabulary | `CONTEXT.md` | implemented User/Space terms plus clearly marked future vocabulary |
| ExamTopics Feed Spec | `exam-topics-feed.md` | Active recall certification study engine and instant validation feed (ADR 0017) |
| Question Types Spec | `question-types.md` | Eight validated question types, per-type answering and feedback (ADR 0018) |
| Future proposal | `knowledge-learning-workspace.md` | deferred knowledge-workspace concepts and requirements |

The former stable section map remains valid for historical references within the
preserved proposal:

| Former section | Canonical owner | Purpose |
| --- | --- | --- |
| §1–§3 | `INTENT.md` | outcome, problem, users, goals, non-goals |
| §4 | `CONTEXT.md` | ubiquitous product vocabulary |
| §5–§7 | `knowledge-learning-workspace.md` | conceptual model, invariants, requirements |
| §8 | `INTENT.md` | product success criteria |
| §9–§13 | `knowledge-learning-workspace.md` | phases, constraints, decisions, risks, decision log |
| Appendices | `knowledge-learning-workspace.md` | references, flows, standards |

The future proposal is not an implementation contract. `Space` has been partially
promoted into the current implementation; all other proposal entities and requirements
remain future-only until they are explicitly promoted into the current-scope documents.
