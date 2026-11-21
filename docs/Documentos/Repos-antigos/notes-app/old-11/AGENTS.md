<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Scope and precedence

This file applies repository-wide unless a nearer `AGENTS.md` exists. Nested files
inherit these rules and contain only local additions or overrides; the nearest file
wins on conflict. Explicit user instructions take precedence.

Preserve marked tool-generated blocks verbatim.

## Operating contract

- Treat the repository as ground truth; inspect before assuming.
- Keep this file routing-oriented. Target <= 12,000 characters; hard maximum
  16,000 UTF-8 bytes.
- Ownership rules (one fact, one canonical owner): `.agents/skills/context-manager/SKILL.md`.
- Documentation, specs, and execution plans MUST be in English unless the user requests otherwise (`CONTRIBUTING.md`).

## Context routing

Read only the owner relevant to the task:

| Need | Canonical owner |
| --- | --- |
| Human setup and project entry point | `README.md` |
| Product scope, goals, non-goals | `INTENT.md` |
| Product requirements, invariants, phases, decisions | `docs/product-specs/index.md` |
| Complex multi-step work state | `docs/exec-plans/README.md` |
| Domain language and concepts | `CONTEXT.md` |
| Bounded contexts | `CONTEXT-MAP.md` |
| Entity-relationship model & Firestore schema | `DER.md` |
| Architecture and boundaries | `ARCHITECTURE.md` |
| Code-writing rules | `CONVENTIONS.md` |
| UI/UX system | `DESIGN.md` |
| Testing and verification strategy | `TESTING.md` |
| Security posture | `SECURITY.md` |
| Blocking quality floors | `CONSTRAINTS.md` |
| Contribution, Git, and PR workflow | `CONTRIBUTING.md` |
| Tool catalog & capabilities | `TOOLING.md` |
| Search, discovery, and navigation hierarchy | `.agents/rules/search-and-discovery.md` |
| Lead Orchestrator, squads & graph-driven task graph | `.agents/rules/orchestration.md`, `.agents/rules/squads.md` |
| ADR implementation & planning guard | `.agents/rules/adr-implementation-guard.md` |
| Emoji prohibition & icon standards | `.agents/rules/no-emojis.md` |

The complete ownership/boundary map is canonical in
`.agents/skills/context-manager/SKILL.md`.

## Tool routing

Use the smallest specialized project-configured tool that fits the task. Do not
replace it with a broader manual workflow for convenience, familiarity, speed, or
token savings.

| Need | Route |
| --- | --- |
| **Any shell command** | **`rtk <command>`** — see `RTK.md`; direct execution is the fallback only under conditions documented there |
| File discovery / exact text | **Serena MCP** (`search_for_pattern`, `find_file`), Filesystem MCP, then `rtk rg` |
| Cross-file architecture / dependencies | **Graphify first** when `graphify-out/` exists; see `.agents/skills/graphify/skill.md` |
| Broad portable repository snapshot | **Repomix** with `repomix.config.json`; do not manually concatenate files |
| Unfamiliar source outline | `ast-grep outline` — structural map before reading full source |
| Structural AST pattern search | `ast-grep run` / `ast-grep scan`; see `.agents/skills/ast-grep/SKILL.md` |
| Symbols / references / rename / semantic edits | **Serena MCP** (`mcp-server-serena`); falls back to `rg` only when Serena is unavailable |
| Git operations | **git MCP** (`mcp-server-git`); falls back to `rtk git <command>` |
| File read / write via MCP | **filesystem MCP** (`@modelcontextprotocol/server-filesystem`) |
| HTTP fetch / web content | **fetch MCP** (`mcp-server-fetch`) |
| Lint / format / import organization | `rtk pnpm lint` (Biome); see `.agents/skills/biome/SKILL.md` |
| Add / search / update shadcn components | `rtk pnpm dlx shadcn@latest`; see `.agents/skills/shadcn/SKILL.md` |
| Module boundary / circular-dep check | `rtk pnpm run deps:check` (dependency-cruiser); see `.agents/skills/dependency-cruiser/SKILL.md` |
| Security / bug pattern scan | Semgrep; see `.agents/skills/semgrep/SKILL.md` |
| MCPs / integrations / agent config | `agents` CLI; source is `.agents/agents.json` |
| Current library / API documentation | Context7 (`ctx7 library` → `ctx7 docs`); see `.agents/skills/context7-cli/SKILL.md` |
| Reusable UI isolation / story preview | Ladle (`rtk pnpm ladle`); see `.agents/skills/ladle/SKILL.md` |
| Focused local edit | `apply_patch` when available |

### Command execution invariant

The Tool routing table above is mandatory (RTK exceptions in `RTK.md`). Details: `.agents/rules/command-invariants.md`, `.agents/rules/search-and-discovery.md`, `.agents/rules/documentation-sync.md`.

When an agent exposes a configured MCP, use it. Bypassing requires stating the reason and using the narrowest fallback.

## Skill routing

Project skills live under `.agents/skills/`. Load the most specific skill whose trigger matches the task, and read its SKILL.md first; never infer behavior from its name.

| Trigger | Skill |
| --- | --- |
| Codebase question; cross-file architecture (`graphify-out/`) | `graphify` |
| Biome, lint, format, import sort, lint config | `biome` |
| shadcn add / search / style / debug; `components.json` | `shadcn` |
| Search community shadcn registry (Shoogle) | `search-registry-items` |
| Component story / Ladle dev / visual preview | `ladle` |
| Module boundary violation; circular dependency | `dependency-cruiser` |
| Security scan; bug pattern; Semgrep rule | `semgrep` |
| Library API docs; unfamiliar SDK; version migration | `context7-cli` |
| AST structural search; pattern matching across files | `ast-grep` |
| Structural map of a file or directory before editing | `ast-grep-outline` |
| Control doc create / audit / sync | `context-manager` |
| Verify markdown docs: links, paths, routing | `verify-docs` |
| React composition; compound components; render props | `vercel-composition-patterns` |
| React / Next.js performance; bundle; data fetching | `vercel-react-best-practices` |
| RTK setup / troubleshoot; `RTK.md` integration | `rtk-cli` |
| MCP config/runtime issues; `agents` CLI | `mcp-troubleshooting` |
| Create / edit / eval a skill | `skill-creator` |
| Domain modeling; ubiquitous language; ADR | `domain-modeling` |
| Implement work from a spec or tickets | `implement` |
| Stress-test a plan interactively | `grilling` |
| Code review since a branch/commit | `code-review` |
| Broad repository snapshot; `repomix.config.json` | `repomix` |
| Unit / component tests; Vitest; mocking; coverage | `vitest` |
| Git workflow, branching, release tagging | `git-workflow-and-versioning` |
| Conventional commit messages and staging | `git-commit` |
| Persist a rule, decision, term, or procedure | `save-info` |
| Scout prior art in `.worktrees/old-*` | `find-worktrees` |
| Guide through engineering skill workflows | `ask-matt` |
| Scaffold repo configuration for engineering skills | `setup-matt-pocock-skills` |
| Manage multi-agent config via `agents` CLI | `agents-dev-cli` |
| Official docs into an implementation checklist | `docs-research` |
| Scaffold a shadcn/Base UI component with story and test | `new-component` |
| Create and maintain agent skills | `skill-guide` |
| Agent eval runs and report comparison | `eval-harness` |
| Firebase Auth emulator, seeds, auth test env | `firebase-setup` |
| Firestore rules or schema change; `firestore.rules` | `firestore-rules-change` |
| Health check: quality, tests, context, token savings | `verify-health` |
| Verify code against `CONVENTIONS.md` / `CONSTRAINTS.md`; quality gates | `verify-code` |

Treat project-owned skills and `skills-lock.json` as controlled configuration.
Do not edit, add, refresh, replace, or remove remote skills unless requested by the user.
Follow the applicable skill-management workflow for lifecycle and lock updates.

## Change workflow

Before changing code:

1. Inspect the working state and relevant files; read only task-relevant owners/skills. For non-trivial multi-file work, partition it with Graphify and dispatch squads per `.agents/rules/orchestration.md`.
2. For Next.js work, follow the generated Next.js instructions at the top of this file.
3. For third-party behavior, use the documentation skill before relying on memory.
4. **shadcn-first for UI**: Prefer existing shadcn/ui components (`src/components/ui/`) over custom markup or ad-hoc wrappers. Application components stay simple and domain-named. Use Base UI `render` for behavioral composition instead of custom `renderX`/`asChild` APIs, and search registries (`rtk pnpm dlx shadcn@latest search`) before building from scratch.
5. **No ADR implementation without an active plan**: before modifying `src/` for an ADR, create an execution plan (`docs/exec-plans/active/`) or decompose via `/to-spec` -> `/to-tickets` (see `.agents/rules/adr-implementation-guard.md`).

While changing code:

- For project-owned application UI, also follow `.agents/rules/component-composition.md`.
- Follow existing patterns and the canonical owner for the affected context.
- Dedicated hooks own stateful behavior: if `Component` has `useComponent`, keep its state, effects, refs, transitions, navigation, and derived handlers there; the component only renders and composes.
- Prefer focused edits; do not edit generated outputs directly.
- Keep affected canonical documentation aligned with the implementation.
- When an execution plan is active, follow the lifecycle in `.agents/skills/implement/SKILL.md`.

## Decision boundaries

Agents may inspect the repository, make requested local edits, run relevant local checks, and fix failures from their own changes without repeated approval.

Never write hardcoded absolute machine paths into committed files, docs, or scripts.
Use repository-relative paths only (see `.agents/rules/path-portability.md`).

Destructive history rewrites, deployments, secret rotation, billing changes, and
other external side effects require explicit user intent.

## Verification routing

Use `CONSTRAINTS.md` for blocking floors, `TESTING.md` for strategy, and `CONTRIBUTING.md` for pre-PR checks. Run the smallest risk-appropriate set.

Do not weaken quality controls or bypass hooks/checks (`--no-verify`, lowered thresholds, removed tests, new suppressions) merely to obtain a pass.

## Definition of done

A task is complete when:

- the requested change is correctly scoped and implemented;
- relevant validation passed, or blockers are reported;
- failures introduced by the change are fixed;
- derived/generated artifacts affected by the change are refreshed from their owner;
- affected canonical documentation is synchronized;
- the final diff is reviewed for unintended changes and quality-floor regressions;
- broad or high-risk diffs receive a fresh independent review (human or separate
  agent) before handoff when that review is available and proportionate.

Correct code that bypasses required project tooling or validation is incomplete.

## Agent skills

### Issue tracker

GitHub Issues via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

See `docs/agents/domain.md` (glossary, context map, DER, ADRs).

## Maintenance

Remove obsolete instructions; move detailed procedures to their owning skill/doc and keep only routing here. Prefer nested `AGENTS.md` files for subtree rules.

@RTK.md
