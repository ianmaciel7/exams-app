---
trigger: model_decision
description: "Read when changing identity, session cookies/tokens, protected access, or post-auth navigation."
---

# Authentication and authorization

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing identity, session cookies/tokens, protected access, or post-auth navigation.

Authentication helpers remain flat modules under `src/lib`: use `auth.ts`,
`session.ts`, and `return-url.ts`. Do not create `src/lib/auth/` for these
modules; `auth.ts` owns authentication operations, `session.ts` owns the
active Firebase session, and `return-url.ts` owns safe post-auth navigation.

## Protected access

- Authenticate identity and authorize the requested operation independently.
- Keep `dal.ts` as the boundary for sensitive/protected data access.
- Validate remotely supplied arguments and caller permissions on every Server Function and handler.
- Keep credentials and private resources on the server; context and optimistic UI grant no access.
- Preserve safe post-auth navigation through `return-url.ts`.
- Follow [SECURITY.md](../../SECURITY.md) and the actual Firebase rules and token-verification implementation.

See [data.md](data.md) for persistence taxonomy and [boundaries.md](boundaries.md)
for runtime imports and serialization.
