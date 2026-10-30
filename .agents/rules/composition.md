---
trigger: model_decision
description: "Read when composing owned component families, forwarding primitive props, or defining children slots."
---

# Component composition

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when composing owned component families, forwarding primitive props, or defining children slots.

## Composition matching local shadcn/ui primitives

Use `src/components/ui/card.tsx`, `button.tsx` and `field.tsx` as reference implementations for application-owned components:

- Use a local named function followed by an explicit named export. Prefer `ComponentProps<typeof Primitive>` or `ComponentProps<"element">` for wrappers that forward standard element props. Specialized third-party component contracts (such as `UseFormProps`) are also valid when that is the real component API.
- Forward applicable `className` and `...props` to the underlying component; use `cn(..., className)` for application-specific styles. Do not blindly spread HTML attributes into `useForm`.
- Use `children` for genuine component composition, as in `Card` and `FieldGroup`. The compound `ProfileFormClient` accepts independent fields as
  `children` under one `FormProvider` context.
- Keep application-owned Card adapters **composable**: `ProfileCard`, `ProfileCardHeader`, `ProfileCardTitle`, `ProfileCardDescription` and `ProfileCardContent` each forward native Card primitive props and `children`; see [forms.md](forms.md#profile-form-action-safety-repository-guard) for the profile form hierarchy and slot invariants. The form content and footer remain children of the same native `<form>`. Do not confuse an application view that renders a Card with a Card primitive wrapper.
- Fields connected via `Controller name="displayName"` must use the semantically matching component/file name `ProfileDisplayNameField` / `profile-display-name-field.tsx` (see [forms.md](forms.md#compound-forms)). The component may expose a friendly display label without renaming the Firebase field.
- Prefer narrow component props; do not hand `ProfileFormClient` or `ProfileAvatarFieldClient` the
  entire profile controller as a `profile` prop.
- `FieldGroup`, `FieldSet`, `Field` and `Controller` are real primitives/API integrations; do not introduce arbitrary *Fields wrapper components solely for visual grouping.
- The family-root and root-prefixed-part convention applies to every owned module, including Server and Client Components. The profile Card and Form retain exact-part guards on top of the general contract. Upstream shadcn/ui files also export related primitives together; generated registries remain unchanged.
Use the installed [shadcn skill](../skills/shadcn/SKILL.md) for Base UI,
button/icon, styling, containment, and chat rules. Keep local changes consistent
with [shadcn.md](shadcn.md).

The TypeScript AST guard checks literal Controller names against owned `*-field.tsx` filenames and prevents whole-controller `profile` props on the profile components listed above. These checks cannot judge all component responsibilities and do not inspect dynamic Controller names.

References: [shadcn/ui Field](https://ui.shadcn.com/docs/components/field), [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form), [React Hook Form FormProvider](https://react-hook-form.com/docs/formprovider).

## General composition contract

[CODING_STANDARDS.md](../../CODING_STANDARDS.md#compound-components-and-serverclient-boundaries)
owns the explanation, examples, and Server/Client distinctions for all owned
components. [Guard coverage](../../CODING_STANDARDS.md#composition-guard-coverage)
defines the automatically enforced subset and its limitations. A module without
`"use client"` may still belong to a client import graph. Presentation modules
keep names without a suffix, whether interactive or compatible with both environments.
Integration responsibilities determine suffixes; directives determine boundaries.
Do not invent parts for simple components. Compound parts use separate named
exports instead of static properties on the root function.

## UI companion composition

Integration modules (`*-client.tsx` / `*-server.tsx`) must compose their companion UI presentation component (without suffix, e.g. `HomeClient` composes `Home`). Presentation compound parts belong to the presentation UI family without suffixes (`HomeContent`, `HomeLogo`, `HomeHeading`, `HomeFooter`), while the integration boundary orchestrates state, hooks, and actions.
