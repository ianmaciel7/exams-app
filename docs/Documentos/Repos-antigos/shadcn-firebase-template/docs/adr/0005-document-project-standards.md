# ADR 0005: Document Project Standards

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

The template already uses the Next.js App Router with the optional `src/`
directory, but its architectural boundaries and contributor expectations are
not documented in one discoverable place. This makes it easy for future work to
mix routing, shared code, route-private code, security practices, and test
expectations inconsistently.

The Next.js 16 documentation available when this decision was made confirms
that `src/` is supported for application code while `public/`, project
configuration, and environment files remain at the repository root. It also
supports colocating non-routable files with routes, underscore-prefixed private
folders, and URL-neutral route groups.

## Decision

We retain the existing repository layout and document it rather than moving
application code. A conforming repository must provide the following
documentation entrypoints, except for the domain records described below:

1. `AGENTS.md` provides instructions and documentation pointers for coding
   agents.
2. `README.md` introduces the template, its package-manager workflow, and the
   documentation index for all contributors.
3. `docs/agents/issue-tracker.md` and `docs/agents/domain.md` configure the
   installed engineering skills. The project maintains 15 installed skills in
   `.agents/skills/`, tracked with locked versions and hashes in `skills-lock.json`,
   and four configured MCP servers in `.agents/agents.json` (see [ADR 0010](0010-configure-agent-ecosystem.md)).
   `docs/agents/triage-labels.md` is required only when the `triage` skill is
   installed.
4. `ARCHITECTURE.md` defines the repository layout and App Router boundaries.
5. `SECURITY.md` defines the vulnerability-reporting policy, its currently
   published channels, and baseline secure contribution practices.
6. `CONTRIBUTING.md` defines Conventional Branch and Conventional Commit rules
   along with pull-request expectations.
7. `TESTING.md` defines the test strategy and validation commands. While
   originally anchored on baseline checks (`pnpm lint` and `pnpm build`), the
   testing standard has evolved into a comprehensive automated suite established
   across [ADR 0006](0006-configure-testing.md) and
   [ADR 0007](0007-configure-ci.md): colocated Vitest unit
   and JSX tests (`src/**/*.test.ts(x)`), Vitest Browser Mode, Playwright E2E and
   axe-core accessibility testing (`tests/*.spec.ts`), visual regression
   baselines, property-based tests (`fast-check`), and mutation testing (`stryker`).
8. `GLOSSARY.md` is the single-context domain glossary when product-specific
   terminology is agreed.
9. `DER.md` is the single entrypoint for the entity-relationship diagram. Until
   a database and persistence model are adopted, it must state that it is
   pending and must not include speculative entities or relationships. Once
   persistence is introduced, it must document the implemented entities,
   relevant attributes, relationships, cardinalities, and integrity
   constraints.
10. `TOOLING.md` is the operational inventory of every installed or configured
   development tool, including its version or status, purpose, and source of
   truth. It covers the package manager, build toolchain, code-quality tools
   (including Biome and GritQL rules), UI scaffolding, commands, and agent
   tooling; it does not duplicate the application dependency catalog.
11. `CODING_STANDARDS.md` consolidates day-to-day code conventions whose
   executable form is split across tool configuration and accepted ADRs.
12. `DESIGN.md` is the visual design reference. It documents the design tokens
   (light and dark colors, typography, radius), the shadcn/ui setup, and the
   component inventory as they are implemented. `src/app/globals.css` is the
   source of truth for tokens; `DESIGN.md` mirrors it (hex values are the sRGB
   equivalents of the `oklch()` values) and must be updated in the same change
   whenever the theme, fonts, or shadcn configuration change. It must not
   describe tokens, components, or brand rules that the code does not
   implement. The document must follow this structure:
   - YAML front matter with `version`, `name`, `description`, and the token
     groups `colors` (split into `light` and `dark`), `typography`, and
     `rounded`. Add `spacing` or `components` only when the code defines them.
   - Colors are quoted hex strings (`#rrggbb`, or `#rrggbbaa` for alpha). Each
     token name matches its CSS variable in `globals.css` without the `--`
     prefix, and every token has both a light and a dark value.
   - Body sections in this order: Overview, Project setup, Colors, Typography,
     Components, Shape, Behavior, Do's and Don'ts. Sections without
     implemented content are omitted, not filled with placeholders.
   - Each documented value cites its source (`globals.css`, `layout.tsx`,
     `components.json`, `typeset.css`) so it can be verified.
13. Ladle (`.ladle/`) is the isolated UI component development and documentation
   workbench. It provides an isolated environment for developing, inspecting,
   and cataloging design system primitives and UI extensions through colocated
   `*.stories.tsx` files, completely independent of the Next.js App Router
   runtime.
14. **Cross-route vs. route-private code placement**:
   - Following the Next.js project-structure strategy of splitting by feature or
     route, underscore-prefixed private folders (`_components`, `_hooks`, `_lib`)
     colocate non-routable code strictly with the route segment or route group
     that owns it (for example, home-page modules in `src/app/_components/` and
     `src/app/_hooks/`).
   - Code consumed by more than one route tree is placed outside `src/app/` in
     the canonical shared directories: shared components in
     `src/components/ui/extensions/` (per [ADR 0002](0002-configure-shadcn-ui.md)),
     shared hooks in `src/hooks/`, and non-UI helpers in `src/lib/` (such as
     `RouteLoading`, `AuthProviderClient`, `FirebaseAuthSessionBridgeClient`,
     their orchestration hooks, and `src/lib/locale.ts`).
   - Layouts and `loading.tsx` files import shared modules through `@/` aliases
     rather than reaching into `src/app/_*`.
   - `pnpm check:components` and the `no-module-support-in-hooks` ast-grep rules
     enforce hook conventions across both `src/app/**/_hooks/` and `src/hooks/`
     (excluding the shadcn-registry `src/hooks/use-mobile.ts`).
15. **Owned component integration suffixes and exact export naming**:
   - Application-owned components in `src/components/ui/extensions/` and
     `src/app/**/_components/` use filename suffixes based on integration
     responsibility rather than raw React runtime directives (evolving from and
     superseding an earlier runtime-suffix-for-all-client-components rule and an
     earlier suffix-free semantic export rule):
     - Reserve `-client.tsx` (declaring `"use client"`) for browser integrations
       (e.g., session, persistence, navigation, browser file/URL APIs, theme),
       including integration work delegated to local hooks or helpers.
     - Reserve `-server.tsx` (importing `"server-only"`) for server integrations.
     - Keep presentation components without a runtime suffix, including interactive
       UI and form-context presentation (such as profile fields and save-state
       buttons) that use state, events, or `useFormContext` and therefore declare
       `"use client"`, as well as shared presentation compatible with either graph
       (such as `LabeledSpinner`). Composing an integration child does not make the
       parent an integration, and `fetch` alone does not determine the execution
       environment. The convention combines Container/Presentational separation
       with React module boundaries.
   - Owned component exports, their `<ComponentName>Props` types, and their
     component-named orchestration hooks (`use<ComponentName>`) must match the
     complete filename stem 1:1, including `Client` or `Server` on integration
     modules (for example, `home-section-client.tsx` exports `HomeSectionClient`,
     `HomeSectionClientProps`, and uses `useHomeSectionClient`;
     `profile-form-client.tsx` exports `ProfileFormClient` with compound parts
     sharing the same root). Colocated tests and stories use the full filename
     stem.
   - Private hook modules in `src/app/**/_hooks/` and shared hooks in `src/hooks/`
     enforce exact file and export name parity. Native presentation hooks (`useId`,
     `useTranslations`, `useFormContext`, `useWatch`) may be composed directly in
     components without custom wrapper hooks.
   - `pnpm check:components` enforces component placement, conservative static
     integration-evidence tracing through local `.ts` helpers, boundary directives,
     composition contracts, and exact filename-stem term parity (`checkStemComponentTermParity`)
     in `verify:fast` and `verify:static`. Framework-mandated route files and
     registry output (`src/components/ui/`, `src/components/firebase/`,
     `src/components/ai-elements/`) retain their exclusions.

16. **Biome Overrides for Vendored Registries (`biome.json`)**:
    Because vendored code from shadcn, AI SDK Elements, and third-party registries uses external generation idioms, `biome.json` configures mandatory overrides for `src/components/ui/**`, `src/components/ai-elements/**`, `src/lib/highlighter.tsx`, and `src/app/typeset.css`:
    - Relaxes rules incompatible with upstream code: accessibility warnings (`a11y/*`), `suspicious/noReactForwardRef`, `suspicious/noArrayIndexKey`, `security/noDangerouslySetInnerHtml`, `correctness/useExhaustiveDependencies`, and `performance/noImgElement`.
    - Disables Biome formatter and import assist (`formatter.enabled: false`, `assist.enabled: false`) for vendored components to prevent churn during registry updates.
    - Excludes custom application extensions (`!src/components/ui/extensions/**`) from these overrides, ensuring project-owned code maintains full strict linting and formatting.

Lasting architectural choices continue to be recorded as sequential ADRs in
`docs/adr/`. Future ADRs follow the filename and title convention in
`.agents/rules/adr-conventions.md`. Accepted ADRs remain immutable: a changed
decision is captured in a new record that supersedes the earlier one, rather
than by renaming, renumbering, or rewriting it.

## Missing-document policy

If a required documentation entrypoint is missing, restore it before relying on
the practice it defines. Recreate `AGENTS.md`, `README.md`, and the relevant
root document using this decision, the current repository configuration, and
the linked documentation as sources of truth. Restore agent configuration files
by running `setup-matt-pocock-skills` rather than inventing tracker or label
conventions.

`GLOSSARY.md` and `docs/adr/` are intentionally created lazily by the domain
modeling workflow when a term or a durable decision is resolved. A template may
therefore omit the glossary and contain no ADRs until those conditions occur.
If `GLOSSARY.md` is present before a domain is defined, it must state that its
content is pending. Do not create `GLOSSARY-MAP.md` unless the repository has
multiple domain contexts.

`DER.md` is required even before a database exists. In that state, it must
clearly state that its content is pending the adoption of a database and
persistence model.

## Consequences

- **Positive**:
  - New contributors can find core practices without inspecting implementation
    details.
  - The existing `src/` layout is explicitly aligned with the Next.js 16
    guidance used for this decision.
  - Future test or security tooling changes have clear documentation owners.
  - Contributors have a single source for installed and configured tooling,
    including its ownership and configuration, and a prepared location for
    agreed domain vocabulary and the future data model.
  - Code conventions are discoverable without duplicating tool configuration.
  - The visual design system is documented in one place that matches the
    implemented theme, so design and code do not drift apart.
- **Negative / Trade-offs**:
  - These documents must be maintained whenever practices or tooling change.
  - `DESIGN.md` duplicates token values from `globals.css` and has no automated
    sync check yet, so it can drift if a theme change omits it.
  - The baseline testing standard initially lacked an automated test runner,
    relying on static analysis and production builds. This baseline has since
    evolved to the full automated Vitest, Playwright, and Ladle test and workbench
    suites formally adopted in [ADR 0006](0006-configure-testing.md) and
    [ADR 0007](0007-configure-ci.md).

## References

- [biome.json](../../biome.json)
- [CODING_STANDARDS.md](../../CODING_STANDARDS.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [ADR 0001: Configure Next.js](0001-configure-nextjs.md)
- [ADR 0002: Configure shadcn/ui](0002-configure-shadcn-ui.md)
- [ADR 0007: Configure CI](0007-configure-ci.md)
