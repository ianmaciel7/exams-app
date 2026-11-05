# AI Handoff Prompt Reference Template

This reference guide provides the canonical, ready-to-use markdown template for generating task handoff prompts for another AI session or agent.

---

## Canonical Template

````markdown
### Objective

[Single concise paragraph stating the goal, target outcome, and architectural standard to follow, without generic introductory fluff]

---

### Final Implementation ("Como Vai Ficar")

#### 1. `path/to/target-file.tsx`
[Brief description of file role]

```tsx
// Exact final code snippet of how this file will look like
```

#### 2. `path/to/another-target-file.ts`
```ts
// Exact final code snippet of how this file will look like
```

#### 3. Obsolete Code Removal
- `path/to/obsolete-file.tsx` (reason for deletion)
- `path/to/obsolete-file.test.tsx`

---

### Repository Guardrails & Constraints

- **1:1 Term Parity**: Kebab-case filename stem must match PascalCase identifiers term-for-term (e.g. `my-component.tsx` -> `MyComponent`, `MyComponentProps`, `useMyComponent`).
- **AST & Linter Constraints**: [Relevant linter checks, e.g. no Middle Man delegation, single form root, no restricted imports].
- **Runtime Boundaries**: [Server Components vs Client Components, serialization boundaries, server-only vs client-only constraints].
- **Language & Localization**: Code, comments, types, and commits strictly in English. UI copy via i18n message catalogs (`src/messages/`).

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
- Commit changes following Conventional Commits (`type(scope): description`), keeping commit body lines under 100 characters.
- Push branch to origin: `git push -u origin <branch-name>`.
- Open a Pull Request targeting `dev` via GitHub CLI:

  ```bash
  gh pr create --base dev --title "type(scope): description" --body "Summary of changes..."
  ```

---

### Knowledge Persistence & Project Save

- If any new conventions, architectural decisions, reusable patterns, or important domain/library discoveries were established during this task, execute `/project-save` (or follow `.agents/skills/project-save/SKILL.md`) to persist them into canonical repository documentation.
````

---

## Pre-Flight Checklist Before Delivering Prompt

Before saving or sending the prompt to the user, ensure:

- [ ] **No Generic Fluff**: All role-playing intros ("You are an expert...") and generic stack primers have been stripped out.
- [ ] **No "Current State" Overhead**: Do not include baseline/current state descriptions or snippets. The receiving agent can read existing files directly.
- [ ] **Exact Final Code ("Como Vai Ficar") Included**: Every file to be created or modified has its complete, exact destination code snippet written out.
- [ ] **Concrete Relative Paths**: All paths are repository-relative (`src/app/...`) and never contain machine-specific absolute prefixes.
- [ ] **Exact Identifiers**: Component names, hook names, and prop types are explicitly defined.
- [ ] **Specific Guardrails**: Repository gotchas that could cause CI failures (AST linters, naming rules, boundary violations) are stated upfront.
- [ ] **Verification Commands Included**: The receiving agent is given executable commands to confirm their work.
- [ ] **Pull Request Workflow Included**: Explicit instructions are included to create a branch off `dev`, commit, push, and open a PR via `gh pr create`.
- [ ] **Knowledge Persistence Instruction Included**: Prompt instructs the receiving agent to execute `/project-save` (or follow `.agents/skills/project-save/SKILL.md`) to persist critical conventions or decisions.
- [ ] **Delivered as Artifact**: The prompt is persisted as a Markdown file in the conversation artifact directory.
