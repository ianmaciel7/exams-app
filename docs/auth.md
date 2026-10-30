# Authentication

The application uses Firebase Authentication for identity and Firebase custom
claims for roles. Client guards guide navigation but do not authorize protected
data or operations; server-side token verification, callable functions, and
Firebase Security Rules are the authorization boundaries.

## Session flow

```mermaid
flowchart TD
  Visitor[Visitor] --> PublicAuth[Public authentication route]
  PublicAuth --> FirebaseAuth[Firebase Authentication]
  FirebaseAuth -->|Signed in| Profile[/profile]
  FirebaseAuth -->|No session| SignIn[Sign-in flow]
  FirebaseAuth --> Worker[Firebase Auth service worker]
  Worker -->|Refreshed ID token| ServerSession[getFirebaseServerSession]
  ServerSession --> AdminSDK[Admin SDK token verification]
  AdminSDK -->|Verified role| Protected[Protected route or operation]
  AdminSDK -->|Missing or invalid session| SignIn
  Protected --> Rules[Callable authorization and Firebase Security Rules]
```

`AuthProviderClient` observes the shared Firebase Auth instance on public
authentication routes. Signed-in visitors are sent to `/profile`.

The Firebase Auth service worker attaches a refreshed ID token to requests it
controls. `getFirebaseServerSession()` verifies that token with the Admin SDK,
including revocation checks. A missing service-worker bridge is not proof of a
signed-out visitor, so the client guard remains the first-load fallback.

Protected layouts use `verifySession()` as this progressive guard.
Protected data and privileged operations must use `verifyRole()` or an
equivalent server-side authorization check. Insufficient roles return
`notFound()` so privileged routes are not disclosed.

The layout check is not authorization. Layouts do not re-render on client
navigation, and `verifySession()` deliberately passes when the bridge is absent.
This differs from the `verifySession` in the Next.js documentation, which always
redirects. `/profile` sets `instant = false`, so the layout's top-level session
read still blocks on the server; move that read into a nested `<Suspense>` before
adopting instant navigation there.

`getFirebaseServerSession()` is wrapped in React `cache`, so a render pass makes
one Admin verification. Each verification still costs a network round trip for
the revocation check. The worker also force-refreshes the ID token on every
navigation and RSC request; keep that behavior until a change has its own
emulator coverage, because `setUserRole` revokes tokens and a cached token could
then bounce between the server redirect and the signed-in client.

## Server entry points

Server Functions and Route Handlers are public endpoints, reachable by direct
request whether or not the UI uses them. Each one authorizes itself:

- Call `verifyRole()` inside the function and check ownership of the requested
  resource. React `cache` does not apply there, so every call verifies again.
- `verifyRole()` redirects. A Route Handler that must answer 401 or 403 needs a
  non-redirecting check.
- Call `redirect()` and `notFound()` outside `try` blocks.

## Caching

`cacheComponents` is enabled, and a session read cannot be part of the static
shell. Authenticated UI streams behind `<Suspense>`.

- Plain `use cache` and `use cache: remote` scopes cannot read request data.
  Resolve the session first, then pass only the user id to an unexported
  `use cache` function, so callers cannot request another user's data.
- Cache keys and tags are stored as plain text. Use stable ids, never tokens or
  email addresses.
- After a mutation, re-read the session in the action and call `updateTag`.

## Admin SDK and Security Rules

Browser SDK requests are evaluated against Firebase Security Rules. Admin SDK
requests are not: they run with full access, so code that reads or writes through
the Admin SDK must authorize the caller itself.

## Roles and allowlist

Roles are Firebase custom claims: `user` and `admin`. Never infer a role from
the client UI, an email address, or an unverified request header.

Custom claims are limited to 1000 bytes and `setCustomUserClaims` replaces the
whole set, so `setUserRole` merges the existing claims. It then revokes refresh
tokens, so a role change applies on the next verified request.

The Auth blocking functions `restrictSignUp` and `restrictSignIn` enforce the
deployment allowlist. Configure these server-side parameters outside source
control:

- `ALLOWED_USER_EMAILS` permits listed users.
- `ADMIN_USER_EMAILS` permits listed users and assigns the `admin` claim.

Production fails closed when no allowlist is configured. The isolated
`demo-test` emulator is open when no list is set; seed accounts must use
fictional `@example.test` addresses.

## Token failures and sign-out

Only `auth/argument-error`, `auth/id-token-expired`,
`auth/id-token-revoked`, and `auth/user-disabled` represent an unauthenticated
session. Admin credential, network, and other server faults must reach the
error boundary to avoid redirect loops.

Use `signOutUser()` rather than Firebase `signOut()` directly. It invalidates
the shared Auth session and waits for service-worker acknowledgement.

## Deliberately not used

[ADR 0023](adr/0023-keep-service-worker-firebase-session.md) records the first
two decisions.

- **Session cookies:** the worker has no CSRF exposure and stays in step with the
  client's tokens.
- **Proxy:** Next.js limits it to optimistic cookie checks, and the session
  travels in a worker-set header rather than a cookie.
- **`forbidden()` and `unauthorized()`:** both remain experimental behind
  `experimental.authInterrupts`.
- **App Check:** requires separate provisioning, as noted in
  [ADR 0009](adr/0009-integrate-firebase-authentication.md). Firebase advises
  monitoring metrics before enforcing it.

## Local development and verification

Use the `demo-test` Firebase Emulator Suite. The client uses
`NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST`; the Admin SDK uses
`FIREBASE_AUTH_EMULATOR_HOST`. Production uses Application Default Credentials
and requires `roles/firebaseauth.viewer` for revocation-aware verification.

Run `pnpm test:auth` for emulator-backed acceptance journeys.

## Official guidance

Installed Next.js guides in `node_modules/next/dist/docs/01-app/02-guides/`:
`authentication.md`, `authentication-with-cache-components.md`, and
`data-security.md`.

Firebase documentation:

- [Service worker sessions](https://firebase.google.com/docs/auth/web/service-worker-sessions)
- [Server-side rendered apps](https://firebase.google.com/docs/web/ssr-apps)
- [Session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices)

## Related references

- [Authentication and authorization rule](../.agents/rules/auth.md)
- [ADR 0009: Integrate Firebase Authentication](adr/0009-integrate-firebase-authentication.md)
- [ADR 0017: Restrict sign-in to an email allowlist](adr/0017-restrict-sign-in-to-an-email-allowlist.md)
- [ADR 0020: Grant App Hosting the Firebase Auth viewer role](adr/0020-grant-app-hosting-firebase-auth-viewer.md)
- [ADR 0023: Keep the service-worker Firebase session](adr/0023-keep-service-worker-firebase-session.md)
