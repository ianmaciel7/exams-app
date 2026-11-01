---
trigger: model_decision
description: "Read when changing Suspense, loading/error boundaries, transitions, hydration, or component identity."
---

# Rendering and identity

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing Suspense, loading/error boundaries, transitions, hydration, or component identity.

## Built-in components

| Component | Required implementation/review guidance |
| --- | --- |
| `Fragment` | Group nodes without extra DOM; use explicit `Fragment` syntax for keys/refs where needed. |
| `StrictMode` | Use development diagnostics to find impure rendering and asymmetric resource setup/cleanup; do not interpret extra development cycles as production transactions. |
| `Suspense` | Use a compatible suspended resource or `lazy` component; an arbitrary Effect fetch does not activate it. Provide separate render-error handling. |
| `Profiler` | Use real render measurements to investigate performance; a configuration check is not a profiling session. |
| `Activity` | Preserve hidden state/DOM while allowing Effect teardown and restart; verify hide/reveal behavior for forms, media, subscriptions, and focus. |
| `ViewTransition` | Coordinate supported updates and `enter`, `exit`, `update`, `share`, and `default` behavior; verify browser support, reduced motion, and fallback presentation. |

Do not replace Error Boundaries with Suspense, Activity, or animation wrappers.
The detailed reference includes lazy loading, preserved-tab state, and visual
transition examples; these are optional capabilities, not mandatory UI features.

## Loading boundaries

The app has one visible loading UI, `GlobalLoadingIndicator`, mounted once in
the root document. Every `loading.tsx`, Suspense fallback, and client guard that
waits renders `<LoadingState boundary="..." />` from `ui/extensions`, an empty
marker that makes `globals.css` reveal the indicator. Do not add a spinner,
overlay, or text to a boundary. For content with a known shape (such as the home
actions), use `Skeleton` blocks that share the final size constant so nothing
shifts. `ast-grep` rule `components/no-inline-loading-state` blocks hand-written
markers.

## Identity, composition, and Error Boundaries

Use `key` to identify siblings and intentional reset boundaries, `children` for
nested composition, and props as component inputs. Keep controlled inputs
controlled throughout their lifetime; let uncontrolled fields retain DOM
ownership. Callback refs can own setup and cleanup; follow the React 19 cleanup and
block-body requirements in [dom.md](dom.md). Hydration must match the initial server output.
Custom hooks share behavior, not a single state instance.

There is no stable native hook for a full Error Boundary. Class boundaries can
use `static getDerivedStateFromError()` and `componentDidCatch()`; preserve valid
framework integrations. Handle asynchronous callbacks and event-handler failures
at their own boundary. Suspense handles suspension, Error Boundaries handle
render failures, Activity manages visibility/state, and ViewTransition animates
visual changes. None substitutes for the others.

Transitions and deferred values do not provide debounce, cancellation, request ordering,
or worker parallelism. Keep text input updates urgent. Profile before manual memoization.
Use [dom.md](dom.md) for ref/resource interaction and [state.md](state.md) for state ownership.
