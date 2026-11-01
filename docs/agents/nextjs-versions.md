# Next.js version applicability

Read this guide when checking framework compatibility or planning an upgrade.

## Local evidence

Checked on 2026-10-30 without changing dependencies:

| Item | Value |
| --- | --- |
| Next.js (`package.json`, installed) | 16.4.3 |
| React / React DOM | 19.3.1 |
| React Compiler plugin | 1.0.0 |
| Router | App Router only |

`next.config.ts` enables `cacheComponents`, `partialPrefetching`, and
`reactCompiler`. The legacy segment configs `dynamic`, `revalidate`, and
`fetchCache` are therefore prohibited by the [cache rule](../../.agents/rules/cache.md).

## What the evidence covers

The installed documentation bundle is the version authority. Context7 can include
canary material and did not advertise the exact 16.4.3 snapshot, so an upstream
example is a lead, not proof. Confirm each API in the installed documentation
(`node_modules/next/dist/docs/`) and, where behavior matters, in a running build.

Individual documentation bodies were consulted for the index, Proxy, and
handler/cache boundaries (see [coverage](coverage.md)). API and version guidance
outside those reads still needs verification before implementation.

## Remaining limits

- No Proxy implementation is claimed or required; locale resolution prefers the
  cookie and falls back to `Accept-Language`
  ([ADR 0004](../adr/0004-configure-internationalization.md), [ADR 0004](../adr/0004-configure-internationalization.md)).
- Renderer-specific React APIs depend on the framework-bundled React build for App
  Router; see [React versions](react-versions.md#renderer-context).
- Upstream documentation does not authorize dependency upgrades, hosting
  configuration, or migration to another rendering model.

Follow [Next.js sources](nextjs-sources.md) for the order of consultation.
