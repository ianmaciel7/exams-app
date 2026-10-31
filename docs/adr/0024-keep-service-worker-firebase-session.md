# ADR 0024: Keep the service-worker Firebase session

- **Status**: Accepted
- **Date**: 2026-10-30
- **Deciders**: ianmaciel7

## Context

A review against official Next.js and Firebase guidance compared the existing
service-worker session with session cookies and `FirebaseServerApp`. Next.js
describes cookie sessions, optionally checked in Proxy. Firebase names no single
approach for server-rendered apps. It documents the service worker for carrying
ID tokens, states that it has no CSRF risk, and warns that session cookies can
fall out of sync with client tokens. No protected route renders server data today.

## Decision

- Keep the Firebase Auth service worker as the bridge that carries ID tokens to
  the server, verified by the Admin SDK with revocation checks.
- Do not add Firebase session cookies, which would add a sign-in endpoint and CSRF
  handling.
- Do not add `FirebaseServerApp` until server rendering needs to read Firebase
  data under Security Rules.
- Do not add Proxy for authentication. It can only run optimistic cookie checks,
  and the session travels in a worker-set header.

Revisit this decision when protected data must render on first load, before the
worker controls the tab, because only the client guard covers that request.

## Consequences

- There is no server-side session on a first load without the worker, so
  protected server data must keep using the fail-closed `verifyRole`.
- Each verified request costs a revocation-check round trip and a forced token
  refresh in the worker.
- Current guidance for entry points and caching lives in
  [docs/auth.md](../auth.md) and [the auth rule](../../.agents/rules/auth.md).
