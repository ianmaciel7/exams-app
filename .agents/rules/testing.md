---
trigger: model_decision
description: "Read before testing or changing stateful user journeys, asynchronous interactions, external authentication, cancellation, or recovery."
---

# Behavioral testing and recovery

The authoritative testing strategy and acceptance model are in
[TESTING.md](../../TESTING.md#stateful-user-journeys-and-model-based-acceptance).

Before implementing or changing a user-facing, asynchronous, or multistep
workflow, enumerate the relevant states, events, transitions and transition
pairs. Define success, cancellation, failure, and recovery expectations
independently of the existing implementation. Prioritize risk and document
uncovered transitions. Test critical behavior through observable user outcomes
and an appropriate real integration, not only mocked callbacks.

After cancellation or failure, verify that the user can **retry** the action
without a stuck spinner, disabled control, unauthorized state, or stale session.

The executable safeguard is the relevant behavioral regression in
`tests/firebase-auth.spec.ts`, exercised by the required `auth-emulator`
CI job. Do not skip, weaken, or replace a failing acceptance scenario with
an assertion about implementation details merely to make CI green.

Read [ui-state.md](ui-state.md) for cross-cutting feedback and accessible
presentation guidance. `pnpm check:ui-state` runs in `verify:fast`,
`verify:static`, and the CI `static` job. It catches only direct raw exception
coercion in JSX, form error, and toast sinks; it does not establish complete
interaction coverage or accessibility conformance.
