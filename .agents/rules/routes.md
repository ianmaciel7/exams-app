---
trigger: model_decision
description: "Read when changing route entrypoints, handlers, navigation, metadata, or viewport exports."
---

# Routes and navigation

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing route entrypoints, handlers, navigation, metadata, or viewport exports.

## Next.js Route Special Files Logic

Repository policy: `page.tsx`, `layout.tsx`, and `template.tsx` stay as
thin **Server Component** entrypoints. This is stricter than the Next.js API,
which permits data access in pages/layouts and Client Components in templates.

## Thin entrypoint guardrails

- **Allowed responsibilities**: Route parameter and search parameter resolution,
  server-side data orchestration, Next.js generators (`generateMetadata`,
  `generateViewport`, `generateStaticParams`), static route exports, root
  document setup, and composition of providers and UI.
- **Async Route Parameters & Props**: In Next.js 15+, `params` and `searchParams`
  are `Promise<T>` and **must be awaited** before reading properties:
  - In `page.tsx`, declare `{ params, searchParams }` with promise types when consumed;
    when unconsumed, use empty parentheses `()` (e.g., `export default function ProfilePage()`)
    so unit tests can render the component without required prop mocks.
  - In `layout.tsx`, `params` is a promise, while `children` is received directly.
  - Use generated framework parameter types (`PageProps<Route>`, `LayoutProps<Route>`,
    `RouteContext<Route>`) produced by `next typegen` rather than hand-written prop signatures.
- **Metadata and Viewport Separation**:
  - Viewport properties (`themeColor`, `width`, `initialScale`, `maximumScale`) must
    not be defined inside `export const metadata: Metadata` or `generateMetadata()`.
  - Export viewport configuration separately via `export const viewport: Viewport = { ... }`
    or `generateViewport()`. Root layout must specify `width: "device-width"` and `initialScale: 1`
    without zoom-disabling constraints (`userScalable: false`).
- **Rejected responsibilities**: Reject `"use client"`, React and third-party hooks
  (`useState`, `useTranslations`, `useRouter`, etc.), direct Firebase SDK imports,
  browser APIs, JSX event handlers, local mutation, conditional control flow,
  loops, exception handling, and inline helper/callback functions.
- **Extraction policy**: Extract UI to colocated `_components/`, client behavior
  to `_hooks/`, and domain operations to dedicated `src/lib/` modules. Server-side
  data reads through those modules are allowed in route entrypoints.
- **CI enforcement**: The mandatory `pnpm check:routes` command scans **all** matching
  files, including the route-group root and future `template.tsx` files. It runs
  self-tests and fails CI on violations; `ast-grep` also marks hook violations
  as errors through `review-route-special-files-logic`.

## Route special files, boundaries, and handlers

- `loading.tsx`, `error.tsx`, and `not-found.tsx` retain their individual Next.js
  conventions and are outside the three-file thin entrypoint check.
- `global-error.tsx` acts as the root error boundary for unhandled errors in root
  `layout.tsx`; it must render its own `<html>` and `<body>` tags.
- `forbidden.tsx` and `unauthorized.tsx` handle 403 and 401 exceptions triggered by
  `forbidden()` and `unauthorized()`.
- `default.tsx` provides fallback rendering for unmatched parallel route slots (`@slot`).
- **Route Handlers (`route.ts`)**:
  - Export HTTP verb functions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) as thin
    server endpoints returning standard Web `Response` or `Response.json()`.
  - Route Handlers must not contain inline database queries or raw persistence SDK
    calls; delegate authentication and authorization to `dal.ts` and operations to
    `src/lib/` or feature `_lib/` modules.

## Official references

- [Next.js layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) (`node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`)
- [Next.js page](https://nextjs.org/docs/app/api-reference/file-conventions/page) (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`)
- [Next.js layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout) (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`)
- [Next.js template](https://nextjs.org/docs/app/api-reference/file-conventions/template) (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md`)
- [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers) (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`)
- [Next.js error handling](https://nextjs.org/docs/app/getting-started/error-handling) (`node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`)

## Navigation and locale

Use App Router `next/navigation`, `next/link`, and the Metadata API rather than
Pages Router imports. Follow [cache.md](cache.md) for prefetch and streaming rules.
For locale behavior, read [Architecture](../../ARCHITECTURE.md#internationalization)
and [Coding standards](../../CODING_STANDARDS.md): preserve the existing cookie-only,
unprefixed locale decision and accepted ADR history.

## Proxy reference

Before introducing or changing Proxy, read the installed Next.js Proxy guide and
[Security](../../SECURITY.md#nextjs-server-and-environment-boundaries). In Next.js 16,
Proxy is the successor name for Middleware. It is not a full authorization or
session boundary. `src/proxy.ts` only applies per-request CSP headers ([ADR 0001](../../docs/adr/0001-configure-nextjs.md))
and does not rewrite or redirect; it imports canonical header names from `src/lib/headers.ts`
and policy construction from `src/lib/csp.ts`. Preserve the project's cookie-only locale
decision; the existence of upstream Proxy examples does not require adding one here.
