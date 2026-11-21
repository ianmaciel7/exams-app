# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Overview
`exams-app` is a modern Next.js 16 web application built with React 19, TypeScript strict mode, Tailwind CSS v4, and Biome.

## Setup & Commands
- **Install dependencies:** `pnpm install`
- **Development server:** `pnpm dev`
- **Production build:** `pnpm build`
- **Type check:** `pnpm typecheck` (`next typegen && tsc --noEmit`)
- **Lint & checks:** `pnpm lint` (`biome check`)
- **Format code:** `pnpm format` (`biome format --write`)

## Code Style & Conventions
- **TypeScript:** Strict mode enabled. Do not use `any`; define explicit types and interfaces. Anonymous inline prop type literals (`{ ... }`) are prohibited; always declare named, exported interfaces or type aliases (e.g., `ErrorBoundaryProps`, `GlobalErrorProps`).
- **React & Next.js:** App Router idioms. Default to React Server Components (RSC); use `'use client'` only for interactive client state or browser APIs.
- **Styling:** Tailwind CSS v4 utility classes collocated with components.
- **Architecture Simplicity:** Prioritize standard framework features (Server Actions, route handlers, simple helpers). Avoid unnecessary abstraction layers, micro-hooks, or over-engineered design patterns.
- **Formatting:** Comply with project rules defined in `biome.json`.

## Testing & Verification
- Always execute `pnpm lint` and `pnpm build` before finalizing any code modifications.
- Surface edge cases, assumptions, and validation outputs explicitly.
- Keep tests green as test frameworks are added.

## Boundaries & Guardrails
- **Secrets:** Never commit `.env`, credentials, or private API keys.
- **Generated Directories:** Never manually edit files in `.next/`, `node_modules/`, or `.agents/generated/`.
- **Lockfile Integrity:** Never edit `pnpm-lock.yaml` by hand; use `pnpm add` / `pnpm remove`.
- **Scope Discipline:** Keep changes minimal and focused on the user's objective; avoid unrelated refactors.

## Tooling, MCP & Skills
- **CLI Management:** `@agents-dev/cli` orchestrates instructions, skills, and MCP servers across AI runtimes.
- **Config & Servers:** Configured in `.agents/agents.json` (with local overrides in `.agents/local.json`).
- **Skills Catalog:** Documented under `.agents/skills/*/SKILL.md`.
- **Sync Command:** Run `npx @agents-dev/cli sync` (or `agents sync`) after changing `.agents/` configuration. Use `agents sync --check` for drift detection.

## Documentation
- Architecture Decision Records: [`docs/adr/`](docs/adr/)
- Local Next.js Guides: `node_modules/next/dist/docs/`
