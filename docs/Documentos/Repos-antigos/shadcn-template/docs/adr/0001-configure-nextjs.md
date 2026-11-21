# ADR 0001: Configure Next.js

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

We need a modern, high-performance base template for Next.js applications featuring shadcn/ui. The project requires fast linting and formatting, strict TypeScript type safety, deterministic dependency resolution, and forward-looking Next.js and React capabilities.

To establish a production-grade baseline, the application must integrate React Server Components, the Next.js App Router, Turbopack, Tailwind CSS v4, internationalization with `next-intl`, and automated memoization with the React Compiler.

## Decision

We bootstrap the base project using the following command and configuration:

```bash
pnpm create next-app . --ts --tailwind --biome --app --src-dir --react-compiler
```

Key architectural choices and core platform requirements:

1. **Runtimes, Engines, and Package Management**:
   - **Node.js**: Enforce supported engine range `^22.19.0 || ^24.5.0` in `package.json` (Node 22 LTS active baseline).
   - **Next.js**: Pin to `16.4.1` with the App Router architecture under `src/app`.
   - **React & React DOM**: Pin to `19.3.0`.
   - **pnpm**: Enforce `pnpm@12.11.2` as the deterministic, disk-efficient package manager via `packageManager`.

2. **Next.js Configuration (`next.config.ts`)**:
   Wrap the configuration with `withNextIntl` (`createNextIntlPlugin("./src/i18n/request.ts")`) and enable modern compiler and caching flags:
   - **`cacheComponents: true`**: Activates Next.js 16 Cache Components and the `"use cache"` directive for granular, component-level caching.
   - **`partialPrefetching: true`**: Enables Partial Pre-rendering (PPR) prefetch optimizations across routes.
   - **`reactCompiler: true`**: Enables the React Compiler out-of-the-box to automate memoization (`useMemo`, `useCallback`).
   - **`turbopack` CSS Rules**: Configures Turbopack loader rules for Tailwind CSS v4:
     ```ts
     turbopack: {
       rules: {
         "*.css": {
           loaders: ["@tailwindcss/turbopack"],
           as: "*.css",
         },
       },
     }
     ```
   The resulting `next.config.ts` structure is:
   ```ts
   import type { NextConfig } from "next";
   import createNextIntlPlugin from "next-intl/plugin";

   const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

   const nextConfig: NextConfig = {
     cacheComponents: true,
     partialPrefetching: true,
     reactCompiler: true,
     turbopack: {
       rules: {
         "*.css": {
           loaders: ["@tailwindcss/turbopack"],
           as: "*.css",
         },
       },
     },
   };

   export default withNextIntl(nextConfig);
   ```

3. **Strict Type Generation and Validation**:
   - Script in `package.json`: `"typecheck": "next typegen && tsc --noEmit"`.
   - Next.js generates route segment typings under `.next/types/app/`.
   - Application layouts and pages depend strictly on generated types such as `LayoutProps` (e.g., `LayoutProps<"/">` in `src/app/layout.tsx`) and `PageProps`.
   - Project GritQL plugins in Biome (`prefer-layout-props.grit`, `prefer-page-props.grit`, `prefer-route-context.grit`) enforce these generated types across all App Router routes.

4. **Linting and Formatting**:
   - Biome replaces ESLint and Prettier for unified, sub-second linting and formatting.

## Consequences

- **Positive**:
  - Blazing fast lint/format cycles via Biome and fast builds via Turbopack with `@tailwindcss/turbopack`.
  - Next.js 16 `"use cache"` directive and PPR capabilities enabled via `cacheComponents` and `partialPrefetching`.
  - End-to-end type safety across route segments using `next typegen` and generated `LayoutProps` / `PageProps`.
  - Automatic component render optimization via the React Compiler without manual hook boilerplate.
  - Seamless internationalization compilation hook via `withNextIntl`.
  - Guaranteed engine consistency across development and CI using pinned `pnpm@12.11.2` and Node `^22.19.0 || ^24.5.0`.
- **Negative / Trade-offs**:
  - Type checking requires running `next typegen` before `tsc --noEmit` to ensure generated type definitions exist.
  - Some third-party ESLint plugins lack direct Biome equivalents (mitigated by custom GritQL plugins and Semgrep).
  - React Compiler requires strictly adhering to the Rules of React without mutable workarounds.

## References

- [next.config.ts](../../next.config.ts)
- [package.json](../../package.json)
- [ADR 0004: Configure Internationalization](0004-configure-internationalization.md)
- [ADR 0005: Document Project Standards](0005-document-project-standards.md)
