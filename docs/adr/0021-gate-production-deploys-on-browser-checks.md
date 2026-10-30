# ADR 0021: Gate production deploys on browser checks

- **Status**: Accepted
- **Date**: 2026-10-30
- **Deciders**: ianmaciel7

## Context

Firebase CD ran only `pnpm verify:fast` before deploying, so no browser test
guarded a release. The Playwright responsiveness and axe suites resized a desktop
browser, which ignores the meta viewport and never matches `(pointer: coarse)`.
Touch targets of 28 to 32px, 14px field text on landscape phones, missing
autofill tokens, missing level-one headings, and a sign-in layout shift all
passed. Without Firebase configuration in CI, the auth-route checks skipped.

## Decision

- Add a Playwright `mobile` project (Pixel 7 device emulation) for
  `tests/mobile.spec.ts`, and `tests/best-practices.spec.ts` for headers, the
  manifest, and document metadata.
- Add `pnpm check:lighthouse` with mobile budgets: accessibility 95, best
  practices 90, SEO 90, CLS 0.1, and performance 40 as a regression floor.
- Give the CI `e2e` job a placeholder Firebase web configuration so the auth
  forms render, then run Lighthouse after `pnpm verify:e2e`.
- Add a Firebase CD `browser-checks` job that runs the same suites on the release
  commit; the deploy job needs it. Only the deploy job holds `id-token: write`.

## Consequences

- A release that breaks mobile, accessibility, or layout stability stops before
  any production change.
- Releases take longer by one Playwright and Lighthouse run.
- The performance floor is low because the home hero waits for the client
  Firebase session (LCP about 6s on simulated slow 4G). Raise it after the hero
  renders on the server.
- The checks are listed in `TESTING.md`; the conventions they enforce are in
  `.agents/rules/mobile.md`.
