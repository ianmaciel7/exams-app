---
trigger: model_decision
description: "Read when changing Next.js caches, invalidation, streaming, prefetching, or request lifetimes."
---

# Caching and streaming

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing Next.js caches, invalidation, streaming, prefetching, or request lifetimes.

- **Cache Components (`use cache`)**:
  - With `cacheComponents: true` enabled in `next.config.ts`, legacy segment
    configs (`dynamic`, `revalidate`, `fetchCache`) are prohibited. Use
    `"use cache"` (at file, component, or function scope) to cache data reads
    and server component rendering.
  - Define cache lifetime using `cacheLife(...)` (e.g., `'hours'`, `'max'`)
    and attach invalidation tags with `cacheTag(...)` from `next/cache`.
  - For route segments requiring opt-out of instant navigation validation during
    incremental adoption, export `const instant = false`.
  - Invalidate tagged cache using `revalidateTag(tag, "max")` (stale-while-revalidate)
    or `revalidateTag(tag, { expire: 0 })` in Route Handlers and Server Functions.
    Use `updateTag(tag)` for immediate read-your-own-writes inside Server Actions.
    Single-argument `revalidateTag(tag)` is deprecated.

- **Partial Prefetching (PPR) & Streaming**:
  - With `partialPrefetching: true`, wrap dynamic or uncached data reads beneath
    meaningful `<Suspense>` boundaries so Next.js can stream the static shell
    instantly.
  - Understand that `loading.tsx` only wraps `page.tsx` within its segment, not
    its layout's data reads or ancestor layouts.

- **Server Request & Lifecycle APIs**:
  - In Next.js 15+, dynamic request APIs (`cookies()`, `headers()`, `draftMode()`)
    are asynchronous and must be awaited before reading properties.
  - Use `await connection()` from `next/server` to explicitly signal runtime
    request execution before accessing uncached dynamic data.
  - Use `after()` from `next/server` for post-response non-blocking operations
    (audit logging, metrics, background notifications) after the stream or action closes.

- **Route Handlers (`route.ts`) & Caching**:
  - With `cacheComponents: true`, `'use cache'` cannot be applied directly to
    the `export async function GET()` declaration. Move cached data retrieval into
    a helper function marked with `'use cache'`; keep the handler itself outside that cached scope.

React `cache()` is request/render-scoped sharing; it does not define durable Next.js cache invalidation. Check installed Next.js documentation before changing these APIs.

See [Coding standards](../../CODING_STANDARDS.md#nextjs-request-data-and-caching) and [Security](../../SECURITY.md#nextjs-server-and-environment-boundaries).
