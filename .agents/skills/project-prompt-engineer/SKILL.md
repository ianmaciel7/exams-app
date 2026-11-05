---
name: project-prompt-engineer
description: Drafts concise, context-dense, actionable handoff prompts for another AI agent or session. Use when the user wants to generate, prepare, or save a prompt instructing another AI to execute a specific task, refactoring, or feature without generic project boilerplate.
---

# Task Prompt Generator (AI Handoff)

This skill guides the creation of high-precision, actionable handoff prompts intended for another AI model or session (e.g., Claude, ChatGPT, Gemini, or a subagent) to execute a coding task, bug fix, or refactoring cleanly.

## Core Directives

1. **Zero Generic Boilerplate**: The receiving AI already has project access or context. Never include generic introductions (e.g., "You are an expert full-stack developer...", "In this Next.js project...", generic framework definitions).
2. **Context-Dense & High-Precision**: Focus exclusively on the **delta**: what exists right now, why it must change, and the exact steps to achieve the desired state.
3. **Always Include Mechanical Guardrails**: An AI will fail if it does not know the repository's AST linters, naming conventions, import boundaries, and architectural patterns (e.g., 1:1 term parity, anti-Middle Man checks, single-form root rules).
4. **Concrete Verification Checklist**: Always end with the exact CLI commands the receiving agent must run to verify their changes (`pnpm typecheck`, `pnpm test`, custom AST scripts).
5. **Artifact Delivery**: Always provide the resulting prompt inside a Markdown artifact in the conversation artifact directory so the user can easily view, copy, or share it.
6. **Language Alignment**: Draft the prompt in the language requested by the user (e.g., Portuguese when requested in Portuguese, English when requested in English), while keeping all code identifiers, file paths, and commit conventions strictly in English.

---

## The 5 Pillars of an Effective Handoff Prompt

Every generated task prompt must follow this structure:

### 1. Objective (`Objetivo` / `Objective`)
A single, unambiguous paragraph stating what needs to be accomplished and the expected outcome.

### 2. Current State (`Estado Atual` / `Current State`)
* Specific file paths (repository-relative, e.g., `src/app/(protected)/profile/page.tsx`).
* Minimal code snippets showing how it currently works and the pain point / reason for the change.

### 3. Step-by-Step Action Items (`O Que Fazer` / `Action Plan`)
Organized by file or component:
* **Files to create**: exact path, component name, props type, required imports, and behavior.
* **Files to modify**: exact changes, function signatures, and integration wiring.
* **Files to delete / deprecate**: cleanup of obsolete files, hooks, or tests.

### 4. Repository Guardrails (`Guardrails do Repositório` / `Guardrails & Constraints`)
Specific constraints the model must not violate:
* AST & linter rules (e.g., kebab-case to PascalCase term parity, Middle Man smell, single form root, Server/Client component directives).
* Layering & boundaries (e.g., Server Components vs Client Components, data access layer imports, gateway ports).
* Language & naming policy: English for code, comments, and types; user-visible strings via translation catalogs.

### 5. Verification Checklist (`Verificações Necessárias` / `Verification`)
* Tests to update or add (colocated `*.test.tsx`, route tests, unit tests).
* Concrete validation commands:
  * `pnpm typecheck`
  * `pnpm test`
  * Specialized linters or checks (e.g., `pnpm check:components`, `pnpm check:unused`, `pnpm check:repo`).

---

## Canonical Template

```markdown
### Objective
[Single concise paragraph stating the goal, target outcome, and architectural standard to follow, without generic introductory fluff]

---

### Current State
* `path/to/current-file.tsx`:
  ```tsx
  // Minimal snippet illustrating the current baseline, code structure, or limitation
  ```
* [Direct explanation of why the current approach is suboptimal, buggy, or requires refactoring]

---

### Action Plan

#### 1. Create [File / Component Name]
* **File**: `path/to/new-file.tsx`
* **Identifier**: `ComponentName` (props: `ComponentNameProps`)
* **Details**:
  * [Primitives, libraries, or base parts consumed]
  * [Props, state orchestration, or hooks utilized]
  * [DOM, event handling, or mutation flow]

#### 2. Modify [Existing Component / Module]
* **File**: `path/to/existing-file.tsx`
* [Modifications, replacements, or wiring required]
  ```tsx
  // Snippet showing how the new component or function is integrated
  ```

#### 3. Obsolete Code Removal
* [Specific files, functions, hooks, or dead exports to delete]

---

### Repository Guardrails & Constraints
* **1:1 Term Parity**: Kebab-case filename stem must match PascalCase identifiers term-for-term.
* **AST & Linter Constraints**: [Relevant linter checks, e.g. no Middle Man delegation, single form root, no restricted imports].
* **Runtime Boundaries**: [Server Components vs Client Components, serialization boundaries, server-only vs client-only constraints].
* **Language & Localization**: Code, comments, types, and commits strictly in English. UI copy via i18n message catalogs.

---

### Verification Checklist
* [Unit or integration tests to add or update]
* Required CLI checks to pass:
  * `pnpm typecheck`
  * `pnpm test`
  * [Repository-specific checks, e.g. check-component-conventions, check:unused]
```

---

## Workflow When Activated

1. **Analyze Context**: Inspect the relevant files, recent commits/ADRs, and AST conventions related to the user's request.
2. **Draft Focused Prompt**: Fill in the 5 pillars without generic preamble. See [Reference Templates](references/template.md) for full Portuguese and English templates with pre-flight checklists.
3. **Save Artifact**: Write the Markdown file to the conversation artifact directory using `write_file`.
4. **Deliver**: Provide a concise response with a clickable link to the created artifact.
