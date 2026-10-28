# React version applicability

Read this guide when checking runtime/type compatibility or planning an upgrade.

## Local evidence

Checked on 2026-10-30 without changing dependencies:

| Package | Installed version |
| --- | --- |
| Next.js | 16.4.3 |
| React | 19.3.1 |
| React DOM | 19.3.1 |

A Node import probe confirmed that `ViewTransition`, `addTransitionType`, and
`react-dom`'s `browser` export exist in the installed packages. Export presence
is not a browser behavior test, type-contract check, or proof of framework support.

## Verified upstream scope

The [official React 19.3 announcement](https://react.dev/blog/2026/09/09/react-19-3),
retrieved through Context7, states that View Transitions and Fragment refs became
stable in React 19.3. `ViewTransition` and `addTransitionType` belong to that release.
This supersedes treating those features as universally experimental.

The [release-channel policy](https://react.dev/community/versioning-policy)
distinguishes stable Latest releases from pinned framework-curated Canary builds
and Experimental builds. Check the channel of the actual API being considered.

The lookup did not establish the full historical narrative previously copied
from the rules, including security/transport changes attributed to 19.3.1,
Trusted Types, server Context, or a release-history classification for `browser`.
Those unsupported historical summaries have been removed. Verify the specific
release/security source and actual integration before making such claims.

## Renderer context

The installed Next.js documentation explains that App Router can use framework-
bundled React builds, while Pages Router uses the application's React dependency.
`package.json` alone is not proof that a renderer-specific API is available in
every build pipeline. Check installed exports, types, and framework integration.

Follow the [React rule](../../.agents/rules/react.md), preserve dependency scope,
and use [lifecycle verification](../../TESTING.md#react-rules-and-lifecycle-verification)
for actual rendering behavior. Documentation lookup does not authorize upgrades.
