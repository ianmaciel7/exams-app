# 0005. Adopt Tailwind CSS v4

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We required a high-performance, modern styling engine with native CSS token theming support and minimal configuration overhead.

## Decision Outcome

We adopted Tailwind CSS v4 using `@tailwindcss/postcss` and configured CSS `@theme` variables directly in `src/app/globals.css`, eliminating legacy JavaScript configuration files while enabling compile-time stylesheet optimization.

### Positive Consequences

- Direct CSS-first configuration via `@theme` directives in `src/app/globals.css`.
- Faster compile times and smaller stylesheet output.
- Eliminates legacy `tailwind.config.js` / `tailwind.config.ts` JavaScript files.

### Negative Consequences

- Newer Tailwind v4 syntax and `@theme` directives differ from v3 configuration patterns, requiring updated tooling and migration awareness.

## Architectural Rules and Invariants

- Theme variables and tokens must be defined in `src/app/globals.css` using standard CSS variables and `@theme`.
- No `tailwind.config.js` or `tailwind.config.ts` configuration files shall be created.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions)
- [`DESIGN.md`](../../DESIGN.md) - CSS variable tokens and design system
