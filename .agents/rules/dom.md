---
trigger: model_decision
description: "Read when changing HTML/SVG semantics, refs, portals, imperative browser integration, or Fragment refs."
---

# DOM integration

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing HTML/SVG semantics, refs, portals, imperative browser integration, or Fragment refs.

## HTML and SVG

Keep native elements distinct from built-in React components. Use semantic
structure (`div`, `section`, `main`, `article`), navigation (`nav`, `a`), text
(`p`, `span`, `h1`-`h6`), forms (`form`, `input`, `select`, `textarea`), grouping
and labels (`label`, `fieldset`, `legend`), and native UI (`dialog`, `details`,
`summary`) according to their accessibility and behavior contracts.

React 19 supports rendering `<title>`, `<meta>`, and `<link rel="stylesheet">`
within components, hoisting them automatically into the document `<head>`.
Stylesheets accept a `precedence` attribute to manage cascade ordering.
Scripts with the `async` prop are also hoisted and deduplicated.
Treat these capabilities as native React 19 features while coordinating document
heads and layouts with Next.js framework conventions. Preserve proper handling
of `script`, `style`, and `img` and SVG elements such as `svg`, `path`, and
`circle`. React escaping does not make arbitrary HTML or URLs safe. Review
labels, keyboard behavior, native props, focus, and controlled-input semantics
at the actual usage boundary.

## Fragment refs

Use an explicit `Fragment` ref for grouped DOM interaction when it avoids a
wrapper needed only for a ref. Shorthand Fragments cannot carry that prop.
Understand all supplied `FragmentInstance` capabilities:

| Methods | Required guidance |
| --- | --- |
| `addEventListener`, `removeEventListener`, `dispatchEvent` | Preserve event semantics and remove owned registrations. |
| `focus`, `focusLast`, `blur` | Verify focus across eligible descendants and accessible keyboard flows. |
| `observeUsing`, `unobserveUsing` | Pair supported observer registration and cleanup. |
| `getClientRects`, `getRootNode` | Respect Fragment geometry/root semantics instead of assuming one wrapper element. |
| `compareDocumentPosition` | Exists in installed renderer source but is absent from installed Fragment types; resolve that mismatch before typed usage. |
| `scrollIntoView` | Follow the installed optional-boolean signature and test grouped scrolling behavior. |

Do not hide a runtime/type mismatch with an unchecked cast or replace semantic
wrappers without evaluating layout/accessibility. Method presence is not a
browser behavior test.

Preserve portal event/focus semantics. Use `flushSync` only for necessary external
integration. Refs hold non-rendering values; writes do not trigger renders.
In React 19, a ref callback may return a cleanup function that runs when the
element unmounts or before the ref is called again with a new node. Avoid returning
non-function values from ref callbacks: arrow functions with implicit returns (such
as `ref={node => map.set(id, node)}`) can trigger runtime errors because React
attempts to invoke the return value as a cleanup function. Always use an explicit
block body when not returning a cleanup.
Follow [DESIGN.md](../../DESIGN.md) and [TESTING.md](../../TESTING.md) for accessibility
and responsive behavior. Coordinate document head behavior with route metadata.
The framework owns client roots and hydration; do not create parallel application roots.
