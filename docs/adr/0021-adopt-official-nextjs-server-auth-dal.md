# ADR 0021: Adopt Official Next.js Server Components Authentication and Data Access Layer

- **Status**: Accepted; supersedes former ADR 0024 and former ADR 0025 (incorporated in ADR 0009)
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

The repository's authentication architecture previously relied on a hybrid approach:
browser-initiated Firebase Authentication, a Service Worker session bridge injecting
refreshed ID tokens into same-origin requests, a tolerant navigation check
(`rejectInvalidBridgeSession()`) in the protected layout, and a client-side layout
guard (`AuthGuardClient`) rendering null or a loading indicator before redirecting
unauthenticated visitors in the browser.

When evaluated against official Next.js App Router guidelines (`authentication.mdx`),
this structure diverges from recommended server-first architecture in several respects:

- Next.js explicitly advises against client layout guards that return `null` or loading
  spinners while waiting for browser authentication state. In the App Router, client-side
  redirects cause visible content layout shifts (CLS), flash unauthenticated UI states,
  and fail to protect server data streams.
- Next.js mandates a server-first Data Access Layer (DAL) memoized with React `cache()`,
  where server authentication and authorization fail closed with immediate server redirects
  before rendering protected subtrees.
- The Service Worker header injection mechanism introduces a first-load race condition:
  on initial page load or when opening a protected link in a new tab, the Service Worker
  may not yet control the page or have synchronized tokens from IndexedDB. This forced
  the server layout check (`rejectInvalidBridgeSession()`) to remain tolerant of a missing
  bridge, deferring zero-trust security enforcement to client-side code.
- Service Worker header manipulation is brittle, non-standard for Server Actions and RSC
  streaming, and incompatible with edge and CDN capabilities.

To achieve 100% official Next.js architecture, the project migrates from the Service Worker
header bridge to native HTTP-only Firebase Session Cookies (`__session`), eliminating first-load
race conditions and enabling zero-trust Server Component layout protection.

## Decision

- **Migrate session transport to HTTP-only Firebase Session Cookies (`__session`)**:
  Session transport transitions from the Service Worker header bridge to native HTTP-only
  Firebase Session Cookies. The cookie name is specifically `__session`, which is natively
  preserved and forwarded by the Firebase App Hosting CDN and Next.js server runtime without
  custom header rewrite configurations.
- **Implement `/api/auth/session` Route Handler**:
  Create an endpoint for minting and clearing session cookies using the Firebase Admin SDK
  (`createSessionCookie`). The client exchanges a valid ID token for an HTTP-only session cookie
  with a configurable expiration upon sign-in, and clears the cookie on sign-out.
- **Establish `src/app/(protected)/_lib/dal.ts` as the official Next.js DAL**:
  - `verifySession` reads the `__session` cookie from `next/headers` and verifies it on the server
    using Firebase Admin SDK (`verifySessionCookie(sessionCookie, true)`), enforcing token revocation checks.
  - `verifyRole` builds upon `verifySession`, enforcing role-based authorization (e.g. `admin`) and
    failing closed via `notFound()` to prevent resource disclosure.
  - Both functions are memoized across a single server render pass using React `cache()`.
- **Retire client-side auth gating**:
  - Remove `rejectInvalidBridgeSession()`.
  - Retire client-side navigation gating in `AuthGuardClient`. Client layout guards no longer return
    null or manage redirect loops.
- **Zero-trust Server Component layout protection**:
  `src/app/(protected)/layout.tsx` becomes a pure Server Component that directly awaits `verifySession()`.
  Unauthenticated requests are redirected at the server boundary before any protected RSC or child
  layout is evaluated, and the layout renders the semantic `<ProtectedGuard>{children}</ProtectedGuard>`.
- **Decouple usage telemetry**:
  Telemetry logging is decoupled from authentication gating into a non-gating client observer
  component (`RouteUsageBridgeClient`), preserving analytics without coupling them to access control.

## Consequences

- **Official Next.js alignment**: The project achieves complete compliance with Next.js App Router
  authentication recommendations, separating authentication, data access, and authorization into a
  properly layered server DAL.
- **Elimination of layout shifts and flashes**: Protected routes no longer suffer from client-side
  redirect flashes, loading spinners, or layout shifts on initial load.
- **Zero-trust security**: Server layouts and Server Components fail closed before rendering any
  confidential data, eliminating the window of vulnerability caused by missing Service Worker control.
- **Full support for Server Actions and RSC streaming**: Requests automatically carry the HTTP-only
  session cookie across standard HTTP transports, supporting Server Actions, route handlers, and RSC
  streaming out of the box.
- **Deprecation of the Service Worker bridge**: The complex Service Worker token bridge (`public/firebase-auth-sw.js`),
  IndexedDB token polling, and custom request filtering are deprecated and superseded by native web
  cookies.

## References

- [Next.js App Router: Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Firebase Admin SDK: Manage Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [ADR 0009: Integrate Firebase Authentication](0009-integrate-firebase-authentication.md)
