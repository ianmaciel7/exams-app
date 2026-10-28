# Documentation coverage

<!-- cspell:words reactjs -->

Reviewed on 2026-10-27 for the flat project rule organization.

## Scope and evidence

This is a documentation topic-to-owner audit, not a claim of full implementation,
a sentence-by-sentence review of every upstream page, or passing behavior tests.
Context7 was used to inspect the official Next.js documentation structure,
React Learn/Reference navigation, and shadcn skill reference inventory.
All 474 Markdown documents in the installed Next.js bundle were inventoried by
path and title. Individual bodies were consulted for the index, Proxy, and
handler/cache boundaries. API/version guidance outside those reads still needs
verification before implementation. The live Context7 Next.js corpus includes
canary material and did not advertise the exact installed 16.4.3 snapshot.

The project declares Next.js 16.4.3, React/React DOM 19.3.1, Compiler 1.0.0,
and shadcn ^4.22.0. The implemented UI uses `base-nova`, Base UI, Tailwind v4,
and Lucide. Configuration and installed source establish applicability, not a
live upstream example. [Version applicability](react-versions.md) distinguishes
verified React 19.3 release claims from local export checks and unresolved details.

## Next.js

The installed bundle contains 298 App Router documents (19 Getting Started,
81 Guides, 196 API Reference, an App index, and a glossary), 167 Pages Router
documents, five Architecture documents, three Community documents, and the
root index. These counts describe document inventory, including section indexes.

| Official context | Local owner | Coverage |
| --- | --- | --- |
| Installation, setup, TypeScript, CLI, configuration, bundling | [Tooling](../../TOOLING.md) | Existing owner; use actual package/configuration |
| Project structure, layouts/pages, linking/navigation | [routes](../../.agents/rules/routes.md), [Architecture](../../ARCHITECTURE.md) | Existing rules |
| Server/Client Components and directives | [boundaries](../../.agents/rules/boundaries.md) | Existing rules |
| Fetching/mutating data, Server Functions, route handlers | [data](../../.agents/rules/data.md), [forms](../../.agents/rules/forms.md), [auth](../../.agents/rules/auth.md) | Existing rules |
| Cache, revalidation, Partial Prefetching, streaming | [cache](../../.agents/rules/cache.md), [rendering](../../.agents/rules/rendering.md) | Installed model must match configuration |
| Errors, preserved state, hydration, lazy loading | [rendering](../../.agents/rules/rendering.md), [effects](../../.agents/rules/effects.md) | Existing rules; verify lifecycle behavior |
| CSS, images, fonts, scripts, video | [assets](../../.agents/rules/assets.md), [Design](../../DESIGN.md), installed styling skill | Script/video lookups conditional on work |
| Metadata, viewport, OG images, robots, sitemap, manifests | [routes](../../.agents/rules/routes.md), installed file-convention/API reference | Individual APIs consulted before use |
| Proxy, redirects, rewrites | [routes](../../.agents/rules/routes.md), [Security](../../SECURITY.md) | No Proxy implementation claimed or required |
| Authentication, data security, CSP, environment variables | [auth](../../.agents/rules/auth.md), [Security](../../SECURITY.md), [Tooling](../../TOOLING.md) | Preserve actual access and environment boundaries |
| Internationalization | [Architecture](../../ARCHITECTURE.md#internationalization), [Coding standards](../../CODING_STANDARDS.md#internationalization) | Cookie-preferred locale selection with browser fallback |
| Testing, accessibility, responsive behavior | [Testing](../../TESTING.md), [Design](../../DESIGN.md) | Existing owners; automatic checks have documented limits |
| Analytics, instrumentation, OpenTelemetry, debugging | [Architecture](../../ARCHITECTURE.md), [Tooling](../../TOOLING.md), [Testing](../../TESTING.md) | Actual instrumentation exists; other integrations conditional |
| Building, deployment, self-hosting, static export, production | [README](../../README.md), [Tooling](../../TOOLING.md), [Security](../../SECURITY.md) | Consult installed deployment guides before changes |
| Upgrades, migrations, codemods | [Tooling](../../TOOLING.md), [Contributing](../../CONTRIBUTING.md) | Conditional; audit does not perform upgrades |
| PWA/offline, MDX, Draft Mode, multi-tenant/zones, custom servers | Installed feature guide and [Architecture](../../ARCHITECTURE.md) | Adoption needs concrete scope; no implementation claimed |
| Pages Router and previous cache model | Installed alternative-router/model docs | Reference for requested migrations, not current App Router policy |
| Architecture and Community material | Installed documentation indexes | Reference; does not create extra project constraints |

Assigning an owner in the table above provides navigation coverage, not verification
of every statement on that page. Consult installed guides on demand.

## React

| Official context | Local owner | Coverage |
| --- | --- | --- |
| Quick Start, installation, editor/TypeScript setup | [Tooling](../../TOOLING.md), [Coding standards](../../CODING_STANDARDS.md), official Learn | Existing setup; tutorials remain upstream |
| Describing the UI: JSX, props, conditional/list rendering, purity | [react](../../.agents/rules/react.md), [components](../../.agents/rules/components.md), [composition](../../.agents/rules/composition.md) | Existing rules; repository naming is local policy |
| Adding Interactivity: events, render/commit, state snapshots, immutable updates | [state](../../.agents/rules/state.md), [react](../../.agents/rules/react.md), [rendering](../../.agents/rules/rendering.md) | Existing contexts |
| Managing State: ownership, sharing, reset, reducers, context | [state](../../.agents/rules/state.md), [rendering](../../.agents/rules/rendering.md) | Existing contexts |
| Escape Hatches: refs, DOM, Effects, dependencies, custom hooks | [dom](../../.agents/rules/dom.md), [effects](../../.agents/rules/effects.md), [hooks](../../.agents/rules/hooks.md) | Existing contexts |
| React hooks, built-in components, APIs | [feature reference](react-features.md), appropriate context rule | API selection is on demand; not every feature is mandatory |
| React DOM hooks, HTML/SVG, portals, resource APIs | [dom](../../.agents/rules/dom.md), [forms](../../.agents/rules/forms.md), [assets](../../.agents/rules/assets.md) | Follow semantic and framework ownership |
| Client, server, static renderer APIs | [boundaries](../../.agents/rules/boundaries.md), [feature reference](react-features.md) | Framework owns app roots and hydration |
| Server Components, Server Functions, directives | [boundaries](../../.agents/rules/boundaries.md), [auth](../../.agents/rules/auth.md), [forms](../../.agents/rules/forms.md) | Validate data and permissions at server boundaries |
| Rules of React and hook ordering | [react](../../.agents/rules/react.md), [effects](../../.agents/rules/effects.md) | Existing rules |
| Compiler configuration/directives/compiling libraries | [compiler](../../.agents/rules/compiler.md), [Tooling](../../TOOLING.md) | Library publishing conditional; pipeline compatibility matters |
| React DevTools, profiling, hook/Compiler lint diagnostics | [Tooling](../../TOOLING.md#react-documentation-and-diagnostic-workflow), [review](react-review.md) | No profiling or complete lint coverage inferred |
| Legacy APIs and removed APIs | [Coding standards](../../CODING_STANDARDS.md#legacy-react-api-guidance) | Reference does not authorize unrelated rewrites |
| Experimental features and version applicability | [react](../../.agents/rules/react.md), [versions](react-versions.md) | Check runtime channel, types, and renderer |
| Performance patterns: waterfalls, bundle size, re-renders, server caching | [vercel-react-best-practices](../../.agents/skills/vercel-react-best-practices/SKILL.md), [rendering](../../.agents/rules/rendering.md), [cache](../../.agents/rules/cache.md) | Installed skill is advisory; project rules and Next.js version context win on conflict |
| Blog, community, tutorials and release narratives | [sources](react-sources.md), official site | Reference; not additional always-loaded policy |

## shadcn/ui

| Official context | Local owner | Coverage |
| --- | --- | --- |
| Installation, components.json, framework detection | [shadcn](../../.agents/rules/shadcn.md), [Tooling](../../TOOLING.md#shadcnui-cli-workflow) | Preserve Base UI configuration |
| Component catalog and blocks | Installed source plus CLI component documentation | Per-component API lookup; no rule file for each component |
| Forms, fields, validation states | [forms](../../.agents/rules/forms.md), [skill forms](../../.agents/skills/shadcn/rules/forms.md) | Existing context |
| Composition, groups, overlays, parts | [composition](../../.agents/rules/composition.md), [skill composition](../../.agents/skills/shadcn/rules/composition.md) | Existing context |
| Styles, variants, tokens, dark mode | [Design](../../DESIGN.md), [skill styling](../../.agents/skills/shadcn/rules/styling.md), [customization](../../.agents/skills/shadcn/customization.md) | Existing sources |
| Icons | [skill icons](../../.agents/skills/shadcn/rules/icons.md) | Existing reference; preserve configured icon family |
| Chat and AI composition | [skill chat](../../.agents/skills/shadcn/rules/chat.md) | Existing reference; select by task |
| Base UI/Radix differences | [skill base differences](../../.agents/skills/shadcn/rules/base-vs-radix.md), installed Base UI types | Do not infer another primitive family's API |
| CLI, presets, updating copied source | [shadcn](../../.agents/rules/shadcn.md), [skill CLI](../../.agents/skills/shadcn/cli.md) | Preserve local adaptations; review update diffs |
| Registry consumers and authoring | [Security](../../SECURITY.md#component-registry-updates), [skill registry](../../.agents/skills/shadcn/registry.md) | Authoring conditional; inspect registry provenance |
| Design system and showcase | [Design](../../DESIGN.md), [design system](../../.agents/skills/shadcn/design-system.md), [showcase](../../.agents/skills/shadcn/design-system-page.md) | Existing references; design work is task-scoped |
| Monorepo, RTL, other framework/base migrations | Official matching guide and installed CLI | Current setup is not a monorepo migration or RTL request |

The installed skill contains all 11 detailed reference entrypoints returned by
Context7. This checks the reference inventory, not every upstream component API.

## Firebase and design context

| Context | Local owner | Coverage |
| --- | --- | --- |
| CLI setup, project selection, app config | [firebase-basics skill](../../.agents/skills/firebase-basics/SKILL.md), [Tooling](../../TOOLING.md) | Existing skill; demo projects use `.firebaserc` and `firebase.json` |
| Authentication, FirebaseUI, Electron redirect, role custom claims | [auth](../../.agents/rules/auth.md), [firebase-auth-basics skill](../../.agents/skills/firebase-auth-basics/SKILL.md), [ADR 0009](../adr/0009-integrate-firebase-authentication.md) | Browser guards are UX routing, not server authorization |
| Persistence, Firestore, Storage, Realtime Database | [data](../../.agents/rules/data.md), [DER](../../DER.md), [ADR 0009](../adr/0009-integrate-firebase-authentication.md) | Product entities pending; only the technical boundary exists |
| Security rules and Cloud Functions review | [firebase-rules-review skill](../../.agents/skills/firebase-rules-review/SKILL.md), [Security](../../SECURITY.md) | Review `firestore.rules`, `storage.rules`, `database.rules.json`, and `functions/` together |
| Emulator Suite and Auth end-to-end flows | [emulator-test skill](../../.agents/skills/emulator-test/SKILL.md), [Testing](../../TESTING.md), [Tooling](../../TOOLING.md) | Requires local emulators; do not claim a run that did not happen |
| FirebaseUI registry source | [ADR 0008](../adr/0008-install-firebase-ui-registry.md), [Security](../../SECURITY.md#component-registry-updates) | Locally owned source; inspect registry diffs |
| Product and design context | [PRODUCT.md](../../PRODUCT.md), [Design](../../DESIGN.md), [impeccable skill](../../.agents/skills/impeccable/SKILL.md) | `PRODUCT.md` states purpose; `DESIGN.md` owns implemented tokens |

Firebase official documentation is queried through the Firebase MCP server or Context7;
the audit does not review upstream Firebase pages.

## Changes from this audit

- Added explicit index destinations for configuration/environment, deployment,
  upgrades, observability, Proxy, and script/video lookups without new rule files.
- Added the Proxy reference to `routes.md` and script/video pointers to `assets.md`.
- Clarified App Router renderer-version ownership in `react-versions.md`.
- Removed ambiguous module-level cache advice for Route Handlers in `cache.md`:
  the installed guide explicitly requires extracting `use cache` into a helper.
- Recorded conditional topics separately from existing implementation guidance.
- Added Firebase, design-context, and React performance-skill owners.
- A follow-up Context7 check corrected current Claude AGENTS discovery guidance
  and verified the React 19.3 View Transitions/Fragment refs release scope.

## Sources and maintenance

- [Next.js official documentation](https://nextjs.org/docs/app), queried through Context7 `/vercel/next.js`; installed docs determine version context.
- [React Learn](https://react.dev/learn) and [Reference](https://react.dev/reference/react), indexed through Context7 `/reactjs/react.dev`.
- [Official shadcn skill](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md), indexed through Context7 `/shadcn-ui/ui`.

Refresh the inventory when framework versions or project architecture change.
Keep a topic in its current owner when that owner already covers the context;
create another rule only for an independently useful project constraint.
