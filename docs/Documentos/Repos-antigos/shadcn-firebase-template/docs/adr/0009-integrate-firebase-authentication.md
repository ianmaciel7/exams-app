# ADR 0009: Integrate Firebase Authentication

- **Status**: Accepted
- **Date**: 2026-10-19
- **Deciders**: ianmaciel7

## Context

The template includes the FirebaseUI registry layer but initially had no authentication
routes, Firebase project configuration, authenticated product screens, usage logging,
or server-side role authorization.

## Decision

Use the Firebase Web SDK and the copied Firebase registry screens and buttons
for sign-in, registration, and password recovery under the `(public)` route
group. They are shadcn source owned by this project and use `@firebase-oss/ui-react`
for shared runtime behavior. Initialize
one default Firebase app, Auth instance, and FirebaseUI store in the browser;
`src/lib/firebase/client.ts` reuses the app and the UI store across development reloads;
the global store's type declaration lives in `src/types/global.d.ts`.
The shared route-group provider (`AuthProviderClient` in `src/components/ui/extensions/`)
observes Auth state before rendering a screen. Authenticated users are redirected to `/profile`.
Navigation destinations are fixed paths, not user-provided URLs. Google sign-in is optional
and controlled by `NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED`.
The UI store follows the next-intl locale using the installed FirebaseUI
translations (`src/lib/locale.ts`). Existing next-intl, theme, and tooltip providers remain in place.

Configure FirebaseUI initialization with `providerPopupStrategy()` by default in ordinary
browsers and `providerRedirectStrategy()` only when the browser user agent contains
`Electron/`, because embedded Electron browsers can fail to preserve the opener window
relationship required by the Auth Emulator popup callback. Both strategies are supported
FirebaseUI v7 behaviors and apply to all enabled external providers. Redirect completion
remains in FirebaseUI's existing `getRedirectResult` lifecycle, after which existing
`onAuthStateChanged` listeners recover authenticated UI state and perform their fixed
safe-route redirect without a custom OAuth callback, popup bridge, or second Auth instance.
For Electron in development, Next.js proxies the Auth Emulator handler and required Auth
REST endpoints through the app origin while preserving each configured emulator endpoint
and port via `next.config.ts` rewrites:

```ts
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim();
const authEmulatorUrl = authEmulatorHost
  ? (authEmulatorHost.startsWith("http://") || authEmulatorHost.startsWith("https://")
      ? authEmulatorHost
      : `http://${authEmulatorHost}`
    ).replace(/\/$/, "")
  : undefined;

// Inside nextConfig:
async rewrites() {
  if (process.env.NODE_ENV !== "development" || !authEmulatorUrl) {
    return [];
  }
  return [
    {
      source: "/emulator/auth/:path*",
      destination: `${authEmulatorUrl}/emulator/auth/:path*`,
    },
    {
      source: "/identitytoolkit.googleapis.com/:path*",
      destination: `${authEmulatorUrl}/identitytoolkit.googleapis.com/:path*`,
    },
    {
      source: "/securetoken.googleapis.com/:path*",
      destination: `${authEmulatorUrl}/securetoken.googleapis.com/:path*`,
    },
  ];
}
```

The public layout supplies the shared `main` landmark. The route pages compose
the local registry screens directly. They do not add forms,
authentication context, or optional FirebaseUI behaviors. Missing public Web SDK
configuration produces a configuration error on the authentication routes.
The home page (`src/app/page.tsx`) incorporates a dynamic client navigation control (`src/app/_components/auth-nav-button-client.tsx`) observing auth state via `onAuthStateChanged`: it presents an accessible link to `/sign-in` ('Sign In') when unauthenticated, and dynamically switches to 'Open App' linking directly to `/profile` when authenticated.

Authenticated user interaction is structured under the `(protected)` route group:

- `src/app/(protected)/layout.tsx` coordinates server and client protection, observing
  `onAuthStateChanged` using the shared Firebase Auth instance, displaying a localized
  loading state while resolving auth state, and redirecting unauthenticated visitors to `/sign-in`.
- `src/app/(protected)/profile/page.tsx` renders user session details (`email`, `displayName`,
  `uid`) and provides sign-out controls that trigger Firebase `signOut(auth)` and redirect
  to `/sign-in` upon completion, and exposes language and theme preferences.
- User preferences are stored in the Firestore document `users/{uid}` using the modular
  Web SDK. Firebase initialization lives in `src/lib/firebase/client.ts`; the profile
  route's hooks coordinate Firebase Auth, Storage, and Firestore;
  preference reads/writes and Firestore data validation live in
  `src/lib/firebase/firestore/user-preferences.ts`. The locale is also written
  to the existing `NEXT_LOCALE` cookie and the theme is applied through `next-themes`,
  so both changes take effect immediately. Firestore rules restrict user writes to
  the authenticated user whose UID matches the document ID (`isAdmin()` also allows
  admin reads of `/users/{uid}`) and validate supported
  preference fields and values. Preference synchronization is best-effort so an
  unavailable Firestore instance does not prevent the local controls from working.
- Profile avatars are stored at `users/{uid}/avatar`. Storage rules restrict access to
  the matching authenticated UID and limit uploads to JPEG, PNG, or WebP images no larger
  than 2 MiB, matching client-side validation.

Authenticated screen and functionality usage logging uses Firebase's native logging
infrastructure (superseding an earlier browser-direct Firestore `usageLogs` write model):

- The protected guard awaits `recordUsage` on pathname changes before releasing
  protected screens, and profile updates await `withUsageGuard` before executing.
  Sign-out remains independent so logging outages never prevent ending a session.
- `recordUsage` invokes an authenticated Firebase callable Cloud Function that validates
  an event allowlist (`/profile` screen and `profile.update` functionality), derives
  `uid` from verified callable authentication (`request.auth`), rejects anonymous callers
  and extra fields, and emits structured `INFO` entries (`event: "app_usage"`,
  `schemaVersion: 1`, `eventId`, `uid`, `type`, `name`) through `firebase-functions/logger`
  to Google Cloud Logging. Query strings, form values, email addresses, and tokens are
  excluded, and legacy `/usageLogs` documents are denied to browser clients in Firestore rules.

Role-based server and backend authorization uses Firebase custom claims and the Admin SDK:

- A single `role` custom claim (`user` or `admin`, defined in `src/lib/role.ts`)
  is the source of truth; missing or unknown values resolve to `user`.
- Claims are written only by the `setUserRole` callable Cloud Function, which requires
  the caller's own verified `role == 'admin'` claim, merges existing custom claims,
  refuses self-demotion, and revokes refresh tokens so role changes take effect on the
  next verified request.
- The Next.js server verifies the worker-bridge ID token using `firebase-admin`
  (`verifyIdToken(token, true)` with revocation checking) in `src/lib/firebase/admin.ts`
  and `src/lib/firebase/server.ts`, exposing `role` alongside `userId`.
- `src/app/(protected)/_lib/require-protected-access.ts` provides `requireRole`, the fail-closed data-access layer (DAL)
  authorization boundary: when no server-verified session is present (even if the worker
  bridge is absent), it redirects to `/sign-in`; when the verified role is insufficient,
  it triggers `notFound()`. `requireProtectedAccess` retains its documented first-load
  fallback for ordinary protected pages.
- Firestore rules include an `isAdmin()` helper allowing admins to read `/users/{uid}`,
  and the emulator seed script assigns the `admin` role claim to `admin@example.test`.

For local development and browser tests, opt in to the Firebase Emulators by setting
`FIREBASE_AUTH_EMULATOR_HOST` (e.g. `127.0.0.1:9099`) alongside the project configuration
in `.env`. The client connects to the emulator endpoint before initializing FirebaseUI and
only permits emulator usage in development. In-code default fallback values are strictly
avoided: configuration is read from `.env` and missing variables raise explicit errors.
Production uses the Web SDK configuration with emulator host variables omitted. Canonical
Firebase emulator configuration resides at the repository root in `firebase.json`, and the
default project alias is maintained in `.firebaserc`, eliminating custom `--config` and
`--project` CLI flags. The configuration enables the Firebase Emulator Suite UI on port
4000 for visual inspection and interactive debugging during development.
Operational commands for the Firebase Auth Emulator:

- `pnpm emulator`: starts the local Auth Emulator (`firebase emulators:start --only auth`),
  serving the Auth service on port 9099 and the Emulator Suite UI at
  `http://127.0.0.1:4000`.
- `pnpm emulator:seed`: sends seed test accounts (including `admin@example.test` with the
  `admin` custom claim) to the running emulator for local development and testing
  (`node scripts/emulator/seed.mjs`).
- `pnpm emulator:clear`: clears all accounts in the emulator (`node scripts/emulator/clear.mjs`).

Operational setup is documented in
[TOOLING.md](../../TOOLING.md#firebase-authentication) and
[docs/logging.md](../logging.md).

## Consequences

Client-side route guards, Proxy matchers, and hidden UI provide UX navigation guarding
rather than zero-trust authorization. Any page or Server Function that exposes
role-restricted data must call `requireRole` in `src/app/(protected)/_lib/require-protected-access.ts` directly, while
Firebase Security Rules remain the enforcement point for browser SDK access. Production
server verification with `firebase-admin` requires Application Default Credentials
(the local Auth Emulator needs none). Custom claims propagate when the client refreshes
its ID token; refresh-token revocation in `setUserRole` enforces immediate re-verification.

Ordinary browsers retain popup OAuth while Electron user agents use full-page redirect
OAuth without relying on an opener relay or cross-origin iframe storage. The redirect
strategy is testable in Chromium with an Electron user agent, though a real embedded
Electron runtime remains a manual compatibility check.

Cloud Logging controls log viewing permissions, severity filters, retention, exclusions,
and exports for `recordUsage` without extra logging libraries or Firestore collections.
Callable usage logging failures (including the 15-second client timeout) intentionally
block protected screens and profile saves while leaving sign-out independent. Guard
acknowledgment confirms callable handler execution, not durable Cloud Logging ingestion,
and events remain client-reported attempts rather than authoritative mutation audits.
Deploy `recordUsage` and updated Firestore rules before releasing the frontend; Firebase
App Check requires separate provisioning and is not enabled by default.

The auth SDK and registry screens increase the measured client JavaScript bundle to
about 732 kB gzip. The client budget is 750 kB gzip to accommodate the required
runtime while retaining a finite regression limit.

The mocked unit tests cover Auth state, route navigation, protected profile components,
usage guards, callable handlers (`pnpm test:logging`), and `requireRole` DAL checks,
meeting the repository's `>= 70%` coverage threshold. The separate Playwright Auth
Emulator suite, configured in `playwright.config.ts`, exercises email registration and
sign-in, persistence, password recovery, locale navigation, protected profile display,
sign-out, and simulated Google popup/Electron redirect sign-in without production
credentials. It runs against a development server and is not part of the standard
Playwright or CI suite. It does not validate real Google consent, email delivery, or MFA;
see [TESTING.md](../../TESTING.md#first-time-setup).

The registry source had upstream type mismatches for optional auth credentials
and optional Base UI selection values. Local forms and the country selector now
handle those API results explicitly. [ADR 0008](0008-install-firebase-ui-registry.md)
records the project's shadcn source-ownership policy.

Firebase Web SDK and emulator parameters are externalized to environment
variables (`.env.example` / `.env`), completely removing in-code default fallback
values across project source, scripts, and test runners. Canonical root configuration
files (`firebase.json` and `.firebaserc`) enable the Firebase CLI and test suites to
discover emulator bindings and project aliases natively.
