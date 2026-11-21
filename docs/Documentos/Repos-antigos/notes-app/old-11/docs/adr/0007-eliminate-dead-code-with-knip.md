# 0007. Eliminate Dead Code with Knip

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed continuous static analysis to prevent dead code, orphaned files, and unused dependencies from accumulating across the repository over time.

## Decision Outcome

We adopted Knip configured via `knip.json` to automatically detect unused files, exported symbols, types, and dependencies in CI and pre-commit checks.

### Positive Consequences

- Keeps bundle size minimal and repository clean by detecting unused packages and files.
- Automated identification of unreferenced exports and dead code pathways.
- Easy integration into local checks and CI workflows.

### Negative Consequences

- Requires occasional configuration adjustments in `knip.json` for dynamically loaded files, plugin entry points, or vendor drops.

## Architectural Rules and Invariants

- `knip.json` is the canonical configuration for unreferenced symbol and dependency analysis.
- Unused dependencies or unreferenced files flagged by Knip must be resolved or explicitly configured if valid entry points.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions)
- [`CONSTRAINTS.md`](../../CONSTRAINTS.md) - Quality floors and static checks
