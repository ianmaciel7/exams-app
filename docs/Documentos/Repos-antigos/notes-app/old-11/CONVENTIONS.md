# Coding Conventions & Standards

This file owns **how code is written**. Test strategy belongs to `TESTING.md`,
quality thresholds to `CONSTRAINTS.md`, visual semantics to `DESIGN.md`, and
contributor workflow to `CONTRIBUTING.md`.

## 1. Tool-Owned Conventions

- **Biome** (`biome.json`) is the formatter and linter for project-owned code.
  `src/components/ui/` is excluded from the project-wide gate because it is
  registry-managed. Do not introduce ESLint/Prettier as parallel sources of truth.
- **TypeScript** remains strict. Do not use `any`, `@ts-ignore`, or unsafe casts
  as shortcuts around type design.
- **Biome organizeImports** owns import ordering; do not maintain a competing manual
  import-order convention.
- **dependency-cruiser** owns executable dependency rules; architectural intent lives
  in `ARCHITECTURE.md`.
- Fix findings at the source. Suppression and non-regression policy is owned by
  `CONSTRAINTS.md`.
- **Documentation synchronization** (`doc-sync`): Code and configuration modifications must be accompanied by documentation updates in the same change (enforced by `check:doc-sync`). Pure refactors or internal changes that genuinely require no documentation updates may be bypassed explicitly with `--allow-no-doc` or commit flag `[skip-doc-sync]`.

## 2. Naming & File Shape

- Files and folders use `kebab-case`. File names (excluding file extension) must not exceed 45 characters to preserve readability, avoid redundant prefixes, and keep import specifiers concise (enforced by `max-filename-length`).
- React components and types use `PascalCase`.
- Functions and variables use `camelCase`; hooks start with `use`.
- Shared UI files use named exports. Next.js route/layout entrypoints may use the
  framework-required default exports, but the underlying component declaration must be a named function.
- Derive props from the underlying primitive or native element where practical
  instead of duplicating them manually (enforced by `check:props`).
- **Component and Subcomponent Role Suffixes (`src/components/`, outside `ui/` and `firebase/`)**: "Application components" means every `*.tsx` file inside any `src/components/<folder>/`, including nested subfolders such as `notes-app/question/`, except `ui/` (shadcn/Base UI registry primitives) and `firebase/` (unmodified Firebase UI registry components); a new folder is covered automatically, and every rule below that says "application component" uses this definition. Application UI component files must carry an explicit archetype suffix in the filename (`kebab-case`), the canonical exported component must match the file name in `PascalCase`, and every named visual subcomponent must also end in a recognized UI role suffix. Compound parts use roles such as `Content`, `Header`, `Footer`, `Form`, `Group`, `FieldSet`, `Title`, `Description`, `Figure`, `Overlay`, `Row`, `Cell`, `Action`, `Icon`, `Avatar`, or `Link`; do not use generic names such as `Part`, `Section`, or plural container nouns such as `Fields`. This preserves the same role-oriented anatomy used by `src/components/ui/`:
  - `-card` / `*Card` for screen or container cards (e.g. `login-card.tsx` -> `LoginCard`)
  - `-form` / `*Form` for a cohesive form/settings responsibility (e.g. `login-form.tsx` -> `LoginForm`, `settings-form.tsx` -> `SettingsForm`). The implementation may use `FieldGroup` without requiring a filename rename; use a native `<form>` only when the component owns submission semantics.
  - `-field` / `*Field` for dedicated input/receptive field surfaces (e.g. `question-drop-field.tsx` -> `QuestionDropField`, `question-matching-field.tsx` -> `QuestionMatchingField`)
  - `-field-group` / `*FieldGroup` for reusable groups of fields sharing a group label (e.g. `question-dropdown-field-group.tsx` -> `QuestionDropdownFieldGroup`)
  - `-field-set` / `*FieldSet` for cohesive grouped inputs that map to a `<fieldset>` / `FieldSet` primitive (e.g. `question-draggable-field-set.tsx` -> `QuestionDraggableFieldSet`, `question-case-study-field-set.tsx` -> `QuestionCaseStudyFieldSet`)
  - `-field-content` / `*FieldContent` for content containers wrapping field children/explanations composed with `FieldContent` (e.g. `question-explanation-field-content.tsx` -> `QuestionExplanationFieldContent`), avoiding invalid block nesting in `<p>`
  - `-toggle` / `*Toggle` for stateful pressed/unpressed toggles composed over `Toggle` (e.g. `question-hotspot-toggle.tsx` -> `QuestionHotspotToggle`)
  - `-header` / `*Header` for heading and greeting presentation blocks (e.g. `auth-greeting-header.tsx` -> `AuthGreetingHeader`)
  - `-alert` / `*Alert` for notification and error banners (e.g. `redirect-error-alert.tsx` -> `RedirectErrorAlert`)
  - `-button` / `*Button`, `-select` / `*Select`, `-menu` / `*Menu`, `-switcher` / `*Switcher` for interactive UI controls
  - `-description` / `*Description` for descriptive field or policy text surfaces
  - `-sidebar` / `*Sidebar` for navigation primitives and parts; domain orchestration belongs in a `-shell` component (e.g. `space-shell.tsx` -> `SpaceShell`)
  - `-provider` / `*Provider` for React context providers
  - `-dialog` / `*Dialog`, `-status` / `*Status`, `-empty` / `*Empty` for standalone overlays and state surfaces split out of a larger component (e.g. `settings-dialog.tsx` -> `SettingsDialog`, `spaces-not-found-status.tsx` -> `SpacesNotFoundStatus`)
- **Visual component slots**: Every visual component and named visual subcomponent in an application component folder exposes a `data-slot`. A visual component extracted into its own file uses a family-prefixed slot that matches the file name (`settings-dialog-header`). Pure providers and conditional orchestration components that do not own a DOM/UI surface remain exempt; never add wrapper markup only to manufacture a slot.
- **Canonical Props Naming (`${ComponentName}Props`)**: Component prop types must be declared canonically using the component's canonical PascalCase name (e.g. `login-card.tsx` declares and uses `type LoginCardProps = ...`, never `SignInAuthScreenProps` as the primary type). Declare them with `type`, never `interface`, exactly as `src/components/ui/` does. Legacy or library names may only be re-exported as backwards-compatible aliases inside the file's trailing export block (e.g. `type LoginCardProps as SignInAuthScreenProps`). Enforced by `check:props` and `component-no-interface`.
- **Export shape (application components)**: Application components follow the same file anatomy as `src/components/ui/`. Declare components and hooks as plain `function` declarations without `export`, and publish every value and type through one trailing `export { ... }` block (types with an inline `type` modifier, aliases as `X as Alias`). Do not write `export function`, `export const`, or `export interface`. Enforced by `component-trailing-export-block`.
- **Name by what it renders, never by where the code came from.** When a component is extracted or moved, re-derive its name from what it renders and where it is rendered instead of keeping the old name or prefixing it with the name of the file it came from (`SpaceSidebarEmpty`, rendered in the main area and not in the sidebar, became `SpacesEmpty`). A surface word before the final role suffix (`sidebar`, `dialog`, `sheet`, `drawer`, `popover`) must be backed by that surface's primitive in the file; otherwise the name is wrong (`name-matches-surface`). Use the domain terms in `CONTEXT.md`: `Space` is one user-owned context, so a component about the collection or its absence is `Spaces*`, never `Space*`, which would read as an empty Space.
- **Test ids follow the file name.** Every `data-testid` in `src/components/<folder>/<name>.tsx` (application components) is `<name>` or starts with `<name>-` (`spaces-empty.tsx` -> `spaces-empty`, `spaces-empty-create-btn`). Renaming or extracting a component renames its test ids in the same change, so a stale id can never survive (`testid-starts-with-component`). After any rename, search the old name across components, test ids, tests, `e2e/`, and docs, and leave zero matches.
  - **Standalone overlays**: A dialog, sheet, or drawer owns its own open state and concern, so it lives in its own file named after it (e.g. `CreateSpaceDialog` in `create-space-dialog.tsx`), never inside the navigation primitive. Cards and forms are exempt because multi-step flows keep their step forms next to the flow. Enforced by `check:props` (`checkStandaloneSurfaceComponents`) for named `*Dialog`/`*Sheet`/`*Drawer` components.

## 3. Component Composition

This section implements [ADR 0016](./docs/adr/0016-prefer-simple-domain-components-and-dedicated-hooks.md).

- Reuse the nearest existing primitive and variant before creating a wrapper or new
  primitive.
- Prefer simple application components that compose existing shadcn/Base UI parts.
  Use `children` for variable content, explicit variants for real visual axes, and
  Base UI's native `render` prop for behavioral element composition. Do not invent
  parallel compound APIs or custom `renderX` props when the shared primitive already
  provides the necessary structure.
- Keep generic primitives free of product/domain behavior.
- **One component per file; no compound components.** Every application component file declares exactly one React component and exports exactly that component (plus its props type). Do not declare sibling parts such as `ConnectionAlertTitle` or `ConnectionAlertAction` next to a root, do not share a `createContext` between parts, and do not attach parts with `Object.assign(Component, { Part })`. Render the content inside the owning component, or extract each part to its own appropriately named file with the same single-component shape. Hooks (`useX`) and non-component helpers do not count. Enforced by `check:props` (`single-component-per-file`).
- **Keep application components focused.** Keep each application component file focused on one concern; the hard limit is four hundred lines (`max-component-lines`). When a file accumulates a second concern (its own state, translations, or hooks that the rest of the file does not use), move that concern to its own `<name>-<role>.tsx` instead of growing the file. Fix visual tweaks by composing primitives, not by adding wrapper markup and class overrides.
- Keep public APIs focused; avoid rename-only wrappers and unnecessary DOM nodes.
- Preserve consumer props, events, refs, native behavior, controlled/uncontrolled
  behavior, ARIA, and primitive state attributes.
- Use CVA only for meaningful variant axes with typed `VariantProps` and sensible
  defaults.
- **Keep application APIs smaller than primitive APIs.** A domain component may
  compose a shadcn compound primitive internally without re-exporting every primitive
  part. Prefer one cohesive component when consumers do not need to rearrange its
  internals. Do not expose application-level compound parts; one component per file
  (see **One component per file**). `SpaceShell` keeps the native
  Sidebar tree visible because that layout is itself a composition boundary; dialogs
  such as `SettingsDialog` remain simple domain components.

## 4. shadcn / Base UI

- Use the installed Base UI APIs rather than Radix-specific examples.
- Use Base UI's `render` pattern for polymorphic composition. Use
  `nativeButton={false}`, `useRender`, or `mergeProps` only when the installed
  primitive requires them.
- Preserve required grouping and anatomy: grouped Select/menu/Command items, overlay
  trigger/content structure, portals, backdrop/close behavior, titles/descriptions,
  focus management, and keyboard behavior.
- Forms should compose the existing Field/InputGroup primitives rather than bypassing
  their anatomy.
- **Read the primitive before styling it.** Open `src/components/ui/<primitive>.tsx` and use its `variant`/`size` axes (e.g. `Button` `icon-xs`, `icon-sm`, `sm`) before reaching for `className`. Overriding a size with `size-*`/`h-*` on `Button` is a violation (`button-size-variant`); add or reuse a variant instead.
- **`Select` vs. `NativeSelect` rule:**
  - **Use `Select` (`src/components/ui/select.tsx`):** For all visible, primary UI selection controls across the app (forms, question fields, filter bars, locale/theme pickers). It provides consistent design token styling, popovers, grouped items, rich contents, and full dark/light theme alignment.
  - **Use `NativeSelect` (`src/components/ui/native-select.tsx`):** Reserved for screen-reader fallbacks and keyboard-accessible alternatives (e.g. `sr-only focus:not-sr-only` pairs in drag-and-drop slots such as `QuestionSlotField`), or lightweight mobile-optimized utility pickers where native browser/OS wheels are explicitly preferred. Do not use `NativeSelect` as a visible primary control in place of `Select`.
- Use semantic HTML and accessible names. Loading, selected, disabled, and error
  states must not rely on color alone.
- Application wrappers around shared shadcn primitives follow the primitive
  forwarding pattern: declare a canonical `${ComponentName}Props` type,
  destructure `className` and the remaining props, merge wrapper layout with
  `cn()`, spread the remaining props onto the root primitive, and apply the
  wrapper's required semantic attributes after the spread. Alert wrappers in
  `src/components/<folder>/*-alert.tsx` (application components) must use this pattern and keep their
  named component/type exports in the trailing export block. An alert
  wrapper declares one component that renders its own content.
  `guard-component-props.mjs` enforces the canonical alert props type.

### Primitive Anatomy (`src/components/ui/`)

Registry-installed shadcn primitives share one anatomy. New or edited primitives
must match it. Compare against upstream with `shadcn add <name> --diff` before
changing an installed primitive.

- **File shape:** optional `"use client"`, imports, constants and `cva`
  definitions, one plain `function` per part, then one trailing
  `export { ... }` block. Named exports only, no `export default`. The `cva`
  (`buttonVariants`) and any co-located hook (`useSidebar`) go in the same block.
- **Part shape:** `function Part({ className, ...props }: Primitive.Props)`
  renders the primitive with `data-slot="family-part"` (kebab-case, family
  prefix), `className={cn("base", className)}`, and `{...props}` last. Parts that
  only forward props omit `className`. Props the part fixes (`role`, `render`,
  `variant`) go before the spread.
- **Prop types:** derive from the primitive (`DialogPrimitive.Popup.Props`),
  `React.ComponentProps<"div">`, or `React.ComponentProps<typeof Other>`. Extra
  props are inline intersections (`& { size?: "sm" | "default" }`). Use a named
  `type` only for context or shared props. Primitives declare no `interface`,
  and application components follow the same
  file shape and the same no-`interface` rule (see section 2).
- **Variants:** `cva` with `variants` and `defaultVariants`; the default is
  repeated in the destructuring (`variant = "default"`); call
  `cva({ variant, size })` inside `cn(..., className)`. Expose the active variant
  as `data-variant` / `data-size` / `data-orientation` / `data-align` so child
  parts can react.
- **Polymorphic parts:** `useRender` with `defaultTagName`,
  `props: mergeProps<"tag">({ className: cn(...) }, props)`, `render`, and
  `state: { slot: "family-part", variant }`. The slot comes from `state.slot`,
  not a hand-written `data-slot`.
- **Overlay content:** `Portal` > `Positioner` > `Popup`, typed with
  `Pick<Primitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">`
  and explicit defaults. Dialog, Sheet, and AlertDialog use `Portal` + `Overlay` +
  `Popup`. Close buttons are `render={<Button ... />}` plus an `sr-only` label.
  Stacking lives inside the primitive, never at the call site: the `Positioner`
  carries `className="isolate z-50"`.
- **Cross-part styling:** the root declares `group/<family>` (or `peer/<family>`)
  and children use `group-data-[...]/<family>`, `has-data-[slot=...]`,
  `*:data-[slot=...]`, or `in-data-[slot=...]`. Do not style children through
  extra props.
- **Icons:** the root sizes child icons with
  `[&_svg:not([class*='size-'])]:size-4`, so icons inside a primitive carry no
  `size-*`. Button icons use `data-icon="inline-start|inline-end"`. Icon-only
  controls include a `<span className="sr-only">` label.
- **State classes:** focus
  `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`,
  invalid `aria-invalid:border-destructive aria-invalid:ring-3
  aria-invalid:ring-destructive/20`, disabled
  `disabled:pointer-events-none disabled:opacity-50` (`data-disabled:` on Base UI
  parts). Popup surface is `bg-popover text-popover-foreground ring-1
  ring-foreground/10`; open/close motion is
  `data-open:animate-in ... data-closed:animate-out ...`.
- **Context:** `createContext<T | null>(null)` plus an exported `useX()` that
  throws `"useX must be used within a <X />"`.
- **CSS variables:** pass through `style` with an `as React.CSSProperties` cast.

### Forms: `Field` vs `Form`

- **Use `Field` + `FieldGroup` for new forms in this repository.** The installed
  Base UI/shadcn setup exposes `Field`, `FieldLabel`, `FieldDescription`,
  `FieldError`, and related primitives. Use them for field layout, accessible
  labels, descriptions, validation state, and consistent spacing. Pair them with
  `useForm`, `Controller`, or `FormProvider` from `react-hook-form` when the form
  needs controlled values or schema validation.
- **Use the classic shadcn `Form` components only for compatibility.** The
  `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`,
  and `FormMessage` API is appropriate when maintaining an existing form that
  already uses that composition or when integrating a dependency/example that
  specifically requires it. Do not introduce it for a new form alongside the
  repository's `Field` API, and do not mix both APIs inside one form.
- **Use native `<form>` with a Server Action for server mutations.** When the
  mutation is implemented as a Next.js Server Action, prefer progressive
  `<Form action={...}>`/native form submission with `useActionState` and
  `useFormStatus`; use `Field` for the visual and validation anatomy. React Hook
  Form is optional in this case and should be added only when client-side field
  orchestration materially improves the experience.
- **Use a plain native `<form>` for simple client submissions.** A form with a
  small number of uncontrolled inputs and one submit handler does not need either
  shadcn's classic `Form` wrapper or React Hook Form.
- **Keep responsibilities separate:** `Field`/`Form*` components provide UI and
  accessibility structure; React Hook Form provides client-side form state; Zod
  or another schema owns validation; Server Actions own server mutations. Do not
  treat a visual form wrapper as a validation or authorization boundary.

## 5. React & Next.js

- Add `"use client"` only at the smallest boundary that requires client behavior (enforced by `check:rsc`).
- In React 19, pass `ref` as a normal prop and prefer `use()` for new context
  access; do not introduce `forwardRef` or `useContext` without a dependency or
  framework reason.
- React Compiler is enabled. Do not add `useMemo`/`useCallback` preemptively;
  optimize from measurement or a demonstrated semantic need.
- Prefer derived values during render over synchronization effects.
- Use functional state updates when the next state depends on previous state.
- Keep effect dependencies primitive and explicit.
- Do not define React components inside other component render functions.
- Keep client props minimal and serializable across server/client boundaries.
- Avoid request waterfalls: start independent work together and use Suspense where
  independent regions can stream.

### Rendering, Async Work & Streaming

- Treat `page.tsx`, `layout.tsx`, and other route files as Server Components by
  default. Add `"use client"` only to the smallest interactive leaf and compose
  server-rendered content through `children` or explicit props.
- Use `loading.tsx` for route-segment loading states and `<Suspense>` for a more
  granular loading boundary inside a page. Keep the shell (navigation, headers,
  and stable layout) outside the boundary so independent content can stream as it
  becomes ready.
- Start independent async work before the first `await` and resolve it together
  with `Promise.all()`. Do not create sequential fetch chains when operations do
  not depend on one another.
- In the installed React version, a promise passed to a Client Component may be read with `use()`;
  the consumer must be inside an intentional `<Suspense>` boundary and the
  promise must be stable for the intended request/render lifetime.
- Prefer server-side data access close to the Server Component that renders it.
  Keep Firebase browser subscriptions in client hooks because this application
  uses Firestore's browser persistence and realtime observers; do not invent a
  server data layer until the architecture adopts one.
- Use `useTransition`/`startTransition` for non-urgent client updates such as
  filtering, navigation-adjacent state, or changing a locale. Use the transition's
  `isPending` state instead of a second manual loading flag for that interaction.
- Use React 19 form actions (`useActionState`, `useFormStatus`, and progressive
  `<Form action={...}>`) for Server Action mutations when a mutation is introduced.
  Add `useOptimistic` only when the optimistic state and rollback behavior are
  explicit and tested.
- Derive values during render. Move interaction-specific work into event handlers;
  use effects only for synchronization with external systems (subscriptions,
  browser APIs, or imperative widgets), with cleanup and primitive dependencies.
- Use `next/dynamic` for heavy, optional, or client-only features that are not
  required for the initial route. Prefer direct imports for normal UI primitives
  so the bundle remains statically analyzable.
- Use `after()` for non-critical post-response work such as analytics, logging, or
  cache warming. It must never be used to hide work required to render the response.
- Add `memo`, `useMemo`, or `useCallback` only after measurement or when a stable
  identity is a demonstrated API requirement; React Compiler is enabled here.

### Fast Refresh Invariants
- **Named Component Exports**: All React component functions must have explicit identifiers (e.g. `function LoginForm() {}` published through the file's trailing `export { LoginForm }`, or `export default function LoginPage() {}` for a Next.js route entrypoint). Anonymous default function expressions (`export default () => ...`) break Fast Refresh boundary detection.
- **Module Isolation**: Isolate non-component constants, pure domain helpers, and data transformers into `src/lib/` and reusable hooks into `src/hooks/`. Exporting mixed non-React constants or mutable singletons alongside components causes Next.js Fast Refresh to fall back to a destructive full page reload.

### Server Actions & Form Mutations
- **`'use server'` Boundary**: All Server Actions must declare `'use server'` at the file or function level.
- **Typed Result Signature**: Server Actions must return a typed `Result<T, E>` pattern (e.g., `{ success: true, data: T } | { success: false, error: string, fields?: Record<string, string> }`) rather than throwing unhandled errors across the RPC boundary.
- **Zod Validation**: Validate all inbound action parameters and form data against strict Zod schemas before executing business logic.
- **React 19 Action Integration**: Bind server actions using `useActionState` and progressive `<Form action={...}>` (or Base UI form primitives) to ensure resilient pending states, optimistic updates, and fallback handling.

### Error Handling & Navigation
- **Error Boundaries**: Next.js App Router `error.tsx` components must always declare `'use client'`.
- **Navigation Primitives**: Trigger standard error UI via framework functions: `notFound()` for 404, `unauthorized()` for 401 unauthenticated requests, and `forbidden()` for 403 authorization failures.
- **No Direct `window.location`**: Direct imperative mutation of `window.location` is forbidden; use Next.js `useRouter()` (`push`, `replace`), `redirect()`, or `<Link>` components to maintain client-side routing state.

### Asynchronous Lifecycle & Background Work
- **`after()` for Post-Response Tasks**: Use Next.js `after()` (or `unstable_after`) to schedule asynchronous work (logging, analytics, cache warming) that should execute after the HTTP response has finished streaming, preventing background tasks from blocking user TTFB.

### App Router Page & Layout Props
- **Next.js `PageProps` Helper**: Use Next.js's globally generated `PageProps<Route>` (generated via `next dev`, `next build`, or `next typegen`) for typing route entrypoint props rather than closed ad-hoc interfaces. Remember that `params` and `searchParams` are asynchronous `Promise` instances since Next.js version 15. In unit tests for route page files, pass `params` and `searchParams` as resolved promises (`Promise.resolve(...)`).

### Hook Placement & Usage
- **Co-located Component Hooks (inside component file):** Keep custom hooks co-located
  within the component file only when they are strictly coupled to that component family's
  context provider (e.g., `useSidebar` in `sidebar.tsx`, `useCarousel` in `carousel.tsx`,
  `useChart` in `chart.tsx`, `useDrawer` in `drawer.tsx`, `useToastManager` in `toast.tsx`)
  or manage private compound state. In the shadcn/ui registry architecture, these belong to
  `registry:ui` single-file primitives exposing an internal `React.createContext`. Declare them
  as top-level exported functions in the trailing export block; never define hooks inside a
  component render body.
- **Dedicated component hook owns behavior:** When an application component already has a
  dedicated hook named for that component (for example `SpaceShell` + `useSpaceShell`,
  `ConnectionAlert` + `useConnectionAlert`), keep component-owned React
  state/effects/refs/transitions, subscriptions, navigation, and behavioral handlers inside
  that hook in `src/hooks/`. The component should consume derived values and semantic
  callbacks and stay focused on rendering (ADR 0016), preserving Fast Refresh boundaries
  and the `single-component-per-file` invariant. Presentation-only hooks such as translations
  may remain in the component.
- **Extract stateful application behavior when it clarifies a real concern:** Do not
  create a dedicated hook merely because a component contains an arbitrary number of
  state/effect calls. Create one when the behavior forms a coherent boundary; once
  that dedicated hook exists, it owns that behavior consistently.
- **Shared Standalone Hooks (`src/hooks/`):** Place hooks in `src/hooks/` when they
  are generic utilities or browser APIs (media queries, listeners, sensors; mapped to
  `registry:hook` and `aliases.hooks` in `components.json`, e.g., `useIsMobile`), domain/data
  hooks (e.g., `useAuth`, `useSpaces`), or require isolated unit testing. Hooks in `src/hooks/`
  must never depend on application routes (`src/app/`).

- **Stateful Component Extraction:** Treat hook extraction as a design/review decision,
  not a numeric quality gate. Extract when it produces a meaningful behavioral
  boundary; keep straightforward local state in the component when that is clearer.

### Internationalization (i18n) & Localized Strings
- **No Hardcoded User-Facing Text**: Hardcoding user-facing strings (such as button labels like "Retry Connection", "Sign in", headings, error messages, or placeholders) directly in JSX or UI components is strictly forbidden.
- **Mandatory i18n Translation Keys**: Always use the internationalization framework (`next-intl`, e.g. `useTranslations`) or Firebase UI translation mechanisms (`getTranslation(ui, ...)`). All user-facing strings must be defined across message catalogs (`src/messages/{locale}.json`).

## 6. Styling

- Merge classes with the project `cn()` convention.
- Use semantic design tokens instead of hardcoded colors or ad hoc dark-theme
  overrides; token semantics are owned by `DESIGN.md`.
- Prefer existing `gap-*`, `size-*`, and truncation utilities over arbitrary
  values when the standard scale fits. Arbitrary px/rem values for text, spacing,
  and sizing (`text-[13px]`, `w-[500px]`) are rejected by `prefer-standard-scale`;
  use the scale (`text-sm`, `size-125`).
- Avoid `!important` and consumer-level overlay stacking overrides.
- Use configured Lucide components explicitly and give icon-only controls accessible
  names.
- Emojis are forbidden in UI components, icon defaults, fallbacks, and domain entities;
  Lucide icons or semantic identifier strings must be used.

## 7. Performance-Sensitive Code

- Prefer route-level `loading.tsx` and targeted `<Suspense>` boundaries over a
  page-wide spinner when content can be rendered independently.
- Eliminate waterfalls with early promise creation, `Promise.all()`, and component
  composition. Do not make a parent await data that only a child needs.
- Prefer direct module imports over broad barrel imports when it materially reduces
  client bundle work.
- Dynamically load heavy client-only features that are not needed initially.
- Avoid shared mutable module state in server code.
- Minimize server-to-client serialization and duplicate subscriptions/listeners.
- Defer non-critical third-party browser work until it is needed.

## 8. Anti-Patterns

Do not:

- bypass Biome or TypeScript merely to obtain a pass;
- hardcode visual tokens owned by `DESIGN.md`;
- hardcode user-facing copy, labels, or error messages (e.g. 'Retry Connection') in UI components instead of using i18n dictionaries;
- rebuild an existing shadcn/Base UI primitive with custom markup;
- put notes-domain behavior inside `src/components/ui/`;
- introduce a global state/data/auth pattern without an architectural decision;
- use emojis in UI components, icon defaults, fallbacks, or domain entities (use
  Lucide icons or semantic identifier strings instead);
- treat compilation as UI verification — visual/test requirements live in
  `TESTING.md`.

## 9. Enforcement Index

### Notes-app UI composition contract

Application components should expose the smallest API that matches their product
responsibility. They compose the installed shadcn/Base UI primitives, but they do
not have to reproduce the primitive's full compound API.

- compose visual application components from `src/components/ui/` primitives;
- name components by their application role. A `SettingsForm` may use
  `FieldGroup` as its visual root; the filename does not need to mirror the
  implementation primitive;
- prefer a simple component with normal props when the surface has one cohesive
  responsibility. A dialog may own its header, body/form, and footer when those
  pieces are not independently reusable;
- do not expose compound subcomponents: each part is its own single-component
  file, and a context shared between sibling parts is not used;
- when a Base UI primitive needs to render another element/component, use its
  native `render={<Component />}` composition API (for example
  `DialogClose render={<Button />}`) instead of inventing `renderX` props,
  `asChild` compatibility layers, or extra wrapper components;
- keep `src/components/ui/` responsible for reusable visual anatomy and keep
  notes-domain behavior in `src/components/notes-app/`;
- state surfaces may expose explicit state parts when those states are separately
  reusable; do not create parts solely to satisfy a naming or anatomy rule;
- for shell-like surfaces, keep the native shadcn primitive tree visible when it
  materially clarifies layout. `SpaceShell` orchestrates the native Sidebar
  tree without introducing a second sidebar abstraction;
- never replace available shadcn/Base UI controls with raw interactive HTML
  controls (`button`, `input`, `select`, `textarea`, or `label`);
- spread caller props before required layout classes and semantic attributes;
- keep `auth-provider.tsx`, `spaces-list.tsx`, and `theme-provider.tsx` as
  explicit non-visual/conditional orchestration exceptions.

This contract is enforced by `scripts/guards/guard-notes-app-pattern.mjs`,
exposed through `check:ui-pattern`, and covered by
`scripts/guards/guard-notes-app-pattern.test.mjs`.

Every rule above has exactly one enforcer: a `package.json` script that runs in
`check:fast`, or `review-only` when no tool can decide it. `check:conventions`
runs `scripts/guards/guard-conventions.mjs` (application rules over `src/`;
`src/components/ui/` is excluded as registry-managed; all other project source
is checked normally) and
`scripts/verify/verify-conventions-index.mjs`, which fails when a row names a
missing or ungated script or when a guard rule is absent from this table. Add a
row here in the same change that adds or changes a rule; prefer promoting a
`review-only` rule to a checker over leaving it prose-only.

| Rule | Enforcer |
| --- | --- |
| `no-any-or-ts-suppress` | `check:lint` |
| `strict-types` | `check:types` |
| `import-order` | `check:lint` |
| `module-boundaries` | `deps:check` |
| `kebab-case-filename` | `check:conventions` |
| `max-filename-length` | `check:conventions` |
| `no-default-export` | `check:conventions` |
| `component-role-suffix` | `check:naming` |
| `subcomponent-role-suffix` | `check:ui-pattern` |
| `component-data-slot` | `check:ui-pattern` |
| `canonical-props-name` | `check:props` |
| `single-component-per-file` | `check:props` |
| `identifier-casing` | `check:lint` |
| `notes-app-composition-contract` | `check:ui-pattern` |
| `dedicated-hook-owns-state` | `check:ui-pattern` |
| `base-ui-render-composition` | review-only |
| `no-as-child` | `check:conventions` |
| `reuse-primitives` | review-only |
| `no-render-props-api` | `check:conventions` |
| `composition-over-boolean-props` | review-only |
| `ui-primitive-no-default-export` | review-only |
| `ui-primitive-trailing-export-block` | review-only |
| `ui-primitive-no-interface` | review-only |
| `ui-primitive-part-shape` | review-only |
| `no-domain-in-ui` | `deps:check` |
| `no-classic-form-api` | `check:conventions` |
| `use-client-smallest-boundary` | `check:rsc` |
| `error-boundary-use-client` | `check:conventions` |
| `no-forward-ref` | `check:conventions` |
| `no-use-context` | `check:conventions` |
| `no-preemptive-memo` | `check:conventions` |
| `no-window-location` | `check:conventions` |
| `no-component-in-render` | `check:lint` |
| `named-default-export` | `check:conventions` |
| `fast-refresh-module-isolation` | review-only |
| `server-action-use-server` | `check:conventions` |
| `server-action-validates-input` | `check:conventions` |
| `server-action-result-type` | review-only |
| `i18n-no-hardcoded-text` | `check:i18n` |
| `no-hardcoded-color` | `check:conventions` |
| `no-important` | `check:conventions` |
| `use-cn-for-class-merge` | `check:conventions` |
| `prefer-standard-scale` | `check:conventions` |
| `button-size-variant` | `check:conventions` |
| `max-component-lines` | `check:conventions` |
| `name-matches-surface` | `check:conventions` |
| `testid-starts-with-component` | `check:conventions` |
| `no-emojis` | `check:emojis` |
| `doc-sync` | `check:doc-sync` |
| `performance-patterns` | review-only |
