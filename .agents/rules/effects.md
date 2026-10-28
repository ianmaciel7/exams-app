---
trigger: model_decision
description: "Read when changing external synchronization, subscriptions, cleanup, or asynchronous lifecycle work."
---

# Effects and resources

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing external synchronization, subscriptions, cleanup, or asynchronous lifecycle work.

- Use Effects for external synchronization, not derived values or event-handler work.
- Declare reactive dependencies; do not use Effect Events to hide them or as ordinary handlers.
- Pair subscriptions, timers, observers, listeners, connections, and object URLs with cleanup.
- Release resources that resolve after cleanup and reject obsolete asynchronous results.
- Reserve layout Effects for necessary pre-paint measurement; insertion Effects belong to style libraries.
- Do not assume every Effect runs after paint or that an Effect fetch activates Suspense.
- Preserve a tested loading branch for Firebase Auth subscriptions; do not invent a Promise wrapper.

Verify cleanup, request ordering, and hide/reveal behavior using [TESTING.md](../../TESTING.md#react-rules-and-lifecycle-verification).
