# React feature selection

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

Read this guide when choosing a React API for a concrete feature.

## Feature selection

| Need | Starting point |
| --- | --- |
| Simple state | `useState` |
| Related complex state transitions | `useReducer` |
| Shared contextual value | `createContext` and `useContext` |
| Compatible async resource | `use` with `Suspense` |
| On-demand component | `lazy` with `Suspense` |
| Action result/pending state | `useActionState` |
| Ancestor form status | `useFormStatus` |
| Temporary feedback | `useOptimistic` |
| External synchronization | `useEffect` |
| Non-reactive Effect logic | `useEffectEvent` |
| External store | `useSyncExternalStore` |
| Controlled non-urgent update | `useTransition` |
| Deferred incoming value | `useDeferredValue` |
| Preserved hidden interface | `Activity` |
| Visual changes | `ViewTransition` |
| DOM access | `useRef` |
| Grouped-child DOM interaction | Fragment refs with verified signatures |
| Modals/overlays | `createPortal` with focus/accessibility integration |
| Render measurement | `Profiler` |
| Development diagnostics | `StrictMode` plus configured lint/Compiler tools |
| Rendering error isolation | Error Boundary |
| Render optimization | Actual profiling and eligible Compiler optimization |

Choose a feature for the actual need; retain simpler working code when a modern
alternative adds no concrete benefit.

## Other modern React APIs

| API | Required implementation/review guidance |
| --- | --- |
| `createContext()` | Define a shared value with explicit provider ownership; keep state and access-control responsibilities clear. |
| `lazy()` | Declare a stable component loader with a compatible module export and Suspense fallback. |
| `memo()` | Use only for a justified render optimization; keep correctness independent of skipped renders. |
| `startTransition()` | Mark non-urgent updates; use `useTransition` when the component needs pending state. |
| `addTransitionType()` | Identify a transition's cause/type inside the supported transition flow. |
| `act()` | Flush React test work through the test runner/library's supported integration. |
| `cache()` | Reuse the cached server function for render/request-scoped sharing; do not assume durable cross-request caching. |
| `cacheSignal()` | Tie supported server work to the cache lifetime; do not use it as a universal client cancellation source. |
| `captureOwnerStack()` | Use for development diagnostics, not production application data or authorization. |
| `use()` | Read a supported resource during component/hook render, including conditionally or in a loop. Never call it in a handler or wrap it in local `try/catch`. |

Provide stable compatible Promises to `use`; do not create a fresh uncached
Promise on every client render. Put rejection handling at an Error Boundary
or another supported resource boundary. Keep the distinction between `cache`
for server call sharing and `useMemo` for a component's render calculation.
Neither establishes authorization or durable server-side cache invalidation policy.

## React DOM and rendering APIs

Apply this rule to React rendering boundaries, DOM integration, form workflows, and Server Component contracts.
Verify installed React/React DOM 19.3.1 capabilities against [official React DOM documentation](https://react.dev/reference/react-dom).

| API group | APIs | Required guidance |
| --- | --- | --- |
| DOM integration | `createPortal`, `flushSync` | Preserve portal focus/event semantics; use synchronous flushing only for a necessary external integration. |
| Resource hints | `prefetchDNS`, `preconnect`, `preload`, `preloadModule`, `preinit`, `preinitModule` | Match the resource and owning framework; avoid speculative or duplicate loading policies. |
| Browser-only subtree | `browser` | Import from `react-dom`, consume through `use` in a compatible Suspense boundary, and handle browser API failures. |
| Form reset | `requestFormReset` | Reset uncontrolled inputs intentionally; preserve controlled and library-owned form values. |
| Client roots | `createRoot`, `hydrateRoot` | Import from `react-dom/client`; let the framework own application roots and hydration. |
| Server streams | `renderToReadableStream`, `renderToPipeableStream` | Respect Web/Node stream contracts and framework ownership. |
| Resuming server rendering | `resume`, `resumeToPipeableStream` | Use compatible postponed render state; these are framework/renderer capabilities. |
| Server strings | `renderToString`, `renderToStaticMarkup` | Understand limited Suspense behavior and that static markup cannot be hydrated. |
| Static rendering | `prerender`, `prerenderToNodeStream`, `resumeAndPrerender`, `resumeAndPrerenderToNodeStream` | Use `react-dom/static` in a supported rendering pipeline; do not replace framework partial prerendering with an isolated recipe. |

`browser` is present in installed React DOM 19.3.1 and its types.
Preserve this correction to the earlier local documentation.
`requestFormReset` is also present even though the input omitted it. A
`"use client"` directive alone does not prevent server prerendering.

## Hooks

Ordinary hooks must be called unconditionally at the top level of a component
or custom hook, before early returns. Do not call them in handlers, loops,
conditions, or ordinary utility functions. `use` has the separate exception in
[React APIs](react-features.md). Apply these purpose-specific rules to all 19 hooks:

| Hook | Required implementation/review guidance |
| --- | --- |
| `useState` | Prefer it for independent local state; use pure functional updaters for changes based on the previous value. |
| `useReducer` | Use a pure reducer for related transitions; return a new state rather than mutating the previous one. |
| `useContext` | Consume an intentional shared context; do not move every local value into Context or use it as authorization. |
| `useActionState` | Model the Action result and pending state; handle validation/failure and preserve the Action's calling contract. Replaces deprecated `useFormState` from `react-dom`. |
| `useOptimistic` | Base temporary feedback on confirmed state and an in-flight Action; provide failure recovery. |
| `useEffect` | Synchronize with an external system; declare dependencies, clean up, and invalidate obsolete async work. Do not use it to mirror derived values or event-handler work. |
| `useLayoutEffect` | Reserve it for measurement/positioning that must precede repaint; prefer `useEffect` otherwise. |
| `useInsertionEffect` | Reserve it for style-library insertion needs, not ordinary application data flow. |
| `useEffectEvent` | Call Effect Events only in their supported local Effect logic; do not use them to hide dependencies or as ordinary handlers. |
| `useRef` | Store DOM references or mutable non-rendering values; do not expect writes to trigger a render. |
| `useImperativeHandle` | Expose a small intentional imperative API, such as focus/reset, while preserving ref and cleanup contracts. |
| `useMemo` | Memoize only an expensive calculation or a justified identity contract; never rely on it for correctness or resource lifetime. |
| `useCallback` | Stabilize callbacks only when a concrete consumer/integration needs that identity. |
| `useTransition` | Mark controlled updates as non-urgent and show pending feedback; keep text-input state urgent. |
| `useDeferredValue` | Defer expensive consumers of an incoming value when the original update is outside their control. |
| `useId` | Associate labels, fields, and descriptions; never generate list keys with it. |
| `useDebugValue` | Supply useful custom-hook diagnostics for DevTools; it does not hold application state. |
| `useSyncExternalStore` | Use a stable subscription and unchanged snapshots; preserve server/hydration snapshot agreement. |
| `useFormStatus` | Import from `react-dom` and call in a descendant of the form being observed. |

Prefer derived values during render to duplicated state plus an Effect. Pair
subscriptions, listeners, timers, observers, object URLs, and connections with
cleanup. Handle a resource that resolves after cleanup by releasing it rather
than attaching it to an obsolete component. A `useEffect` invocation is not
guaranteed always to happen after paint.

`useTransition` controls the update and returns pending state;
`useDeferredValue` defers a consumer's value. Neither supplies debounce,
throttling, cancellation, request ordering, or Web Worker parallelism. Keep
post-`await` state updates inside another transition when required by the
current API. Profile before adding manual memoization.
