# 0003. Use Ladle for Component Development

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We required an isolated visual environment to develop, test, and preview UI components independently from the Next.js application runtime, routing, and data providers.

## Decision Outcome

We chose Ladle (`@ladle/react`) over Storybook because its Vite-based build system provides instant hot reload and minimal dependency overhead.

### Positive Consequences

- Near-instant startup times and rapid hot module replacement (HMR) powered by Vite.
- Low footprint and zero complex Webpack or Babel configuration required.
- Easy previewing of component variants and accessibility states.

### Negative Consequences

- Ladle uses Vite while Next.js uses Turbopack/Next build, requiring separate configuration for path aliases and CSS handling if complex server features are mocked.

## Architectural Rules and Invariants

- Visual component stories must be co-located or maintained under `src/components/ui/*.stories.tsx` or component directories.
- Component development and isolated visual testing should verify accessibility and theme variations in Ladle.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions)
- [`TESTING.md`](../../TESTING.md) - Component story verification
- [`DESIGN.md`](../../DESIGN.md) - Component variants and visual design
