# 0006. Enforce Module Boundaries with Dependency Cruiser

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed automated enforcement of application layering and dependency flow to prevent architectural erosion, circular dependencies, and illegal cross-module imports as the application grows.

## Decision Outcome

We adopted dependency-cruiser configured via `.dependency-cruiser.cjs` to validate module boundaries across `src` and fail builds on circular dependencies or boundary violations.

### Positive Consequences

- Automated, CI-enforceable verification of architectural layer relationships (`src/app` -> `src/components` -> `src/lib`, etc.).
- Immediate detection and blocking of circular dependencies (`src/` circular imports).
- Prevents presentation layers or primitives from importing domain-specific app logic illegally.

### Negative Consequences

- Requires updating rules in `.dependency-cruiser.cjs` when new top-level directory architectural layers are added.

## Architectural Rules and Invariants

- `src/components/ui/` primitives must not import application components (`src/components/notes-app/`), Firebase/auth integration code, or routing code (`src/app/`).
- `src/components/ui/` primitives may only import `@/lib/utils` (or `cn`) from the `src/lib/` layer, never domain, data access, auth, or sync services.
- `src/hooks/` reusable hooks must not depend on application routes (`src/app/`).
- `src/lib/` shared utilities must not depend on UI primitives or application components.
- Direct imports of `@radix-ui` are barred across `src/` in favor of `@base-ui/react` primitives.
- Foundation atomic UI primitives must not depend on composite UI components.
- Builds must fail if dependency-cruiser detects any circular dependencies or boundary rule violations.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 2 (Module Boundaries) & Section 3 (Technology Decisions)
- [`CONSTRAINTS.md`](../../CONSTRAINTS.md) - Architectural validation quality floors
