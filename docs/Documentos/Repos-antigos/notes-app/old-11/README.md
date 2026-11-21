# Notes App

Current foundation for the Notes App. The repository provides the Next.js
application shell, shared UI primitives, Firebase Authentication, local Firebase
emulators, Firestore browser persistence, and the initial user-owned Space slice
(create, list, switch, and protected Space routing).
The current scope is defined in [`INTENT.md`](./INTENT.md).

## Getting Started

Prerequisites: a current Node.js LTS release and pnpm 11.20.0, pinned by
`packageManager` in `package.json`. Command examples use RTK; if RTK is unavailable,
follow the direct-execution fallback in [`RTK.md`](./RTK.md).

```bash
rtk pnpm install
rtk pnpm dev
```

Open http://localhost:3000.

## Development

The broader notes/object domain is not implemented yet; `Space` is the first
product-domain entity currently available. Shared UI can be explored with Ladle:

```bash
rtk pnpm ladle
```

For contribution checks and pull-request expectations, use
[`CONTRIBUTING.md`](./CONTRIBUTING.md). AI coding agents should start with
[`AGENTS.md`](./AGENTS.md).

### Local verification

Biome is the repository's only formatter/linter for project-owned code.
`src/components/ui/` is registry-managed and excluded from the project-wide
style gate. Git hooks keep normal local feedback incremental:

```bash
rtk pnpm check:push
rtk pnpm check:fast
```

Use `check:push` for the pre-push-sized gate and `check:fast` at task end or
handoff. `check:ci` is the complete deterministic verification surface.

## Documentation

- [`INTENT.md`](./INTENT.md) — product purpose, scope, non-goals, and open questions
- [`docs/product-specs/index.md`](./docs/product-specs/index.md) — detailed requirements, invariants, phases, and decisions
- [`docs/exec-plans/README.md`](./docs/exec-plans/README.md) — durable plans for complex work
- [`CONTEXT.md`](./CONTEXT.md) — domain vocabulary
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system structure and boundaries
- [`CONVENTIONS.md`](./CONVENTIONS.md) — code-writing rules
- [`DESIGN.md`](./DESIGN.md) — design system and UI language
- [`TESTING.md`](./TESTING.md) — test and verification strategy
- [`SECURITY.md`](./SECURITY.md) — security posture and security tooling
- [`CONSTRAINTS.md`](./CONSTRAINTS.md) — non-regression quality floor
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — contribution, Git, and PR workflow
- [`AGENTS.md`](./AGENTS.md) — agent routing and always-on contract
- [`RTK.md`](./RTK.md) — RTK-specific command-wrapper guidance
- [`TOOLING.md`](./TOOLING.md) — repository tooling, guards, and MCP catalog

## License

Unlicensed / private.
