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
   installed engineering skills. The project installs five skills in
   `.agents/skills/` (`ask-matt`, `context7-cli`, `save`, `setup-matt-pocock-skills`,
   and `shadcn`), tracked with locked versions and hashes in `skills-lock.json`.
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

Lasting architectural choices continue to be recorded as sequential ADRs in
`docs/adr/`. Future ADRs follow the filename and title convention in
`.agents/rules/adr-naming.md`. Accepted ADRs remain immutable: a changed
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
