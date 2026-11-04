# ADR 0017: Structure the profile as one form component

- **Status**: Accepted; amends ADR 0015 and ADR 0016
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

After ADR 0016 the profile route still had 14 imports in `page.tsx`, a `ProfileFormClient` that only forwarded the result of `useProfileFormClient` into `ProfileFormContext`, four field components that read that context, and `ProfileCard*` wrappers that re-exported shadcn `Card` parts. The [Next.js project structure guide](https://nextjs.org/docs/app/getting-started/project-structure) keeps `page.tsx` as the routable entry and co-locates private code in `_components` and `_lib`. The shadcn Next.js form guide uses a schema, an Action and one client form component that calls `useActionState` and renders its fields. The reviewer found the profile structure strange against both.

`check:components` forced most of that structure: it required a named hook for any component that coordinates `useActionState`, a `-client` suffix for browser integrations, and profile-specific composition rules for `ProfileCard*` and `ProfileFormClient`.

## Decision

- `profile/page.tsx` stays a Server Component. It renders a shadcn `Card` with the title and description and `<ProfileForm />`.
- `ProfileForm` (`_components/profile-form.tsx`) is one client component. It calls `useActionState` directly, reads the profile with `use()`, and renders the display name, email, language and theme fields, the save button and the back link inline. `pending` comes from `useActionState`.
- `ProfileAvatarFieldClient` stays separate because it owns the object URL preview and the file input; it receives the picked file, `onPick`, `pending` and `savedCount` as props.
- The Action is a plain function created by `createProfileAction` in `_lib/profile-action.ts`, so it is testable without React. The `use-profile-action.ts`, `use-profile-form-client.ts` hooks, `ProfileFormContext` and the `ProfileCard*` wrappers are removed.
- `check:components` exempts `*-form.tsx` components from the `-client` suffix and from the custom-hook delegation rules, and still requires exactly one form root and no `FormProvider`. The profile-specific card, form and page composition rules are removed. A Biome override turns off `noExcessiveLinesPerFunction` for `src/**/_components/*-form.tsx`, since a form's fields are declarative markup; the cognitive-complexity budget still applies.

## Consequences

- Seven component files, two hooks and one context fewer; the form reads top to bottom like the Next.js and shadcn examples.
- A form component can grow large. The avatar field and the Action stay in their own modules, and further fields should be extracted when `profile-form.tsx` becomes hard to scan.
- The hook-delegation rule still applies to every other component.
