# ADR 0001: Configure Next.js

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

We need a modern, high-performance base template for Next.js applications. To maintain a strict separation of architectural concerns, this record defines **only the native Next.js framework baseline**: core runtime dependencies, framework configuration, compiler and caching flags, route type generation, and server error instrumentation.

All subsequent domain capabilities are decoupled and owned by dedicated decision records:
- Component primitives and shadcn/ui: [ADR 0002](0002-configure-shadcn-ui.md)
- Styling and theme tokens: [ADR 0003](0003-configure-theming.md)
- Internationalization architecture: [ADR 0004](0004-configure-internationalization.md)
- Linting, formatting, and repository standards: [ADR 0005](0005-document-project-standards.md)
- Testing strategy: [ADR 0006](0006-configure-testing.md)
- Continuous integration and custom rules: [ADR 0007](0007-configure-ci.md)
- Firebase UI registry: [ADR 0008](0008-install-firebase-ui-registry.md)
- Firebase authentication and emulators: [ADR 0009](0009-integrate-firebase-authentication.md)
- Agent ecosystem: [ADR 0010](0010-configure-agent-ecosystem.md)

To establish a production-grade framework baseline, the application integrates React Server Components, the Next.js App Router, Turbopack, automated memoization with the React Compiler, Next.js Cache Components, and native server error instrumentation.

## Decision

We bootstrap the base Next.js application using the official create command targeting TypeScript, the App Router, and the React Compiler:

```bash
pnpm create next-app . --ts --app --src-dir --react-compiler
```

Key architectural choices and core Next.js platform requirements:

1. **Runtimes, Engines, and Package Management**:
   - **Node.js**: Enforce supported engine range `^22.22.1 || ^24.5.0` in `package.json` (Node 22 LTS active baseline).
   - **Next.js**: Pin to `16.4.2` with the App Router architecture under `src/app`.
   - **React & React DOM**: Pin to `19.3.1`.
   - **pnpm**: Enforce `pnpm@12.14.0` as the deterministic, disk-efficient package manager via `packageManager`.

2. **Native Next.js Configuration (`next.config.ts`)**:
   Configure core Next.js compiler, runtime, and caching capabilities:
   - **`cacheComponents: true`**: Activates Next.js 16 Cache Components and the `"use cache"` directive for granular, component-level caching.
   - **`partialPrefetching: true`**: Enables Partial Pre-rendering (PPR) prefetch optimizations across routes.
   - **`reactCompiler: true`**: Enables the React Compiler out-of-the-box to automate memoization (`useMemo`, `useCallback`).
   - **`typescript.tsconfigPath: "tsconfig.build.json"`**: Enforces application build-specific TypeScript configuration excluding non-shipped fixtures.

   The baseline Next.js configuration is:
   ```ts
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     cacheComponents: true,
     partialPrefetching: true,
     reactCompiler: true,
     typescript: {
       tsconfigPath: "tsconfig.build.json",
     },
   };

   export default nextConfig;
   ```

   *Architectural Boundary*: Any downstream additions to `next.config.ts` belong strictly to their owning ADRs:
   - Turbopack CSS loaders for Tailwind CSS v4 are governed by [ADR 0003](0003-configure-theming.md).
   - The `withNextIntl` plugin wrapper is governed by [ADR 0004](0004-configure-internationalization.md).
   - Development proxy `rewrites()` for the Firebase Auth Emulator are governed by [ADR 0009](0009-integrate-firebase-authentication.md).

3. **Strict Route Type Generation (`next typegen`)**:
   - Script in `package.json`: `"typecheck": "next typegen && tsc --noEmit -p tsconfig.build.json"`.
   - Next.js automatically generates route segment typings under `.next/types/app/`.
   - Application layouts and pages depend strictly on generated Next.js types such as `LayoutProps` (e.g., `LayoutProps<"/">` in `src/app/layout.tsx`) and `PageProps` (enforced via project standards in [ADR 0005](0005-document-project-standards.md)).

4. **Server Request Error Instrumentation (`src/instrumentation.ts`)**:
   - Use Next.js native `onRequestError` instrumentation hook in `src/instrumentation.ts` to emit structured JSON on `stderr` when Next.js captures a server request error.
   - Include `ERROR` severity, a stable event name (`next_request_error`), framework route metadata (route template, route type, router kind), and a numeric error digest when available.
   - Exclude raw error messages, stacks, request headers, URLs, cookies, and bodies from the custom entry. Expected framework navigation control flow (`redirect()`, `notFound()`) is excluded by Next.js.

## Consequences

- **Positive**:
  - Next.js 16 `"use cache"` directive and PPR capabilities enabled via `cacheComponents` and `partialPrefetching`.
  - Fast builds and hot reload via native Turbopack.
  - End-to-end type safety across route segments using `next typegen` and generated `LayoutProps` / `PageProps`.
  - Automatic component render optimization via the React Compiler without manual hook boilerplate.
  - Guaranteed engine consistency across development and CI using pinned `pnpm@12.14.0` and Node `^22.22.1 || ^24.5.0`.
  - Cloud Run can collect structured `stderr` request error entries from `onRequestError` into Cloud Logging without an extra logging SDK or credentials.
- **Negative / Trade-offs**:
  - Type checking requires running `next typegen` before `tsc --noEmit` to ensure generated type definitions exist.
  - React Compiler requires strictly adhering to the Rules of React without mutable workarounds.
  - Non-Cloud Run hosts require log forwarding to Cloud Logging; the `onRequestError` hook does not replace Next.js diagnostic output, catch arbitrary background failures or browser errors, or guarantee durable log ingestion.

## References

- [next.config.ts](../../next.config.ts)
- [package.json](../../package.json)
- [src/instrumentation.ts](../../src/instrumentation.ts)
- [docs/logging.md](../logging.md)
- [ADR 0002: Configure shadcn/ui](0002-configure-shadcn-ui.md)
- [ADR 0003: Configure Theming](0003-configure-theming.md)
- [ADR 0004: Configure Internationalization](0004-configure-internationalization.md)
- [ADR 0005: Document Project Standards](0005-document-project-standards.md)
- [ADR 0009: Integrate Firebase Authentication](0009-integrate-firebase-authentication.md)
