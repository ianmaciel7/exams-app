# ADR 0025: Load the profile inside the form and drop the client wrapper

- **Status**: Accepted; amends ADRs 0019 and 0024

## Context

ADR 0024 left `ProfileFormClient`, a client component whose only logic was
`if (isLoading) return <LoadingStatus />` before it mounted `ProfileForm`. It
existed because `useActionState` needs its initial values when the component
mounts, and the profile is read from Firebase in the browser. The reviewer
asked for `<ProfileForm />` directly in `page.tsx`, as in the Next.js and
shadcn form guides.

## Decision

- `ProfileForm` is the client leaf. `useProfileForm` composes `useProfileRead`
  (browser read, theme and locale sync, 15-second deadline, errors to
  `profile/error.tsx`) with `useActionState`.
- The Action state starts as `null`; until the first submission the form shows
  the loaded values (`initialProfileActionState`). The Action throws if it runs
  before the profile is loaded, which the form prevents by rendering
  `LoadingStatus` instead of the fields.
- `page.tsx` renders `<ProfileForm />` inside `CardContent`. A function such as
  `updateProfile` cannot be passed from a Server Component, so the Action stays
  inside the client form (every write uses the browser Firebase SDK).
- The Middle Man rule now treats an early-return loading guard as no logic, so
  a wrapper like the old `ProfileFormClient` is rejected.

## Consequences

- One fewer component and hook; `use-profile-form-client.ts` becomes
  `use-profile-read.ts`.
- `ProfileForm` no longer accepts `initialValues`.
