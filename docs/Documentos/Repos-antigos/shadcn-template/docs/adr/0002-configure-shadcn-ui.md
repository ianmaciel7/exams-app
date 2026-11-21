# ADR 0002: Configure shadcn/ui

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

Following the baseline Next.js and Biome configuration in [ADR 0001](0001-configure-nextjs.md), we need an accessible, customizable, and high-performance component library. We want full ownership of UI component source code without third-party runtime package lock-in, while maintaining standard interactive button cursor behavior, generative AI element support, and clean accessibility semantics.

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
   The root layout (`src/app/layout.tsx`) and Ladle provider (`.ladle/components.tsx`) wrap the application tree in `<TooltipProvider>`. This ensures all tooltip instances across UI and AI element components share unified delay and state coordination without individual route wrapper boilerplate.

7. **Mobile Breakpoint Hook Refactoring (`src/hooks/use-mobile.ts`)**:
   `useIsMobile` is refactored from `useEffect` + `useState` to React 18/19's canonical `React.useSyncExternalStore`:
   - Subscribes to `window.matchMedia("(max-width: 767px)")`.
   - `getSnapshot` returns `window.innerWidth < 768`.
   - `getServerSnapshot` returns `false` (desktop layout during SSR).
   This eliminates layout shifts, client-side re-render flashes, and hydration warnings.

8. **Pre-installation of UI Components**:
   We pre-install all available components from the shadcn/ui registry:
   ```bash
   pnpm dlx shadcn@latest add --all -y
   ```
   Unused components do not inflate client route bundles because Next.js and Turbopack statically tree-shake per route.

9. **Scoped Markdown Typography (`src/app/typeset.css`)**:
   We adopt `shadcn/typeset` for rich content and Markdown rendering:
   - Store the upstream stylesheet at `src/app/typeset.css`.
   - Import it from `src/app/globals.css` after Tailwind imports.
   - Define `.typeset-docs` bound to Geist font variables (`--font-geist`, `--font-geist-mono`).
   - Scope rendering via `.typeset` containers, preserving `.not-typeset` and `data-not-typeset` escape hatches for interactive components.

10. **AI SDK Elements Registry & Dependencies**:
    We install AI SDK Elements through the shadcn CLI registry:
    ```bash
    pnpm dlx shadcn@latest add https://elements.ai-sdk.dev/api/registry/all.json
    ```
    This vendors generative UI components into `src/components/ai-elements/` and injects 15 specialized dependencies:
    - AI streaming, flow graphs, and state: `ai`, `@xyflow/react`, `streamdown`, `@streamdown/code`, `@streamdown/math`, `@streamdown/mermaid`, `@streamdown/cjk`, `use-stick-to-bottom`.
    - Motion, syntax highlighting, media, and parsing: `motion`, `shiki`, `media-chrome`, `tokenlens`, `ansi-to-react`, `react-jsx-parser`, `nanoid`.
    Together with `@base-ui/react` and `@shadcn/react`, these primitives provide turn-key generative chat, code blocks, canvas flows, and media rendering.

11. **Biome Overrides for Vendored Components (`biome.json`)**:
    Because vendored code from shadcn and AI SDK Elements uses third-party generation idioms, `biome.json` configures mandatory overrides for `src/components/ui/**`, `src/components/ai-elements/**`, `src/lib/highlighter.tsx`, and `src/app/typeset.css`:
    - Relaxes rules incompatible with upstream code: accessibility warnings (`a11y/*`), `suspicious/noReactForwardRef`, `suspicious/noArrayIndexKey`, `security/noDangerouslySetInnerHtml`, `correctness/useExhaustiveDependencies`, and `performance/noImgElement`.
    - Disables Biome formatter and import assist (`formatter.enabled: false`, `assist.enabled: false`) for vendored components to prevent churn during registry updates.
    - Excludes custom application extensions (`!src/components/ui/extensions/**`) from these overrides, ensuring project-owned code maintains full strict linting and formatting.

## Consequences

- **Positive**:
  - Full source control and local ownership over UI and AI component code.
  - Clean semantic navigation using `<Link className={buttonVariants(...)}>` without Base UI button composition workarounds.
  - Zero hydration mismatch or layout flicker on mobile breakpoint evaluation via `React.useSyncExternalStore`.
  - Global tooltip coordination ready out-of-the-box via root `<TooltipProvider>`.
  - Seamless coexistence between strict Biome standards and upstream component registries through targeted `biome.json` overrides.
  - Comprehensive generative UI capabilities backed by 15 AI SDK Elements dependencies and Base UI primitives.
- **Negative / Trade-offs**:
  - Vendored components in `src/components/ui/` and `src/components/ai-elements/` require manual maintenance when upstream registries release updates.
  - AI SDK Elements introduce 15 specialized dependencies that must be tracked for security and compatibility.
  - `typeset.css` must be kept formatted and updated manually as upstream styles evolve.

## References

- [src/app/page.tsx](../../src/app/page.tsx)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/hooks/use-mobile.ts](../../src/hooks/use-mobile.ts)
- [src/lib/utils.ts](../../src/lib/utils.ts)
- [biome.json](../../biome.json)
- [src/app/typeset.css](../../src/app/typeset.css)
- [ADR 0001: Configure Next.js](0001-configure-nextjs.md)
- [ADR 0003: Configure Theming](0003-configure-theming.md)
