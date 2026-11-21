# Contributing

This is a prototype-stage project. `main` is the stable branch; `prototype` is the active development branch. Both are protected by the same CI gate (see below).

## Setup

```bash
pnpm install
pnpm emulators      # Firebase Auth + Firestore emulators, in a separate terminal
pnpm dev            # Next.js dev server at http://localhost:3000
```

Use `localhost`, not `127.0.0.1` — see the "E2E traps" note in [TESTING.md](./TESTING.md).

## Before you start

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together and [CONVENTIONS.md](./CONVENTIONS.md) for day-to-day patterns in `src/` (server-only boundaries, auth/authorization invariants, validation, generated UI rules, styling guardrails).
- Check [intent.md](./intent.md), [spec.md](./spec.md), and [plan.md](./plan.md) for product intent, requirements, and the implementation sequence — most non-trivial features trace back to one of these.
- If you're using an AI coding agent, [AGENTS.md](./AGENTS.md) is the shared source of truth for tooling and enforcement across Antigravity, Claude Code, Gemini CLI, and Codex. It is not optional reading for agents working in this repo.

## Workflow

1. Branch from `prototype`.
2. Make focused changes. Follow [CONVENTIONS.md](./CONVENTIONS.md), especially:
   - Multi-tenancy invariants (`spaceId` scoping, uniform 404s for unauthorized/missing resources) — see [ARCHITECTURE.md](./ARCHITECTURE.md)'s "Multi-tenancy & Isolation Invariants" section and the `tenancy-invariant-check` review whenever you touch Firestore, `object_links`, or MCP tool handlers.
   - Pure business logic goes in `src/domain/`, independent of Firebase/Next.js.
   - Generated components in `src/components/ui/` are excluded from Biome checks and shouldn't be hand-edited; compose app logic in `src/components/recall/` on top of them.
3. Format and lint before committing:
   ```bash
   pnpm format
   pnpm lint
   ```
4. Add or update tests alongside the change (see [Testing](#testing) below).
5. Commit with a [Conventional Commits](https://www.conventionalcommits.org/) prefix (`feat:`, `fix:`, `test:`, `style:`, `refactor:`, `docs:`, `chore:`), matching the existing history.
6. Open a PR against `prototype`. Describe what changed and why; link the relevant `intent.md`/`spec.md`/`plan.md` entry if one exists.

## Testing

Both test layers are expected to pass before merging:

```bash
pnpm test        # node:test — pure domain logic, emulator-backed rule checks
pnpm test:e2e    # Playwright — browser/auth/Firestore/MCP integration
```

See [TESTING.md](./TESTING.md) for what each suite covers, how to run a single spec, and known traps (cold-route timeouts, serial emulator state, OS-specific visual snapshots). New behavior should get a test in the same PR — one test per behavior, not per DOM node.

## CI

`.github/workflows/ci.yml` runs on every PR and on pushes to `main`/`prototype`: install → Playwright browser install → `pnpm lint` → `pnpm test` (against emulators) → `pnpm test:e2e` → `pnpm run build`. A PR won't merge if this gate fails; run the same commands locally before pushing to avoid a red build.

## Code review

- All changes are expected to pass `pnpm lint` cleanly — Biome's `noExcessiveCognitiveComplexity` and cyclomatic-complexity rules are enforced, not advisory.
- Changes touching Firestore reads/writes, `spaceId` scoping, `object_links`, or MCP tool handlers should be checked against the multi-tenancy isolation invariants in [ARCHITECTURE.md](./ARCHITECTURE.md) before requesting review.
- See [SECURITY.md](./SECURITY.md) for how to report a vulnerability rather than opening a public issue.

## Questions

If a convention isn't covered by the docs above, match the surrounding code rather than introducing a new pattern, and raise it in the PR description if it's a real gap.
