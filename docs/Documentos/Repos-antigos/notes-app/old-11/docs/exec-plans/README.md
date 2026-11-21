# Execution Plans

Execution plans are durable working state for tasks that are too large or risky to
fit safely in one agent session.

Create a plan when work is multi-session, spans multiple subsystems, has migration or
rollback risk, or depends on ordered decisions. Keep small, obvious changes ephemeral;
do not create process overhead for routine edits.

## Lifecycle

1. Copy `template.md` into `active/<short-kebab-name>.md`.
2. Record objective, scope, canonical context links, ordered steps, verification, and
   recovery/rollback before implementation.
3. Keep Progress and Decision Log current as work changes.
4. Record blockers explicitly instead of silently changing scope.
5. When complete, move the plan to `completed/` and record final verification.
6. Durable follow-up debt belongs in `tech-debt-tracker.md`, not an abandoned plan.

Plans coordinate work; they do not replace `INTENT.md`, product specs, ADRs, or
quality contracts.

## Active Plans

- [`active/0018-unified-question-types.md`](./active/0018-unified-question-types.md) — unified question type system ([ADR 0018](../adr/0018-unified-question-type-system.md)).

