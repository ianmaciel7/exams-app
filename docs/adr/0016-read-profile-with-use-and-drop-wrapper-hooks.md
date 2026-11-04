# ADR 0016: Read the profile with use() and drop wrapper hooks

- **Status**: Accepted; amends ADR 0015
- **Date**: 2026-11-04
- **Deciders**: ianmaciel7

## Context

After ADR 0015 the profile form had three layers between Firestore and a field: `useProfilePreferences` (a Suspense read plus a `savedValuesRef`), `useProfileFormClient` (the Action) and `useProfileFormContext` (a one-line `useContext` wrapper). The reviewer found that more indirection than the React and Next.js docs call for: React 19 reads promises and context with `use()` directly, and `useActionState` already carries the last result.

## Decision

- Remove `useProfilePreferences`. `useProfileFormClient` reads the cached profile promise with `use(loadProfile(...))` and evicts it on mount.
- Remove `savedValuesRef`. The last persisted values live in the Action state (`saved`), so the Action diffs against `state.saved` and a failed save leaves it untouched.
- Remove `useProfileFormContext`. Fields read the form-scoped context with `use(ProfileFormContext)`; the context has an idle default so a field outside the form renders empty instead of throwing.
- Keep `useProfileFormClient` as the one orchestration hook. `check:components` requires a component that coordinates `useActionState`, session and the profile read to delegate to its named hook; that stricter project policy stays.

## Consequences

- Two hook modules fewer, and no mutable ref beside the Action state.
- A field outside `ProfileFormClient` no longer fails loudly; the tests and `check:components` cover the profile composition.
