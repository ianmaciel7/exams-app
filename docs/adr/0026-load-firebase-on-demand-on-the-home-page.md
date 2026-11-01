# ADR 0026: Load Firebase on demand on the home page

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

The home page waited for Firebase to load on the client before it painted the
hero, so the simulated mobile LCP (largest content render time) was about 6.0 s.
[ADR 0022](0022-gate-production-deploys-on-browser-checks.md) gates deploys on
mobile budgets but did not gate LCP, so the regression went unnoticed. The change
shipped in pull request #41.

## Decision

- The home hero renders in the server HTML. Session surfaces (sign-in, sign-out,
  profile links) are client components that wait behind button-sized skeletons.
- Firebase modules load after hydration through dynamic `import()` calls kept in
  `src/app/_lib/firebase-loaders.ts`, because React Compiler does not support
  `import()` inside hooks. Other critical-path routes follow the same rule.
- `pnpm check:lighthouse` fails when the home LCP is above 4 s. The total client
  JavaScript budget in `.size-limit.json` is 770 kB to cover the extra chunk
  overhead.
- `pnpm check:components` follows dynamic imports when it checks the component
  conventions.

## Consequences

- The simulated mobile LCP of `/` fell to about 2.3 to 3.1 s.
- A session control appears after a short skeleton instead of with the first paint.
- The `/sign-in` LCP stays above the target and is not gated; a later record can
  extend the ceiling to that route.
- Budgets and commands live in [TESTING.md](../../TESTING.md) and
  [TOOLING.md](../../TOOLING.md).
