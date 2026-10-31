<!-- cspell:ignore jitless -->

# ADR 0023: Enforce a nonce-based Content Security Policy

- **Status**: Accepted; amends the no-Proxy rule of 0004 and 0021
- **Date**: 2026-10-31
- **Deciders**: ianmaciel7

## Context

`next.config.ts` sent only `frame-ancestors`, `base-uri`, and `object-src`, so
any injected script could run. Next.js adds a nonce to its framework scripts
only when the request carries a CSP with `'nonce-…'`, and only a Proxy can set
request headers before rendering. Every route already renders on demand
(the root layout reads cookies and `Accept-Language`), so a per-request nonce
does not cost a static shell. ADR 0004 and ADR 0021 forbade a Proxy to keep
locale routing cookie-driven and unprefixed.

## Decision

- Add `src/proxy.ts`. It creates a 128-bit nonce per document request, builds
  the policy with `src/lib/csp.ts`, and sets it on the request (for Next.js)
  and on the response. It only sets headers: it never rewrites, redirects, or
  reads the locale, so the routing decisions of 0004 and 0021 stand.
- Policy: `script-src 'nonce-…' 'strict-dynamic'` (with `https:` and
  `'unsafe-inline'` as fallbacks that CSP Level 3 browsers ignore),
  `style-src 'self' 'nonce-…'`, `style-src-attr 'unsafe-inline'` for
  server-rendered `style` attributes, `object-src 'none'`, `base-uri 'none'`,
  `worker-src 'self' https://www.gstatic.com/firebasejs/` (the auth service worker imports the Firebase SDK from there, and Chromium checks those module imports against the page's `worker-src`), and `connect-src`/`frame-src` limited to Firebase,
  Google sign-in, and reCAPTCHA. Development adds `'unsafe-eval'`, inline
  styles, and the configured emulator origins.
- Pass the nonce from the `x-nonce` request header to Base UI through
  `CspProviderServer` (`CSPProvider`) and to the next-themes script through
  `ThemeProviderServer`.
- Turn off the Zod JIT (`config({ jitless: true })`) in `src/instrumentation-client.ts`, so its `new Function`
  probe does not trigger a violation.
- Static files, Next.js assets, prefetches, and the auth service worker skip
  the Proxy and keep the baseline headers from `next.config.ts`.

## Consequences

- An injected inline or third-party script cannot run without the nonce.
- `tests/best-practices.spec.ts` checks the policy, a fresh nonce per request,
  the nonce on every script, and no violations on public routes.
- Pages cannot be served as a prerendered static shell or cached by a CDN
  while the policy uses a nonce. A route that becomes static must move to the
  experimental SRI hashes or leave the Proxy matcher.
- Inline `<style>` and scripts added by tests or bookmarklets are blocked.
  Browser extensions and user stylesheets still apply.
- A new third-party origin (analytics, fonts, images) needs a matching
  directive in `src/lib/csp.ts`.
