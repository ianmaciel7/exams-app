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

## Roles and allowlist

Roles are Firebase custom claims: `user` and `admin`. Never infer a role from
the client UI, an email address, or an unverified request header.

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

## Local development and verification

Use the `demo-test` Firebase Emulator Suite. The client uses
`NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST`; the Admin SDK uses
`FIREBASE_AUTH_EMULATOR_HOST`. Production uses Application Default Credentials
and requires `roles/firebaseauth.viewer` for revocation-aware verification.

Run `pnpm test:auth` for emulator-backed acceptance journeys.

## Related references

- [Authentication and authorization rule](../.agents/rules/auth.md)
- [ADR 0009: Integrate Firebase Authentication](adr/0009-integrate-firebase-authentication.md)
- [ADR 0017: Restrict sign-in to an email allowlist](adr/0017-restrict-sign-in-to-an-email-allowlist.md)
- [ADR 0020: Grant App Hosting the Firebase Auth viewer role](adr/0020-grant-app-hosting-firebase-auth-viewer.md)
