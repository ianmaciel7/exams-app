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

- The profile form submits through a React form Action: `ProfileForm` (`profile-form.tsx`) renders one Base UI `Form` with `action={formAction}` from `useProfileForm` (which wraps `useActionState`), not React Hook Form. A `*-form.tsx` component is exempt from the `-client` suffix only and delegates its hooks to `use<Component>` (see ADRs 0017 and 0018). Do not add `FormProvider`, `useForm` or `onSubmit` to it; `pnpm check:components` rejects `FormProvider` there. The Action is a client function because every write is a browser Firebase SDK call (see CODING_STANDARDS "Form and Field Architecture").
- Keep profile Actions in `_lib/actions.ts`. Its `"use client"` boundary preserves the browser Firebase workflow. A filename does not make a Server Function; `require-session-check-in-server-action` checks exported function declarations with module-level or inline `"use server"` directives.
- `pnpm check:components` rejects the legacy `profile-action.ts` and `profile-actions.ts` module names, including colocated tests. Intentional naming changes must update the owning rule, guard and regression cases together.
- The Action has the `(prevState, formData)` signature and returns `ProfileActionState` (`values`, pending `avatarFile`, `error`). It maps `FormData` in `_lib/dto.ts` using field names from `_lib/definitions.ts`, and falls back to the previous value for anything unknown.
- Fields are uncontrolled: `name` (from `profileFieldNames`) plus `defaultValue` from `state.values` of the Action, written inline in `ProfileForm`. React resets the form after an Action, so a failed save returns the submitted values; a `Select` uses `key` on its value so it picks up the new default.
- `ProfileForm` reads pending state from the third value of `useActionState` and passes it to child components that need it; never keep a second saving flag. `useFormStatus()` remains valid in a component rendered inside a form.
- A reusable form that is not profile-like may still use React Hook Form (the Firebase UI auth forms do) with one `useForm`, `FormProvider` and `form.handleSubmit`; `require-form-provider` guards those.
- A screen/controller owns asynchronous data loading; only mount a form with prepared defaults. The Action's state seeds from the loaded profile.
- Avatar file selection and preview remain a separate field, since `File` / `FileList` need application-level lifecycle handling. The picked file is added to the `FormData` in `formAction`, because the browser clears the file input when React resets the form.
- UI primitives already provided by shadcn/ui (`FieldGroup`, `FieldSet`, `FieldLegend`) are preferable to splitting basic fields into arbitrary grouping components without a semantic responsibility.
- `InputGroup` requires `InputGroupInput` or `InputGroupTextarea`, never raw `Input` or `Textarea`. Interactive buttons or text inside inputs use `InputGroupAddon`.
- Option sets containing 2 to 7 choices use `ToggleGroup` + `ToggleGroupItem` rather than multiple `Button` elements with manual active state.

## Profile behavior ownership

- `ProfileForm` owns the browser load state through `useProfileForm`, which
  composes `useProfileRead`. It renders `LoadingStatus` while reading and the
  fields only with loaded values. Cleanup stops accepting results from that lifecycle, and the
  15-second deadline ends its UI wait. Errors reach `profile/error.tsx`; retry
  remounts the loader and reads again, without cache eviction. `loading.tsx`
  remains the route's server-rendering fallback (ADR 0019).
- Keep reads and writes in `data.ts`, transferred form values in `dto.ts`, and
  contracts and field names in `definitions.ts`. There is no profile Promise
  registry or cache module. Initial theme and locale apply once per mounted
  visit, preserving saved values across Activity reconnects.
- User identity comes from `useSession()`; there is no form context or extra
  authentication subscription.
- `ProfileForm` owns its Action lifecycle; the Action is created by
  `createProfileAction` in `_lib/actions.ts` and successful UI feedback goes
  through `useProfileSaveFeedback`. Use the pending value of `useActionState`
  instead of keeping a second saving flag;
  `ProfileValues` and `ProfileFormValues` live in
  `src/app/(protected)/profile/_lib/definitions.ts`; persistence lives in the sibling
  `data.ts` module.
  `saveProfile` accepts typed `ProfileDependencies` with default Firebase
  adapters to test persistence without production services.
- `ProfileAvatarFieldClient` uses `useProfileAvatarFieldClient` for field state and avatar display data, with `useProfileAvatarInput` handling validation and `useProfileAvatarPreview` the preview. In `useProfileForm`, avatar draft lifecycle is managed by `useProfileAvatarDraft` via pure derivation (`{ baseState, file }`), keeping the selection in sync with Action dispatches (cleared on success, preserved on failure for retry) so submission can upload it without DOM file-input dependencies or render-phase state adjustments; preview URLs are released on replacement, successful reset and unmount.
- `ProfileForm` renders the **one** `FieldGroup`: do not wrap individual fields in another `FieldGroup`. `page.tsx` composes the shadcn `Card` parts and resolves translated headings; `ProfileForm` loads and renders the form itself.

## Profile form action safety (repository guard)

- `page.tsx` renders one shadcn `Card` with the header and `<ProfileForm />` in `CardContent`. `ProfileForm` owns the only HTML `<form>` and the save button, which has `type="submit"`; do not render a second Card or form.
- `pnpm check:components` enforces that a `*-form.tsx` component renders exactly one form root and no `FormProvider`. This is a **UI action-safety guard**, not a substitute for Firebase security rules, authorization or server-side validation.

## Accessibility and Next.js

- For `Controller`-bound fields, set `data-invalid={fieldState.invalid}` on `Field`, `aria-invalid={fieldState.invalid}` on the input or Select trigger, and show `FieldError` for errors. Associate `FieldLabel` with the control. When a field or form is disabled, set `data-disabled` on `Field` and `disabled` on the input control.
- When an inline field error is rendered, give the `FieldError` a stable or `useId`-derived `id` and reference it from the invalid control with `aria-describedby`. Remove that reference when the error is absent. Root/form errors remain separate from field descriptions.
- Preserve the `"use client"` entry boundary for the Firebase client-side workflow. Imported field files need no additional directive solely because they are imported by this client subtree.
- Do not replace the Firebase SDK submit handler with `next/form`, which serves different navigation/Server Action use cases.

## Repository verification

- `pnpm check:structure` applies `require-form-provider` to owned `*-form.tsx`, `*-form-client.tsx`, and `*-form-server.tsx` files; here forms with nested fields intentionally use a Provider. This is a _repository guard_, not an official shadcn/ui requirement for every form.
- `pnpm check:components` validates a matching family root and related named parts, filename semantics and literal Controller-name-to-field-name matching, plus the profile controller prop boundary.

## Native primitive audit

The profile components were compared with all maintained UI component modules under `src/components/ui` (excluding story/test fixtures), including `card.tsx`, `field.tsx`, `input.tsx`, `select.tsx`, `avatar.tsx`, `button.tsx` and the compound patterns used by `dialog.tsx`, `item.tsx` and `tabs.tsx`.

- Keep application-owned components in private `_components/`, importing rather than modifying the registry.
- Use the shadcn `Card` parts directly in the screen composition owner (`page.tsx` for the profile); do not add application wrappers that only forward props to a Card primitive.
- Follow `ComponentProps<typeof Primitive>`, native children, `cn()` overrides and named exports for component adapters.
- Use `useId()` for reusable field label/control pairs; do not hard-code duplicate `id` values when a profile form might mount more than once.
- Keep `type="submit"` on the save button. This is an explicit repository convention, not a mandatory official shadcn file structure.

## React Form Actions

The profile uses React `<form action>` with `useActionState` and `useFormStatus`
as a repository choice. Official Action examples do not establish a general
Next.js prohibition on React Hook Form. Client Actions are the pattern for
Firebase-SDK mutations here; server mutations use Server Functions. The Firebase
UI auth forms still use React Hook Form and migrate separately. The component
convention guard and profile integration tests protect the implemented boundary.

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
