# Project skills

This directory contains fifteen installed skills. `skills-lock.json` at the
repository root records upstream sources, paths, and computed hashes for external
skills.

| Skill | Entrypoint | Upstream | Use |
| --- | --- | --- | --- |
| ask-matt | [SKILL.md](ask-matt/SKILL.md) | `mattpocock/skills` | Route engineering work to relevant workflows |
| code-review | [SKILL.md](code-review/SKILL.md) | Not recorded in lock metadata | Review standards and originating specifications |
| context7-cli | [SKILL.md](context7-cli/SKILL.md) | `upstash/context7` | Resolve a library and query current documentation |
| emulator-test | [SKILL.md](emulator-test/SKILL.md) | Project-local | Run the auth emulator end-to-end suite and report the result |
| firebase-basics | [SKILL.md](firebase-basics/SKILL.md) | `firebase/agent-skills` | Firebase CLI setup, project selection, and app configuration downloads |
| firebase-auth-basics | [SKILL.md](firebase-auth-basics/SKILL.md) | `firebase/agent-skills` | Firebase Authentication concepts, integration, and security rules |
| firebase-rules-review | [SKILL.md](firebase-rules-review/SKILL.md) | Project-local | Review Firestore rules, Cloud Functions, and auth boundaries for security gaps |
| impeccable | [SKILL.md](impeccable/SKILL.md) | `pbakaus/impeccable` | Design, audit, critique, shape, and polish frontend UI/UX |
| project-new-component | [SKILL.md](project-new-component/SKILL.md) | Project-local | Scaffold components that follow the naming and boundary contracts |
| project-save | [SKILL.md](project-save/SKILL.md) | Project-local | Persist knowledge, rules, decisions, and conventions to canonical documentation |
| retro | [SKILL.md](retro/SKILL.md) | Not recorded in lock metadata | Review completed work and capture improvements |
| setup-matt-pocock-skills | [SKILL.md](setup-matt-pocock-skills/SKILL.md) | `mattpocock/skills` | Configure engineering skill and tracker documentation |
| shadcn | [SKILL.md](shadcn/SKILL.md) | `shadcn/ui` | Work with shadcn components, registries, and design systems |
| project-verify | [SKILL.md](project-verify/SKILL.md) | Project-local | Run the smallest verification tier covering the current diff |
| vercel-react-best-practices | [SKILL.md](vercel-react-best-practices/SKILL.md) | `vercel-labs/agent-skills` | React and Next.js performance guidelines |

Supporting Markdown under each skill is an upstream reference, not a claim
that every example, provider, or workflow is configured in this application.
The tracker and domain configuration for this repository live in
[docs/agents](../../docs/agents/).

The `code-review` and `retro` entrypoints are versioned, but their upstream
provenance is not recorded in `skills-lock.json`. This inventory does not invent
source repositories or integrity hashes for them.

## Maintenance

Keep upstream skill content and `skills-lock.json` aligned when updating an
installed skill. Review upstream changes rather than rewriting their examples
to describe the template. Keep repository-specific guidance in `AGENTS.md`,
`.agents/rules/`, and `docs/agents/`.

For a new, explicitly requested project skill, use a kebab-case directory with
`SKILL.md` containing `name` and a specific `description` in YAML front matter.
Keep its instructions narrow and reusable. Run `agents sync` and
`agents sync --check` after changing reusable instructions, as described in
[the agent guide](../README.md).
