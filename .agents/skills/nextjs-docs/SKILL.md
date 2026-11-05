---

name: nextjs-docs
description: Lookup and verify installed Next.js documentation in node_modules/next/dist/docs/ and server internals in node_modules/next/dist/server/lib/. Use before planning, writing, modifying, or answering anything regarding Next.js routing, caching, server actions, server/client components, or runtime behavior.
---

# Next.js Installed Documentation & Server Internals

Inspect installed Next.js documentation and server runtime sources before designing, answering, or implementing any Next.js feature in this repository.

## Authority & Core Directives

1. **Installed Sources Are the Authority**: The installed Next.js version in `node_modules/next` is the single source of truth for all API signatures, conventions, runtime semantics, and configuration flags.
2. **Never Rely on Pre-Trained Defaults**: Modern Next.js (App Router, Cache Components, Partial Prefetching, Server Actions) deprecates many older Next.js 13/14 patterns. Always check installed documentation and types before proposing code or architectural patterns.
3. **Repository-Relative Paths**: Always refer to documentation and server code using repository-relative paths (`node_modules/next/dist/docs/` and `node_modules/next/dist/server/lib/`). Do not hardcode machine-specific or absolute paths.

---

## Directory Inventory

### 1. Bundled Documentation (`node_modules/next/dist/docs/`)

The primary documentation directory is `01-app` for App Router projects:

- **Getting Started** (`01-app/01-getting-started/`):
  - `03-layouts-and-pages.md`: Layout hierarchy, templates, and nesting.
  - `04-linking-and-navigating.md`: `<Link>`, `useRouter()`, prefetching, and soft navigation.
  - `05-server-and-client-components.md`: Server vs Client component boundaries, serialization rules.
  - `06-fetching-data.md`: Request-time fetching, streaming with `<Suspense>`, and caching.
  - `07-mutating-data.md`: Server Actions, form submissions, and mutations.
  - `08-caching.md`: Modern caching model, Cache Components (`use cache`), and static shells.
  - `09-revalidating.md`: Invalidation via `revalidatePath`, `revalidateTag`, and `cacheLife`.
  - `10-error-handling.md`: Error boundaries (`error.tsx`), `notFound()`, and server error masking.
  - `14-metadata-and-og-images.md`: Static and dynamic metadata, viewport, and OpenGraph images.
  - `15-route-handlers.md`: `route.ts` handlers, HTTP method exports, and caching behavior.

- **Guides** (`01-app/02-guides/`):
  - `adopting-partial-prefetching.md`: Partial Prefetching (PPR) adoption and streaming shells.
  - `authentication-with-cache-components.md`: Combining authentication (`cookies()`) with `'use cache: private'`.
  - `caching-without-cache-components.md`: Fallback / classic caching patterns.
  - `incremental-static-regeneration-cache-components.md`: Modern ISR with Cache Components.
  - `forms.md`: Form handling, action hooks (`useActionState`), and validation.
  - `server-actions-and-mutations.md`: In-depth Server Actions mechanics and security.
  - `data-security.md`: Data leak prevention, server-only code isolation, and sanitization.
  - `draft-mode.md`: Enabling and clearing Draft Mode for headless CMS previews.
  - `instrumentation.md`: Server startup instrumentation hooks (`instrumentation.ts`).

- **API Reference** (`01-app/03-api-reference/`):
  - **Directives** (`01-directives/`):
    - `use-cache.md`: The `"use cache"` directive syntax, scopes, and key hashing.
    - `use-cache-private.md`: Scoping cached values to client cookies/headers.
    - `use-cache-remote.md`: Explicit remote tier caching handlers.
    - `use-client.md`: Marking Client Component entry boundaries.
    - `use-server.md`: Marking Server Action entry points.
  - **Components** (`02-components/`):
    - `image.md`, `link.md`, `form.md`, `script.md`.
  - **File Conventions** (`03-file-conventions/`):
    - `layout-js.md`, `page-js.md`, `route-js.md`, `loading-js.md`, `error-js.md`, `not-found-js.md`, `default-js.md`, `middleware-js.md`.
  - **Functions** (`04-functions/`):
    - `after.md`: Scheduling work after the response finishes (`after()`).
    - `cacheLife.md`: Defining cache lifetimes and staleness profiles.
    - `cacheTag.md`: Associating cache tags with cached functions.
    - `connection.md`: Indicating dynamic request execution with `await connection()`.
    - `cookies.md`, `headers.md`: Accessing request headers and cookies.
    - `redirect.md`, `permanentRedirect.md`: Navigation redirects.
    - `revalidatePath.md`, `revalidateTag.md`, `updateTag.md`: Invalidation APIs.
    - `unauthorized.md`, `forbidden.md`: Auth status helpers.
    - `use-link-status.md`, `use-offline.md`: Modern client hooks.
  - **Configuration** (`05-config/01-next-config-js/`):
    - `cacheComponents.md`, `cacheLife.md`, `cacheHandlers.md`, `ppr.md`, `turbopack.md`.

- **Glossary** (`01-app/04-glossary.md`): Authoritative definitions of Next.js architecture terms.

### 2. Server Internals (`node_modules/next/dist/server/lib/`)

When documentation does not detail runtime type signatures, internal hooks, or execution flow, inspect the server implementation directly:

- `app-dir-module.d.ts`: Module shapes for App Router pages, layouts, and route handlers.
- `route-cache-key.d.ts` / `.js`: Computation of route cache keys and directory naming (`ROUTE_CACHE_DIRECTORY`).
- `server-action-request-meta.d.ts` / `.js`: Headers and metadata used by Next.js to identify Server Actions.
- `cache-handlers/`: Default in-memory and custom cache handler signatures (`default.d.ts`).
- `incremental-cache/`: Incremental cache implementations and tag tracking.
- `router-utils/`: Route matching, segment parsing, and parameter encoding utilities.
- `streaming-metadata.d.ts`: Internal mechanics of streaming metadata and head injection.
- `generate-agent-files.js`: Next.js's embedded agent generator and rules block definition.

---

## Fast Lookup Utility

This skill includes a zero-dependency CLI script to locate matching documentation files and server internals instantly:

```bash
# Search across installed documentation and server internals
node .agents/skills/nextjs-docs/scripts/lookup.mjs "use cache"

# Search exclusively in server internals (types and runtime lib)
node .agents/skills/nextjs-docs/scripts/lookup.mjs --server "route-cache"

# Search exclusively in documentation
node .agents/skills/nextjs-docs/scripts/lookup.mjs --docs "revalidateTag"

# List all available topics and categories
node .agents/skills/nextjs-docs/scripts/lookup.mjs --list
```

---

## Workflow for Answering and Implementing Next.js Tasks

1. **Identify the Concept**:
   - Determine whether the task involves routing, caching, data mutation, server components, or configuration.
2. **Locate Installed Documentation**:
   - Run `node .agents/skills/nextjs-docs/scripts/lookup.mjs <concept>` or navigate to the relevant file in `node_modules/next/dist/docs/01-app/`.
3. **Verify Runtime & Type Signatures**:
   - If the task involves low-level contracts, request metadata, or cache handler wiring, inspect the matching `.d.ts` file in `node_modules/next/dist/server/lib/`.
4. **Check Local Architectural Rules**:
   - Ensure the proposal aligns with repository rules in `.agents/rules/`:
     - Caching & streaming: `.agents/rules/cache.md`
     - Routes & navigation: `.agents/rules/routes.md`
     - Component boundaries: `.agents/rules/boundaries.md`
5. **Formulate the Answer or Solution**:
   - Cite the specific installed guide path (e.g., `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`) and state the exact API contracts verified.
