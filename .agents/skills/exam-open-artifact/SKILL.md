---
name: exam-open-artifact
description: Access the Exam App native whiteboards, diagnose Open Artifact, find the current stage and use verified CLI or MCP tools without duplicating artifacts.
---
# Exam App Open Artifact access

Read AGENTS.md and docs/agent-access.md first. Run the pinned installer if necessary, then the official doctor for your harness. Read the official entry skill and the relevant type skill in the resolved runtime (vendor/artifact-types/<type>/SKILL.md). Inspect docs/releases/v0.1.0/current-state.json and the owning board meta before opening or editing. Use the existing board folder, not a new artifact. Native tool availability, ownership, and permission must be verified before claiming collaboration. For the standalone viewer use node scripts/open-boards.mjs; for full Shell collaboration use the official plugin and add the existing folder from its local library, confirming the root and owner. Static Pages cannot send requests to agents or persist changes. Never publish private comments or open an unapproved remote. Prefer scoped file or native CLI reads if MCP is unavailable; disclose missing capabilities. Run structural checks and relevant independent visual checks after edits.
