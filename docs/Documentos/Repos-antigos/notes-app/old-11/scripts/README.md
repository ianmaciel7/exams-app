# Repository Scripts

This directory contains deterministic repository automation. The canonical tool inventory and command surface live in [`TOOLING.md`](../TOOLING.md) and `package.json`.

- `guards/`: blocking repository policy and architecture checks. Project guards are the last resort for repository-specific invariants; prefer Biome, TypeScript, dependency-cruiser, Knip, and tests when a standard tool owns the concern.
- `hooks/`: agent/editor hook adapters and hook-specific shared logic.
- `verify/`: cross-cutting verification and health orchestration.
- `tooling/`: adapters around external CLIs.

The `guards/guard-question-types.mjs` check keeps the canonical question type
list synchronized with submitted-answer parsing and the Firestore persistence
rules. It runs through `check:fast` and `test:guards`.

The `scripts/guards/guard-code-health.mjs` check ratchets the Fallow health score,
complexity findings, and large-function count against
`guards/code-health-floor.json`. Metrics may only improve; run
`pnpm run check:health -- --tighten` to lock a gain. It runs through
`check:fast` and `test:guards`.

Keep tests and helper modules beside the entry point they support. Prefer stable `pnpm` commands over direct script paths in contributor-facing documentation. Scripts must use repository-relative paths, avoid secrets, remain non-interactive in CI, and avoid product-domain behavior.

## Compatibility entry points

Root-level wrappers are retained only when installed third-party skills reference legacy script paths. New project-owned code and documentation should use the grouped paths above.

- `scripts/floor-guard.mjs` delegates to `scripts/guards/floor-guard.mjs`.
- `scripts/verify-health.mjs` delegates to `scripts/verify/verify-health.mjs`.
