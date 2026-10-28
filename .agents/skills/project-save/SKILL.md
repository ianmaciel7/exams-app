---
name: project-save
description: Persist and organize user-provided rules, architecture decisions, retrospective improvements (/retro), project conventions, tooling specifications, and domain knowledge into canonical documentation. Activate when the user instructs to save, record, persist, remember, or document rules, configurations, decisions, or conventions.
---

# Save Knowledge & Project Rules

This skill governs how to classify, locate, and record knowledge, rules, decisions, and operational instructions provided by the user or discovered during development.

## Core Principles

1. **English by default**: All documentation, code comments, and rule descriptions must be in English per [agent rules](../../rules/language.md#language-policy), even if the user provided the input in another language (e.g., Portuguese).
2. **Strict path portability**: NEVER store hardcoded host-specific or user-specific absolute paths (such as user home directories, drive prefixes, or machine root paths). Always sanitize and convert paths to repository-relative format (e.g., `TOOLING.md`, `src/app/`, `.agents/rules/`).
3. **Single source of truth**: Store each rule or piece of knowledge in its authoritative canonical document. Do not duplicate rules across multiple guides.
4. **ADR immutability**: Accepted Architecture Decision Records (`docs/adr/0001-*` through current) are historical and immutable per [agent rules](../../rules/adr.md#adr-naming-and-immutability). Never rewrite, edit, or renumber an accepted record.
5. **Every rule needs a safeguard**: A rule that lives only in prose will be broken again. When you save a rule, convention, or lesson learned from a mistake, also make it mechanically enforced by the strongest installed tool, so the same error cannot return silently. Documentation records the rule; a safeguard defends it. See [Safeguards](#safeguards-make-every-saved-rule-enforceable).
6. **Retrospective synthesis & environment improvement**: Findings from `/retro` suggest improvements to the agent's *environment*, not ephemeral patches to code. When persisting retro results, classify them:
   - **Mechanical violations** (fixed patterns, imports, banned APIs, file locations) must become deterministic checks and safeguards.
   - **Judgement calls** (cross-file consistency, style, heuristics) belong in `CODING_STANDARDS.md`, where they are reviewed by the review agent (`/code-review`) without imposing context pressure on implementation.
   - **Navigation friction** belongs as navigation pointers in `AGENTS.md` or domain indices.
   - **Tooling inefficiency / no-ops** must be pruned or streamlined in `TOOLING.md` / `AGENTS.md`.

---

## Decision Matrix: Information Type to Destination

Use this matrix to identify the canonical destination file for any given piece of information:

| Information Type | Description & Examples | Target File | Action |
| --- | --- | --- | --- |
| **Tool inventory & host dependencies** | Host prerequisites, package managers, CLI tools, runtime versions, build tools | `TOOLING.md` (## Tool inventory, ## Host prerequisites) | **Update** |
| **Commands & scripts** | Package scripts, verification commands, audit commands | `TOOLING.md` (## Commands, ### Verification entry points) | **Update** |
| **Configuration sources** | Roles and locations of config files (`biome.json`, `next.config.ts`, etc.) | `TOOLING.md` (## Configuration sources) | **Update** |
| **Custom code quality rules** | Biome GritQL rules, ast-grep structural rules, Semgrep static security rules | `TOOLING.md` (## Custom rule registry) | **Update** |
| **Known tooling limitations** | Workarounds, tool quirks, exclusions, upstream bugs | `TOOLING.md` (## Known limitations) | **Update** |
| **Coding & styling conventions** | TypeScript standards, React patterns, Next.js practices, import ordering | `CODING_STANDARDS.md` | **Update** |
| **Design tokens & UI components** | Colors, spacing, typography, theme tokens, shadcn components, Ladle stories | `DESIGN.md` | **Update** |
| **Testing strategy & practices** | Unit, integration, browser, e2e, a11y, visual, mutation test practices | `TESTING.md` | **Update** |
| **Git workflow & contributions** | Branch naming, Conventional Commits, PR guidelines, git hooks | `CONTRIBUTING.md` | **Update** |
| **Security policies** | Vulnerability handling, security scanners, ignored security advisories | `SECURITY.md` | **Update** |
| **Architecture & layering** | Repository layers, boundary rules, routing architecture, i18n structure | `ARCHITECTURE.md` | **Update** |
| **Domain vocabulary** | Business terms, ubiquitous language definitions | `GLOSSARY.md` | **Update** |
| **Database & persistence schema** | Entity-relationship model, tables, columns, relations, storage | `DER.md` | **Update / Create** |
| **Global agent directives** | Overall mission, high-level engineering rules, documentation map for agents | `AGENTS.md` | **Update** |
| **Agent tool configuration** | MCP servers, client integrations, sync settings | `.agents/agents.json` | **Update** |
| **Persistent agent rules** | Standalone, machine-actionable behavioral constraints for AI agents (e.g., naming, language, thin routes, components) | Owning topic in `.agents/rules/`; index: `.agents/rules/README.md` | **Update** |
| **Reusable agent skills** | Multi-step interactive agent workflows, tool guides, reusable recipes | `.agents/skills/<name>/SKILL.md` | **Create** |
| **Architecture Decision Records (ADRs)** | Architectural choices, trade-offs, tech evaluations, paradigm changes | `docs/adr/NNNN-<phrase>.md` | **Create** (Immutable) |
| **External research results, upstream API/doc lookup caches, transient exploratory findings** | Operational research cache; keeps canonical Markdown repository documentation focused on stable, agreed-upon standards. | Serena Memory (`write_memory`) under `research/*` | **Write / Cache** |
| **Retro: Navigation pointers** | Navigation aids to eliminate exploration friction surfaced in `/retro` | `AGENTS.md` (or domain index docs) | **Update** |
| **Retro: Mechanical safeguards** | Deterministic checks for mechanical errors caught during `/retro` | `TOOLING.md` (## Custom rule registry / Commands) | **Update** |
| **Retro: Reviewer standards** | Review-time heuristics and judgement rules for the reviewer agent (`code-review`) | `CODING_STANDARDS.md` | **Update** |
| **Retro: Steering & no-ops** | Pruning bloat, removing no-op instructions, or streamlining steering | `AGENTS.md` | **Update** |
| **Retro: Tool economy** | Streamlining expensive tool calls, adjusting MCP configs or logging access | `TOOLING.md`, `.agents/agents.json` | **Update** |

---

## When to Update vs When to Create

Follow these strict boundaries when persisting information:

### When to UPDATE an Existing File

Modify an existing document when the user's information refines, extends, or updates established operational practices:

- **`TOOLING.md`**:
  - Adding or upgrading a developer tool or dependency.
  - Adding a custom lint/ast rule to the Custom Rule Registry (table in `TOOLING.md`).
  - Adding a verification or maintenance command to the command tables.
  - Recording a known tool limitation, vendor exclusion, or advisory exception.
  - Adding automated guardrails, pre-commit checks, or CI jobs proposed by `/retro` to prevent repeated failures.
- **`CODING_STANDARDS.md`**:
  - Adding or refining a TypeScript convention, React idiom, Next.js guideline, or file structure rule.
  - Adding review-time judgement rules surfaced by `/retro` that cannot be automated via mechanical checks (evaluated by `/code-review`).
- **`DESIGN.md`**:
  - Updating design tokens, color palette definitions, typography scales, or component guidelines.
- **`TESTING.md`**:
  - Adding testing patterns, assertion guidelines, coverage expectations, or mocking conventions.
- **`AGENTS.md`**:
  - Updating high-level guidance, repository-wide rules, or indices of skills and MCP servers.
  - Adding navigation pointers surfaced by `/retro` to reduce agent search time, or pruning no-op instructions to save context.
- **`ARCHITECTURE.md`**:
  - Clarifying module boundaries, layer dependency rules, or internationalization flow.
- **`GLOSSARY.md` / `DER.md`**:
  - Updating product terms or database entities as the domain model evolves.
- **`CONTRIBUTING.md` / `SECURITY.md`**:
  - Refining contribution guidelines, PR criteria, or security vulnerability procedures.

### When to CREATE a New File

Create a new file only when the information constitutes a distinct, modular artifact:

1. **Architecture Decision Records (`docs/adr/NNNN-<phrase>.md`)**:
  - **Trigger**: A significant architectural, structural, or technology choice that requires recording context, options considered, decision, and consequences.
  - **Immutability rule**: Accepted ADRs are strictly immutable per [agent rules](../../rules/adr.md#adr-naming-and-immutability). Never edit or rewrite accepted records.
  - **Naming format**: Next unused four-digit number followed by a kebab-case imperative phrase (e.g., `0009-adopt-database-orm.md`).
  - **Index update**: After creating the ADR, add its entry to `docs/adr/README.md`. If superseding an earlier ADR, note the supersession in `docs/adr/README.md` and in the new ADR.
2. **Agent Persistent Rules (`.agents/rules/`)**:
  - **Trigger**: A discrete, persistent behavioral constraint that applies to all coding agents working across the repository (e.g., formatting constraints, commit constraints, language requirements).
  - **Format**: Concise rule in the owning technology or project topic file. Follow official documentation topics for framework guidance, use short filenames, keep one context per rule, and store procedural references in `docs/agents/`, and update `.agents/rules/README.md` when adding a topic.
3. **Reusable Agent Skills (`.agents/skills/<name>/SKILL.md`)**:
  - **Trigger**: A complex, multi-step interactive workflow, domain-specific procedure, or tool guide that agents should load on demand.
  - **Format**: Directory named with kebab-case, containing `SKILL.md` with YAML front matter (`name` and `description`).
  - **Registration**: Register new skills in `.agents/skills/README.md`, `.agents/README.md`, and `TOOLING.md`.

---

## Safeguards: Make Every Saved Rule Enforceable

Applies to every kind of knowledge this skill saves, not only one topic (language, naming, layering, security, testing, tooling, and so on). Before finishing, ask: "If someone, human or agent, breaks this tomorrow, what fails?" If the answer is "nothing", add a safeguard.

### 1. Pick the strongest fitting tool

Read [TOOLING.md](../../../TOOLING.md) (tool inventory, commands, custom rule registry) first and reuse what is installed before adding anything new. Prefer native tool rules over custom scripts.

| What must be prevented | Preferred enforcement |
| --- | --- |
| Code style, lint, import order, unsafe patterns | Biome native rule, then a Biome GritQL plugin in `.biome/rules/` |
| Structural or syntactic patterns in code | ast-grep rule in `.ast-grep/` with snapshot tests |
| Type contracts, props, route shapes | TypeScript types, then a TypeScript-AST script in `scripts/checks/check-*.mjs` |
| Layering and dependency direction | dependency-cruiser (`.dependency-cruiser.cjs`) |
| Dead code, unused exports and dependencies | Knip; duplication via jscpd; complexity via Fallow |
| Security patterns and secrets | Semgrep rules in `.semgrep/`, Gitleaks, `pnpm audit` |
| Behavior and regressions | Vitest, Vitest Browser Mode, Playwright, axe, Stryker |
| Docs, spelling, prose, language | markdownlint, CSpell, a `scripts/checks/check-*.mjs` guard |
| Commit and branch conventions | Commitlint, Husky, lint-staged |
| Workflow and CI correctness | actionlint, zizmor |
| Rule that no tool above can express | A small dependency-free `scripts/checks/check-<topic>.mjs` with a `node --test` suite |

### 2. Test the safeguard

Every new check ships with at least one passing (valid) case and one failing (invalid) case, plus a documented escape hatch (for example an ignore marker with a stated reason) for intentional exceptions. A check that has never been seen failing is not a safeguard.

### 3. Wire it into every gate

A check that nobody runs does not protect anything. Connect it at each layer that fits, from fastest to slowest:

1. **Editor or agent time**: a persistent rule in `.agents/rules/` and the owning guide.
2. **Commit time**: lint-staged for staged files, the Husky `pre-commit` and `commit-msg` hooks, or `.pre-commit-config.yaml`.
3. **Local verification**: add the script to `package.json` and to `verify:fast` and/or `verify:static`.
4. **CI**: confirm the corresponding job in `.github/workflows/ci.yml` runs it, usually through a `verify:*` command.

### 4. Record it

- Add the tool or command to `TOOLING.md` (tool inventory, commands, and the custom rule registry for custom rules).
- Mention the enforcement in the owning rule or guide, and update `TESTING.md` when a job or suite changes.
- Keep config, positive and negative tests, `TOOLING.md`, and the owning agent rule in the same change.

### 5. Handle existing violations honestly

Run the new check against the whole repository before wiring it in. If it already fails, either fix the backlog or, only when the user agrees, add a narrow documented exemption. Never wire in a gate that is knowingly red without reporting it, and never weaken the check to make it pass.

---

## Investigation Tools for Rule Verification

Before persisting a rule, convention, or architectural decision, verify whether the rule reflects current repository code and upstream library reality. Use the following specialized tools:

### 1. Serena (Semantic Symbol Analysis MCP)
Serena provides project-local semantic symbol indexing, code navigation, and project-scoped research memory caching. Use it to inspect codebase symbols, verify whether conventions or patterns are already in use, locate relevant components, and manage research caches before saving rules or standards:
- **Code symbol navigation**:
  - `find_symbol`: Verify whether an interface, class, component, or helper function already exists in `src/` (e.g., checking if `ButtonProps` or `ThemeToggle` follows the proposed naming convention).
  - `get_symbols_overview`: Inspect the top-level symbols of a file or module before drafting coding standards for that file type.
  - `find_referencing_symbols`: Determine how widely a symbol or convention is used across the codebase before establishing a deprecation or replacement rule.
  - `find_implementations`: Discover all implementations of a base interface or type (e.g., exploring existing layout props or route handlers).
- **Project-scoped research memory caching**:
  - `read_memory` / `list_memories`: Retrieve and inspect existing operational research caches under `research/*` before issuing redundant external queries or saving duplicate rules.
  - `write_memory` / `edit_memory`: Cache upstream API lookups, compatibility notes, and transient research scratchpads without cluttering canonical Markdown documents.

### 2. Context7 (`context7-cli`)
When the user's rule touches external dependencies or framework capabilities (Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, `next-intl`), check authoritative upstream documentation instead of relying on outdated training data:
- Step 1: Resolve the library ID:
  ```bash
  ctx7 library <library-name> [query]
  ```
- Step 2: Query documentation:
  ```bash
  ctx7 docs <library-id> <query>
  ```
- Example: Verify current Next.js 16 Server Actions signatures or Tailwind v4 `@theme` directives before documenting them in `CODING_STANDARDS.md` or `DESIGN.md`.

### 3. Next.js DevTools MCP
When establishing rules around routing, server vs. client component boundaries, or runtime performance:
- Use Next.js DevTools to inspect route segments, server-rendered components, and client boundary hooks.
- Validate route naming conventions, layout nesting rules, or metadata export expectations against actual route trees.

### 4. ast-grep & Biome
When turning a coding convention into an enforceable automated rule:
- **Biome GritQL**: Use GritQL plugins in `.biome/rules/` to enforce Next.js route, page, and layout prop types. Regression-test them in `.biome/rules/nextjs/rules.test.ts`.
- **ast-grep**: Use `sgconfig.yml` and `.ast-grep/` for syntax-aware pattern enforcement (e.g., forbidding dynamic class names or manual memoization). Run snapshot tests via `pnpm check:structure`.
- If an automated rule is created, record it in the **Custom rule registry** table in `TOOLING.md`.

### 5. Session Transcripts & Retrospectives (`/retro`)
When persisting findings from a retrospective or debugging session:
- **Transcript analysis**: Read primary session logs (`transcript.jsonl`) to identify what caused friction or confusion.
- **Rule classification**: Split findings into mechanical mistakes (requiring automated checks in `TOOLING.md` / linters / CI) and judgement calls (requiring rules in `CODING_STANDARDS.md` enforced at review time by `code-review`).
- **Context optimization**: Identify navigation bottlenecks and add pointers in `AGENTS.md`, or prune no-op instructions to conserve context tokens.

---

## End-to-End Decision & Execution Flow

### Mermaid Flowchart

```mermaid
flowchart TD
    A["User Input: Rule, Decision, or /retro Finding"] --> B["Step 1: Ingest & Language Normalization (English default)"]
    B --> C["Step 2: Investigate & Validate with Tools"]
    
    subgraph ToolingInvestigation ["Tooling & Codebase Investigation"]
        C1["Serena MCP: find_symbol, get_symbols_overview"]
        C2["Context7 CLI: ctx7 library, ctx7 docs"]
        C3["Next.js DevTools: Routes & Server Components"]
        C4["ast-grep & Biome: Syntactic pattern validation"]
        C5["Session Logs & /retro: Friction & Transcripts"]
    end

    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> C5

    C1 --> D{"Step 3: Decision - Update or Create?"}
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D

    D -- "Update Existing File" --> E["Operational / Incremental Knowledge"]
    E --> E1["Tooling & Rules -> TOOLING.md"]
    E --> E2["Code Standards -> CODING_STANDARDS.md"]
    E --> E3["Design & Styling -> DESIGN.md"]
    E --> E4["Testing Strategy -> TESTING.md"]
    E --> E5["Architecture & Boundaries -> ARCHITECTURE.md"]
    E --> E6["Global Directives -> AGENTS.md"]
    E --> E7["Glossary / Schema -> GLOSSARY.md / DER.md"]

    D -- "Create New File" --> F["Modular / Architectural Artifact"]
    F --> F1["Architecture Decision -> docs/adr/NNNN-phrase.md (Immutable)"]
    F --> F2["Persistent Agent Rule -> owning topic in .agents/rules/"]
    F --> F3["Reusable Agent Skill -> .agents/skills/name/SKILL.md"]

    E1 --> G["Step 4: Sanitize Paths (Repository-Relative)"]
    E2 --> G
    E3 --> G
    E4 --> G
    E5 --> G
    E6 --> G
    E7 --> G
    F1 --> G
    F2 --> G
    F3 --> G

    G --> H["Step 5: Quality & Integrity Verification"]
    subgraph VerificationSuite ["Verification Suite"]
        H1["pnpm check:markdown"]
        H2["pnpm check:spelling"]
        H3["agents sync"]
        H4["Safeguard: tool + tests + hooks + CI"]
    end
    H --> H1
    H --> H2
    H --> H3
    H --> H4

    H1 --> I["Step 6: User Confirmation & Rationale"]
    H2 --> I
    H3 --> I
    H4 --> I
```

---

## Step-by-Step Execution Workflow

When a user requests to save or document information (e.g., "save this rule", "save this rule to TOOLING.md", "remember this convention"):

### 1. Ingest & Interpret
- Extract the core rule, convention, architectural decision, retrospective candidate (`/retro`), or tool specification from the user's input or session retrospective.
- Check the language: if input is in Portuguese or another language, translate the technical guidance into idiomatic English for storage (per [agent rules](../../rules/language.md#language-policy)).

### 2. Sanitize & Normalize
- **Remove absolute machine paths**: Replace machine-specific absolute paths (such as full workspace paths or user directory prefixes) with repository-relative paths (e.g., `TOOLING.md`).
- Ensure code snippets follow repository coding standards (TypeScript, Biome formatting).

### 3. Classify & Select Target
- Consult the [Decision Matrix](#decision-matrix-information-type-to-destination).
- Decide between **UPDATE** and **CREATE** using the criteria above.
- If the user explicitly nominated a target file (e.g., `TOOLING.md`), verify that the information fits that file's ownership scope in `docs/README.md`. If a more specific or appropriate document exists (e.g., an ADR vs updating `TOOLING.md`), explain the choice.

### 4. Apply Changes
- **For Updates**:
  1. Read the target section in the existing document.
  2. Locate the appropriate table or section heading.
  3. Insert or update the content using consistent Markdown structure (table rows, lists, headings).
- **For Creates**:
  1. Verify the next sequential number (for ADRs) or appropriate naming convention.
  2. Write the new document with clear headings, context, and rationale.
  3. Update related index files (`docs/adr/README.md` for ADRs, `.agents/skills/README.md` for skills).

### 5. Quality Assurance & Verification
Run the following checks to ensure repository integrity:

```bash
# 1. Verify markdown formatting
pnpm check:markdown

# 2. Verify spelling across code and documentation
pnpm check:spelling

# 3. Verify the language policy (English by default)
pnpm check:english

# 4. Synchronize agent skill manifests (when .agents/ is modified)
agents sync
```

### 5b. Add or Verify the Safeguard
Follow [Safeguards](#safeguards-make-every-saved-rule-enforceable): select an installed tool from `TOOLING.md`, add valid and invalid tests, wire the check into hooks, `verify:*`, and CI, and register it in `TOOLING.md`. If no safeguard is feasible, state why in the confirmation.

### 6. Confirm to User
Provide a concise summary of the action taken:
- The target file path (repository-relative).
- The section or table updated, or the new file created.
- The rationale for the chosen target.
- The safeguard added (tool, tests, and gates it is wired into), or why none was possible.
- Results of verification checks, including any pre-existing violations.
