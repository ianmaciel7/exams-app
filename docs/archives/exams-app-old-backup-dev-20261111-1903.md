# exams-app-old-backup-dev-20261111-1903

- **Repository:** `https://github.com/ianmaciel7/exams-app-old`
- **Original Branch:** `backup/dev-20261111-1903`
- **Commit SHA:** `a8d9797ed47bd8d2e2987e12d7bb478841c78671`
- **GitHub Reference:** [Commit a8d9797 on GitHub](https://github.com/ianmaciel7/exams-app-old/tree/backup/dev-20261111-1903)
- **Git Bundle:** [exams-app-old-backup-dev-20261111-1903.bundle](exams-app-old-backup-dev-20261111-1903.bundle)

## Purpose & Summary

A development infrastructure release consolidating MDX tooling, bundle analysis, automated Git/ADR synchronization workflows, and extended AI agent capabilities within the Exams App ecosystem.

## Implemented Features

- Interactive MDX documentation support (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`).
- Bundle analyzer configuration (`@next/bundle-analyzer`) and compilation feature flags.
- ADR synchronization tools (`git-adr-sync`) with remote branch equalization and local worktree cleanup.
- Extended logging telemetry with `@opentelemetry/sdk-logs` and `@opentelemetry/api-logs`.
- Architecture agent skills (`adr-update`, `git-sync-origin`, `grill-with-docs`, `domain-modeling`).

## Tech Stack

- **Framework:** Next.js 16.4.6, React 19
- **Content & Tooling:** MDX 3, Next Bundle Analyzer, Agents CLI
- **Observability:** OpenTelemetry SDK Logs
- **Testing:** Vitest 5, React Testing Library, Playwright

## Screenshot

_No screenshot available: this version focused on MDX compilation, bundle analysis tooling, and agent workflow scripts. The visual layout used the default Next.js starter page._

## Restoration Instructions

```bash
git bundle verify exams-app-old-backup-dev-20261111-1903.bundle
git clone exams-app-old-backup-dev-20261111-1903.bundle -b backup-dev-20261111-1903 ./restored-exams-app-old-backup-dev-20261111-1903
```
