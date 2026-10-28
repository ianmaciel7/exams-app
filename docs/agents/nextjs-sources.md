# Next.js sources

Read this guide when looking up Next.js documentation or verifying evidence.

## Order of consultation

1. **Installed documentation** in `node_modules/next/dist/docs/` (resolved from the
   repository root). It matches the installed version and is the authority for
   version-specific behavior. It is organized as `01-app`, `02-pages`,
   `03-architecture`, and `04-community`, with an `index.md`. Use `01-app` for this
   repository; `02-pages` is reference for requested migrations only.
2. **Context7** (`/vercel/next.js`) for upstream examples and navigation. Its corpus
   includes canary material and may not advertise the exact installed snapshot, so
   confirm any API against the installed documentation before using it.
3. **Next.js DevTools MCP** (`next-devtools`) for runtime diagnostics and route
   inspection of a running development server.
4. **Web research** only to complement the sources above or for material outside
   them, following the [research workflow](research.md).

## Official references

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- [Next.js configuration reference](https://nextjs.org/docs/app/api-reference/config/next-config-js)

Resolve the installed version and the matching topic before copying an example.
A documentation lookup, configuration regression, or type check is not behavior
coverage; verify rendering, caching, and streaming against a running build when the
change depends on them.

## Local owners

| Topic | Owner |
| --- | --- |
| Cache Components, revalidation, Partial Prefetching, streaming | [cache](../../.agents/rules/cache.md) |
| Routes, metadata, viewport, navigation | [routes](../../.agents/rules/routes.md) |
| Server and Client Component boundaries | [boundaries](../../.agents/rules/boundaries.md) |
| Configuration decisions | [ADR 0001](../adr/0001-configure-nextjs.md), `next.config.ts` |
| Topic-to-owner audit | [coverage](coverage.md) |

Follow [security guidance](../../SECURITY.md#nextjs-server-and-environment-boundaries)
for environment and server boundaries. Documentation lookup does not authorize
dependency upgrades or a different rendering model.
