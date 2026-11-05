---
name: project-prompt-engineer
description: Drafts concise, context-dense, actionable handoff prompts for another AI agent or session. Use when the user wants to generate, prepare, or save a prompt instructing another AI to execute a specific task, refactoring, or feature without generic project boilerplate.
---

# Task Prompt Generator (AI Handoff)

This skill guides the creation of high-precision, actionable handoff prompts intended for another AI model or session (e.g., Claude, ChatGPT, Gemini, or a subagent) to execute a coding task, bug fix, or refactoring cleanly.

## Core Directives

1. **Zero Generic Boilerplate**: The receiving AI already has project access or context. Never include generic introductions (e.g., "You are an expert full-stack developer...", "In this Next.js project...", generic framework definitions).
2. **No "Current State" Overhead**: Do NOT spend context or space reproducing the current state or baseline code snippets. The receiving agent can already read the codebase and inspect existing files directly. Focus strictly and exclusively on the **target destination**.
3. **Mandatory Final Code ("Como Vai Ficar")**: For EVERY file being created or modified, provide the EXACT, complete implementation of how the code will look like ("Como Vai Ficar"). Never leave signatures, JSX structure, imports, or wiring for the receiving model to guess.
4. **Always Include Mechanical Guardrails**: An AI will fail if it does not know the repository's AST linters, naming conventions, import boundaries, and architectural patterns (e.g., 1:1 term parity, anti-Middle Man checks, single-form root rules).
5. **Concrete Verification Checklist**: Always end with the exact CLI commands the receiving agent must run to verify their changes (`pnpm typecheck`, `pnpm test`, custom AST scripts).
6. **Artifact Delivery**: Always provide the resulting prompt inside a Markdown artifact in the conversation artifact directory so the user can easily view, copy, or share it.
7. **Language Alignment**: Draft the prompt in the language requested by the user (e.g., Portuguese when requested in Portuguese, English when requested in English), while keeping all code identifiers, file paths, and commit conventions strictly in English.
8. **Mandatory Pull Request Delivery**: Never instruct or allow direct commits to `dev` or `main`. Always instruct the receiving AI to create a short-lived working branch off `dev`, commit following Conventional Commits, push to remote, and open a Pull Request targeting `dev` using `gh pr create`.
9. **Knowledge Persistence via `/project-save`**: Always instruct the receiving AI to execute `/project-save` (or follow `.agents/skills/project-save/SKILL.md`) after completing verification and delivery, whenever important conventions, architectural decisions, library quirks, or reusable patterns were established during the task.

---

## The 6 Pillars of an Effective Handoff Prompt

Every generated task prompt must follow this structure (omitting baseline/current state descriptions):

### 1. Objective (`Objetivo` / `Objective`)

A single, unambiguous paragraph stating what needs to be accomplished and the expected outcome.

### 2. Final Implementation ("Como Vai Ficar")

Organized clearly by file:
- **Files to create or modify**: Exact path, component/function name, complete imports, types, and the **full, concrete code snippet** showing exactly how the final file will look like.
- **Files to delete / clean up**: Specific list of obsolete files, hooks, or tests to remove.

### 3. Repository Guardrails (`Guardrails do Repositório` / `Guardrails & Constraints`)

Specific constraints the model must not violate:
- AST & linter rules (e.g., kebab-case to PascalCase term parity, Middle Man smell, single form root, Server/Client component directives).
- Layering & boundaries (e.g., Server Components vs Client Components, data access layer imports, gateway ports).
- Language & naming policy: English for code, comments, and types; user-visible strings via translation catalogs.

### 4. Verification Checklist (`Verificações Necessárias` / `Verification`)

- Tests to update or add (colocated `*.test.tsx`, route tests, unit tests).
- Concrete validation commands:
  - `pnpm typecheck`
  - `pnpm test`
  - Specialized linters or checks (e.g., `pnpm check:components`, `pnpm check:unused`, `pnpm check:repo`).

### 5. Git & Pull Request Delivery (`Fluxo de Git e PR` / `Branch & PR Delivery`)

- Create a dedicated working branch off `dev`: `git checkout -b <type>/<description>`.
- Commit with Conventional Commits (`type(scope): description`), ensuring commit body lines stay under 100 characters.
- Push branch to origin: `git push -u origin <branch-name>`.
- Open a Pull Request targeting `dev` via GitHub CLI: `gh pr create --base dev --title "..." --body "..."`.

### 6. Knowledge Persistence (`Persistência de Conhecimento` / `/project-save`)

- Instruct the agent to run `/project-save` (referencing `.agents/skills/project-save/SKILL.md`) upon completion to persist any critical conventions, ADR updates, domain learnings, or architectural decisions into canonical documentation.

---

## Canonical Template

````markdown
### Objective

[Single concise paragraph stating the goal, target outcome, and architectural standard to follow, without generic introductory fluff]

---

### Final Implementation ("Como Vai Ficar")

#### 1. `path/to/file-to-modify-or-create.tsx`
[Brief note on what this file does, followed by the exact code snippet]

```tsx
// Complete or exact code showing how the file will look like
```

#### 2. `path/to/another-file.ts`
```ts
// Complete or exact code showing how the file will look like
```

#### 3. Obsolete Code Removal
- `path/to/obsolete-file.tsx` (reason for deletion)
- `path/to/obsolete-file.test.tsx`

---

### Repository Guardrails & Constraints

- **1:1 Term Parity**: Kebab-case filename stem must match PascalCase identifiers term-for-term.
- **AST & Linter Constraints**: [Relevant linter checks, e.g. no Middle Man delegation, single form root, no restricted imports].
- **Runtime Boundaries**: [Server Components vs Client Components, serialization boundaries, server-only vs client-only constraints].
- **Language & Localization**: Code, comments, types, and commits strictly in English. UI copy via i18n message catalogs.

---

### Verification Checklist

- [Unit or integration tests to add or update]
- Required CLI checks to pass:
  - `pnpm typecheck`
  - `pnpm test`
  - [Repository-specific checks, e.g. check-component-conventions, check:unused]

---

### Git & Pull Request Delivery

- Create a working branch off `dev`: `git checkout -b <type>/<short-description>`.
- Commit changes using Conventional Commits (`type(scope): description`). Ensure body lines stay under 100 characters.
- Push branch: `git push -u origin <branch-name>`.
- Open a Pull Request targeting `dev`:

  ```bash
  gh pr create --base dev --title "type(scope): description" --body "Summary of changes..."
  ```

---

### Knowledge Persistence & Project Save

- If any new conventions, architectural decisions, reusable patterns, or important domain/library discoveries were established during this task, execute `/project-save` (or follow `.agents/skills/project-save/SKILL.md`) to persist them into canonical repository documentation.
````

---

## Workflow When Activated

1. **Analyze Context**: Inspect the target files and architectural requirements.
2. **Draft Focused Prompt**: Fill in the 6 pillars. Omit current state descriptions, supply the exact destination code for every file, and include instructions for `/project-save` persistence.
3. **Save Artifact**: Write the Markdown file to the conversation artifact directory using `write_file`.
4. **Deliver**: Provide a concise response with a clickable link to the created artifact.
