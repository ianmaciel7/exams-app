---
name: adaptive-routing
description: "Decision procedure and evaluation guidelines for capability-based adaptive model routing and reasoning escalation across Codex, Claude Code, and Antigravity."
---

# Adaptive Model Routing & Reasoning Escalation

This skill defines the provider-neutral decision procedure for capability-based model selection, reasoning escalation, and de-escalation across AI coding assistants.

## Decision Procedure

```
Task Arrives
   │
   ├─► Is the task mechanical, bounded, read-only, or deterministic?
   │     └─► Tier 1: Light model / low effort (or deterministic tools)
   │
   ├─► Is the task ordinary implementation, bugfix, or standard unit test?
   │     └─► Tier 2: Standard capable model / medium effort
   │
   ├─► Is requirements ambiguity, subtle debugging, or architecture involved?
   │     └─► Tier 3: Escalate to strong model / high effort
   │
   ├─► Does the task touch auth, security, data integrity, concurrency,
   │   irreversible migrations, or has an identical approach repeated failed?
   │     └─► Tier 4: Maximum effort / independent evaluator-reviewer
   │
   └─► Has the critical portion succeeded and only routine checks remain?
         └─► De-escalate: Return to Tier 1 or Tier 2 for routine completion
```

## Provider Mapping

| Platform | Tier 1 (Light) | Tier 2 (Standard) | Tier 3 (Escalate) | Tier 4 (Critical/Review) |
| --- | --- | --- | --- | --- |
| **Codex** | `light-explorer` (`low` effort) | Default session model (`medium` effort) | `high` effort override | `code-reviewer` profile (`high` effort) |
| **Claude Code** | `haiku` / `light-explorer` | `sonnet` / standard agent | `sonnet` (`high` effort / advisor) | `opus` or independent `code-reviewer` |
| **Antigravity** | `flash` / `light-explorer` | Standard default model | `pro` / deep reasoning | `pro` verifier / independent evaluator |

## Fallback & Constraints

1. If a requested tier or model is unavailable or rate-limited, use an authorized fallback or explicitly disclose the blocker.
2. Never silently incur unauthorized paid API costs.
3. Keep verification proportionate to risk.
