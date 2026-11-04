# ADR 0018: Delegate profile form hooks to useProfileForm

- **Status**: Accepted; amends ADR 0017
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

ADR 0017 exempted `*-form.tsx` components from the custom-hook delegation rules so that `ProfileForm` could call `useActionState` directly. `ProfileForm` then grew to coordinate the session, theme, navigation and locale, the suspended profile read, an effect, the Action and the picked avatar in one component, and `check:components` could not flag it. The reviewer expected that coordination to live in a `useProfileForm` hook.

## Decision

- `useProfileForm` (`profile/_hooks/use-profile-form.ts`) owns the profile read, the effect that forgets the cached read, `useActionState`, the picked avatar and the form action. It returns `state`, `pending`, `formAction`, `avatarFile` and `pickAvatar`.
- `ProfileForm` keeps `useTranslations` and renders the fields inline, as in the Next.js and shadcn form guides.
- `check:components` no longer exempts `*-form.tsx` from the custom-hook delegation rules: a form component calls only `use<Component>` plus presentation hooks. It stays exempt from the `-client` suffix, still needs exactly one form root and rejects `FormProvider`.
- The Biome override for `noExcessiveLinesPerFunction` on `_components/*-form.tsx` stays, because the fields are declarative markup; the cognitive-complexity budget applies.

## Consequences

- A form component that coordinates state, effects or the Action inline fails `pnpm check:components`.
- `profile-form.tsx` reads as markup; the logic is testable and reviewable in `_hooks/`.
