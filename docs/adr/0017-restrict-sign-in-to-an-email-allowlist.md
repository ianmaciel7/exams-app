# ADR 0017: Restrict sign-in to an email allowlist

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

The app has a handful of known users, but Firebase Authentication lets anyone who finds
the sign-in page register an account. Production already runs on Identity Platform
([ADR 0012](0012-configure-terraform-infrastructure.md)), which supports blocking
functions that run before a user is created or signs in.

## Decision

Refuse every address that is not on an allowlist, with two Auth blocking functions in
`functions/`:

- `restrictSignUp` (`beforeUserCreated`) and `restrictSignIn` (`beforeUserSignedIn`) throw
  `permission-denied` for any address outside the lists.
- Two lists exist: regular users and admins. Admin addresses are allowed implicitly and
  receive the `role: admin` custom claim that `setUserRole` already uses; everyone else
  receives `role: user`. The claim is set only when the address is verified, so someone
  who registers with an admin address and a password does not become an admin.
- Sign-in requires a verified email. The allowed users sign in with Google, which verifies
  the address. Email and password accounts stay refused until the app sends a
  verification email.
- Addresses are identifiers, so they are not tracked. They are the Functions parameters
  `ALLOWED_USER_EMAILS` and `ADMIN_USER_EMAILS` (comma separated), read from
  `functions/.env.<project id>` at deploy time. Terraform keeps them as `production`
  environment secrets from the local `terraform.tfvars`, and the release workflow writes
  the parameters file from them.
- The policy fails closed: outside the emulator an empty list refuses everyone. In the
  Functions emulator with no list the app stays open, so the E2E suite keeps using
  `@example.test` users.

## Considered options

- **Firestore rules only**: rejected because accounts would still be created and every
  other Auth-backed feature would stay open.
- **Disable sign-up in Identity Platform**: rejected because it blocks the owners' first
  sign-in and does not restrict existing accounts.
- **Commit the lists**: rejected by the identifier rule.

## Consequences

- A wrong or missing deploy value locks every user out. Fix the secrets and redeploy.
- The release workflow needs a step that writes `functions/.env.<project id>` from the
  `ALLOWED_USER_EMAILS` and `ADMIN_USER_EMAILS` secrets, which is not part of this change.
- Changing the lists means updating `terraform.tfvars`, applying, and releasing again.
- Existing sessions keep working until their token expires.

## Delivery

The release workflow writes the two lists from the `production` environment secrets into
`functions/.env.<project id>` on the runner before `firebase deploy`, and fails when a
secret is missing. The blocking functions (`restrictsignup`, `restrictsignin`) join the
services whose Cloud Run invoker check is turned off, as in ADR 0016, because Identity
Platform calls them directly.

## Deploy findings

Blocking functions deploy to `us-east1`, not the region of the callable functions. The
Firebase CLI tries to make a new function public and fails under the organization policy,
so the first deploy that creates them reports an error even though the services exist.
Later deploys only update them and succeed. The invoker step names each service's region.
The deploy passes `--force` so the CLI sets up the image cleanup policy of the new region.
