# 0002. Adopt Base UI with Shadcn Base-Nova Style

- **Status:** Accepted
- **Date:** 2026-09-28
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

We needed an accessible, headless UI component foundation compatible with Tailwind CSS v4. Standard UI component libraries often bundle opinions on styling or rely on legacy primitive libraries like Radix UI, which can introduce style conflicts or runtime overhead.

## Decision Outcome

We selected `@base-ui/react` primitives configured with the shadcn `base-nova` style rather than conventional Radix UI primitives to leverage modern unstyled component architecture and direct styling flexibility.

### Positive Consequences

- Leverages modern unstyled component architecture for high customization and accessibility compliance.
- Integrates cleanly with Tailwind CSS v4 theme design tokens.
- Establishes a predictable component catalog under `src/components/ui/`.

### Negative Consequences

- Primitive behaviors and styling logic must be maintained directly within `src/components/ui/`.

## Architectural Rules and Invariants

- Primitives in `src/components/ui/` must remain generic shadcn/Base UI components with zero notes-domain logic.
- Application components compose these primitives directly and should not recreate parallel application-level compound APIs merely to mirror primitive anatomy.
- Use Base UI `render` composition when a behavior-bearing primitive must render another component; do not introduce Radix-style `asChild` compatibility or custom `renderX` APIs for that purpose.
- `src/components/ui/` is registry-managed; application-specific naming, state, and validation rules belong outside it.
- All UI component styling must consume CSS variable tokens defined in `src/app/globals.css`.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 3 (Technology Decisions) & Section 2 (Module Boundaries)
- [`DESIGN.md`](../../DESIGN.md) - UI system and design tokens
- [`CONVENTIONS.md`](../../CONVENTIONS.md) - UI composition rules
- [ADR 0016](./0016-prefer-simple-domain-components-and-dedicated-hooks.md) - application composition and state ownership
