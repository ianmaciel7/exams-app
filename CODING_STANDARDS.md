# Coding Standards

The evidence-backed applicability matrix for external web standards lives in
[quality standards](docs/agents/quality-standards.md). This guide owns source
conventions and implementation boundaries.

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
- Whenever a client component uses an Effect, consider whether a descriptive
  feature-local custom hook would make its purpose and data flow clearer. React
  recommends considering a custom hook for each Effect ([Reusing Logic with
  Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks)). Remove unnecessary Effects first, and extract a hook only when it creates a useful boundary; do not add one solely to shorten a component.
- Do not model UI phases with a `status` tag. Use explicit boolean flags such
  as `isLoading`, `isHidden`, and `isError`; components should branch on the
  applicable flag and keep payloads such as `message` and `userId` nullable
  when unavailable.
  Boolean flags remain appropriate for independent conditions.
- **State derivation and Effect elimination**:
  - Do not use `useEffect` to copy, derive, or mirror state from props or other state variables. Calculate derived values during rendering or synchronize atomic changes directly in event handlers ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).
  - Consolidate state variables that always transition together into a single atomic state object rather than maintaining fragmented, dependent `useState` declarations.
  - Allocate external resources after commit in the appropriate Effect or in the user event that owns them, never during render. Pair setup with cleanup for replacement, hiding, and unmount as appropriate. An Effect can legitimately synchronize an external resource; avoid blanket rewrites that move necessary synchronization into handlers.
- React permits composing multiple focused hooks. This repository adds the
  stricter [component-named orchestration policy](.agents/rules/hooks.md#component-named-orchestration-hooks)
  for owned components: put behavior/context orchestration in a separate
  `use<ComponentName>` hook, which may compose focused hooks internally.
  Keep route-specific hooks in private `_hooks` folders and hooks shared by
  several route trees in `src/hooks/` ([ADR 0005](docs/adr/0005-document-project-standards.md)). Any combination
  of the supported presentation hooks may be called directly. React itself
  does not require one orchestration hook per component.
- **Hook modules do not own module-level support declarations**: Put helper
  functions, constants, lookup sets and context objects outside the hook in the
  route's `_lib/`. Private `_hooks` modules keep imports, types and the hook
  implementations themselves. Constants and event/lifecycle callbacks inside a
  hook remain valid. The blocking ast-grep rules and syntax limits are documented
  in [the hook module contract](.agents/rules/hooks.md#private-hook-module-support-declarations).
- **No inline state derivation or type guards in JSX**: Owned components must not
  perform inline type discrimination (such as `"userId" in status ? status.userId : undefined`),
  ternary logic for keys, or derived state calculations within JSX attributes or render bodies.
  All conditional identifiers and resolved properties must be derived inside the
  component-named orchestration hook and exposed as clean, ready-to-consume values
  (for example, exposing `userId` so JSX can simply pass `key={userId}`).
- **Self-contained fallback components**: Status and fallback wrapper components
  (such as `ProfileGuard`) must encapsulate their internal presentation logic,
  localized spinner text, and error card structures directly using local translations,
  rather than requiring callers to pass down redundant presentation labels (for example,
  avoid passing `loadingLabel={t("loading")}`).
- **Dependency inversion without prop drilling**: Inject infrastructure
  through typed service functions at the persistence boundary when behavior
  benefits from independent testing. `saveProfile` accepts
  `ProfileDependencies` and defaults to Firebase adapters. Keep UI fields
  dependent on form context, not on Firebase implementations or a passed
  profile controller. Dependency injection is a design choice, not a rule
  to create an interface for every helper.
- **Form Architecture and State Propagation**:
  - Compound forms composed with field-component `children` use one
    `useForm` and `<FormProvider {...form}>`; fields obtain `control`
    with `useFormContext()`. `ProfileFormClientContent` already renders
    one `FieldGroup`, so do not introduce a second group in
    `ProfileSectionClient`. Read native RHF `formState.isSubmitting`
    rather than synchronizing a separate saving flag. The Provider
    requirement is a repository convention, not universal shadcn/ui policy.
  - Name standalone field components after their React Hook Form data property (for example `ProfileDisplayNameField` for `Controller name="displayName"`). Prefer built-in `FieldGroup`/`FieldSet` over arbitrary wrapper components.
  - Allow React Hook Form `UseFormProps<Values>` as an appropriate form component contract. Extract `onSubmit` and component presentation props before passing only RHF options into `useForm`.
  - Form fields use `Field`, `FieldLabel`, `FieldError`, `data-invalid` and `aria-invalid` as documented by shadcn/ui.
  - See `.agents/rules/forms.md#form-architecture-and-context-standards`; run `pnpm check:structure` and `pnpm check:components`.

- **Data and Authentication Module Architecture**:
  - Follow the canonical module taxonomy in [agent rules](.agents/rules/data.md#data-layer-module-conventions) for data and auth boundaries:
    - `definitions.ts`: Types, interfaces, and validation schemas (e.g. Zod schemas).
    - `dto.ts`: Select and structure transferred data crossing system boundaries.
    - `dal.ts`: Protected data access and authorization boundary (`verifySession()`, `verifyRole()`).
    - `data.ts`: Low-level database/persistence operations and query execution. Exported functions must use explicit `<verb><DomainNoun>` naming (`read*`, `write*`, `save*`, `create*`, `update*`, `delete*`, `remove*`, `upload*`, `fetch*`, `get*`, `set*`, `list*`, `verify*`), stay within **150 non-empty lines per file**, and obey the Biome per-function budgets (cognitive complexity **<= 8**, body **<= 40 non-empty lines**, callback nesting **<= 2**).
    - `auth.ts`: Authentication operations answering identity verification ("Who are you?"), such as credential validation, sign-in, sign-up, password recovery, and sign-out.
    - `session.ts`: Session lifecycle, state, token verification, and cookie persistence ("Are you authenticated and what is your active session?").

## Next.js App Router

- Keep route entrypoints and Next.js special files in `src/app`.
- **Server and Client boundary separation**: Route entrypoints (`page.tsx`, `layout.tsx`) cannot be simultaneously Server and Client Components. In the React Server Components model:
  - Adding `"use client"` transforms the entire module into a Client Component boundary, rendering it and all its imports in the client bundle.
  - Framework server exports such as `metadata`, `generateMetadata`, and `generateStaticParams` cannot be exported from a `"use client"` route module. Ordinary browser data-fetching functions are different; their allowed APIs depend on the import graph.
  - Server Components cannot use client state/effect/navigation hooks (`useState`, `useEffect`, `useRouter`) or DOM event handlers (`onClick`). This does not prohibit every API whose name begins with `use`; for example, React supports `use` in synchronous Server Components.
  - Therefore, keep route entrypoint files (`page.tsx`) as Server Components by default. Whenever interactivity or client hooks are required, never create a generic `*-page-client.tsx` at the route root. Instead, extract the client logic into a semantically named UI component in a private `_components/` directory (e.g., following shadcn conventions such as `_components/register-auth-flow-client.tsx`, `_components/sign-in-auth-flow-client.tsx`, or `_components/forgot-password-auth-flow-client.tsx`) and render it from the server `page.tsx`.
- Use the generated `PageProps`, `LayoutProps`, and `RouteContext` helpers for
  route parameters rather than hand-written equivalents:
  - **Route entrypoint parameters (`page.tsx`)**: When a page does not consume `params`
    or `searchParams`, declare the component with empty parentheses (e.g., `export default function ProfilePage()`).
    Do not add unused `_props: PageProps<Route>` signatures to pages that do not take parameters; doing so forces
    required `params` and `searchParams` properties in JSX, breaking component unit tests (e.g., `<ProfilePage />`).
  - **Layout entrypoints (`layout.tsx`)**: Layouts must always receive `{ children }: LayoutProps<Route>`
    (or `{ children }: { children: ReactNode }`) so nested routes render properly; layouts must never have empty `()`.
  - **Root layout viewport export**: The root layout (`src/app/layout.tsx`) must export a viewport configuration with `width: "device-width"` and `initialScale: 1`, strictly prohibiting zoom-disabling settings (`userScalable: false`, `maximumScale: 1`). See [Responsive design and layout contracts](#responsive-design-and-layout-contracts).
  - **Route error & feedback boundaries**: `not-found.tsx` and `loading.tsx` use empty `()`, while `error.tsx`
    receives `{ error, reset }`.
- Colocate route-specific code when it improves locality. Use `_components`,
  `_hooks`, or `_lib` when marking the folder as a private implementation detail
  is useful, following [Next.js private-folder guidance](https://nextjs.org/docs/app/getting-started/project-structure#private-folders).
- Use route groups only to organize routes or layouts without changing the URL.

## Components and styling

- Consult [DESIGN.md](DESIGN.md) for tokens and component conventions. Update
  that reference when changing fonts, theme tokens, or `components.json`.
- The owned-component naming and Next.js Client/Server boundary guard is enforced by `pnpm check:components` (included in CI); registry-generated UI is excluded. See [agent rules](.agents/rules/components.md#component-architecture-dimensions-and-file-contracts).
- Follow the component taxonomy and file naming conventions in
  [agent rules](.agents/rules/components.md#component-architecture-dimensions-and-file-contracts) for UI
  and feature components (such as `*-field.tsx`, `*-fields.tsx`, `*-form.tsx`,
  `*-card.tsx`, `*-dialog.tsx`, and `*-header.tsx`).
- Biome disables formatting and import organization for vendored UI and AI
  Elements files, with targeted lint exceptions. `ui/extensions` remains
  application code; do not extend vendor exceptions to it.

- Reuse `src/components/ui` primitives before creating new ones.
- Follow the existing shadcn component convention across UI primitives and
  private `_components/`: declare a named function and export it explicitly via
  named export (for example, `function Button()` then `export { Button }`).
  Never use inline `export function ComponentName()` or `export default function`
  in `_components/` or `src/components/`; reserve `export default function` solely
  for Next.js route entry points (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`).
- Component prop types should extend the corresponding HTML element or base component
  primitive (for example, button components extend `ComponentProps<typeof Button>` or `ComponentProps<"button">`,
  and form components extend `ComponentProps<"form">`) so they inherit standard attributes,
  support `className` pass-through, and remain composable.
- Maintain single-responsibility module separation: keep domain types, constants,
  and type guards (such as `role.ts`, `theme.ts`, and `locale.ts`) in dedicated modules under
  `src/lib/`, decoupled from persistence and database clients (e.g. `src/lib/firebase/` and route `_lib/data.ts`).
- **Enforced thin route entrypoints**: `page.tsx`, `layout.tsx`, and `template.tsx` are Server Component composition seams in this repository. They can orchestrate server data reads, access route props, declare metadata, and compose UI, but must not embed client hooks, direct Firebase SDK calls, browser APIs, event handlers, state mutation, branching, loops, or helper callbacks. Extract UI into `_components/`, hooks into `_hooks/`, and business logic into dedicated `src/lib/` services. Run `pnpm check:routes` locally; it is mandatory in `verify:fast` and `verify:static` CI. This is a repository policy, not a general Next.js restriction. See [agent rules](.agents/rules/routes.md#nextjs-route-special-files-logic).
- Use the configured `@/*` path aliases instead of deep relative imports when
  crossing module boundaries.
- Use Tailwind CSS and the existing design tokens. Avoid inline styles unless a
  value must be computed at runtime.

### Responsive design and layout contracts

All application UI components—whether in route-private `_components/`, shared
`src/components/`, or `src/components/ui/extensions/`—must satisfy modern 2026
responsive design standards and accessibility criteria enforced by
`pnpm check:responsiveness`:

- **Root layout viewport export (`src/app/layout.tsx`)**:
  - The root layout must export a `viewport: Viewport` object or `generateViewport` function:

    ```tsx
    import type { Viewport } from "next";

    export const viewport: Viewport = {
      width: "device-width",
      initialScale: 1,
    };
    ```

  - **Strict prohibition of zoom disabling (WCAG 1.4.4 Resize Text)**: Restricting user
    zoom by declaring `userScalable: false`, `maximumScale: 1`, or `<meta name="viewport" content="user-scalable=no">`
    is strictly forbidden. Users must always be able to zoom text and layout up to at least
    200% without loss of content or functionality.
- **Rigid pixel width anti-pattern (WCAG 1.4.10 Reflow)**:
  - Do not use fixed pixel widths exceeding 320px (such as `w-[400px]`, `min-w-[500px]`,
    or inline `style={{ width: "450px" }}`) without responsive modifiers or fluid constraints.
  - The 320 CSS pixel threshold represents the standard mobile reflow baseline. Content must
    reflow in a single vertical column without introducing horizontal scrolling (`scrollWidth <= clientWidth`).
  - When wider fixed widths are necessary on larger screens, guard them with responsive
    breakpoint modifiers (e.g., `sm:w-[400px]`, `md:w-[480px]`) or wrap them in fluid
    constraints (e.g., `w-full max-w-[400px]`, `max-w-full`).
- **Target size compliance (WCAG 2.2 SC 2.5.8 Target Size - Minimum 24x24px)**:
  - Every interactive element—including `<button>`, `<a>`, `<Link>`, custom elements with
    `role="button"` or `role="link"`, and click triggers—must provide an interactive target
    area of at least 24x24 CSS pixels.
  - When an element is visually smaller than 24px (such as a 16x16 icon button or compact badge):
    - Add adequate hit-area padding: `p-2`, `p-[6px]`, or `p-1.5`.
    - Apply explicit minimum dimensions: `min-h-6 min-w-6` or `min-size-6`.
    - Use pseudo-element touch expanders: `relative after:absolute after:-inset-2` or `after:size-6`.
  - Nested icons inside a parent button that already satisfies the 24x24px bounding box
    do not need standalone touch padding.
- **Tailwind CSS v4 Container Query conventions (`@container`)**:
  - Prefer container queries over viewport media queries for modular, self-contained components
    whose layout depends on the size of their containing column or card rather than the viewport.
  - Mark parent wrappers with `@container` (or named containers like `@container/card-header`).
  - Style child elements using container query modifiers: `@xs:`, `@sm:`, `@md:`, `@lg:`, etc.
  - Test container query reflow in real Chromium via colocated Vitest Browser Mode tests
    (e.g., `card.browser.test.tsx` verifying container-query adaptation for card metrics and actions).

### Compound components and Server/Client boundaries

These conventions apply to **all application-owned components**, both Server
and Client Components: route-private `_components/`, shared `src/components/`,
and `src/components/ui/extensions/`. They are not limited to the profile route.
Generated registry trees retain their documented exclusions.

Composition describes a component's public API. A compound component exposes a
root and independently usable parts, such as `Card`, `CardHeader`, `CardTitle`,
and `CardContent`. The caller assembles those parts through `children` or named
slots. Each adapter inherits its corresponding primitive's props and forwards
applicable attributes, `className`, `children`, and `ref`. React 19 can carry
`ref` through the ordinary props contract and spread.

A simple `Button`, field, or application view does not need invented parts or
an unused `children` prop. A primitive adapter preserves the primitive contract;
a feature view may own its content, actions, and loading states. Do not confuse
a fixed feature view with a general-purpose Card adapter.

Use separate named exports from one family module. `account-card.tsx` declares
`AccountCard` plus any actual parts named `AccountCardHeader`,
`AccountCardContent`, etc. The root matches the filename, every part is a local
named function with the same root prefix, and each props type matches its part.
Component value exports preserve their local function names; export aliases and
component re-exports cannot satisfy the filename contract. Type-only exports
are exempt. Unrelated components belong in their own modules. The exact profile families
retain their additional safety checks.

```tsx
import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AccountCard(props: ComponentProps<typeof Card>) {
  return <Card {...props} />;
}

function AccountCardHeader(props: ComponentProps<typeof CardHeader>) {
  return <CardHeader {...props} />;
}

function AccountCardContent(props: ComponentProps<typeof CardContent>) {
  return <CardContent {...props} />;
}

export { AccountCard, AccountCardHeader, AccountCardContent };
```

At the call site, the caller supplies the content for each part:

```tsx
<AccountCard>
  <AccountCardHeader>{heading}</AccountCardHeader>
  <AccountCardContent>{children}</AccountCardContent>
</AccountCard>
```

Compose only the parts with content. An adapter that extracts `className` merges
it with its layout classes using `cn`; an extracted `children` value must reach
the primitive. Forward remaining standard props instead of copying a small
selection such as `id` and `title` and silently dropping everything else.

Server/Client describes module graphs and rendering, independently of compound
anatomy. Filename suffixes identify integration responsibilities; directives and imports establish
the actual boundary:

| Situation | Meaning |
| --- | --- |
| Module without a directive | It can participate in the server graph, client graph, or both depending on imports; the missing directive alone does not prove it is a Server Component |
| Module with `"use client"` in its directive prologue | It establishes a client boundary; its runtime dependencies join the client graph without repeating the directive in every file |
| Client Component on an initial request | Next.js can render its initial HTML on the server and hydrate it in the browser; Client does not mean browser-only rendering |
| Server parent passes `<ServerDetails />` as `children` to a Client Component | The server renders the details and passes their output; the Client Component does not import the server module |
| Ordinary callback inside the client graph | It can pass between Client Components; React serialization constraints apply when values cross the Server-to-Client boundary |

Keep browser interactivity behind the smallest useful client boundary. Shared
components do not gain a runtime from names such as `Card`, `Form`, `Header`,
`Section`, or `Provider`. `"use server"` marks server functions; it is not a
way to declare an ordinary Server Component. An exported component at a client
boundary cannot be an async function; an async event handler inside it is valid.

Expose compound parts as named exports rather than assigning static properties
such as `AccountCard.Header = AccountCardHeader` or using
`Object.assign(AccountCard, { Header })`. A Server Component importing a Client
Component receives a client reference, so looking up an arbitrary static part
on it is not a safe cross-boundary API. Named exports let the framework create
an independent reference for each client part. This is our portable project
contract even for a family currently used inside one graph; upstream React also
supports static compound patterns within a single graph.

The import graph and the rendered tree are different. A client boundary must
not import runtime server-only APIs. Type-only imports are erased and do not
establish runtime dependencies. Passing server-rendered nodes through slots is
valid; importing their server-only implementation into client code is not.
See the installed Next.js boundary guide and the
[official Server and Client boundary reference](https://nextjs.org/docs/app/guides/server-and-client-boundary).

### Composition guard coverage

`pnpm check:components` tests and runs the TypeScript AST guard for all owned
components, without restricting the scan to files with `"use client"`.
It enforces semantic filenames, a matching family root, locally declared named
parts with the root prefix, matching props names, separate named exports, and
exact term parity (`checkStemComponentTermParity`) between filenames and component declarations for non-legacy modules (such as `HomeClient` in `src/app/_components/home-client.tsx` requiring a 1:1 term match across component name, props type, and orchestration hook, and composing its companion UI component `Home`).
It rejects static component-property assignment and direct `Object.assign`,
`Object.defineProperty`, or `Object.defineProperties` on a component family.

For direct returned adapters whose local parameter contract resolves to
`ComponentProps<typeof Primitive>` (including React's ref variants, local type
aliases, intersections, and `Omit`) and whose primitive is a named value import
from `@/components/ui/`, the guard requires a matching direct JSX root and
checks remaining-props spreads and forwarding
of explicitly extracted `children` and `className`, including renamed bindings.
It also detects client directives in the full directive prologue, ignores
erased type imports, and preserves the existing direct runtime server-only
import checks at client boundaries. Biome's native
`noNextAsyncClientComponent` rule owns async client-component diagnostics;
the custom composition guard does not duplicate it.

React Hook Form `Controller` roots delegate their visual output to a render
callback and are excluded from this direct-root check; aliases of its named
value import are recognized.

This is a bounded source guard, not a proof of complete RSC behavior. It does
not resolve the transitive import graph, barrel/namespace imports, arbitrary
wrapper helpers, external/interface type contracts, conditional return trees,
all prop/ref data flow, or the semantic purpose of a slot. It does not infer
that every component without a directive is server-only or require every view
to have compound parts. TypeScript, Next.js builds, structural checks, and
behavior/accessibility tests remain responsible for their respective contracts.

### Form and Field Architecture (shadcn/ui & React Hook Form)

Use `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`
from the installed `@/components/ui/field` alongside React Hook Form
`Controller`. The upstream guide demonstrates a choice of schema validation;
it does not require a specific schema library or `FormProvider` in every form.
The profile currently uses RHF defaults, controlled values, and field-level
rules, without a schema resolver. Add one only when the feature needs it.

- Initialize complete defaults for controlled values. When external values
  change, choose RHF `values` or `reset` deliberately and preserve unsaved edits.
- Follow [agent rules](.agents/rules/forms.md#form-architecture-and-context-standards)
  for the single form instance, compound children, Provider boundary, profile
  submit state, reset, avatar cleanup, and fixed button action types. These
  are repository policies rather than universal shadcn/ui requirements.
- Use `FieldGroup` for field layout and `FieldSet` with `FieldLegend` for
  semantically related controls. `*-fields.tsx` is available for a real grouped
  responsibility, not a requirement to wrap every set of inputs.
- Bind `data-invalid={fieldState.invalid}` on `Field` and
  `aria-invalid={fieldState.invalid}` on the interactive control; for Select,
  put the latter on `SelectTrigger`. Connect labels with stable control IDs.
  Use `FieldError errors={[fieldState.error]}` when invalid, or its supported
  children API for a specific message.
- Bind Select through `value` and `onValueChange`; inspect local types for
  nullable values. Do not copy Radix-only props into Base UI components.
- Use `InputGroupInput`/`InputGroupTextarea` within `InputGroup`, with
  `InputGroupAddon` and the matching button component for embedded actions.
- Use native validation where appropriate. A documentation demo's `noValidate`
  is a demonstration choice, not a production default. Client validation never
  replaces Firebase Security Rules or server authorization.

### shadcn/ui API and accessibility

Read [agent rules](.agents/rules/shadcn.md#shadcnui-maintenance) before UI work and
use the CLI workflow in [TOOLING.md](TOOLING.md#shadcnui-cli-workflow). Base UI
uses `render` and presence state attributes; Radix `asChild` and
`data-state` examples do not establish the local API. For navigation, apply
`buttonVariants` to a real anchor or Link instead of rendering an anchor
through Base UI Button, which supplies button semantics. The
`.ast-grep/rules/base-ui/` rules enforce these Base UI contracts in owned
components; see the [custom rule registry](TOOLING.md#custom-rule-registry).

Build a component that accepts `render` with `useRender` and `mergeProps`, as
`src/components/ui/badge.tsx` does: type the public props as
`useRender.ComponentProps<"tag">`, merge local defaults with
`mergeProps<"tag">(defaults, props)`, and return `useRender({ defaultTagName,
render, props })`. Do not use `cloneElement`, `asChild` or a Radix `Slot`. In a
`render` function, spread the received props so Base UI keeps its ref,
handlers and ARIA. Prefer Base UI `data-*` attributes for state styling, and
use the `className={(state) => ...}` form only when a selector cannot express
the state. The [shadcn agent rule](.agents/rules/shadcn.md#establish-project-context)
lists the `mergeProps` merge order and the animation attributes.

Keep Select items inside `SelectGroup`, menu items in the corresponding group,
and Tabs triggers inside `TabsList`. Dialog, Sheet, and Drawer need an
accessible title; avatars need a fallback. An icon-only action needs a localized
accessible name. Preserve `ref`, applicable element props, keyboard behavior,
and focus management when adapting primitives. Use `ComponentProps` of the
actual primitive, not a prop contract copied from a different base.

Keep each trigger and its panel inside the same primitive root so generated
IDs, focus and lifecycle belong to one instance; synchronizing only an `open`
boolean across separate roots does not share `aria-controls`. Compose a Tooltip
trigger with its existing button through `render` instead of nesting buttons.
For a non-native element that needs Base UI button behavior, configure
`nativeButton={false}`. If a third-party custom element already owns keyboard
activation, style it with `buttonVariants` rather than adding a second event
owner. Preserve the actual element property/ref contract, not only attributes.

Icon-only default actions and progress indicators need accessible names that
consumers can localize. Actions revealed on hover must also be visible on
keyboard focus and usable on devices without hover. Forward adapter options to
the primitive part that owns them: the installed Preview Card delays belong to
its Trigger, not its Root; explicit Trigger values may override wrapper defaults.

Use semantic colors and existing variants. Application classes should primarily
control layout; shared visual changes belong in the primitive or theme. Use
the `cn` package directly or the existing `@/lib/utils` re-export rather than
reintroducing a `clsx`/`tailwind-merge` helper. Preserve intentional registry
exclusions while keeping application extensions subject to normal checks.

### Dependency Inversion and Composition in Screen and Presentation Components

Components throughout the application—regardless of whether they are Server Components, Client Components, or shared isomorphic components (neither explicitly client nor server)—must adhere to the Dependency Inversion Principle (DIP) and React composition patterns:

- **Universal Component Decoupling (Server, Client, and Shared Components)**:
  - Do not hardcode high-level infrastructure, application routing (`useRouter`, `redirect`, `Link`), external API clients, or environment-dependent SDKs inside reusable or presentation components.
  - Presentational and domain UI components must receive their actions, dynamic slots, and data abstractions via props (e.g., explicit callbacks, `children`, or injected interfaces) rather than instantiating or coupling to concrete implementations directly.
- **Zero route coupling in presentation screens**: Screen and auth form components must remain purely presentational and never import Next.js navigation hooks (`useRouter`, `redirect`, `Link`) or hardcode application routes (such as `/register`, `/sign-in`, or `/forgot-password`). Decouple them by defining explicit callback props (e.g., `onSignUpClick?: () => void`, `onForgotPasswordClick?: () => void`, `onSignIn?: (credential: UserCredential) => void`).
- **Route-private composition roots**: Route-level private components (such as `src/app/(public)/sign-in/_components/sign-in-auth-flow-client.tsx` and `src/app/(public)/register/_components/register-auth-flow-client.tsx`) act as composition roots. They connect Next.js navigation hooks (`router.push(...)`) to the screen's callback props and assemble feature-specific dependencies.
- **Provider and addon injection via `children` slots**: Presentation screens and shared surfaces must not hardcode third-party identity providers (e.g., Google, GitHub, or SAML) or concrete third-party services. Instead, expose extensible `children` slots so that provider buttons (e.g., `<GoogleSignInButton />`) or custom actions can be injected at the composition root, conditioned on environment variables (such as `NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED`).
- **Logic abstraction via custom hooks or service interfaces**: Isolate business logic, validation schemas, and lifecycle effects behind specialized hooks or pure service functions (such as `useUI()`, `useSignInAuthFormSchema()`, `useSignInAuthFormAction()`, and `useOnUserAuthenticated()`). This keeps presentation components focused on rendering state, layout, and event propagation without direct coupling to underlying SDK operations.

## Internationalization

- Write source, comments, and project documentation in English by default,
  following `.agents/rules/language.md#language-policy`. Localized catalogs use their own
  language.
- Follow the implemented cookie-based request resolution. Localized navigation
  helpers alone do not establish locale-prefixed routes. The current architecture
  and maintainer constraint are recorded in
  [Architecture](ARCHITECTURE.md#internationalization); do not infer permission
  for a route or rendering migration from a request to fix an accessibility finding.

- Put user-facing application text in the `next-intl` message catalogs under
  `src/messages/`.
- Do not introduce hardcoded JSX text outside the documented UI primitive
  exceptions. Biome enforces this rule for application code.
- When metadata varies by locale, use the `next-intl` metadata pattern from
  ADR 0004.

## Quality guard

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

## Next.js request data and caching

Use the installed-version guide before copying an example. This application
uses App Router with Cache Components and Partial Prefetching enabled. The [Next.js maintenance rule](.agents/rules/cache.md) separates versioned APIs,
newer documentation, and optional deployment recipes.

### Async request APIs and streaming

- Await `cookies()`, `headers()`, `draftMode()`, and promised route `params` /
  page `searchParams` before reading their values; React `use` is another
  framework-supported option where appropriate. Preserve this repository's
  stricter hook-free route policy. Generated `PageProps`, `LayoutProps`, and
  `RouteContext` are available after `next typegen`, `next dev`, or `next build`.
- Put request-time or uncached asynchronous reads beneath a useful `Suspense`
  boundary. Move the read into a child if the parent would await it before
  returning that boundary. Do not assume `loading.tsx` covers its own layout's
  earlier work. Keep fallbacks accessible and consistent with the design system.
- Read request cookies and headers outside a shared `"use cache"` scope. Pass
  only resolved, minimal values needed by a cached function, after authorization.
  Request-dependent promises captured through props or closures do not become
  safe cache inputs. Request identity and sensitive data need a deliberate
  isolation policy; adding a user ID to a key is not authorization.
- Server Components and cached functions must stay free of render-time writes.
  Do not use `"use server"` to label a Server Component. It marks Server Functions.
  Client Components may also render initial HTML on the server, so browser APIs
  must run at an appropriate client lifecycle point.

### Cache ownership and mutation consistency

For new shared cached work, prefer `"use cache"` with an explicit `cacheLife`
and, when invalidation is needed, `cacheTag`. Choose a lifetime from freshness
requirements; never increase it only to silence a prerender diagnostic.
React `cache()` deduplicates work within a request; it is not a persistent cache.
For local presentation caches, identify the complete input and every relevant
option. Length plus a text prefix/suffix is not a safe content identity. Use
the same complete identity for cached values and asynchronous subscribers.
Plain `fetch` results are not persistently cached by default.

With `cacheComponents` enabled, do not introduce old `dynamic`, `dynamicParams`,
`fetchCache`, `revalidate`, or `runtime` segment exports from previous-model
recipes. Consult the migration guide and installed compiler diagnostics;
`cacheLife` and cache scopes express caching. Existing `fetch` cache options and
`unstable_cache` have migration guidance; this does not require a speculative
rewrite of code that is not present.

| API | Intended use |
| --- | --- |
| `cacheLife`, `cacheTag` | Define lifetime and tags inside a cache scope |
| `revalidateTag(tag, "max")` | Mark tagged server data stale with stale-while-revalidate behavior; Server Functions or Route Handlers |
| `updateTag(tag)` | Immediately expire tagged data for read-your-own-writes; Server Actions only |
| `revalidatePath(path)` | Invalidate the selected page/layout path; does not replace tags shared by other paths |
| `refresh()` from `next/cache` | Refresh the client router from a Server Action; does not invalidate tagged server data |
| `router.refresh()` from `next/navigation` | Request and merge fresh RSC output for the current route while preserving unaffected client state; does not invalidate the server cache |

The single-argument `revalidateTag(tag)` form is deprecated. For immediate
invalidation from a Route Handler, use the documented `{ expire: 0 }` profile
instead of calling the Server-Action-only `updateTag`.

Current Firebase writes remain browser SDK operations with explicit form reset,
feedback, and Security Rules. The cache APIs above are guidance for future
server-owned data, not a migration of the profile submit workflow.

### Routing, metadata, and errors

Use `next/navigation` for App Router navigation hooks, `next/link` for navigation
links, and the Metadata API for route metadata. The native Biome
`noRestrictedImports` rule rejects `next/router`, `next/head`, `next/document`,
and `next/app` in owned app, component, and hook modules. It also checks UI
extensions, while untouched registry components keep their exclusions. Static
imports and re-exports are checked; this is not a complete transitive graph
analysis. Keep the current unprefixed locale URLs and use the existing safe
return-URL validator for user-controlled redirect destinations.

Import `Link` from `next/link` and router hooks from `next/navigation`
directly. Do not add a re-export shim such as `@/i18n/navigation`: the locale
lives in a cookie, not in the path, so a wrapper changes nothing and splits the
import path. Biome `noRestrictedImports` rejects `@/i18n/navigation`.

Centralize application route paths and sign-in redirects in
`src/lib/navigation.ts`. Owned modules reference `routes` (`home`, `signIn`,
`register`, `forgotPassword`, `profile`) instead of string literals such as
`"/sign-in"`, build `?next=` URLs with `getSignInUrl(destination)`, and call
`redirectToSignIn(destination)` (defaults to the profile route) for server-side
sign-in redirects. `authRoutes` also drives the auth-route exclusion in
`src/lib/return-url.ts`, so a new auth route is added in one place. The
presentation-screen rule below still applies: screens receive callbacks and do
not import `routes`; route-private composition roots and hooks do.

With installed Next.js 16.4.3, use the error boundary's `retry()` for an action
that promises to retry a failed read. `reset()` only clears and rerenders the
boundary state; it is not equivalent to refetching.

Use `error.tsx` / `global-error.tsx` according to their Client Component contracts;
a global error boundary replaces the root layout and needs its own document
markup. Error boundaries do not catch every event-handler or async callback
failure. Return expected action errors as explicit state; keep unexpected
failures for the framework boundary. `redirect()` and `notFound()` throw
framework control-flow signals, so do not swallow them in generic catches.

Keep `metadata` / `generateMetadata` and `viewport` / `generateViewport` on the
server and use their respective APIs. Metadata can stream under supported
conditions; inspect crawler behavior and the installed version's diagnostics
before adding request-dependent metadata. The existing static viewport and
localized metadata are not automatically changed by a documentation refresh.

### Route Handlers and Server Functions

Server Components should call their data layer directly instead of fetching
the application's own Route Handler through HTTP. A Route Handler is a public
HTTP boundary: validate inputs, authorize each operation, and return only the
intended response data. A Server Function is also directly callable over the
network; verify identity and resource authorization inside each operation.
See [Security](SECURITY.md#nextjs-server-and-environment-boundaries).

Use Server Actions for mutations, not as a parallel data-fetching API. Write
response cookies only in a Server Function or Route Handler before streaming
starts. This application does not currently implement these server mutation
surfaces; adding one requires its own behavior and authorization tests.

### Navigation state and optional features

With Cache Components, Next.js may preserve inactive UI using React Activity.
Do not assume navigation always unmounts a component, clears a form, or disposes
an external resource. Follow the preserving-state guide for intentional resets,
and test navigation, back/forward, focus, and effect cleanup.

Use `next/image`, `next/font`, `next/script`, and Metadata APIs according to the
installed reference. Image allowlists, script strategy, CSP, telemetry,
instrumentation, remote cache handlers, and hosting adapters are separate
configuration decisions. Do not enable experimental flags, run codemods, or
install upstream agent skills simply because a guide mentions them.

### Security headers, CSP, and request nonce ownership

- Isolate HTTP header management from Content Security Policy logic:
  - `src/lib/headers.ts` is the single source of truth for HTTP header names
    (`nonceHeader`, `cspHeader`), the baseline `securityHeaders` array for
    `next.config.ts`, and the async `getNonce()` helper.
  - `src/lib/csp.ts` contains pure CSP policy generation functions
    (`buildContentSecurityPolicy`, `createNonce`) and does not import `next/headers`.
  - `src/proxy.ts` imports header constants from `@/lib/headers` and policy
    builders from `@/lib/csp`, injecting `x-nonce` and `Content-Security-Policy`
    into the request and response.
  - Server Components that need the per-request nonce (such as
    `CspProviderServer` or `ThemeProviderServer`) import `getNonce` from
    `@/lib/headers`.

### Owned function complexity and hook responsibility trees

Main component hooks coordinate focused sub-hooks and expose rendering-ready
state/callbacks. A sub-hook owns one cohesive lifecycle or workflow, not one line
of code. For example, `useAuthProviderClient` composes `useAuthUiStore`,
`useFirebaseUiReturnNavigation` and `useAuthUiLocale`; it does not initialize Firebase,
subscribe to authentication and synchronize locale inside one monolithic Effect.
`useProfileSession` delegates preference loading to `useProfilePreferences`, and
`useProfileSubmit` delegates successful UI feedback to `useProfileSaveFeedback`.
Pure transformations, constants and subscription support functions remain in the
route's `_lib`, following the hook support placement contract.

The native Biome budget for owned runtime source is cognitive complexity **8**,
function body size **40 lines excluding blanks**, and callback nesting **2**. Values at
the limit are allowed; the next value is an error. These checks include focused
sub-hooks and `_lib`/shared functions, so moving a large body to a helper does not
remove its budget. The existing copied registry and test/spec/story exclusions
remain; non-source scripts keep the existing cognitive limit of 15.

Decompose along responsibilities, preserve cancellation and authorization checks,
and test public behavior after extraction. Do not suppress diagnostics, raise a
threshold for a single offending function, compress code onto fewer lines or
create trivial hook wrappers to disguise a monolith. The budgets detect size and
control-flow growth; they do not prove semantic cohesion or replace architectural
review. Fallow's cyclomatic/coverage metrics remain a separate health check.

## React rendering, hooks, and identity

The project pins React and React DOM 19.3.1 and uses React Compiler 1.0.0 in
Next.js. The [React rules](.agents/rules/react.md) cover React,
React DOM, Compiler, lint references, warnings, and release material. Match new
APIs to installed exports; the live docs are updated within a major version
and also contain experimental sections.

### Pure render and immutable inputs

Treat props, state, context, and hook arguments/results as snapshots. Derive
rendered values from current inputs; update state through setters or reducers
and make copies before changing shared arrays or objects. Updater functions
and reducers must be pure. Local mutation of a newly created value is different
from mutating a value received from another render or caller.

Do not start network writes, subscriptions, timers, DOM changes, or object-URL
allocation during render. React may restart or abandon render work. A ref does
not make a render-time side effect safe. Refs hold values that do not drive
rendering; avoid arbitrary ref reads/writes during render, preserving only
React's documented predictable initialization patterns.

Declare component types at module scope. Defining a component inside a render
creates a new identity and can reset child state on every parent update.
Native Biome `noNestedComponentDefinitions` and `noReactPropAssignments` are
explicit errors in owned app/component/hook code, including UI extensions.
The props rule checks direct assignments; it is not a proof of deep
immutability or all state/context mutations. Keep list keys stable and based
on data identity. `useId` is for accessibility associations, not list keys.
Use a deliberate `key` change only when resetting a subtree is intended.

### Hook dependencies and external synchronization

Call state/effect and ordinary custom hooks unconditionally at the top level
of a component or hook. Do not call them from handlers, loops, nested callbacks,
or after an early return. React's `use` API has a documented exception for
conditions and loops, but still belongs inside a component or hook and cannot
be wrapped in a local `try/catch`. Preserve the stricter route-entrypoint and
component orchestration policies where they apply.

Calculate derived state during render when possible. Put work caused by a user
action in that action's handler. Use an Effect to synchronize with an external
system: Firebase subscriptions, browser listeners, and the current avatar
preview lifecycle are legitimate examples. A custom hook encapsulates this
synchronization; it does not make impure render code or redundant state valid.

Declare reactive Effect dependencies accurately. Move object/function creation
inside the Effect or restructure ownership when that removes a dependency;
do not suppress dependency checks merely to force a once-only run. Pair each
subscription, observer, timer, or resource with cleanup, and prevent obsolete
async results from changing the current subject's state. Test setup/cleanup
symmetry under Strict Mode and replacement, rather than asserting an Effect
runs exactly once.

`useEffectEvent` separates non-reactive reads from an Effect while seeing current
props/state. Call the returned Effect Event only from the allowed local Effect
logic; do not use it as a dependency-avoidance shortcut, ordinary click handler,
or callback passed to a child. Its lifecycle rules need review: this project's
Biome coverage is not claimed to implement every upstream ESLint/Compiler rule.

For external stores, `useSyncExternalStore` needs a stable subscription contract,
immutable/reused snapshots while unchanged, and matching initial server and
hydration snapshots. `useIsMobile` currently uses a `false` server snapshot;
keep viewport behavior tested in a real browser. Do not invent an ad hoc
render-time store or force every SDK subscription into a new abstraction.

### React 19 refs, context, and controlled inputs

Function components can receive `ref` as a prop in React 19. Preserve a wrapped
primitive's ref/props contract; the existing native `noReactForwardRef` policy
prefers this API for owned code. `forwardRef` remains available upstream and
is unnecessary for these new wrappers; it is not a removed React API.
Callback refs can return cleanup functions. Avoid accidental return values
from assignment expressions, and clean up callback-owned registrations when
React detaches them.

Context provides a value to consumers; it is not a security boundary or a
replacement for explicit ownership. A React 19 context can be rendered as a
provider directly, while `.Provider` remains valid. Preserve current providers
unless changing them has a concrete purpose. Server Components cannot consume
client context. Pass server-rendered nodes through slots instead of importing
server implementations into the client graph.

Keep controlled inputs controlled for their entire lifetime and update their
value from the relevant input event. Use the appropriate `value`/`checked` and
`defaultValue`/`defaultChecked` contracts; an initial undefined value followed
by a controlled value is a different contract. Existing React Hook Form
controllers own profile field state. Do not add another mirror state, nest
forms, or replace that integration solely because an upstream form Action
example exists.

### Suspense, Actions, and preserved state

Suspense responds to supported render-time suspension, such as `lazy` or
reading a stable Promise with `use`; fetching inside an Effect or handler does
not automatically activate it. Use the framework's supported data mechanisms,
not a fresh Promise created on each client render. Rejected resources need an
error boundary; async callbacks and event-handler failures need their own
appropriate error handling.

A React Action is transition-coordinated work and may run on the client.
A Server Function is a separate network-callable server surface. `useTransition`
marks non-urgent updates and provides pending feedback; it does not authorize
a mutation, cancel obsolete requests, or guarantee custom request ordering.
The current API requires another `startTransition` for state updates after an
`await` when those updates should remain transitions. Keep text-input updates
urgent. `useActionState` queues its actions; `useOptimistic` describes temporary
UI over a confirmed base value and needs an Action plus a pure reducer/updater.
These APIs do not replace the existing Firebase/RHF submit workflow by default.

Strict Mode's extra development renders, Effect cycles, and ref callbacks are
diagnostics, not duplicate production transactions. Activity can retain hidden
state and DOM while tearing down Effects, then restore them on reveal.
Suspense can also clean up and rerun layout Effects when content hides/reappears.
Cleanup is therefore not synonymous with permanent unmount. Preserve and test
intentional form, dialog, media, and subscription behavior across navigation.

### Compiler and performance boundaries

React Compiler optimizes eligible components/hooks, not every function or every
build pipeline. Keep correctness independent of memoization. Retain intentional
`useMemo`, `useCallback`, or `memo` when an integration needs a measured/stated
identity contract; do not add them routinely or mechanically delete them all.
They are not resource-lifetime or persistence guarantees.

Do not add `"use memo"` everywhere or silently set `"use no memo"` to hide a
problem. Compiler directives and options need a specific reason and validation.
Check third-party mutable APIs and the installed compiler's diagnostics; the
presence of React Hook Form does not establish that every API it exports is
compatible with automatic memoization. Preserve the current integration and
verify actual behavior before changing it.

New APIs described in current docs require installed runtime/type/framework
support. In this review, `Activity`, `ViewTransition`, `addTransitionType`, `use`,
and `useEffectEvent` exist in React 19.3.1. `browser` is exported by the installed
React DOM 19.3.1 package and declared in its types; import it from `react-dom`.
Availability alone is not a request to adopt an animation, browser-only-rendering,
optimistic-state, or experimental Suspense feature.

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

Placement does not classify runtime. `IntlProvider` in `intl-provider-server.tsx` is an async Server
Component using server-only translation APIs; `ThemeProvider` in `theme-provider-client.tsx` declares
`"use client"`; `LoadingState` has no directive and can be used in either
rendering graph. Keep those boundaries even when the files share a directory.
The existing direct server-import guard complements placement checks; Next.js
validates the complete module graph.

## Integration filename convention

| Responsibility | Owned component filename | Actual runtime boundary | Examples |
| --- | --- | --- | --- |
| Browser integration | `name-client.tsx` | `"use client"` | Firebase Auth, browser storage, navigation, theme persistence, browser requests |
| Server integration | `name-server.tsx` | `import "server-only"` | Server requests, database access, secrets, Firebase Admin |
| Presentation | `name.tsx` | `"use client"` when interactive; otherwise follows its dependencies | Fields, cards, loading UI, stateful controls and form context adapters |

These are integration-versus-presentation responsibilities, not three exclusive
React runtimes. Presentation components can be Client Components without a
`-client` suffix. State, events, Effects, React Hook Form and custom hooks alone
do not establish an integration. A filename without a suffix does not guarantee that a component
can run on the server. Shared presentation is the subset compatible with both.

Integrations may delegate their environment access to focused hooks/helpers;
review those implementations. `ProfileFormClient` persists through `useProfileSubmit`,
so it remains in `profile-form-client.tsx`. `ProfileEmailField` uses only form
context and translations, so it lives in `profile-email-field.tsx` while keeping
`"use client"`. `ProfileAvatarFieldClient` accesses browser object URLs through its
hook and keeps `profile-avatar-field-client.tsx`. `LoadingState` remains
without a suffix and compatible with either graph.

Owned component exports, props types, and component-named orchestration hooks
use the complete filename stem, including `Client` or `Server` where present.
For example, `home-client.tsx` exports `HomeClient` and uses
`useHomeClient`. Colocated tests and stories follow the component stem. A fetch alone does not determine
runtime: the component boundary determines where that request executes.
Composing an integration component does not make presentation an integration.
Mandatory Next.js filenames, registry output, hooks and non-component modules
retain their existing contracts. Integrations stay in their current route or
shared extension placement; no new container directory is required.

See [the naming rule](.agents/rules/components.md#ci-enforcement) for
executable coverage and limits, and [ADR 0005](docs/adr/0005-document-project-standards.md)
for the integration naming and exact export-stem parity decision.

## Source naming and export style

Owned source (`src/`, `scripts/`, `functions/`, `tests/`) follows one style:

- Files and folders use lowercase `kebab-case`. Tests use `.test.ts(x)` or
  `.spec.ts`; browser tests add `.browser.test.tsx`.
- Components declare a local `function` and export it with a trailing
  `export { ... }`. Hooks live in `use-<stem>.ts` and export `use<Stem>` inline
  with `export function`.
- Use `type` aliases, not `interface`. Props are named `<ComponentName>Props`.
- Only module-level constants use `SCREAMING_CASE`.
- Message files (`en`, `es`, `pt-BR`) keep an identical key set.
- Keep short, straightforward calls on one line. Use an expanded trailing-object
  call when any of these conditions applies:

  - The final object is invocation policy or options, distinct from the operation's
    domain input, even when it currently has one property (for example, Firestore's
    `merge` option).
  - The object has multiple properties, contains a nested value, callback, or
    collection, or will be read or modified as a distinct configuration block.
  - The complete call exceeds Biome's configured line width; accept its automatic
    wrapping rather than selecting line breaks by hand.

  Keep compact scalar or domain-input arguments on the opening line, and begin the
  first property of the final object on the next line to express intentional
  expansion. With the default `expand: "auto"`, Biome preserves that object layout.
  SDK/provider mutations commonly use this form:

  ```ts
  await setDoc(doc(getFirebaseFirestore(), "users", uid), preferences, {
    merge: true,
  });
  ```

  Do not expand a simple data object solely for visual symmetry. Biome is the
  mechanical safeguard for the resulting wrapping, two-space indentation, and
  trailing commas; selecting a semantically distinct configuration block remains a
  review-time judgement.

Documented exceptions, not to be renamed:

- Next.js route groups and private folders (`(public)`, `_components`), dotfiles
  and root documents in uppercase (`AGENTS.md`).
- Vendored Firebase skill references in `snake_case` under
  `.agents/skills/firebase-basics/` and `.agents/skills/firebase-auth-basics/`
  (mirrored in `.gemini/` and pinned by `skills-lock.json`), and
  `.agents/skills/ask-matt/PHASE-BOUNDARIES.md`.
- `src/hooks/use-mobile.ts` exports `useIsMobile` (shadcn registry output).
- Top-level message namespaces in PascalCase (`App`, `Auth`, `Home`), the
  `next-intl` convention.

## SDK and provider adapter contracts

Request-owned locale and messages stay owned by the server translation provider:
omit them from caller props and assign resolved values after caller spreads.
Never replace `console.error` globally to hide a dependency warning; preserve
unrelated diagnostics and address the warning at its source.

AI SDK tool input schemas may be lazy or asynchronously converted. Resolve them
through installed `asSchema(...).jsonSchema`, keep loading/failure presentation
as valid strings, and prevent obsolete conversions from replacing current data.
`JSON.stringify` of a schema factory is not JSON Schema conversion.

AI SDK input totals include cached input. Adapt uncached input, cache reads and
cache writes to the installed pricing helper once, then derive totals and rows
from the same result. Output totals already include reasoning tokens; do not
charge reasoning a second time. Treat catalog estimates as estimates, not proof
of provider billing. Verified regression examples live in `context.test.tsx`.

## Legacy React API guidance

| Available legacy API | Direction for new code |
| --- | --- |
| `Children` | Prefer explicit composition over unnecessary child inspection. |
| `cloneElement` | Prefer composition and explicit props. |
| `Component` | Usually prefer function components; retain classes where needed for Error Boundaries. |
| `PureComponent` | Prefer function components and justified optimization. |
| `createElement` | Prefer JSX. |
| `createRef` | Use `useRef` in function components. |
| `forwardRef` | Prefer React 19 ref props. |
| `isValidElement` | Inspect an element only for a concrete integration need. |

For removed APIs, use `createRoot` instead of `ReactDOM.render`, `hydrateRoot`
instead of `ReactDOM.hydrate`, explicit refs instead of `findDOMNode`,
`root.unmount()` instead of `unmountComponentAtNode`, and JSX instead of
`createFactory`. Do not describe a still-available legacy API as removed or
mechanically rewrite valid boundaries.

## Development tooling and secret isolation

- **VS Code launch configurations (`.vscode/launch.json`)**:
  - Never commit credentials, private tokens, or API keys directly inside `"env"` blocks.
  - Configurations must load environment variables through `"envFile": "${workspaceFolder}/.env.*"` targeting Git-ignored environment files.
  - This rule is enforced mechanically by `pnpm check:secret-guard` and the `.husky/pre-commit` hook.
  - Emulator launch configurations should automate starting background emulator dependencies using `"preLaunchTask"` paired with background problem matchers in `.vscode/tasks.json`.
