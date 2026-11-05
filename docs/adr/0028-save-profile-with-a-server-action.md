# ADR 0028: Save the profile with a Server Action and a presentational form

- **Status**: Accepted; amends ADRs 0019, 0025 and 0027

## Context

After ADR 0027 the profile UI depended on a `ProfileGateway` port, but
`ProfileForm` still decided where the data comes from: it loaded the profile
itself and called the gateway. The reviewer asked for the dependency inversion
shown in the Next.js forms guide: the Server Component page injects the Action
into a presentational form, `<ProfileForm action={updateProfile} />`. A function
can cross from a Server Component to a Client Component only if it is a Server
Function, so the profile write moves to the server.

## Decision

- `page.tsx` reads the profile with `readOwnProfile` and renders
  `<ProfileForm action={updateProfile} initialValues={profile} />`. There is no
  provider-wrapped loader and no loading state in the form.
- `updateProfile` (`_lib/actions.ts`, `"use server"`) re-verifies the session
  (a Server Function is a public endpoint), reads the current profile on the
  server instead of trusting the client's previous state, validates the
  avatar, and calls `saveProfile`.
- `data.ts` is `server-only` and uses the Admin SDK: `getUser` and `updateUser`
  for the display name and photo, Firestore for `users/{uid}` preferences and
  Storage for `users/{uid}/avatar`. The Admin SDK bypasses the Firestore and
  Storage rules, so the Action owns the ownership check by only ever acting on
  the verified `userId`.
- The e-mail is never written by the Action. `verifyBeforeUpdateEmail` also
  sends the confirmation mail, which only the browser SDK can do. A separate
  `ProfileEmailForm` receives `changeEmail`; its container
  `ProfileEmailFormContainer` injects it from `useProfileEmailFormContainer`,
  which uses the `ProfileGateway` port (now `changeEmail` and `refreshUser`).
  A container is needed only because a Server Component cannot pass a
  browser-only function.
- After a successful save the browser Auth user is reloaded (`refreshUser`) so
  `useSession` shows the new name and photo.
- `serverActions.bodySizeLimit` is 3 MB for the 2 MB avatar.
- The App Hosting service account gets `roles/firebaseauth.admin`,
  `roles/datastore.user` and `roles/storage.objectAdmin` on the default bucket
  (Terraform, `infra/prod/app_hosting.tf`).
- Guards: Biome `noRestrictedImports` for route hooks and components also
  rejects `firebase-admin`, `_lib/gateway` and `_lib/actions`; the Middle Man
  check accepts a container that passes a function returned by its own hook down
  as a prop; `require-component-props` accepts `Omit<ComponentProps<...>, ...> &
{ ... }`.

## Consequences

- `ProfileForm` is presentational and tested with a fake Action; the server
  data layer is tested with a mocked Admin SDK.
- The browser profile read, its 15-second deadline and the account-switch
  logic are gone, because the page reads on the server for each visit.
- The `profile.update` usage event that the browser callable logged is no
  longer emitted for saves; a server-side usage log is a follow-up.
- Production needs the new IAM bindings applied before the Action can write.
