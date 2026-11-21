# 0001. Use Biome for Linting and Formatting

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed a unified, fast toolchain for code formatting and static analysis across the Next.js application codebase. Previous setups relying on ESLint and Prettier required complex configuration coordination, slower execution times, and separate plugins for import sorting and formatting.

## Decision Outcome

We chose Biome (`biome check`) as our single toolchain for linting, formatting, and import organization instead of ESLint and Prettier.

### Positive Consequences

- Achieves sub-second execution speeds for linting and formatting across all files.
- Provides zero-configuration formatting and linting in a single native binary.
- Automatically organizes imports according to consistent rules without external plugins.

### Negative Consequences

- Slightly smaller plugin ecosystem compared to ESLint, requiring custom scripts or dedicated tools (like dependency-cruiser or Knip) for specialized static analysis.

## Architectural Rules and Invariants

- Biome is the single formatter, linter, and import organizer for project-owned source, scripts, evals, and supported configuration targets.
- `src/components/ui/` is registry-managed shadcn code and is intentionally excluded from the project-wide Biome gate; application/domain code must not use that exclusion as a general escape hatch.
- Pre-commit uses staged Biome checks, pre-push uses the changed-file Biome gate, and task-end/CI verification uses the full configured Biome target set.
- ESLint and Prettier configurations must not be added as parallel sources of truth.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions)
- [`CONVENTIONS.md`](../../CONVENTIONS.md) - Code-writing and linting rules
- [`CONSTRAINTS.md`](../../CONSTRAINTS.md) - Code quality floors
