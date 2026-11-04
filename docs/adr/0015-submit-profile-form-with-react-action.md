# ADR 0015: Submit the profile form with a React form Action

- **Status**: Accepted; amends the profile form state in ADR 0014
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

The profile form used React Hook Form: `useForm`, `FormProvider`, `form.handleSubmit` and a `useProfileSubmit` hook with its own `saveError` state. The [Next.js forms guide](https://nextjs.org/docs/app/guides/forms) structures a form as `<form action={fn}>` with `FormData`, `useActionState` for the result and `useFormStatus` for the pending state. The guide frames Actions as Server Functions, but in React 19 an Action can be a client function with the same signature.

Every profile write is a browser Firebase SDK call (`updateProfile`, `verifyBeforeUpdateEmail`, Storage upload, Firestore writes) checked by security rules, so a Server Action would need the Admin SDK and would move authorization from rules to code.

## Decision

- `ProfileFormClient` renders one Base UI `Form` with `action={formAction}`; `formAction` wraps the dispatch from `useActionState(submitProfile, initialState)` in `useProfileFormClient`.
- `submitProfile` (`use-profile-action.ts`, replacing `useProfileSubmit`) is a client Action `(prevState, formData) => nextState`. It parses `FormData` in `_lib/form-data.ts`, saves through `saveProfile`, and returns `ProfileActionState` (`values`, pending `avatarFile`, `error`, `savedCount`). A failed save returns the submitted values so React's post-Action form reset keeps the user's input.
- Fields are uncontrolled (`name` + `defaultValue`). Pending state comes from `useFormStatus()`. The picked avatar `File` is added to the `FormData` in `formAction`.
- The form-scoped `ProfileFormContext` carries the Action state and the avatar pick to the fields. It replaces `FormProvider` as the form-state carrier and holds no user identity, which still comes from `useSession()` (ADR 0014).
- `pnpm check:components` rejects `FormProvider` in the profile form, and `_lib/form-data.test.ts` covers the `FormData` parsing.

## Considered options

- **Keep React Hook Form**: rejected; it duplicates what the React and Next.js form primitives provide for this single-submit form.
- **Server Action**: rejected for the reasons above; the Firebase UI auth forms and any future server mutation can still use it.
- **Pass state down as props**: rejected; it would break the profile composition and prop-drilling checks.

## Consequences

- The profile follows the documented Next.js structure with a client Action.
- The Firebase UI auth forms still use React Hook Form and migrate separately.
- The browser clears file inputs on form reset, so the avatar pick lives in React state rather than in the input.
