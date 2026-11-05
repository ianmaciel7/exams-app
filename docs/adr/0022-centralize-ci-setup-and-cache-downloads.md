# ADR 0022: Centralize CI setup and cache downloads

- **Status**: Accepted; amends the setup and job layout of ADR 0010
- **Date**: 2026-11-05

## Context

The CI repeats Node, pnpm and frozen installs in seven jobs. Title validation
alone installs the complete dependency tree. Emulator jobs repeatedly download
Java emulator binaries and the pinned Firebase CLI. Security installs Python
packages and pre-commit environments on each run.

## Decision

Use local composite actions for the common project setup and Java/emulator
cache setup. Keep checkout, permissions, timeouts and verification commands in
the workflow so each job's boundary is visible. Validate PR titles in the static
job using its existing Commitlint installation and environment-bound input.
Remove the standalone UI state check: verify:static already runs it via check:repo.

Cache downloads, not node_modules or test outcomes. Pin actions by full SHA;
key Firebase caches by OS, architecture, CLI version and configuration or lockfile.
Use setup-python's pip cache and a configuration-keyed pre-commit environment
cache. Keep frozen pnpm installs and npm ci on every run, even after cache hits.
Use only the Chromium headless shell for auth tests, which do not specify a channel.

Keep all verification suites and the fail-closed CI result gate. Only optional
manual production smoke may be skipped. Test the actual gate predicate with
success, failure, skipped and cancelled results. Keep PR cancellation and every
main/dev push validation; do not trade protected-branch coverage for speed.

## Consequences

There is one fewer runner and full dependency installation per PR. Warm caches
can reduce downloads; cold runs still work. Cache eviction must not change test
coverage or correctness. No percentage speedup is promised: compare workflow
and job timings across cold and warm runs. Auth E2E remains the critical path.

Sources consulted on 2026-11-05 via Context7 and official web documentation:

- [GitHub dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)
- [Firebase emulator installation and cache path](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Playwright 1.64.1 CI guidance](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/ci.md)
- [Playwright headless shell](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/browsers.md)
