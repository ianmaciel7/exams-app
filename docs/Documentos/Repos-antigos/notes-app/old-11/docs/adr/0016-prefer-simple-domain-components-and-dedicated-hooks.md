# 0016. Prefer Simple Domain Components and Dedicated Hooks

- **Status:** Accepted
- **Date:** 2026-10-02
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

Standardizing application components against shadcn/Base UI initially pushed the
repository toward mechanically mirroring primitive anatomy in product code: component
names followed the implementation root, dialogs exposed application-specific compound
parts, and state was split between rendering components and dedicated hooks.

That approach produced unnecessary renames and wrapper APIs without improving product
semantics. For example, a settings surface became coupled to the fact that its current
visual root is `FieldGroup`, even though its durable responsibility is a settings
form. It also made dedicated hooks less useful when the component continued to own
parallel `useState`/effects and behavioral handlers.

## Decision Outcome

Application UI follows these rules:

1. **Name by product responsibility.** A component name describes the durable domain
   surface, not the primitive currently used as its root. `SettingsForm` may compose
   `FieldGroup` internally without becoming `SettingsFieldGroup`.
2. **Simple component by default.** Application components compose the existing
   shadcn/Base UI compound parts internally and expose one cohesive public component
   unless callers genuinely need independently rearrangeable parts.
3. **Use Base UI `render` for behavioral composition.** When a behavior-bearing
   primitive must render another component, use the primitive's standard
   `render={<Component />}` API (for example `DialogClose render={<Button />}`).
   Do not invent `renderX` props or Radix-style `asChild` compatibility layers.
4. **Context is deliberate.** Create component-family context only when multiple
   public sibling parts genuinely require shared state. Do not introduce context only
   to wire a normal application surface together.
5. **A dedicated component hook owns the component's stateful behavior.** If
   `Component` has a dedicated same-family hook such as `useComponent`, that hook
   owns component-specific state, effects, refs, reducers, transitions, subscriptions,
   navigation, and state-derived handlers. The component consumes semantic values and
   callbacks and focuses on rendering. Components without a dedicated hook may keep
   straightforward local state.
6. **Shared primitives remain registry-managed.** `src/components/ui/` stays the
   generic shadcn/Base UI layer. Product behavior and project-specific guards remain
   outside that directory.

## Consequences

### Positive Consequences

- Application APIs stay smaller and aligned with product concepts.
- Internal primitive changes do not force unnecessary application component renames.
- Base UI preserves focus, keyboard, ARIA, and primitive state behavior during
  polymorphic composition.
- Dedicated hooks become clear behavior boundaries instead of partial extractions.
- Rendering components are easier to review and test because state transitions live in
  one owner.

### Trade-offs

- Component names no longer reveal the exact primitive used internally; developers
  inspect the implementation when that detail matters.
- Dedicated hooks can become too broad if unrelated behaviors are added to them; split
  hooks by responsibility when the component itself has multiple independent flows.
- Application compound APIs remain available, but require a demonstrated consumer need
  rather than being the default.

## Enforcement

- `CONVENTIONS.md` is the code-writing source of truth.
- `check:ui-pattern` enforces notes-app-specific composition and dedicated-hook
  ownership invariants where static checks are reliable.
- Biome remains the only formatter/linter for project-owned code.
- dependency-cruiser continues to own module boundaries; this ADR does not duplicate
  import-layer rules.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - application composition and behavior ownership
- [`CONVENTIONS.md`](../../CONVENTIONS.md) - naming, composition, Base UI `render`, and hook rules
- [`DESIGN.md`](../../DESIGN.md) - interaction language
- [`TESTING.md`](../../TESTING.md) - behavior-oriented hook and component verification
- [ADR 0002](./0002-adopt-base-ui-with-shadcn-base-nova.md) - Base UI and shadcn foundation
- [ADR 0015](./0015-adopt-sidebar-space-navigation.md) - Space shell composition
