# ADR 0014: Eliminate profile context in favor of root session

- **Status**: Accepted; amends the profile state in ADR 0013
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

[ADR 0013](0013-share-one-client-session.md) unified client session management into a single `SessionProviderClient` subscription exposed through `useSession()`. However, the profile route retained a localized `ProfileContext`, `useProfile`, and `useProfileContext`, which duplicated user identity state and passed loaded preference values down an intermediate tree.

In practice, only `ProfileAvatarFieldClient` read from `ProfileContext`, and it only required the current user and avatar cache invalidation. All other profile fields (`ProfileDisplayNameField`, `ProfileEmailField`, `ProfileLocaleField`, `ProfileThemeField`) consumed form context directly through React Hook Form's `useFormContext()`.

Furthermore, official Next.js App Router and Cache Components authentication guidance (`authentication-with-cache-components.md` step 3: "Share the user across components") prescribes reading the user session once at the boundary provider and consuming it directly without introducing secondary, per-screen user contexts.

## Decision

- Remove `ProfileContext`, `useProfileContext`, and `useProfile`.
- Child profile components, including `ProfileAvatarFieldClient`, read the authenticated user directly from the application's root `useSession()` hook.
- `useProfileFormClient` directly composes `useSession()`, `useProfilePreferences()`, `useProfileSubmit()`, and React Hook Form's `useForm()`.
- `ProfileFormClient` provides `<FormProvider {...form}>` directly to its children without wrapping in `<ProfileContext>`.
- Avatar cache-busting utilizes `formState.submitCount` from React Hook Form with `getAvatarSource` rather than maintaining manual React state setters in `useProfileSubmit` or `useProfileSaveFeedback`.

## Considered options

- **Keep `ProfileContext` as a narrow context for avatar cache busting**: rejected because `formState.submitCount` natively tracks form resets on submission, eliminating the need for any local context.
- **Pass user down via props from `ProfileFormClient`**: rejected because it would violate component composition and prop-drilling conventions (`checkProfilePropDrilling`).
- **Consume root `useSession()` directly and rely on `FormProvider`**: accepted; adheres to official Next.js guidance and eliminates three obsolete files.

## Consequences

- Direct adherence to official Next.js App Router authentication patterns.
- Eliminates three redundant files (`use-profile.ts`, `profile-context.ts`, `use-profile-context.ts`) and reduces unnecessary abstraction layers.
- Form field components remain decoupled, accessing form state via `useFormContext()` and user identity via `useSession()`.
