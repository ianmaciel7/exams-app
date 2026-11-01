# ADR 0033: Isolate CI tools from project dependencies

- **Status**: Accepted
- **Date**: 2026-11-01
- **Deciders**: ianmaciel7

## Context

Host scanners and Firebase tooling conflicted with project dependencies:
`firebase-tools` pulled a vulnerable `minimatch` into the lockfile resolution, and
the Gitleaks host scanner ran in jobs that do not need it. Pull requests #39, #50
and #57 isolated them. Pull request #48 added VS Code launch profiles and a shared
security headers module.

## Decision

- CI invokes `firebase-tools` through `npx` and does not add it as a project
  dependency, so its tree stays out of the lockfile. `pnpm` overrides pin
  `minimatch` and `glob` to patched versions so `pnpm audit` passes.
- The Gitleaks host scanner is installed and run only in the `security` job. The
  local pre-commit hook skips it, with a notice, when the binary is missing.
- Local development uses the checked-in VS Code launch profiles for the dev and
  production servers. Security headers and the nonce reader live in one module
  (`src/lib/csp.ts` and its headers module) shared by `next.config.ts` and the Proxy.

## Consequences

- The lockfile stays small and the audit stays green.
- A CI job needs only the tools that it uses.
- Commands and exceptions live in [TOOLING.md](../../TOOLING.md) and
  [SECURITY.md](../../SECURITY.md).
