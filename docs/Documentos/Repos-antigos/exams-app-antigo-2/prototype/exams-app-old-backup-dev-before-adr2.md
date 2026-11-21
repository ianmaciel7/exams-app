# exams-app-old-backup-dev-before-adr2

- **Repository:** `https://github.com/ianmaciel7/exams-app-old`
- **Original Branch:** `backup/dev-before-adr2`
- **Commit SHA:** `1db80ad136bbab8720637fbd33315d08bf6a5def`
- **GitHub Reference:** [Commit 1db80ad on GitHub](https://github.com/ianmaciel7/exams-app-old/tree/backup/dev-before-adr2)
- **Git Bundle:** [exams-app-old-backup-dev-before-adr2.bundle](exams-app-old-backup-dev-before-adr2.bundle)

## Purpose & Summary

A critical security and runtime infrastructure release implementing a canonical Next.js 16 Content Security Policy (CSP), HTTP status predicates, guards, response helpers, and distributed tracing via OpenTelemetry SDK.

## Implemented Features

- Strict Content Security Policy (CSP) and HTTP security headers implementation.
- Standardized HTTP guards, status registries, and isomorphic logger hardening.
- OpenTelemetry SDK integration, trace correlation, and structured logging.
- Strict route typings, error boundaries, and 404 handler primitives.
- Upgraded Next.js to 16.4.6 with Turbopack Tailwind CSS module rule fixes.

## Tech Stack

- **Framework:** Next.js 16.4.6, React 19
- **Security & Observability:** Canonical CSP, `@opentelemetry/api`, `@vercel/otel`, Zod
- **Styling:** Tailwind CSS v4, Turbopack
- **Testing:** Vitest, Playwright

## Screenshot

_No screenshot available: this version focused on HTTP security policies, runtime libraries, and distributed tracing rather than UI changes. The visual layout used the default Next.js starter page._

## Restoration Instructions

```bash
git bundle verify exams-app-old-backup-dev-before-adr2.bundle
git clone exams-app-old-backup-dev-before-adr2.bundle -b backup-dev-before-adr2 ./restored-exams-app-old-backup-dev-before-adr2
```
