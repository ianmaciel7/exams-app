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

| Dimension      | Convention                                                                                                                                                                                                                                                     | Examples                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Runtime        | Import graphs determine membership; `"use client"` declares a boundary, while a shared module can compile in both graphs                                                                                                                                       | `AccountCard` may participate in a client subtree without its own directive             |
| Responsibility | Every component must specify a concrete component type or semantic role describing its composition or behavior, not its runtime environment. Bare domain or runtime labels are prohibited                                                                      | `ProfileForm`, `ProfileAvatarFieldClient`, `PublicUiProviderClient`, `SignInFormClient` |
| Placement      | Colocate route components in private `_components/`, hooks in `_hooks/` and route-shared components in the nearest common `_components/` (`src/app/_components/` for the whole app, `src/app/(public)/_components/firebase/` for the Firebase auth components) | App Router private folders do not become routes                                         |

Every owned component must specify a concrete component type or semantic role describing its composition or behavior (such as `*-field`, `*-form`, `*-card`, `*-dialog`, `*-hero`, `*-button`, `*-provider`, or `*-guard`). A component name must never describe only its feature domain or runtime environment without a concrete role.

Route composition roots that render an auth form carry `Form` in the name (`SignInFormClient`, `RegisterFormClient`) and their hooks and files follow it (`use-sign-in-form-client.ts`, `sign-in-form-client.tsx`). The forgot-password page composes `Card` directly and renders `ForgotPasswordFormClient`, like the sign-in and register pages. The legacy Firebase UI `*-auth-screen.tsx` and `*-auth-form.tsx` modules no longer exist; shared form parts live in `src/app/(public)/_components/` (`EmailField`, `PasswordField`, `AuthSubmitSection`).

`src/components` only holds the shadcn primitives (`ui/`, with the presentational
`ui/extensions/`) and generated AI Elements; `pnpm check:repo` runs
`check-components-directory.mjs`, which rejects any other folder, any `-client`/`-server` component and any `"use server"`/`server-only` module there. Integration components (session, headers, Firebase) live in `_components` next to the route that owns them, following the Next.js private-folder convention. Generated AI Elements live under
`src/components/ai-elements/`. That copied registry source is locally maintained and adaptable, and excluded
from application naming checks; this exclusion preserves upstream API shapes
and does not transfer maintenance ownership to vendors. Application-owned extensions under
`src/components/ui/extensions/` **are** checked.

## Anti-Over-Engineering and Pragmatic Cohesion

- **Avoid Hyper-Fragmentation**: Keep closely related component and hook logic cohesive in the same module. Do not split simple forms or fields into chains of single-purpose micro-hooks (< 30-50 lines) or pass-through containers merely for theoretical single-responsibility dogma.
- **Framework-First Architecture**: Follow canonical Next.js App Router patterns (Server Actions, direct utilities, shared root providers). Avoid introducing route-level Ports, Adapters, Gateways, or route-level React Context Providers where standard framework idioms suffice.
- **Critical Architecture Review**: Proactively audit and alert on over-engineering, code duplication, and unnecessary indirection rather than passively justifying complex existing scaffolding.

## Component file contracts

- Use `kebab-case.tsx` and a matching PascalCase family root. Every owned component module may also export related parts prefixed by the root name, such as `AccountCardHeader` in `account-card.tsx`. Declare each as a local named function and export the parts together. Simple components retain one export. Do not use `export default` or `export function` in owned reusable components.
- Component value exports must preserve the local function name. Aliases such as `OtherCard as AccountCard` and component re-exports cannot satisfy the filename contract, even when an unused matching local function exists. Type-only exports are exempt.
- Use `AccountCardProps` for props of `AccountCard`; inherit React/HTML
  component props according to the existing component-props rule.
  Extract inline object parameter types into named `<ComponentName>Props`
  aliases. `no-inline-component-props` also covers Next.js special files,
  including `error.tsx` and `global-error.tsx`; their framework exports remain
  unchanged. Error-boundary props do not inherit HTML attributes.
- Every owned component identifier and filename MUST include a concrete component role / type describing its composition (e.g. `*-field`, `*-fields`, `*-form`, `*-card`, `*-dialog`, `*-header`, `*-button`, `*-table`, `*-list`, `*-provider`, `*-guard`, `*-flow`, `*-hero`, `*-section`, `*-content`, or `*-text`). This is a mandatory contract, not an optional preference; omitting the component type is prohibited. This list of semantic roles is **not** closed. `Flow` specifically denotes navigation or application flow wiring.
- Bare feature/domain integration names like `<Domain>Client` or `<Domain>Server` (e.g. `ProfileClient`, `SettingsClient`, `HomeServer`) that omit the component type are explicitly forbidden. The `Client` and `Server` suffixes specify the runtime environment, NOT the component type. Omitting the component type creates ambiguous components with no clear composition role. All integration components must pair their domain with a concrete semantic role before any runtime suffix (e.g. `ProfileAvatarFieldClient`, `SettingsSectionClient`, `HomeHeroClient`).
- Effect-only client components that render nothing (`return null`) keep the
  name from the official Next.js docs instead of a repository role and `-client`
  suffix: `NavigationEvents` (route-change effects, `useRouter` guide) and
  `WebVitals` (`useReportWebVitals`). `check:components` allows exactly these
  stems (`nextjsDocComponentStems`); the hook follows the same name
  (`useNavigationEvents`).
- Do not name route-private components after screen or page terms (`-page`, `-screen`, `-view`);
  name by semantic role. Prohibit generic implementation terms (`View`, `Screen`, `Presentation`) in component identifiers.
- Reserve `-client.tsx` for browser integrations and `-server.tsx` for server
  integrations. Presentation components keep no suffix, including interactive
  presentation that declares `"use client"`. Owned component exports and
  props types must match their complete filename stem, including `Client`
  or `Server`. The checker no longer defines a legacy semantic suffix
  exception. For example, `WelcomeHeroServer` uses
  `WelcomeHeroServerProps` in `welcome-hero-server.tsx`.
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
- **Reference implementation (`SignOutButtonClient`)**: `src/app/_components/sign-out-button-client.tsx` enforces exact 1:1 term parity:
  - Component declaration and named export: `SignOutButtonClient`
  - Prop type declaration: `SignOutButtonClientProps` (`SignOutButtonProps` is rejected)
  - Hook coordination: `useSignOutButtonClient` in `src/app/_hooks/use-sign-out-button-client.ts`
  - Server pair: `welcome-hero-server.tsx` exports `WelcomeHeroServer`, which composes its companion `welcome-hero.tsx` (`WelcomeHero`, `WelcomeHeroHeader`, `WelcomeHeroTitle`, `WelcomeHeroDescription`, `WelcomeHeroActions`, `WelcomeHeroSkeleton`). The home `page.tsx` composes `Home` and streams `WelcomeHeroServer` behind `<Suspense>`.
- **Profile example:** `profile-form.tsx` exports `ProfileForm`. A `*-form.tsx` component is exempt from the `-client` suffix because it owns its Action and integrations through `useProfileForm` (ADRs 0017 and 0018); `profile-avatar-field-client.tsx` keeps the suffix for its browser object URLs. See
  [ADR 0006](../../docs/adr/0006-document-project-standards.md).

## UI companion components for integration boundaries (Client and Server)

Every Client (`*-client.tsx` / `*Client`) or Server (`*-server.tsx` / `*Server`) integration component must be paired with an equivalent UI presentation component (without integration suffixes, e.g. `HomeSection` in `home-section.tsx` for `HomeSectionClient` in `home-section-client.tsx`).

- The companion UI component owns markup, HTML elements, styled layout containers, and presentation compound parts (such as `HomeSection`, `HomeSectionContent`, `HomeSectionHeader`, `HomeSectionFooter`).
- Integration components must not declare presentation parts with `Client` or `Server` suffixes (such as `HomeSectionClientHeader` or `HomeSectionClientFooter`).
- The integration component coordinates hooks, browser/server data, and passes slots by composing the companion UI component.

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

Do not use `View` or `Screen` as words in owned component, hook, type, variable, parameter, import-binding or file names. Use the responsibility instead (`ProfileAvatarFieldClient`, `useProfileAvatarFieldClient`, `AuthCardHeader`, `AuthContent`, `AuthFlow`).

`check:components` scans owned `.ts` and `.tsx` files throughout `src`, including hooks and library modules. CamelCase, kebab-case and numbered words are checked, so `AccountScreenState`, `AccountScreen2` and `use-account-view.ts` fail; unrelated words such as `Viewport` and `preview` remain valid. Generated registries and test/story files retain their exclusions. The scan includes `src/components/firebase/`. An import never hides the term: `import { AccountScreen as AccountContent }` and `import ... from "./account-screen"` fail, so do not depend on a module or export that carries the word.

Export aliases, named function/class expressions, enums and type parameters also follow this policy. Re-exporting an external name with a semantic public alias (`AccountScreen as AccountContent`) stays valid; exporting `AccountContent as AccountScreen` is prohibited. Comments and string content are outside this naming check.

## Component export style and helper placement

Every component module in `src/` ( excluding the shadcn copies `src/components/ui/*.tsx` and AI Elements) declares `function Name()` locally and exports it with `export { Name }`. Inline `export function Name()` and `export default` are rejected by `inspectComponentExportConventions`; `export default` is reserved for Next.js route entry points (`page`, `layout`, `template`, `error`, `global-error`, `not-found`, `loading`, `default`).

`src/components/` holds React UI only. Non-UI `.ts` helpers, including their tests, belong in `src/lib/` (or `src/lib/firebase/`), for example `src/lib/firebase/auth-error-message.ts`.

## Owned component placement

Place shared application components in `src/components/ui/extensions/` and
route-private components in `src/app/**/_components/`. For example,
`LoadingStatus` belongs in `ui/extensions` because both
route components and Firebase UI consume it. Do not create parallel application
component folders such as `src/components/loading/`.

`pnpm check:components` rejects JavaScript and TypeScript source files (including
colocated tests and barrel files) outside the `ui`, `firebase`, and `ai-elements`
registry trees under `src/components`. Existing registry trees remain allowed;
their generated source retains its existing exclusions. This is repository
policy, not a Next.js requirement.

## Unused vendored components

Do not keep vendored Firebase UI components that no route imports (extra
OAuth provider buttons, email-link, enrollment screens). Re-add them from the
registry when a flow needs them. Never delete shadcn-native files in
`src/components/ui/*.tsx`: they stay as upstream copies. Owned wrappers must
add behavior; do not nest extra containers or slot attributes that no style or
test uses. `pnpm check:unused` (Knip) is the mechanical safeguard for unused files.
