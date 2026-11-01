# ADR 0027: Build forms on Base UI Form and Field

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

Forms mixed raw `<form>` and `<label>` elements, manual `htmlFor` wiring, and
ad hoc error text. Accessible names, error association, and native validation
differed from one form to the next. The profile form (pull request #60) and the
Firebase authentication forms (pull request #63) moved to one model.

## Decision

- Forms use the Base UI `Form` and `Field` primitives through the owned wrappers in
  `src/components/ui/extensions/` (`form`, `form-field`, `form-error`). Labels, descriptions, and
  errors are associated by Base UI instead of by hand.
- The profile keeps a single React Hook Form instance wrapped in `FormProvider`; each field
  composes `FormField`, the input, and `FormFieldError` with a `Controller`.
- ast-grep rules in `.ast-grep/rules/forms/` block raw `<form>` elements, manual label wiring, a
  missing `autoComplete`, and a Server Action without a session check. `pnpm check:forms` and the
  CI gate run them with their snapshot tests.
- Conventions live in [CODING_STANDARDS.md](../../CODING_STANDARDS.md) and
  `.agents/rules/forms.md`; this record keeps the reasoning only.

## Consequences

- Every form exposes the same accessible name, error, and submit-state behavior, and new forms
  that bypass the wrappers fail at commit time.
- Forms depend on the Base UI release that provides `Form` and `Field`.
- The Firebase UI registry forms are now locally edited copies, so a registry update needs a
  manual merge ([ADR 0008](0008-install-firebase-ui-registry.md)).
