# ADR 0028: Test security rules and authentication journeys on emulators

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

[ADR 0010](0010-configure-agent-ecosystem.md) made the repository the owner of the
Firebase security rules, but nothing proved that they deny what they should.
Authentication was covered by mocks, so a stale service worker token or a sign-out
race could pass every test. Pull requests #59 and #37 added the missing layers.

## Decision

- `tests/rules/*.test.mjs` run with `node:test` and `@firebase/rules-unit-testing` against the
  Firestore, Storage, and Realtime Database emulators (`pnpm test:rules`). Each rule covers the
  owner, another user, the administrator claim, and anonymous callers. CI has a `rules` job.
- `pnpm check:firebase-rules` fails when a rules file has no test, a matched path is never named
  in its test, a rule allows everything, or CI stops running `tests/rules`.
- Playwright acceptance journeys run against the Auth and Firestore emulators with an independent
  oracle for the stored data (own profile writes allowed, cross-account writes denied, sign-out
  persisted). A Playwright retry that passes fails the CI run, so flaky tests stay visible.
- Stateful features cover each state transition, including cancellation and recovery.

## Consequences

- A rules change without a matching test fails review and CI.
- The `rules` job needs Java and the Firebase CLI, which makes CI slower.
- Details live in [TESTING.md](../../TESTING.md), [TOOLING.md](../../TOOLING.md), and
  `.agents/rules/auth.md`.
