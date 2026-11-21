# Architecture

## Overview

This repository is a Next.js 16 application using the App Router, React 19,
TypeScript, Tailwind CSS, shadcn/ui, and `next-intl`. It uses the optional
`src/` directory to keep application source separate from project
configuration and repository documentation.

## Repository layout

```text
.
├── .agents/                 # Agent rules, workflows, and installed skills
├── .biome/                  # Custom Biome GritQL rules and tests
├── .fallow/                 # Fallow complexity and hotspot tracking
├── .github/                 # GitHub Actions CI workflows and configurations
├── .ladle/                  # Ladle component workbench configuration and styling
├── docs/
│   ├── adr/                 # Accepted architecture decisions
│   └── agents/              # Instructions for automated contributors
├── public/                  # Static assets served by Next.js
├── src/
│   ├── app/                 # App Router routes, layouts, and global styles
│   ├── components/          # Reusable application and UI components
│   ├── hooks/               # Reusable React hooks
│   ├── i18n/                # Locale routing, navigation, and request config
│   ├── lib/                 # Framework-independent utilities
│   ├── messages/            # Locale message catalogs
│   └── types/               # Shared TypeScript declarations
├── tests/                   # Playwright E2E tests, visual baselines, and Semgrep rules
├── AGENTS.md
├── ARCHITECTURE.md
├── CODING_STANDARDS.md
├── CONTRIBUTING.md
├── DER.md                   # Entity-relationship diagram (pending persistence)
├── DESIGN.md                # Design system tokens, typography, and UI specs
├── GLOSSARY.md
├── README.md
├── SECURITY.md
├── TESTING.md
└── TOOLING.md
```

`package.json`, Next.js configuration, TypeScript configuration, environment
files, and `public/` remain at the repository root, as required by the Next.js
`src/` directory convention.

## Application boundaries

- `src/app` contains routes and Next.js special files only, such as
  `page.tsx`, `layout.tsx`, `loading.tsx`, and `route.ts`.
- Shared UI belongs in `src/components`; shared non-UI helpers belong in
  `src/lib`.
- Route-specific implementation details may be colocated with a route. Use an
  underscore-prefixed folder such as `_components` or `_lib` when explicitly
  marking it as non-routable is useful.
- Use App Router route groups, for example `(marketing)`, to organize related
  routes or layouts without changing their URLs.

## Test boundaries

- Colocate Vitest tests with the `src/` code they verify: use `*.test.ts` for
  non-JSX modules and `*.test.tsx` for React or JSX integrations.
- Colocate Ladle stories (`*.stories.tsx`) next to UI primitives under
  `src/components/ui/` for isolated component development and visual inspection.
- Keep Playwright E2E specifications in root `tests/` with `*.spec.ts`.
  Feature-specific fixtures and helpers stay with their consumer unless shared
  by multiple E2E specifications.
- Keep route-private test subjects under existing `_components` and `_lib`
  boundaries; test placement must not alter a route's URL or structure.

See [ADR 0006](docs/adr/0006-configure-testing.md) for the adopted architecture and [TESTING.md](TESTING.md) for
commands and implementation conventions.

## Internationalization

The internationalization architecture is 100% cookie-driven (`NEXT_LOCALE`)
without `middleware.ts` and without a `[locale]` folder segment in the App
Router. The application serves `src/app/page.tsx` directly at `/`; there are no
localized URL route prefixes or proxy scripts.

`src/i18n/routing.ts` defines `en`, `pt-BR`, and `es`, defaulting to `en`, and
exports `localeCookie = "NEXT_LOCALE"` along with the `isLocale` type guard.
`src/i18n/routing.test.ts` verifies this guard with property-based testing
(`fast-check`). `src/i18n/request.ts` reads the cookie (or explicit request
locale) and imports `src/messages/${locale}.json`, cleanly falling back to `en`
if an invalid locale is received.

Message catalogs (`src/messages/*.json`) adhere to a structural testing
contract in `src/messages/messages.test.ts`, which validates key parity across
`en.json`, `pt-BR.json`, and `es.json`, forbids empty messages, and ensures ICU
placeholders match the reference catalog. Global message type safety is enforced
by augmenting the `IntlMessages` interface in `src/types/global.d.ts`. Spelling
validation integrates `@cspell/dict-pt-br`.

The root layout (`src/app/layout.tsx`) currently declares a static `<html
lang="en">` attribute even when translated content is rendered through
`IntlProvider` via the cookie. Derived applications requiring dynamic
server-rendered `lang` attributes must read the cookie in `RootLayout`. See
[ADR 0004](docs/adr/0004-configure-internationalization.md) for the complete
decision.

## Runtime and component boundaries

`next.config.ts` enables Cache Components, partial prefetching, and React
Compiler. It loads Tailwind through the Turbopack CSS loader and wraps the
configuration with the `next-intl` plugin.

The root layout keeps the async `IntlProvider` inside `Suspense`, followed by
`ThemeProvider` and `TooltipProvider`. The component libraries under
`src/components/ui` and `src/components/ai-elements` are locally owned source;
custom providers under `ui/extensions` remain subject to application checks.
Ladle (`.ladle/`) isolates and documents UI components without requiring the
Next.js runtime.

`.dependency-cruiser.cjs` rejects cycles, imports from shared components into
`src/app`, and imports from `src/lib` into routes, components, hooks, or i18n.
It does not ban all third-party React dependencies in `src/lib`.

No database, authentication provider, or deployment integration is configured.
Keep [DER.md](DER.md) and [GLOSSARY.md](GLOSSARY.md) pending until the respective
persistence and product decisions exist.

## Decision records

Architecture decisions that have lasting consequences are recorded in
`docs/adr/`; use its [index](docs/adr/README.md) to distinguish historical
details from current configuration. New ADRs are numbered sequentially and must describe the context,
decision, and consequences before the related implementation is merged.
