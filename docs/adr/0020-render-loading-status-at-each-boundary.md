# ADR 0020: Render LoadingStatus at each boundary

- **Status**: Accepted; supersedes only the loading-indicator decision in ADR 0002 (former ADR 0030)
- **Date**: 2026-11-04

## Context

The loading section of ADR 0002 recorded a global visible indicator, empty
`LoadingState` markers, and a frame-by-frame Playwright probe. Development
replaced that coordination with direct `LoadingStatus` fallbacks. This record
captures the replacement without rewriting the accepted historical decision.
ADR 0019 separately owns the profile browser read lifecycle.

Next.js supports segment loading fallbacks and React supports Suspense fallbacks;
neither requires a global marker registry. A fixed shared primitive keeps the
loading presentation consistent while each boundary owns when it appears.

## Decision

- Render the existing `LoadingStatus` directly from the root and profile
  `loading.tsx` files, Suspense fallbacks, and waiting client guards. Do not add
  route loading files to segments without a useful suspension boundary.
- Keep one full-viewport loading primitive, with its translated label, status
  semantics, fixed small-viewport position, and reduced-motion support.
- Remove `GlobalLoadingIndicator`, `LoadingState` markers, the CSS `:has()`
  reveal mechanism, the `no-inline-loading-state` ast-grep rule, and the
  frame-by-frame Playwright probe. These are historical mechanisms, not the
  current loading architecture.
- Keep the current behavioral inventory in
  [UI state feedback](../ui-state-feedback.md) and the current boundary guidance
  in [rendering rules](../../.agents/rules/rendering.md#loading-boundaries).

## Consequences

Loading ownership is visible where the wait happens, without a global registry.
Multiple boundaries can mount the same primitive; this design no longer claims
the former global guarantee that exactly one spinner exists in the DOM. Existing
loading primitive and route tests cover the shared output, while profile
lifecycle tests cover browser loading, error and retry transitions. Browser
accessibility and visual suites remain the broader integration safeguards.

## References

- [Next.js loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [React Suspense](https://react.dev/reference/react/Suspense)
