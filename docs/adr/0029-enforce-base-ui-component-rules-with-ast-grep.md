# ADR 0029: Enforce Base UI component rules with ast-grep

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

[ADR 0002](0002-configure-shadcn-ui.md) chose Base UI primitives and locally owned
components, and [ADR 0007](0007-configure-ci.md) added ast-grep for structural
rules. Base UI misuse (a cloned element instead of `render`, a Radix import,
`onClick` on a value control, a raw `<button>`) compiled and passed unit tests but
broke keyboard and accessibility behavior. Pull requests #35, #39 and #58 closed
the gap.

## Decision

- Rules in `.ast-grep/rules/base-ui/` reject Radix imports and state selectors, a
  direct Base UI import outside the owned wrappers, `cloneElement`, `onClick` on
  value controls, raw `<button>` elements, a button rendered as a link, nested
  buttons in a trigger, and a menu item `onClick`. A trigger rendered as a
  non-button requires `nativeButton={false}`.
- Each rule has snapshot tests and runs through `pnpm check:structure`.
- `ast-grep scan` also runs on staged `*.{ts,tsx}` files in lint-staged after
  Biome, so a violation blocks the commit and not only CI.
- Rules that need types (`asChild`, popup titles) stay with TypeScript and axe.
- Composition patterns (`render`, `useRender`, `mergeProps`) live in
  `.agents/rules/shadcn.md`.

## Consequences

- A Base UI misuse fails at commit time with a message that names the fix.
- Each rule is a maintenance cost and needs a snapshot when Base UI changes.
- The rule list lives in the custom rule registry in [TOOLING.md](../../TOOLING.md).
