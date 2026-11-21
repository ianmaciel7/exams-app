# 0004. Enable React Compiler

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed fine-grained render optimization without manual memoization overhead (`useMemo`, `useCallback`, `React.memo`) across application components, which often clutter code and can lead to cache invalidation bugs.

## Decision Outcome

We enabled the React Compiler (`reactCompiler: true`) in Next.js (`next.config.ts`) to automate memoization at build time, eliminating manual `useMemo` and `useCallback` boilerplate.

### Positive Consequences

- Automates fine-grained component and value memoization during compilation.
- Reduces boilerplate code and developer cognitive load by removing manual `useMemo` and `useCallback` calls.
- Eliminates common bug vectors related to missing dependency array entries.

### Negative Consequences

- Requires strict adherence to React's rules of hooks and immutability for compiler auto-memoization to function correctly.

## Architectural Rules and Invariants

- Developers must write idiomatic React code without manual `useMemo` or `useCallback` wrappers unless explicitly required for external library reference stability.
- Components must follow strict purity rules so the compiler can safely optimize renders.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions)
- [`CONVENTIONS.md`](../../CONVENTIONS.md) - React code patterns and standards
