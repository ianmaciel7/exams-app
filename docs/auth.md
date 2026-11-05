# Authentication

The application uses Firebase Authentication for identity and Firebase custom
claims for roles. The client auth guard guides navigation but does not authorize
protected data or operations; server-side token verification, callable functions, and
Firebase Security Rules are the authorization boundaries.

## Session flow

```mermaid
flowchart TD
  Visitor[Visitor] --> PublicAuth[Public authentication route]
  PublicAuth --> FirebaseAuth[Firebase Authentication]
  FirebaseAuth -->|Signed in| Profile[/profile]
  FirebaseAuth -->|No session| SignIn[Sign-in flow]
  FirebaseAuth -->|Session Cookie| SessionAPI[/api/auth/session]
  SessionAPI -->|Set __session| ServerSession[getFirebaseServerSession]
  ServerSession --> AdminSDK[Admin SDK session verification]
  AdminSDK -->|Rejected session| SignIn
  AdminSDK --> Layout[Protected layout: verifySession in DAL]
  Layout -->|Unauthenticated| SignIn
  Layout -->|Authenticated| Protected[Protected route: ProtectedGuard]
  Protected --> Rules[Firebase Security Rules and callable authorization]
```

`PublicGuardClient` observes the shared Firebase Auth instance on public
authentication routes. Signed-in visitors are sent to the validated `next`
destination, or to the home page.

Session management uses HTTP-only `__session` cookies (ADR 0021). The client exchanges
a refreshed ID token with `/api/auth/session` upon sign-in.
`getFirebaseServerSession()` verifies the session cookie with the Admin SDK, including
revocation checks.

## Responsibilities

Next.js separates authentication, session management, and authorization. This
application maps them as follows. Firebase Authentication, session cookies,
`verifySessionCookie`, and Security Rules are documented Firebase mechanisms; the names
below and the split between them are choices of this repository.

| Module                  | Responsibility                                                                                                                                 | Grants access? |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `SessionProviderClient` | The single client Firebase Auth subscription, mounted once in the root layout; `isLoading`, `isError`, and `user` cannot contradict each other | No             |
| `useSession`            | Reads the global session from any client component; never subscribes again                                                                     | No             |
| `ProtectedGuard`        | Semantic Server layout container for protected routes                                                                                          | No             |
| `UsageRecorderClient`   | Fire-and-forget route usage telemetry; never gates content                                                                                     | No             |
| `verifySession()`       | Server DAL boundary: fails closed and returns the verified identity                                                                            | Authentication |
| `verifyRole()`          | `verifySession()` plus the required role                                                                                                       | Authorization  |
| Security Rules          | Every Client SDK read and write                                                                                                                | Authorization  |

Protected data and privileged server operations must use `verifyRole()` or
`verifySession()` and check ownership. Insufficient roles return `notFound()` so
privileged routes are not disclosed. See
[ADR 0009](adr/0009-integrate-firebase-authentication.md) and
[ADR 0021](adr/0021-adopt-official-nextjs-server-auth-dal.md).

The protected layout calls `verifySession()` in `src/app/(protected)/_lib/dal.ts`, which verifies the HTTP-only `__session` cookie. Unauthenticated requests are redirected to sign-in on the server before child route segments or RSC payloads evaluate.

`getFirebaseServerSession()` is wrapped in React `cache`, so duplicate calls across `layout.tsx` and Server Component pages (such as `ProfilePage`) during a single render pass execute the Admin SDK revocation check only once. Session cookies are synchronized upon sign-in and sign-out via the `/api/auth/session` Route Handler.

## Server entry points

Server Functions and Route Handlers are public endpoints, reachable by direct
request whether or not the UI uses them. Each one authorizes itself:

- Call `verifyRole()` or `verifySession()` inside the function and check
  ownership of the requested resource. React `cache` does not apply there, so
  every call verifies again.
- Both redirect. A Route Handler that must answer 401 or 403 needs a
  non-redirecting check.
- Extend the worker's request filter first, or the request carries no token.
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
tokens, so a role change applies on the next verified request. A client receives
new claims when its ID token refreshes. Security Rules do not check revocation:
an issued token keeps its claims there until it expires, and only
`verifyIdToken(token, true)` rejects it earlier.

`restrictSignIn` is promote-only: it raises an allowlisted, verified address to
`admin` and otherwise keeps the existing role, so a role set by `setUserRole`
survives sign-in. Removing an address from `ADMIN_USER_EMAILS` does not demote an
existing administrator; use `setUserRole`.

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
`auth/id-token-revoked`, `auth/user-disabled`, and `auth/user-not-found` represent
an unauthenticated session. Admin credential, network, and other server faults must reach the
error boundary to avoid redirect loops.

Use `signOutUser()` rather than Firebase `signOut()` directly. It invalidates
the shared Auth session and waits for service-worker acknowledgement.

## Deliberately not used

[ADR 0009](adr/0009-integrate-firebase-authentication.md) records the first
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
- [ADR 0009: Restrict sign-in to an email allowlist](adr/0009-integrate-firebase-authentication.md)
- [ADR 0011: Grant App Hosting the Firebase Auth viewer role](adr/0011-configure-terraform-infrastructure.md)
- [ADR 0009: Keep the service-worker Firebase session](adr/0009-integrate-firebase-authentication.md)
- [ADR 0009: Separate the bridge navigation check from session verification](adr/0009-integrate-firebase-authentication.md)
