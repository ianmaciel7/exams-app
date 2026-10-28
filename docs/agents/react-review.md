# React review

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

Read this guide when reviewing React behavior and lifecycle changes.

## Implementation and review checklist

- [ ] Keep components pure.
- [ ] Avoid direct props/state mutation.
- [ ] Avoid duplicated derived state.
- [ ] Reduce unnecessary Effects without deleting legitimate synchronization.
- [ ] Clean up subscriptions and external resources, including late results.
- [ ] Follow the Rules of Hooks and the `use` exception.
- [ ] Make custom-hook abstractions useful and focused.
- [ ] Prefer composition over inheritance where appropriate.
- [ ] Use ref props in new React 19 wrappers.
- [ ] Use Actions when appropriate to the actual workflow.
- [ ] Avoid duplicating form-owned state.
- [ ] Respect Server/Client Component boundaries.
- [ ] Validate and authorize Server Functions.
- [ ] Use compatible resources with Suspense.
- [ ] Handle rendering failures with Error Boundaries.
- [ ] Evaluate Compiler eligibility and the actual pipeline.
- [ ] Run supported lint diagnostics.
- [ ] Measure before optimizing.
- [ ] Avoid unnecessary manual memoization.
- [ ] Consider Activity and ViewTransition when needed.
- [ ] Verify accessibility.
- [ ] Test critical behavior, ordering, and lifecycle cleanup.
- [ ] Prefer modern APIs for new code without unrelated legacy rewrites.
