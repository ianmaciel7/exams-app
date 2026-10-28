# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root (if present).
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

This template already has accepted ADRs and a pending glossary. Preserve the
pending glossary until product terms are agreed. Restore a missing required
documentation entrypoint according to ADR 0005 and `AGENTS.md`; do not invent
domain vocabulary to fill it.

The installed `ask-matt` skill routes engineering workflows; domain-modeling
workflows may create domain content when terms or decisions are resolved.
Do not assume every routed skill is installed locally. See
[the skill inventory](../../.agents/skills/README.md).

## File structure

Single-context repo:

```text
/
├── GLOSSARY.md
├── docs/adr/
│   ├── README.md
│   └── 0001-configure-nextjs.md … 0010-configure-agent-ecosystem.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR 0001 (Configure Next.js); propose a superseding ADR with the rationale._

Use [the ADR index](../adr/README.md) to identify later decisions. Never rename,
renumber, or rewrite an accepted record to make it match current operations.

## Technical UI references

The [shadcn/ui rule](../../.agents/rules/shadcn.md) describes framework and component practices.
It does not introduce business vocabulary or resolve the pending product ERD.
Use [DER.md](../../DER.md) for the existing technical Firebase persistence
boundary and future product relationships.
