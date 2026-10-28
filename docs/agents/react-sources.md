# React sources

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

Read this guide when looking up React documentation or verifying evidence.

## Documentation, evidence, and tooling

Consult official React documentation for authoritative reference:

- [React Reference](https://react.dev/reference/react) (hooks, components, and APIs)
- [React DOM Reference](https://react.dev/reference/react-dom) (DOM components, client/server rendering)
- [Rules of React](https://react.dev/reference/rules) (purity, immutability, and hook rules)
- [React Compiler](https://react.dev/learn/react-compiler) (compiler architecture and directives)
- [Server Components and Server Functions](https://react.dev/reference/rsc/server-components)

Resolve the correct topic and installed version before copying an example.
Match [lifecycle verification](../../TESTING.md#react-rules-and-lifecycle-verification)
to real resources, hydration, and hide/reveal behavior. A source lookup,
configuration regression, or lint success is not complete behavior coverage
or profiling. Follow [security guidance](../../SECURITY.md#react-rendering-and-input-boundaries)
at HTML/URL/data boundaries; optimistic UI and context do not authorize access.
