# ADR 0019: Scope profile loading to the screen

- **Status**: Accepted; amends the read ownership in ADRs 0016 and 0018 and Card placement in ADR 0017
- **Date**: 2026-11-04

## Context

The profile reads browser Firebase data once per visit. A global Promise registry
required cache keys, rejected-read retention, mount eviction and explicit retry
invalidation. It could retain failures from an old session and apply preferences
after the requesting screen had gone away. The user requested a simpler design
and clearer placement of route-private modules.

Next.js permits [route colocation](https://nextjs.org/docs/app/getting-started/project-structure#colocation)
without prescribing helper filenames. Its streamed `use()` example starts the
Promise on the server. Browser Firebase remains a client integration; this change
does not move persistence or authorization to a server DAL.

## Decision

- Remove the profile Promise registry. `ProfileClient` owns the read through
  `useProfileClient`, which starts it in an Effect, stops waiting after fifteen
  seconds and discards obsolete results during cleanup.
- Mount `ProfileForm` only with loaded `initialValues`. Preserve `useActionState`,
  submitted values and the pending avatar after a failed save.
- Display the existing `LoadingStatus` while reading. Throw read failures to the
  segment error boundary; retry remounts the loader without cache operations.
- Apply initial preferences once per mounted visit. Activity reconnects preserve
  successful edits, and a new visit reads fresh data.
- Keep Firebase reads and writes in `data.ts`, form mapping in `dto.ts`, and
  contracts and field names in `definitions.ts`. Keep the client Action, shared
  locale synchronization and avatar support in their existing focused modules.

## Consequences

There is no shared profile browser cache or cache eviction API. Each new visit
performs a read. A future need for shared caching, polling or background
revalidation should use a supported client data library rather than restoring a
custom Promise registry. The loading owner and loaded form are separate components;
the rendered Card and form remain the same. Lifecycle regressions cover timeout,
retry, abandoned requests, account switching, fresh visits and Activity reconnects.
