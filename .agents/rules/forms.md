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

- A composite form with nested field components (as with `ProfileFormClient`) uses exactly one `useForm` instance, wraps its content in `FormProvider {...form}`, and submits through `form.handleSubmit(onSubmit)`.
- Child fields access `control` with `useFormContext<ProfileValues>()`; they compose `FormField`, `FormFieldLabel`, `Input` / `Select`, and `FormFieldError` (Base UI Field, from `ui/extensions/form-field`) with React Hook Form `Controller`; `ProfileFormClient` renders the Base UI `Form`.
- Match each independently named `*-field.tsx` to its literal React Hook Form `Controller name`. For example `name="displayName"` is implemented by `ProfileDisplayNameField`, while the label may simply read "Name".
- A reusable form can accept strongly typed `UseFormProps<Values>`, but
  never pass DOM attributes or `onSubmit` into `useForm`: they are not
  `UseFormProps` options. The current `ProfileFormClient` receives only
  DOM form props, while `useProfileFormClient` owns `useForm` options and
  the submit callback.
- A screen/controller owns asynchronous data loading; only mount a form with prepared defaults or deliberately use RHF `values` / `reset` to synchronize subsequent changes. After successful client Firebase mutations, reset the form to the persisted values without clobbering unsaved edits.
- Avatar file selection and preview remain a separate field, since `File` / `FileList` need application-level lifecycle handling.
- The profile follows native shadcn/ui composition: `ProfileCard` is a
  thin `Card` adapter forwarding primitive props and children, without
  loading data. `ProfileSectionClient` composes `ProfileCard` with
  `ProfileFormClient`, Card header/content/footer, and Form content/footer.
  `ProfileFormClientContent` provides one `FieldGroup` with the avatar,
  display name, email, locale, and theme fields as direct children.
  `ProfileFormClient` owns `FormProvider` and one native `<form>`;
  the form uses `--card-spacing` to preserve the Card layout.
- UI primitives already provided by shadcn/ui (`FieldGroup`, `FieldSet`, `FieldLegend`) are preferable to splitting basic fields into arbitrary grouping components without a semantic responsibility.
- `InputGroup` requires `InputGroupInput` or `InputGroupTextarea`, never raw `Input` or `Textarea`. Interactive buttons or text inside inputs use `InputGroupAddon`.
- Option sets containing 2 to 7 choices use `ToggleGroup` + `ToggleGroupItem` rather than multiple `Button` elements with manual active state.

## Profile behavior ownership

- `useProfileStatus` returns `isLoading`, `isHidden`, and `isError` flags,
  plus resolved `message` and `userId` payloads. The section renders the
  applicable branch from these flags without completing error messages itself.
- `useProfileController` is removed. `ProfileSectionClient` uses
  `useProfileSectionClient` to compose session and status hooks with
  translations; it does not assemble field or button props.
- `ProfileFormClient` delegates its React Hook Form lifecycle to
  `useProfileFormClient`, which calls `useProfileSubmit` for persistence.
  Read `formState.isSubmitting` instead of keeping a second saving flag;
  `ProfileValues` and `ProfileFormValues` live in
  `src/app/(protected)/profile/_lib/definitions.ts`; persistence lives in the sibling
  `data.ts` module.
  `saveProfile` accepts typed `ProfileDependencies` with default Firebase
  adapters to test persistence without production services.
- `ProfileAvatarFieldClient` uses `useProfileAvatarFieldClient` for field state and avatar display data, with `useProfileAvatar` handling validation and preview. Only the selected `File` lives in React Hook Form so submission can upload it; preview URLs are released on replacement, successful reset and unmount. Failed saves retain the selection for retry.
- `ProfileFormClientContent` and `ProfileFormClientFooter` are colocated
  exports in `profile-form-client.tsx`; AST safety checks inspect each
  function independently. The content owns the **one** `FieldGroup`:
  do not wrap the individual profile fields in another `FieldGroup`.

## Profile form action safety (repository guard)

- `ProfileCard` renders one native shadcn `Card` as its sole root and
  forwards children and applicable primitive props. `ProfileSectionClient`
  composes its header, content, and footer, renders the discriminated status,
  and shares loaded session data through `ProfileSessionContext`.
  `ProfileFormClient` owns the only HTML `<form>` inside the Card under
  `FormProvider`; do not render a second Card.
- `ProfileCardHeader`, `ProfileCardTitle`, `ProfileCardDescription`,
  `ProfileCardContent`, and `ProfileCardFooter` share
  `profile-card.tsx` and forward their native primitive props.
  `ProfileCardContent` owns `CardContent`; `ProfileFormClientContent`
  owns the **only** `FieldGroup`. `ProfileCardFooter` owns the one
  native `CardFooter`; `ProfileFormClientFooter` owns only the action
  layout. Both are inside the same native form from `ProfileFormClient`.
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
  `profile-card.tsx`. `ProfileSectionClient` composes the content;
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

## React Form Actions are not a migration

Preserve the React Hook Form and Firebase profile architecture. Upstream React `<form action>` examples are explanatory, not a request to migrate. Preserve controlled and React Hook Form-owned values when using `requestFormReset`.

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
