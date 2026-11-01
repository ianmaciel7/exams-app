---
trigger: manual
description: "Index of project rule topics; consult to select relevant rules."
---

# Agent rules

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

All rule files are immediate children of this directory. Read only the contexts
needed by the task; do not load the full directory. Detailed guides live in
[docs/agents](../../docs/agents/README.md). Version and API statements inherited
from the previous rules still require verification against installed packages.

## Reading map

| Rule | When to read |
| --- | --- |
| [components.md](components.md) | naming, placing, exporting, or defining props for owned components |
| [composition.md](composition.md) | composing owned component families, forwarding primitive props, or defining children slots |
| [hooks.md](hooks.md) | implementing or refactoring custom hooks and component behavior ownership |
| [react.md](react.md) | changing React render logic, hook call order, API compatibility, or adopting experimental APIs |
| [state.md](state.md) | changing local state, reducers, context, derived values, or external stores |
| [effects.md](effects.md) | changing external synchronization, subscriptions, cleanup, or asynchronous lifecycle work |
| [forms.md](forms.md) | changing form context, validation, Actions, submission, reset, or profile field ownership |
| [routes.md](routes.md) | changing route entrypoints, handlers, navigation, metadata, or viewport exports |
| [boundaries.md](boundaries.md) | changing runtime import graphs, Server Components, Server Functions, or data crossing runtime boundaries |
| [cache.md](cache.md) | changing Next.js caches, invalidation, streaming, prefetching, or request lifetimes |
| [assets.md](assets.md) | changing Next.js image or font loading and resource hints |
| [data.md](data.md) | changing persistence modules, DTOs, schemas, data placement, or dependency injection |
| [auth.md](auth.md) | changing identity, session cookies/tokens, protected access, or post-auth navigation |
| [testing.md](testing.md) | testing or changing stateful journeys, cancellation, errors, retries, or recovery |
| [ui-state.md](ui-state.md) | changing user-visible pending, success, error, empty, cancellation, retry, or recovery behavior |
| [rendering.md](rendering.md) | changing Suspense, loading/error boundaries, transitions, hydration, or component identity |
| [mobile.md](mobile.md) | changing touch targets, form-field text, autofill, motion, or mobile layout behavior |
| [dom.md](dom.md) | changing HTML/SVG semantics, refs, portals, imperative browser integration, or Fragment refs |
| [compiler.md](compiler.md) | changing Compiler configuration, directives, optimization, or eligibility diagnostics |
| [shadcn.md](shadcn.md) | maintaining copied shadcn/Base UI source, adapting primitives, or updating UI registry output |
| [language.md](language.md) | writing source comments, documentation, agent artifacts, or commit messages |
| [adr.md](adr.md) | creating, superseding, or referencing architecture decision records |
| [docs.md](docs.md) | deciding where to save rules, operational guides, conventions, or project knowledge |
| [research.md](research.md) | Read before external documentation research or when caching and promoting research findings |

## Existing sources

- UI styles, icons, chat, and Base UI differences: [installed shadcn skill](../skills/shadcn/SKILL.md).
- Locale and routing architecture: [ARCHITECTURE.md](../../ARCHITECTURE.md#internationalization).
- Accessibility and responsive behavior: [mobile rule](mobile.md), [DESIGN.md](../../DESIGN.md), and [TESTING.md](../../TESTING.md).
- Diagnostics and verification: [TOOLING.md](../../TOOLING.md), [TESTING.md](../../TESTING.md), and [project-verify](../skills/project-verify/SKILL.md).

## Documentation coverage

The [coverage map](../../docs/agents/coverage.md) assigns official Next.js, React,
and shadcn topics to existing rules, guides, skill references, or conditional
upstream lookups. Consult it when the reading map has no obvious match.
Configuration, environment variables, deployment, and upgrades belong to
`TOOLING.md`, `SECURITY.md`, and the installed framework guides. Instrumentation
belongs to `ARCHITECTURE.md` and `TESTING.md`. This index does not claim that an
optional feature is implemented or that every upstream API has been verified.

## Client loading

Antigravity topic rules use `model_decision` for on-demand reading; the short
language policy uses `always_on`.
Codex follows the explicit reading map in `AGENTS.md`; arbitrary topic files are
not automatically discovered. Current Claude Code can read `AGENTS.md` directly
when its project-instructions mode selects it and no Claude entrypoint takes
precedence; `@AGENTS.md` in `CLAUDE.md` is an optional compatibility path.
Antigravity metadata does not configure Claude.
See the [loading guide](../../docs/agents/rules.md). Do not assume synchronization
or client activation succeeded merely because configuration exists.
