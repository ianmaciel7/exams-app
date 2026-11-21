# Coding Standards

## Sources of truth

When standards conflict, apply them in this order:

1. `AGENTS.md` for repository-wide engineering rules.
2. Accepted ADRs in `docs/adr/` for architectural decisions.
3. Tool configuration (`biome.json`, `tsconfig.json`, `next.config.ts`, and
   `components.json`) for executable rules.
4. This document for day-to-day conventions that do not belong in tooling.

## TypeScript and React

- Write TypeScript that passes the repository's strict compiler configuration.
- Follow the Rules of React. React Compiler is enabled, so manual
  memoization (`useMemo`, `useCallback`, `memo`) is usually redundant. Keep it
  only for a stated reason, such as a stable Effect dependency. ast-grep reports
  it as a warning, not an error.
- Prefer Server Components. Add `"use client"` only at the smallest boundary
  that needs browser APIs, state, effects, or event handlers.
- Keep client-only providers in dedicated component seams so route layouts can
  remain Server Components.

## Next.js App Router

- Keep route entrypoints and Next.js special files in `src/app`.
- Use the generated `PageProps`, `LayoutProps`, and `RouteContext` helpers for
  route parameters rather than hand-written equivalents.
- Colocate route-specific code when it improves locality. Use `_components` or
  `_lib` when marking the folder as a private implementation detail is useful.
- Use route groups only to organize routes or layouts without changing the URL.

## Components and styling

- Consult [DESIGN.md](DESIGN.md) for tokens and component conventions. Update
  that reference when changing fonts, theme tokens, or `components.json`.
- Biome disables formatting and import organization for vendored UI and AI
  Elements files, with targeted lint exceptions. `ui/extensions` remains
  application code; do not extend vendor exceptions to it.

- Reuse `src/components/ui` primitives before creating new ones.
- Follow the existing shadcn component convention: declare a named function
  and export it explicitly (for example, `function Button()` then
  `export { Button }`).
- Component prop types should extend the corresponding HTML element or base component
  primitive (for example, button components extend `ComponentProps<typeof Button>` or `ComponentProps<"button">`,
  and form components extend `ComponentProps<"form">`) so they inherit standard attributes,
  support `className` pass-through, and remain composable.
- Maintain single-responsibility module separation: keep domain types, constants,
  and type guards (such as `theme.ts` and `locale.ts`) in dedicated modules under
  `src/lib/`, decoupled from persistence and database clients.
- Use the configured `@/*` path aliases instead of deep relative imports when
  crossing module boundaries.
- Use Tailwind CSS and the existing design tokens. Avoid inline styles unless a
  value must be computed at runtime.

## Internationalization

- Write source, comments, and project documentation in English by default,
  following `.agents/rules/language.md`. Localized catalogs use their own
  language.
- Follow the implemented cookie-based request resolution. Localized navigation
  helpers alone do not establish locale-prefixed routes.

- Put user-facing application text in the `next-intl` message catalogs under
  `src/messages/`.
- Do not introduce hardcoded JSX text outside the documented UI primitive
  exceptions. Biome enforces this rule for application code.
- When metadata varies by locale, use the `next-intl` metadata pattern from
  ADR 0004.

## Quality gate

- Format only the files you changed, then run the relevant checks from
  [TESTING.md](TESTING.md).
- Do not weaken or disable a lint rule to accommodate new application code
  without recording the rationale in an ADR when the decision is durable.
- Keep changes focused and add or update behavior tests when the change affects
  application behavior. For documentation changes, check Markdown, spelling,
  links, and commands against the current configuration.

## Tests

- Colocate `*.test.ts` and `*.test.tsx` files with the production module under
  `src/`; do not create per-component `__tests__/` folders or global
  `unit/`, `components/`, or `integration/` hierarchies.
- Put only Playwright user-journey specifications in root `tests/`, using
  `*.spec.ts`.
- Test observable behavior with clear arrange-act-assert structure. Prefer
  accessible, semantic React Testing Library queries such as `getByRole`.
- Keep feature-specific mocks, fixtures, and helpers next to their consuming
  test. Promote them to shared infrastructure only after genuine reuse.
- Avoid broad implementation mocks and large snapshots. Do not test an
  external library's internals.
- Cover asynchronous Server Components with Playwright E2E tests rather than
  forcing them through Vitest.
