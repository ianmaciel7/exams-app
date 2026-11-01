# ADR 0030: Use one loading indicator and one loading marker

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

Route and session loading showed several spinners (a primitive, a labeled spinner,
and an overlay), so navigation to the profile flashed two indicators, shifted the
layout, or lost the indicator across a root Suspense boundary. Pull requests 36,
40 to 44, 46 and 56 fixed it step by step.

## Decision

- One `GlobalLoadingIndicator` renders the only visible, labeled loading state.
- Each loading boundary (`loading.tsx`, the protected guard, and client session
  waits) renders an empty `LoadingState` marker that tells the indicator a
  transition is pending. A boundary never draws its own spinner.
- The ast-grep rule `no-inline-loading-state` blocks a hand-made loading state.
- Playwright records every visible spinner frame across real App Router and
  Firebase auth transitions on a viewport matrix, so a second indicator or a
  layout shift fails the suite.

## Consequences

- A new route only adds a marker and gets the right feedback.
- Loading looks the same everywhere, and the indicator does not shift the layout.
- The state inventory lives in [docs/ui-state-feedback.md](../ui-state-feedback.md).
