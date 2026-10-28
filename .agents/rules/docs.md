---
trigger: model_decision
description: "Read when deciding where to save rules, operational guides, conventions, or project knowledge."
---

# Documentation ownership

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when deciding where to save rules, operational guides, conventions, or project knowledge.

## Architectural Boundary and Rule Index

## Architectural boundary: `.agents/rules/` vs `docs/`

- **`.agents/rules/` (Behavioral constraints for agents)**:
  - Contains **prescriptive agent guardrails applied when their context is relevant**.
  - Dictates *how agents must behave, write, and verify code* across the codebase (e.g. naming, file limits, thin routes, language, framework patterns).
  - Kept concise and machine-actionable to conserve prompt context.
- **`docs/` (Human and domain documentation & system operations)**:
  - Contains **descriptive reference documentation, operational guides, and history**.
  - Maps system architecture ([`docs/README.md`](../../docs/README.md)), verification ownership ([`TESTING.md`](../../TESTING.md)), tooling configuration ([`TOOLING.md`](../../TOOLING.md)), immutable decisions ([`docs/adr/`](../../docs/adr)), skill tracker configuration ([`docs/agents/`](../../docs/agents)), and historical review snapshots (`docs/code-review/` (historical review location; absent from this checkout)).
  - Intended for human engineers, onboarding, production operations, and authoritative reference.

## Rule catalog

Use the [topic index](README.md) for the complete rule catalog and the
[repository instructions](../../AGENTS.md) for the task reading map.

Keep executable obligations in `.agents/rules/`, one context per flat Markdown file.
Put procedures, source lists, selection tables, and review checklists in `docs/agents/`.
Keep API conventions in `CODING_STANDARDS.md`, design in `DESIGN.md`, commands and
check ownership in `TOOLING.md`, and verification strategy in `TESTING.md`.
Link existing shadcn skill references instead of copying them into project rules.
Update the rule index and consuming links when changing ownership.

Use [agent references](../../docs/agents/README.md) for on-demand guides.
