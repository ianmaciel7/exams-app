# ADR 0010: Configure agent ecosystem

- **Status**: Accepted
- **Date**: 2026-10-27
- **Deciders**: ianmaciel7

## Context

Modern software development with AI coding agents requires a disciplined, reproducible, and secure development environment. Without a standardized integration baseline, autonomous agents operate as uncoordinated monoliths: they may use unpinned external tools, produce machine-specific paths, leak background processes, or fail to adhere to project-specific architecture boundaries, coding standards, and verification pipelines.

The repository requires a first-class agent infrastructure that enables multi-agent orchestration, provides symbol-aware semantic code navigation and runtime debugging through the Model Context Protocol (MCP), supplies task-specific engineering skills with locked upstream dependencies, and enforces strict governance rules across all supported agent runtimes.

The same decision also records supporting artifacts that were versioned alongside the ecosystem: `PRODUCT.md` (product context read by the Impeccable design skill), `graphify-out/` (the Graphify codebase graph), `evals/` and `scripts/evals/` (the on-demand tool-usage evaluation suite), the repository guards under `scripts/checks/`, and the Firebase security rules. Without a record, contributors cannot tell which of these are canonical, generated, or CI-owned.

## Decision

We establish a unified agent architecture centered in `.agents/`, governed by `AGENTS.md` and configured across ten layers:

1. **Scoped Agent Integrations (`.agents/agents.json`)**:
   - Scope enabled integrations strictly to `codex`, `claude`, and `antigravity`.
   - Configure `syncMode: "source-only"` to ensure that project-local configuration serves as the canonical source of truth, preventing unintended upstream configuration drift.

2. **Model Context Protocol (MCP) Server Suite**:
   Configure four specialized MCP servers to grant agents native semantic and runtime capabilities:
   - **Serena** (`serena`): Project-local semantic symbol analysis and code navigation executed via `node .agents/scripts/serena-stdio-guard.mjs serena start-mcp-server --project-from-cwd --context=codex`. Wrapped by a custom Node.js supervisor (`serena-stdio-guard.mjs`) that intercepts parent process termination and automatically kills child process trees upon stdio disconnection, eliminating orphan background processes.
   - **Next.js DevTools** (`next-devtools-mcp`): Project-local runtime diagnostics and route structure inspection.
   - **Playwright** (`@playwright/mcp@0.0.83`): Browser automation for validating visual layouts, accessibility, and user flows.
   - **Firebase** (`firebase-tools@15.34.1`): Firebase project management, security rules validation, and local emulator interaction.

3. **Reusable Skill Inventory & Dependency Lock (`.agents/skills/`, `skills-lock.json`)**:
   - Install and maintain fifteen specialized engineering skills under `.agents/skills/`:
     - Engineering workflows: `ask-matt`, `code-review`, `setup-matt-pocock-skills`, `retro`, `project-verify`.
     - Documentation & conventions: `context7-cli`, `project-save`, `project-new-component`.
     - UI, design, & performance: `shadcn`, `impeccable`, `vercel-react-best-practices`.
     - Firebase & security: `firebase-basics`, `firebase-auth-basics`, `emulator-test`, `firebase-rules-review`.
   - External skills are locked with upstream repository sources, file paths, and SHA-256 hashes in `skills-lock.json`.
   - Project-local command skills declare `metadata: { disable-model-invocation: true }` in front matter to prevent unintended autonomous agent execution of destructive or unguided workflows.

4. **Context-Specific Agent Rules (`.agents/rules/`)**:
   - Maintain targeted rule documents structured by domain: `components.md`, `composition.md`, `dom.md`, `forms.md`, `hooks.md`, `react.md`, `rendering.md`, `routes.md`, `data.md`, `auth.md`, `cache.md`, `compiler.md`, `assets.md`, `shadcn.md`, `adr.md`, `docs.md`, and `language.md`.
   - Indexed via `.agents/rules/README.md` to allow agents to selectively load only the rule context relevant to their current task without context window bloat.

5. **Lead Orchestrator Directive (`AGENTS.md`)**:
   - Direct the primary agent to operate as a **Lead Orchestrator** (*Orquestrador Principal*), delegating specialized subtasks to dedicated subagents (`research`, `architect`, `code-reviewer`, `test-engineer`, `security-reviewer`, `doc-maintainer`).
   - Enforce repository portability: strictly forbid hardcoded absolute machine paths (`C:\Users\...`, `/home/...`) in committed code, configuration, or documentation; require relative workspace paths.
   - Enforce English as the standard language for code, comments, documentation, and agent artifacts.

6. **Product context (`PRODUCT.md`)**: keep a root `PRODUCT.md` that follows the
   `impeccable:product-schema 1` layout (platform, users, purpose, positioning,
   capabilities, constraints). It defers visual rules to `DESIGN.md` and
   engineering rules to `CODING_STANDARDS.md` instead of duplicating them. The
   Impeccable and project skill front matter was aligned with this context.

7. **Codebase graph (Graphify)**: version only `graphify-out/graph.json`,
   `graphify-out/GRAPH_REPORT.md`, and the portable `graphify-out/manifest.json`.
   All other `graphify-out/` state is machine-local and ignored. Husky
   `post-commit` and `post-checkout` hooks rebuild the graph, and `.gitattributes`
   registers a merge driver for `graph.json`. The generated `graph.json` is
   exempt from the pre-commit large-file hook.

8. **Tool-usage evaluations (`evals/`)**: keep five read-only scenarios in
   `evals/tool-usage/cases.json` with a schema-constrained receipt
   (`receipt.schema.json`), executed by `pnpm eval:tool-usage` through the Codex
   CLI. Artifacts are written to the ignored `reports/tool-usage-evals/`. The
   runner's own unit test (`pnpm test:evals`) is part of `verify:fast`; the live
   evaluation stays outside CI because it needs an authenticated CLI and is
   non-deterministic.

9. **Firebase security rules ownership**: `firestore.rules`, `storage.rules`, and
   `database.rules.json` are wired through `firebase.json` and reviewed with the
   `firebase-rules-review` skill. They implement the authorization model of
   [ADR 0009](0009-integrate-firebase-authentication.md): owner-only `users/{uid}`
   preferences limited to `locale` and `theme`, an admin read path through the
   `role` custom claim, owner-only avatar uploads capped at 2 MiB
   (`jpeg`/`png`/`webp`), a closed Realtime Database, and a denied legacy
   `usageLogs` collection.

10. **Repository guards and review workflow**: the contract guards under
    `scripts/checks/` run through dedicated scripts, each preceded by its own
    `node --test` regression suite, and are part of `verify:fast`:
    - `pnpm check:routes` keeps `page.tsx`, `layout.tsx`, and `template.tsx` thin.
    - `pnpm check:components` enforces owned-component naming and boundaries.
    - `pnpm check:responsiveness` enforces viewport exports, no zoom restrictions,
      fluid widths up to 320px, and WCAG 2.2 touch targets.
    - `pnpm check:english` enforces the English-by-default policy; locale catalogs
      in `src/messages/` are exempt.
    - `pnpm test:production-smoke` runs the regression tests of the deployed-HTML
      smoke check (`scripts/checks/check-production-smoke.mjs`). The check itself runs
      in the manual-URL `production-smoke` CI job against `PRODUCTION_URL`: it rejects
      private or reserved addresses and verifies a `200` HTML response whose `<html lang>`
      matches each of `en`, `pt-BR`, and `es`.
    - `pnpm check:docs` validates documentation links and the skill inventory
      against `skills-lock.json`.

    `.github/workflows/review-validation.yml` is a manual (`workflow_dispatch`)
    job that runs `verify:fast`, `check:docs`, `check:spelling`, and
    `check:markdown` for current-state review; it is not a required status check.
    `knip.runtime-audit.jsonc` is a narrower Knip configuration scoped to App Router
    entrypoints for runtime reachability audits; `knip.jsonc` remains the default.

*Client-Facing Generative UI*: User-facing AI chat, code blocks, canvas flows, and streaming components in `src/components/ai-elements/` are distributed via the shadcn CLI registry and governed by [ADR 0002: Configure shadcn/ui](0002-configure-shadcn-ui.md).

## Consequences

- **Positive**:
  - Consistent agent behavior across Codex, Claude, and Antigravity environments.
  - Zero orphan process accumulation via the Serena stdio supervisor.
  - Reproducible skill supply chain governed by `skills-lock.json` and verified by `pnpm check:docs`.
  - Focused, context-aware rule selection preventing prompt dilution.
  - Automated verification of skill inventories and documentation links in CI.
  - Generated versus canonical agent artifacts are explicit, and tool-selection regressions can be measured on demand.
  - Product context stays a single short file; Firebase security rules have a documented owner and review path.
- **Negative / Trade-offs**:
  - Upstream skills require manual lock updates and hash recalculation when refreshed.
  - The versioned graph adds merge-conflict surface; run `graphify update .` after `git pull` or `merge`.
  - Live evaluations are not CI evidence and must be rerun manually.
  - MCP tools require runtime host prerequisites (Node.js, pnpm, Python) and local environment credentials when targeting external services.

## References

- [.agents/agents.json](../../.agents/agents.json)
- [.agents/README.md](../../.agents/README.md)
- [.agents/skills/README.md](../../.agents/skills/README.md)
- [skills-lock.json](../../skills-lock.json)
- [AGENTS.md](../../AGENTS.md)
- [TOOLING.md](../../TOOLING.md)
- [PRODUCT.md](../../PRODUCT.md)
- [DESIGN.md](../../DESIGN.md)
- [evals/tool-usage/cases.json](../../evals/tool-usage/cases.json)
- [firebase.json](../../firebase.json)
- [firestore.rules](../../firestore.rules)
- [storage.rules](../../storage.rules)
- [ADR 0009: Integrate Firebase Authentication](0009-integrate-firebase-authentication.md)
- [ADR 0002: Configure shadcn/ui](0002-configure-shadcn-ui.md)
- [ADR 0005: Document Project Standards](0005-document-project-standards.md)
- [ADR 0007: Configure CI](0007-configure-ci.md)
