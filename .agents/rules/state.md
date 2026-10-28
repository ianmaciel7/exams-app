---
trigger: model_decision
description: "Read when changing local state, reducers, context, derived values, or external stores."
---

# State ownership

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing local state, reducers, context, derived values, or external stores.

- Prefer `useState` for independent state and pure `useReducer` transitions for related state.
- Use functional updates when a change depends on the previous value. Do not mutate snapshots.
- Derive values during render instead of mirroring them with state and Effects.
- Lift shared state to its owner; custom hook calls share logic, not a state instance.
- Keep context intentional; it does not establish authorization.
- Use stable external-store subscriptions and snapshots with server/hydration agreement.
- Preserve explicit profile status flags without duplicating derived state or React Hook Form submission state.

See [hooks](hooks.md) for project behavior ownership and [forms](forms.md) for form-owned state.
