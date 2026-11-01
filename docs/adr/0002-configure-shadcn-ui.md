# ADR 0002: Configure shadcn/ui

- **Status**: Accepted; incorporates former ADRs 0027, 0029, 0030
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

Following the baseline Next.js configuration in [ADR 0001](0001-configure-nextjs.md), we need an accessible, customizable, and high-performance component library. This decision focuses on the **shadcn/ui component system and registry setup**: Base UI component primitives, local code ownership, interactive button behavior, class utility conventions, semantic button variants, pre-installed UI primitives, scoped Markdown typography, and AI SDK Elements generative UI registries.

Related domain capabilities are decoupled and governed by dedicated decision records:
- Theming and OKLCH color tokens: [ADR 0003](0003-configure-theming.md)
- Internationalization architecture: [ADR 0004](0004-configure-internationalization.md)
- Repository component standards, placement rules (`ui/extensions`), and Biome overrides: [ADR 0005](0005-document-project-standards.md)
- Testing strategy for components: [ADR 0006](0006-configure-testing.md)
- Firebase UI registry integration: [ADR 0008](0008-install-firebase-ui-registry.md)
- Agent ecosystem, MCP servers, and autonomous engineering skills: [ADR 0010](0010-configure-agent-ecosystem.md)

## Decision

We initialize shadcn/ui using the official recommended defaults with pointer cursor:

```bash
pnpm dlx shadcn@latest init -d --pointer
```

Key architectural choices:

1. **Component Primitives (Base UI)**:
   Powered by the `base-nova` preset using Base UI (`@base-ui/react` `^1.9.0`, `@shadcn/react` `^0.3.1`, and `@radix-ui/react-use-controllable-state` `^1.3.0`) as recommended by shadcn for Next.js and React 19.

2. **Code Ownership (Copy-Paste Philosophy)**:
   Components live inside `src/components/ui/` and `src/components/ai-elements/` rather than in opaque `node_modules` packages, enabling full customization and static optimization.

3. **`--pointer` Flag**:
   Explicitly enables `cursor: pointer` for button primitives (`button:not(:disabled), [role="button"]:not(:disabled)`) to preserve intuitive clickable user experience.

4. **Class Name Utility Convention (`"cn": "^0.4.0"`)**:
   We adopt the lightweight npm package `"cn": "^0.4.0"` to merge conditional Tailwind classes. The project standardizes on `src/lib/utils.ts` re-exporting `cn`:
   ```ts
   export { cn } from "cn";
   ```
   This avoids redundant internal wrapper code while providing standard `cn(...)` usage across all components.

5. **Starter Page Native Composition (`src/app/page.tsx`)**:
   Action buttons in the starter screen use native, semantic Next.js `<Link>` elements styled via the `buttonVariants` helper rather than the obsolete `<Button render={<Link>}>`:
   ```tsx
   <Link
     href="https://vercel.com/new?..."
     target="_blank"
     rel="noopener noreferrer"
     aria-label={t("deployNow")}
     className={buttonVariants({
       className:
         "flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-medium md:w-[158px]",
     })}
   >
     <Image ... />
     {t("deployNow")}
   </Link>
   ```
   This clean semantic composition avoids Base UI button prop inheritance overhead, eliminates unnecessary `nativeButton={false}` overrides, and conforms directly to standard HTML and Next.js navigation semantics with full-width mobile and `md:w-[158px]` responsive sizing.

6. **Root Provider Integration (`<TooltipProvider>`)**:
   The root layout (`src/app/layout.tsx`) and Ladle provider (`.ladle/components.tsx`) wrap the application tree in `<TooltipProvider>`. This ensures all tooltip instances across UI components share unified delay and state coordination without individual route wrapper boilerplate.

7. **Mobile Breakpoint Hook Refactoring (`src/hooks/use-mobile.ts`)**:
   `useIsMobile` (installed by shadcn for responsive primitives) is refactored from `useEffect` + `useState` to React 18/19's canonical `React.useSyncExternalStore`:
   - Subscribes to `window.matchMedia("(max-width: 767px)")`.
   - `getSnapshot` returns `window.innerWidth < 768`.
   - `getServerSnapshot` returns `false` (desktop layout during SSR).
   This eliminates layout shifts, client-side re-render flashes, and hydration warnings.

8. **Pre-installation and Local Adaptation of UI Components**:
   We pre-install components from the shadcn/ui registry:
   ```bash
   pnpm dlx shadcn@latest add --all -y
   ```
   Unused components do not inflate client route bundles because Next.js and Turbopack statically tree-shake per route. Application components in `src/components/ui/` are locally owned and adapted for Base UI (`base-nova`), keyboard accessibility, and repository composition contracts (`require-button-props`, `require-component-props`). Raw re-execution of upstream registry additions must be reviewed against these local contracts.

9. **Scoped Markdown Typography (`src/app/typeset.css`)**:
   We adopt `shadcn/typeset` for rich content and Markdown rendering:
   - Store the upstream stylesheet at `src/app/typeset.css`.
   - Import it from `src/app/globals.css` after Tailwind imports.
   - Define `.typeset-docs` bound to Geist font variables (`--font-geist`, `--font-geist-mono`).
   - Scope rendering via `.typeset` containers, preserving `.not-typeset` and `data-not-typeset` escape hatches for interactive components.

10. **AI SDK Elements Registry & Dependencies (`src/components/ai-elements/`)**:
    We install AI SDK Elements through the shadcn CLI registry:

    ```bash
    pnpm dlx shadcn@latest add https://elements.ai-sdk.dev/api/registry/all.json
    ```

    This vendors generative UI components into `src/components/ai-elements/` and injects 15 specialized dependencies:
    - AI streaming, flow graphs, and state: `ai`, `@xyflow/react`, `streamdown`, `@streamdown/code`, `@streamdown/math`, `@streamdown/mermaid`, `@streamdown/cjk`, `use-stick-to-bottom`.
    - Motion, syntax highlighting, media, and parsing: `motion`, `shiki`, `media-chrome`, `tokenlens`, `ansi-to-react`, `react-jsx-parser`, `nanoid`.

    Together with `@base-ui/react` and `@shadcn/react`, these primitives provide turn-key generative chat, code blocks, canvas flows, and media rendering. Vendored sources incorporate local bug fixes and regression tests (such as `AgentTool` lazy schema resolution and `PromptInput` local attachment resets) maintained directly in project source.

*Architectural Boundary*: Downstream concerns related to UI are owned by their respective records:
- Theming, dark mode, and OKLCH color palettes are defined in [ADR 0003](0003-configure-theming.md).
- Component architecture, shared component placement in `src/components/ui/extensions/`, and `biome.json` overrides for vendored code are defined in [ADR 0005](0005-document-project-standards.md).
- Agent execution workflows, MCP tools, and skills are defined in [ADR 0010](0010-configure-agent-ecosystem.md).

## Consequences

- **Positive**:
  - Full source control and local ownership over UI and generative AI component code.
  - Clean semantic navigation using `<Link className={buttonVariants(...)}>` without Base UI button composition workarounds.
  - Zero hydration mismatch or layout flicker on mobile breakpoint evaluation via `React.useSyncExternalStore`.
  - Global tooltip coordination ready out-of-the-box via root `<TooltipProvider>`.
  - Comprehensive generative UI capabilities backed by 15 AI SDK Elements dependencies and Base UI primitives.
  - Upstream component tree-shaking per route via Next.js and Turbopack.
- **Negative / Trade-offs**:
  - Vendored components in `src/components/ui/` and `src/components/ai-elements/` require manual maintenance when upstream registries release updates.
  - AI SDK Elements introduce 15 specialized dependencies that must be tracked for security and compatibility.
  - `typeset.css` must be kept formatted and updated manually as upstream styles evolve.

## References

- [src/app/page.tsx](../../src/app/page.tsx)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/hooks/use-mobile.ts](../../src/hooks/use-mobile.ts)
- [src/lib/utils.ts](../../src/lib/utils.ts)
- [src/app/typeset.css](../../src/app/typeset.css)
- [ADR 0001: Configure Next.js](0001-configure-nextjs.md)
- [ADR 0003: Configure Theming](0003-configure-theming.md)
- [ADR 0005: Document Project Standards](0005-document-project-standards.md)
- [ADR 0010: Configure Agent Ecosystem](0010-configure-agent-ecosystem.md)

## Incorporated decisions

The following records were merged into this one on 2026-11-01 at the maintainer's direction. Their text is kept as written, with the original number, status, and date, so the history stays traceable. The earlier files remain in Git history.

### Former ADR 0027: Build forms on Base UI Form and Field

- **Original status**: Accepted
- **Original date**: 2026-11-01

#### Context (former ADR 0027)

Forms mixed raw `<form>` and `<label>` elements, manual `htmlFor` wiring, and
ad hoc error text. Accessible names, error association, and native validation
differed from one form to the next. The profile form (pull request #60) and the
Firebase authentication forms (pull request #63) moved to one model.

#### Decision (former ADR 0027)

- Forms use the Base UI `Form` and `Field` primitives through the owned wrappers in
  `src/components/ui/extensions/` (`form`, `form-field`, `form-error`). Labels, descriptions, and
  errors are associated by Base UI instead of by hand.
- The profile keeps a single React Hook Form instance wrapped in `FormProvider`; each field
  composes `FormField`, the input, and `FormFieldError` with a `Controller`.
- ast-grep rules in `.ast-grep/rules/forms/` block raw `<form>` elements, manual label wiring, a
  missing `autoComplete`, and a Server Action without a session check. `pnpm check:forms` and the
  CI gate run them with their snapshot tests.
- Conventions live in [CODING_STANDARDS.md](../../CODING_STANDARDS.md) and
  `.agents/rules/forms.md`; this record keeps the reasoning only.

#### Consequences (former ADR 0027)

- Every form exposes the same accessible name, error, and submit-state behavior, and new forms
  that bypass the wrappers fail at commit time.
- Forms depend on the Base UI release that provides `Form` and `Field`.
- The Firebase UI registry forms are now locally edited copies, so a registry update needs a
  manual merge ([ADR 0008](0008-install-firebase-ui-registry.md)).

### Former ADR 0029: Enforce Base UI component rules with ast-grep

- **Original status**: Accepted
- **Original date**: 2026-11-01

#### Context (former ADR 0029)

[ADR 0002](0002-configure-shadcn-ui.md) chose Base UI primitives and locally owned
components, and [ADR 0007](0007-configure-ci.md) added ast-grep for structural
rules. Base UI misuse (a cloned element instead of `render`, a Radix import,
`onClick` on a value control, a raw `<button>`) compiled and passed unit tests but
broke keyboard and accessibility behavior. Pull requests #35, #39 and #58 closed
the gap.

#### Decision (former ADR 0029)

- Rules in `.ast-grep/rules/base-ui/` reject Radix imports and state selectors, a
  direct Base UI import outside the owned wrappers, `cloneElement`, `onClick` on
  value controls, raw `<button>` elements, a button rendered as a link, nested
  buttons in a trigger, and a menu item `onClick`. A trigger rendered as a
  non-button requires `nativeButton={false}`.
- Each rule has snapshot tests and runs through `pnpm check:structure`.
- `ast-grep scan` also runs on staged `*.{ts,tsx}` files in lint-staged after
  Biome, so a violation blocks the commit and not only CI.
- Rules that need types (`asChild`, popup titles) stay with TypeScript and axe.
- Composition patterns (`render`, `useRender`, `mergeProps`) live in
  `.agents/rules/shadcn.md`.

#### Consequences (former ADR 0029)

- A Base UI misuse fails at commit time with a message that names the fix.
- Each rule is a maintenance cost and needs a snapshot when Base UI changes.
- The rule list lives in the custom rule registry in [TOOLING.md](../../TOOLING.md).

### Former ADR 0030: Use one loading indicator and one loading marker

- **Original status**: Accepted
- **Original date**: 2026-11-01

#### Context (former ADR 0030)

Route and session loading showed several spinners (a primitive, a labeled spinner,
and an overlay), so navigation to the profile flashed two indicators, shifted the
layout, or lost the indicator across a root Suspense boundary. Pull requests 36,
40 to 44, 46 and 56 fixed it step by step.

#### Decision (former ADR 0030)

- One `GlobalLoadingIndicator` renders the only visible, labeled loading state.
- Each loading boundary (`loading.tsx`, the protected guard, and client session
  waits) renders an empty `LoadingState` marker that tells the indicator a
  transition is pending. A boundary never draws its own spinner.
- The ast-grep rule `no-inline-loading-state` blocks a hand-made loading state.
- Playwright records every visible spinner frame across real App Router and
  Firebase auth transitions on a viewport matrix, so a second indicator or a
  layout shift fails the suite.

#### Consequences (former ADR 0030)

- A new route only adds a marker and gets the right feedback.
- Loading looks the same everywhere, and the indicator does not shift the layout.
- The state inventory lives in [docs/ui-state-feedback.md](../ui-state-feedback.md).
