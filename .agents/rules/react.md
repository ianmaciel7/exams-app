---
trigger: model_decision
description: "Read when changing React render logic, hook call order, API compatibility, or adopting experimental APIs."
---

# React correctness

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing React render logic, hook call order, API compatibility, or adopting experimental APIs.

## Rules of React

Keep render pure and idempotent: equivalent inputs must produce equivalent
results without externally visible effects. Treat props, state, context, and
hook inputs/results as immutable snapshots. Use setters/reducers and copied
values instead of mutating received data. Newly created local values can be
assembled locally without mutating a prior snapshot.

Keep side effects in appropriate event handlers or Effects. Call ordinary
hooks only at the top level of React functions. Let React call components
through JSX instead of invoking them as ordinary functions. Prefer explicit
composition for reusable UI and behavior. Keep component types at module
scope and keys stable by data identity. Do not mislabel stricter repository
component orchestration or route policies as universal React requirements.

## Experimental APIs

Treat `experimental_taintObjectReference` and `experimental_taintUniqueValue`
as experimental server/client data-boundary tools, not stable default exports.
Check the runtime channel and framework integration before use. Object/value
tainting cannot replace authentication, authorization, input validation, or
control of sensitive derived data. Do not adopt an experimental dependency
simply because a live reference describes it.

Verify APIs against installed packages and types before copying live examples.
Use `package.json` and the lockfile for versions. Preserve working code and choose
the simplest supported abstraction. Upstream examples do not authorize upgrades,
new skills, renderer migrations, or changes to project policy.

See [React sources](../../docs/agents/react-sources.md),
[version applicability](../../docs/agents/react-versions.md), and
[review checklist](../../docs/agents/react-review.md) only when needed.
