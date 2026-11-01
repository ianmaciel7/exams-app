---
trigger: model_decision
description: "Read when naming, placing, exporting, or defining props for owned components."
---

# Component contracts

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when naming, placing, exporting, or defining props for owned components.

## Component Architecture: Dimensions and File Contracts

These are **repository conventions**, not filename rules prescribed by Next.js or shadcn/ui.
This section covers component dimensions and file contracts; see also [Component Architecture: Composition, Hooks, and Enforcement](components.md).

## Three independent dimensions

| Dimension | Convention | Examples |
| --- | --- | --- |
| Runtime | Import graphs determine membership; `"use client"` declares a boundary, while a shared module can compile in both graphs | `ProfileCard` may participate in a client subtree without its own directive |
| Responsibility | Describe the composition or behavior, not its runtime | `ProfileCard`, `ProfileFormClient`, `ProfileAvatarFieldClient`, `AuthProviderClient`, `AuthGateClient`, `SignInAuthFlowClient` |
| Placement | Colocate route components in private `_components/`, hooks in `_hooks/` and shared components in `src/components/ui/extensions/` | App Router private folders do not become routes |

The shadcn primitives live under `src/components/ui/`; Firebase registry output
lives under `src/components/firebase/`; generated AI Elements live under
`src/components/ai-elements/`. That copied registry source is locally maintained and adaptable, and excluded
from application naming checks; this exclusion preserves upstream API shapes
and does not transfer maintenance ownership to vendors. Application-owned extensions under
`src/components/ui/extensions/` **are** checked.

## Component file contracts

- Use `kebab-case.tsx` and a matching PascalCase family root. Every owned component module may also export related parts prefixed by the root name, such as `AccountCardHeader` in `account-card.tsx`. Declare each as a local named function and export the parts together. Simple components retain one export. The profile Card and Form families have additional exact-part safety checks. Do not use `export default` or `export function` in owned reusable components.
- Component value exports must preserve the local function name. Aliases such as `OtherCard as AccountCard` and component re-exports cannot satisfy the filename contract, even when an unused matching local function exists. Type-only exports are exempt.
- Use `ProfileCardProps` for props of `ProfileCard`; inherit React/HTML
  component props according to the existing component-props rule.
- Prefer semantic roles: `*-field`, `*-fields`, `*-form`, `*-card`,
  `*-dialog`, `*-header`, `*-button`, `*-table`, `*-list`, `*-provider`,
  `*-guard`, `*-flow`, `*-hero`, `*-section`, or `*-content`. This is **not** a closed list.
  `Flow` specifically denotes navigation or application flow wiring.
- Do not name route-private components after screen or page terms (`-page`, `-screen`, `-view`);
  name by semantic role. Prohibit generic implementation terms (`View`, `Screen`, `Presentation`) in component identifiers.
- Reserve `-client.tsx` for browser integrations and `-server.tsx` for server
  integrations. Presentation components keep no suffix, including interactive
  presentation that declares `"use client"`. Owned component exports and
  props types must match their complete filename stem, including `Client`
  or `Server`. The checker no longer defines a legacy semantic suffix
  exception. For example, `HomeClient` uses
  `HomeClientProps` in `home-client.tsx`.
- Integrations own application data, persistence, authentication, navigation or
  platform access, directly or through focused hooks/helpers. Examples include
  Firebase, browser storage, object URLs, theme persistence and external fetches.
  React state, Effects, events, React Hook Form context, translations, or the
  presence/name of a custom hook alone do not justify an integration suffix.
- Browser integration entrypoints declare `"use client"`; server integration
  entrypoints import `"server-only"`. Interactive presentation also uses client
  boundaries where required. A name without a suffix does not mean server-compatible.
  Do not use `"use server"` to classify ordinary Server Components.
  Prohibit generic implementation suffixes `-component`, `-ui`, and `-presentation`.
- Server Components can fetch data and render Client Components; only
  browser-interactive entrypoints need explicit client boundaries.
  A `"use client"` module must not directly import server-only APIs
  (`next/headers`, `next/cache`, `next/server`, `next-intl/server`,
  `server-only` or `firebase-admin`). These are provable errors;
  the guard does not attempt to infer the complete transitive import graph.
  A helper module that imports `"server-only"` may use the Firebase SDK
  (`FirebaseServerApp`) without making the Server Component that calls it a
  browser integration.
- Next.js `page.tsx`, `layout.tsx` and `template.tsx` use their mandatory
  framework exports and remain outside this naming guard. The separate
  `pnpm check:routes` enforces our thin-route architecture policy.

## Exact filename stem and component term parity (`checkStemComponentTermParity`)

Owned component files enforce exact 1:1 term parity between the filename
stem and component identifiers:

- **Term-for-term matching**: The kebab-case filename stem and PascalCase component identifiers are tokenized into semantic terms (e.g., `home-section-client` -> `["home", "section", "client"]`). Every term present in the filename stem must exist in the component name, and no extraneous terms may appear.
- **No missing terms**: Declaring a component that drops terms from the filename (such as declaring `HomeSection` in `home-section-client.tsx`, which omits `Client`) triggers an error: `missing term(s): "client"`.
- **No unexpected terms**: Declaring a component with terms absent from the filename (such as `HomeViewClient` or `HomeSectionViewClient` in `home-section-client.tsx`) triggers an error: `unexpected term(s): "view"`.
- **Reference implementation (`HomeClient`)**: `src/app/_components/home-client.tsx` enforces exact 1:1 term parity:
  - Component declaration and named export: `HomeClient`
  - Prop type declaration: `HomeClientProps` (`HomeProps` is rejected)
  - Hook coordination: `useHomeClient` in `src/app/_hooks/use-home-client.ts` (`useHome` is rejected)
  - Companion UI component: `src/app/_components/home.tsx` exports `Home` and its compound presentation parts (`HomeContent`, `HomeLogo`, `HomeHeading`, `HomeFooter`). `HomeClient` coordinates state/hooks and composes `Home`.
- **Profile example:** `profile-form-client.tsx` exports
  `ProfileFormClient`, with compound parts sharing the same root. This
  naming contract enforces exact filename-stem parity while preserving integration
  versus presentation placement. See
  [ADR 0005](../../docs/adr/0005-document-project-standards.md).

## UI companion components for integration boundaries (Client and Server)

Every Client (`*-client.tsx` / `*Client`) or Server (`*-server.tsx` / `*Server`) integration component must be paired with an equivalent UI presentation component (without integration suffixes, e.g. `Home` in `home.tsx` for `HomeClient` in `home-client.tsx`).

- The companion UI component owns markup, HTML elements, styled layout containers, and presentation compound parts (`Home`, `HomeContent`, `HomeLogo`, `HomeHeading`, `HomeFooter`).
- Integration components must not declare presentation parts with `Client` or `Server` suffixes (such as `HomeClientLogo` or `HomeClientHeading`).
- The integration component coordinates hooks, browser/server data, and passes slots by composing the companion UI component.
- `pnpm check:components` enforces that `HomeClient` composes `Home`.

Simple presentation hooks such as `useId`, `useTranslations`, and React Hook
Form's `useFormContext` and `useWatch` may be called directly in a field.
Multiple presentation hooks are permitted. Do not create component-specific
wrappers solely to group these calls; reserve application hooks for stateful
behavior, effects, and data coordination.

## CI enforcement

`pnpm check:components` runs self-tests and validates all owned
`src/app/**/_components/**/*.tsx` and `src/components/**/*.tsx` files,
except generated registry trees and test/story files. It is included in
`verify:fast` and `verify:static`, making it mandatory in CI.

Integration checks follow static runtime imports/re-exports through local `.ts`
hooks/helpers (`@/` and relative imports), with cycle protection. They stop at
component imports: composing an integration child does not classify its parent.
Type-only imports, React UI hooks, React Hook Form and client directives alone
are not integration evidence. Known evidence includes Firebase, next-themes,
browser navigation hooks (including `useParams`), browser globals/object URLs, fetch calls, server APIs,
Node built-ins (both bare and `node:` imports) and explicit `client-only`/`server-only` markers. Fetch is classified
using the owning component boundary, not whether its URL is external.

The guard requires matching suffixes and boundaries for recognized integrations
and rejects `-client` on presentation-only modules. Unknown browser SDKs can use
`client-only` in their adapter to declare the dependency explicitly. This is a
conservative module-level syntax check, not symbol-level data-flow analysis.
Dynamic imports, computed browser access, aliases of globals, third-party SDK
internals and hooks implemented in `.tsx` require manual review. Next.js remains
responsible for the complete Server/Client graph. Native boundary checks,
exact term parity (`checkStemComponentTermParity`), and existing composition/form/field guards remain active.

## Official references

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`)
- [Next.js use client directive](https://nextjs.org/docs/app/api-reference/directives/use-client) (`node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`)
- [Next.js private folders/project structure](https://nextjs.org/docs/app/getting-started/project-structure) (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`)
- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json)
- [shadcn/ui Card composition](https://ui.shadcn.com/docs/components/base/card)

## Banned generic naming terms

Do not use `View` or `Screen` as words in owned component, hook, type, variable, parameter, import-binding or file names. Use the responsibility instead (`ProfileSectionClient`, `useProfileSectionClient`, `useProfileStatus`, `AuthContent`, `AuthFlow`). `useProfileStatus` replaces generic view-state naming; profile rendering consumes `state.status`.

`check:components` scans owned `.ts` and `.tsx` files throughout `src`, including hooks and library modules. CamelCase, kebab-case and numbered words are checked, so `AccountScreenState`, `AccountScreen2` and `use-account-view.ts` fail; unrelated words such as `Viewport` and `preview` remain valid. Generated registries and test/story files retain their exclusions. Preserve external API export names, but alias their local bindings (`SignInAuthScreen as SignInAuthContent`).

Export aliases, named function/class expressions, enums and type parameters also follow this policy. Re-export external names with a semantic public alias (`AccountScreen as AccountContent`); exporting `AccountContent as AccountScreen` is prohibited. Comments and string content are outside this naming check.

## Owned component placement

Place shared application components in `src/components/ui/extensions/` and
route-private components in `src/app/**/_components/`. For example,
`LoadingState` belongs in `ui/extensions` because both
route components and Firebase UI consume it. Do not create parallel application
component folders such as `src/components/loading/`.

`pnpm check:components` rejects JavaScript and TypeScript source files (including
colocated tests and barrel files) outside the `ui`, `firebase`, and `ai-elements`
registry trees under `src/components`. Existing registry trees remain allowed;
their generated source retains its existing exclusions. This is repository
policy, not a Next.js requirement.
