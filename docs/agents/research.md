# Research workflow

Read this guide when using project memory, external documentation, or promoting verified findings.

## Serena External-Research Memory

Apply this rule before and during external research queries, including web searches, upstream documentation lookups, external API queries, and framework compatibility investigations.

## Tool inventory and project activation prerequisite

Serena memory operations are scoped to the active project workspace. Before invoking any memory or symbol tools, ensure the project is active:

- Call `activate_project(project="exams-app")` if not already activated in the current session.
- Once activated, use Serena's dedicated memory MCP tools:
  - `list_memories`: List existing project memories.
  - `read_memory`: Retrieve the full content of a specified memory.
  - `write_memory`: Persist new structured research findings or session scratchpads.
  - `edit_memory`: Update existing memory entries with refreshed findings or supersession notes.
  - `delete_memory`: Remove obsolete, invalidated, or graduated memories.

## Boundary and criteria: Serena memory vs. canonical Markdown documentation

Maintain a strict boundary between dynamic runtime research caching and permanent repository documentation:

1. **When to store in Serena Memory (`write_memory`)**:
   - **External research caching**: Durable, reusable results from upstream doc lookups, web searches, external API specifications, and third-party library compatibility quirks.
   - **Session scratchpads**: Ephemeral or exploratory investigation notes and hypotheses that should not pollute permanent repository documentation.
   - **Key naming**: Organize research findings under `research/<topic>` (e.g., `research/nextjs-cache`, `research/tailwind-v4-theme`).

2. **When to store in Canonical Markdown Documentation (via `/save` / `project-save` skill)**:
   - **Architectural decisions & trade-offs**: Persist in `docs/adr/` (e.g., `docs/adr/NNNN-<phrase>.md`, immutable once accepted).
   - **Component & API conventions**: Persist in `CODING_STANDARDS.md`.
   - **Design tokens, themes, visual patterns**: Persist in `DESIGN.md`.
   - **Commands, scripts, tooling workflows**: Persist in `TOOLING.md`.
   - **Agent behavioral boundaries & persistent rules**: Persist in the owning topic under `.agents/rules/`; update its `README.md` index.
   - **Test strategy & practices**: Persist in `TESTING.md`.

3. **Strict prohibitions**:
   - Never store API keys, secrets, authentication tokens, credentials, personal data, or raw dumps in Serena memory.

## Research workflow, Context7 interaction, and cache-first lookup

External queries must follow a cache-first workflow to conserve context and eliminate redundant network operations:

1. **Check local memory first**:
   - Execute `list_memories` or `read_memory` for the target topic before running external queries.
   - Reuse a current, sufficiently specific finding when one exists.
2. **Targeted external research**:
   - Query external sources only when memory is missing, insufficient, or potentially stale.
   - For libraries, frameworks, SDKs, or APIs (Next.js, React, Tailwind, Base UI, Firebase), use the native Context7 MCP tool (`resolve-library-id` followed by `query-docs`) or the `context7-cli` skill as the primary source of truth. For Firebase, the configured Firebase MCP server and the `firebase-basics` and `firebase-auth-basics` skills complement Context7.
   - Use web search only to complement Context7 or for material outside its corpus.
3. **Cache reusable findings**:
   - Store non-trivial, reusable findings into Serena memory under `research/<topic>` using `write_memory`.
   - Always record: topic name, retrieval date, source URL or library ID, and applicable version bounds (e.g., Next.js 16.4.2, React 19.3.1).

## Promotion and graduation to canonical documentation

When an external research finding stabilizes into an agreed project-wide convention, architectural choice, or standard developer workflow:

- Promote the knowledge to canonical Markdown documentation using the `/save` command or `project-save` skill into its authoritative destination (`CODING_STANDARDS.md`, `TOOLING.md`, or a new ADR).
- Update or retire the corresponding Serena memory using `edit_memory` or `delete_memory` to record the promotion or avoid duplicate divergence.

## Invalidation and memory maintenance

Memories are living caches that degrade as upstream software evolves:

- Every memory entry must specify topic, retrieval date, canonical source, and version bounds.
- When upstream libraries upgrade or findings become obsolete, invalidate or prune them using `delete_memory` or `edit_memory`.
- Never treat a memory as authoritative when its recorded version or retrieval date makes it incompatible with the repository's current stack.

## Git and working tree policy

Dynamic agent memories generated at runtime in `.serena/memories/` are local session cache and excluded from git tracking to prevent dirty working trees and CI noise. Persistent research policy resides in this topic; other agent guardrails reside in their owning files under `.agents/rules/`.
