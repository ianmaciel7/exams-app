---
trigger: model_decision
description: "Read when changing form context, validation, Actions, submission, reset, or profile field ownership."
---

# Forms

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing form context, validation, Actions, submission, reset, or profile field ownership.

## Form Architecture and Context Standards

These are project conventions aligned with the current shadcn/ui and React Hook Form documentation, not universal framework requirements.

## Compound forms

- The profile form submits through a React form Action: `ProfileFormClient` renders one Base UI `Form` with `action={formAction}` from `useActionState` (in `useProfileFormClient`), not React Hook Form. Do not add `FormProvider`, `useForm` or `onSubmit` to it; `pnpm check:components` rejects `FormProvider` there. The Action is a client function because every write is a browser Firebase SDK call (see CODING_STANDARDS "Form and Field Architecture").
- The Action has the `(prevState, formData)` signature and returns `ProfileActionState` (`values`, pending `avatarFile`, `error`). It parses `FormData` in `_lib/form-data.ts`, which is the only place that reads field names, and falls back to the previous value for anything unknown.
- Fields are uncontrolled: `name` (from `profileFieldNames`) plus `defaultValue` from `submission.values` in `ProfileFormContext`. React resets the form after an Action, so a failed save returns the submitted values; a `Select` uses `key` on its value so it picks up the new default.
- Fields read pending state with `useFormStatus()` (only valid in a component rendered inside the form), never a second saving flag.
- A reusable form that is not profile-like may still use React Hook Form (the Firebase UI auth forms do) with one `useForm`, `FormProvider` and `form.handleSubmit`; `require-form-provider` guards those.
- A screen/controller owns asynchronous data loading; only mount a form with prepared defaults. The Action's state seeds from the loaded profile.
- Avatar file selection and preview remain a separate field, since `File` / `FileList` need application-level lifecycle handling. The picked file is added to the `FormData` in `formAction`, because the browser clears the file input when React resets the form.
- UI primitives already provided by shadcn/ui (`FieldGroup`, `FieldSet`, `FieldLegend`) are preferable to splitting basic fields into arbitrary grouping components without a semantic responsibility.
- `InputGroup` requires `InputGroupInput` or `InputGroupTextarea`, never raw `Input` or `Textarea`. Interactive buttons or text inside inputs use `InputGroupAddon`.
- Option sets containing 2 to 7 choices use `ToggleGroup` + `ToggleGroupItem` rather than multiple `Button` elements with manual active state.

## Profile behavior ownership

- The profile segment owns load states: `useProfilePreferences` suspends
  with `use()` on the read cached in `_lib/profile-resource.ts`, so
  `profile/loading.tsx` renders the pending state and a rejection reaches
  `profile/error.tsx`. Its retry evicts the failed read before calling
  `retry()`. A 15-second deadline terminates stalled reads and a locale refresh
  no longer deliberately pins the screen to a never-settling Promise.
  Components render only loaded data; there is no status guard.
- `useProfileController` and `useProfile` are removed. `useProfileFormClient`
  reads session directly via `useSession()` and `useProfilePreferences()`;
  it does not assemble field or button props. User identity always comes from
  `useSession()`; `ProfileFormContext` carries only the form Action state
  (see ADR 0015).
- `ProfileFormClient` delegates its Action lifecycle to
  `useProfileFormClient`, which calls `useProfileAction` for persistence.
  Read `useFormStatus().pending` instead of keeping a second saving flag;
  `ProfileValues` and `ProfileFormValues` live in
  `src/app/(protected)/profile/_lib/definitions.ts`; persistence lives in the sibling
  `data.ts` module.
  `saveProfile` accepts typed `ProfileDependencies` with default Firebase
  adapters to test persistence without production services.
- `ProfileAvatarFieldClient` uses `useProfileAvatarFieldClient` for field state and avatar display data, with `useProfileAvatarInput` handling validation and `useProfileAvatarPreview` the preview. Only the picked `File` lives in `useProfileFormClient` state (and in the Action result after a failure) so submission can upload it; preview URLs are released on replacement, successful reset and unmount. Failed saves retain the selection for retry.
- `ProfileCardContent` owns the **one** `FieldGroup`: do not wrap the
  individual profile fields in another `FieldGroup` in `page.tsx`.

## Profile form action safety (repository guard)

- `ProfileCard` renders one native shadcn `Card` as its sole root and
  forwards children and applicable primitive props. `profile/page.tsx`
  composes the Card header, content, and footer.
  `ProfileFormClient` owns the only HTML `<form>` inside the Card under
  the profile context; do not render a second Card.
- `ProfileCardHeader`, `ProfileCardTitle`, `ProfileCardDescription`,
  `ProfileCardContent`, and `ProfileCardFooter` share
  `profile-card.tsx` and forward their native primitive props.
  `ProfileCardContent` owns `CardContent` and the **only** `FieldGroup`
  directly inside it. `ProfileCardFooter` owns the one native
  `CardFooter`. Both are inside the same native form from
  `ProfileFormClient`, and the Card title and description sit inside
  `ProfileCardHeader` on the page.
- `ProfileSaveButton` is the only form action and must force `type="submit"`.
- Spread caller attributes **before** fixed `type` and computed `disabled`, so even if a caller supplies a conflicting `type` the component enforces its intended action. A late `...props` may silently override both safeguards. The separate AST guard also disallows explicit `type` overrides at profile call sites.
- `pnpm check:components` enforces these concrete profile invariants through TypeScript AST tests. This is a **UI action-safety guard**, not a substitute for Firebase security rules, authorization or server-side validation.

## Accessibility and Next.js

- For `Controller`-bound fields, set `data-invalid={fieldState.invalid}` on `Field`, `aria-invalid={fieldState.invalid}` on the input or Select trigger, and show `FieldError` for errors. Associate `FieldLabel` with the control. When a field or form is disabled, set `data-disabled` on `Field` and `disabled` on the input control.
- When an inline field error is rendered, give the `FieldError` a stable or `useId`-derived `id` and reference it from the invalid control with `aria-describedby`. Remove that reference when the error is absent. Root/form errors remain separate from field descriptions.
- Preserve the `"use client"` entry boundary for the Firebase client-side workflow. Imported field files need no additional directive solely because they are imported by this client subtree.
- Do not replace the Firebase SDK submit handler with `next/form`, which serves different navigation/Server Action use cases.

## Repository verification

- `pnpm check:structure` applies `require-form-provider` to owned `*-form.tsx`, `*-form-client.tsx`, and `*-form-server.tsx` files; here forms with nested fields intentionally use a Provider. This is a *repository guard*, not an official shadcn/ui requirement for every form.
- `pnpm check:components` validates a matching family root and related named parts, filename semantics and literal Controller-name-to-field-name matching, plus the profile controller prop boundary.

## Native primitive audit

The profile components were compared with all maintained UI component modules under `src/components/ui` (excluding story/test fixtures), including `card.tsx`, `field.tsx`, `input.tsx`, `select.tsx`, `avatar.tsx`, `button.tsx` and the compound patterns used by `dialog.tsx`, `item.tsx` and `tabs.tsx`.

- Keep application-owned components in private `_components/`, importing rather than modifying the registry.
- Preserve native slots: `ProfileCard`, `ProfileCardHeader`,
  `ProfileCardTitle`, `ProfileCardDescription`, `ProfileCardContent`,
  and `ProfileCardFooter` are exported together from
  `profile-card.tsx`. `profile/page.tsx` composes the content;
  `ProfileFormClient` adds `data-slot="profile-form"` and uses
  `gap-(--card-spacing)` for spacing.
- Follow `ComponentProps<typeof Primitive>`, native children, `cn()` overrides and named exports for component adapters.
- Use `useId()` for reusable field label/control pairs; do not hard-code duplicate `id` values when a profile form might mount more than once.
- Keep `type="submit"` fixed after props spreads. This is an explicit repository convention, not a mandatory official shadcn file structure.

## Direct parent relationships

The JSX guard requires the immediate parent chain, not just an ancestor.
Card header/content/footer are direct children of `ProfileFormClient`,
which is a direct child of `ProfileCard`. Title and description are
direct header children; Form content is directly in Card content, and Form
footer is directly in Card footer. Action buttons are direct Form footer
children. Additional wrappers at these boundaries fail the guard because
they change the intended slot layout.

## React Form Actions

The profile uses React `<form action>` with `useActionState` and `useFormStatus` (Ian, 2026-11-04: the React Hook Form `handleSubmit` plus a `useProfileSubmit` hook was not the Next.js recommended structure). Client Actions are the pattern for Firebase-SDK mutations; Server Actions are for server mutations only. The Firebase UI auth forms still use React Hook Form and migrate separately.

## Official references

- [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
- [shadcn/ui Field](https://ui.shadcn.com/docs/components/field)
- [React Hook Form useForm](https://react-hook-form.com/docs/useform)
- [React Hook Form FormProvider](https://react-hook-form.com/docs/formprovider)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`)
- [Next.js Form component](https://nextjs.org/docs/app/api-reference/components/form) (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md`)

## Forms and Actions

Understand `<form action={fn}>`, submit-button `formAction`, `useActionState`,
`useFormStatus`, and `useOptimistic` as related but distinct tools. Note that
`useFormState` from `react-dom` is deprecated in React 19 and replaced by
`useActionState` from `react`. An Action may execute on the client; only a
properly marked/integrated Server Function crosses that server boundary.

Validate input, handle failures/pending state, prevent inappropriate duplicate
submissions, and authenticate/authorize server operations. Choose controlled
or uncontrolled input ownership deliberately. Do not duplicate form state in
local state, nest forms, or lose new edits when an old submission completes.
Successful Actions can reset uncontrolled fields, so review the reset contract.
