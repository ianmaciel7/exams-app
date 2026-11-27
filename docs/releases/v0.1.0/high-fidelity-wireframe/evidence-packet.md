# High-Fidelity Wireframe Evidence Packet — v0.1.0

Purpose: Pre-change baseline verification, isolated Open Artifact MCP and native comment lifecycle verification, and explicit disclosure of live host limits for the High-Fidelity Wireframe remediation cycle.
Baseline `dev` HEAD: `17bc17e923551288b8a6510f6197b8881cd7dfb1`
Pinned Open Artifact runtime: `v0.17.0` (commit `0f6079853c8b0d2f4e9bddf5465ddbda722ce5a9`)

## 1. Pre-Change Baseline Evidence (`17bc17e`)

All deterministic checks and board inventories below were executed directly against baseline `dev` commit `17bc17e923551288b8a6510f6197b8881cd7dfb1` before edits in this cycle:

### 1.1 Deterministic Checks at Baseline

| Check | Command | Observed Result |
| --- | --- | --- |
| Board integrity and release consistency | `node scripts/check-boards.mjs` | Exit `0`. All 11 canonical boards reported `OK`; `Release consistency: OK`. |
| Fidelity coverage ledger | `node scripts/check-fidelity-coverage.mjs` | Exit `0`. Output: `Fidelity coverage ledger valid (stage closure separately gated)`. |
| Unit test suites | `node --test scripts/check-boards.test.mjs scripts/sync-release-state.test.mjs scripts/open-artifact-runtime.test.mjs scripts/context-metrics.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs` | Exit `0`. `20` tests, `20` passed, `0` failed, `0` skipped (`duration_ms 1733.4711`). |

### 1.2 Baseline Board Catalog (`open-artifact-library.mjs catalog`)

| Key | Preview ID | Path | Title | Elements | `.artifact.json` Marker |
| --- | --- | --- | --- | --- | --- |
| `overview` | `art_examappoverview` | `docs/boards/overview` | `Exam App — Ideas Board` | `73` | `false` |
| `releases` | `art_examappreleasestages` | `docs/boards/release-stages` | `Release stages` | `13` | `false` |
| `hub` | `art_examappprojecthub` | `docs/boards/project-hub` | `Exam App — project hub` | `28` | `false` |
| `product` | `art_examappproductv010` | `docs/releases/v0.1.0/product` | `Product — v0.1.0` | `6` | `false` |
| `architecture` | `art_examappinformationarchitecturev010` | `docs/releases/v0.1.0/information-architecture` | `Information Architecture — v0.1.0` | `8` | `false` |
| `screens` | `art_examappscreeninventoryv010` | `docs/releases/v0.1.0/screen-inventory` | `Screen Inventory — v0.1.0` | `5` | `false` |
| `flows` | `art_examappuserflowsv010` | `docs/releases/v0.1.0/user-flows` | `User Flows — v0.1.0` | `5` | `false` |
| `sketch` | `art_examappsketchv010` | `docs/releases/v0.1.0/sketch` | `Sketch — v0.1.0` | `464` | `false` |
| `lowfidelity` | `art_examapplowfidelityv010` | `docs/releases/v0.1.0/low-fidelity-wireframe` | `Low-Fidelity Wireframe — v0.1.0` | `528` | `false` |
| `midfidelity` | `art_examappmidfidelityv010` | `docs/releases/v0.1.0/mid-fidelity-wireframe` | `Mid-Fidelity Wireframe — v0.1.0` | `790` | `false` |
| `highfidelity` | `art_examapphighfidelityv010` | `docs/releases/v0.1.0/high-fidelity-wireframe` | `High-Fidelity Wireframe — v0.1.0` | `713` | `false` |

### 1.3 Baseline Viewer Context & Known Visual Overlap (`_agent/view-context.json`)

Observed in `docs/releases/v0.1.0/high-fidelity-wireframe/_agent/view-context.json` (captured at `2026-11-27T18:25:36.737Z`, zoom `0.35`, claim `c018ncog`):

- `words_covered`: `desktop_q_option1` covered by `desktop_q_correct` (`hidden: 0.77`)
- `words_covered`: `desktop_q_option2` covered by `desktop_q_wrong` (`hidden: 0.77`)
- `words_covered`: `desktop_q_result` covered by `desktop_q_locked` (`hidden: 0.66`)

Prior capture provenance recorded in [current-state.json](../current-state.json) covers Mid-Fidelity approval (`ec20139c96062542fc7eabb7424333b4fec6412f`, CI run `46024835242`, artifact `15211487561`). High-Fidelity visual review remains `pending` and `coverageGate.status` remains `blocked`.

## 2. Native Comment Lifecycle & MCP Smoke Verification (Disposable Fixture)

Command executed: `node scripts/open-artifact-mcp.integration.mjs`

Result: **Exit `0`** (executed in an isolated temporary `OPEN_ARTIFACT_HOME` and `.open-artifact-runtime/mcp-test-*` scratch directory without modifying canonical repository boards or user global daemon state).

Observed stdout:

```text
MCP: 3 harnesses, 9 types, shared page/board reads, write, stale-write rejection, outside-workspace denial, comment read passed.
Collaboration: 3 hook dialects, owner-only delivery, no duplicate delivery, Stop response, native anchored comment, MCP reply and resolution passed.
```

Verified behaviors in the disposable fixture run:

1. **Multi-harness MCP stdio initialization:** `codex`, `claude-code`, and `antigravity` harnesses all connected and exposed `Artifact`, `ArtifactData`, and `ArtifactComments`, listing all 9 pinned types (`data`, `design`, `design-system`, `docs`, `motion`, `page`, `sheets`, `slides`, `whiteboard`).
2. **Confinement and optimistic concurrency:** Cross-harness read/write succeeded within workspace scratch; stale `if_match` write was rejected (`conflict` / `not_executed`); outside-workspace publish was denied (`not_granted`).
3. **Host hook dialects and delivery isolation:** `artifacts.ask` routed requests through `PreInvocation` (`antigravity`) and `UserPromptSubmit` (`codex`, `claude-code`) to the owning session only, with no duplicate delivery and no cross-session leakage, and verified `Stop` hook payloads (`continue` for `antigravity`, `block` for `codex`/`claude-code`).
4. **Native anchored comment lifecycle:** Created an anchored comment on `#wb-n1 > wx50005000:nth-of-type(1)` via `_api/comments/create`, delivered via `_api/comments/send`, read via `ArtifactComments` (`action: 'read'`), replied and resolved via `ArtifactComments` (`action: 'reply', resolve: true`), and confirmed `status === 'resolved'`.

## 3. Explicit Disclosure of Live Host Limits

Diagnostics executed against the active host environment:

1. **`node scripts/open-artifact-runtime.mjs resolve`:** Located pinned `v0.17.0` runtime under `.open-artifact-runtime/v0.17.0/open-artifact-plugins`.
2. **`node scripts/open-artifact-runtime.mjs doctor antigravity`:** Reported `counts: { ok: 10, warn: 3, fail: 0, n/a: 1 }` with 3 warnings:
   - `home`: `.open-artifact-runtime\home` does not exist yet.
   - `daemon`: `The daemon is not running`.
   - `harness-adapter`: `No adapter of antigravity can be connected: the daemon is not running` (`tools: not checked (the daemon is not running)`).
3. **`node scripts/open-artifact-library.mjs status`:** Exited `1` with `Native daemon is not running. Start the official plugin and open its library first.`
4. **Session tool surface:** The active Antigravity agent session does not expose live Open Artifact MCP tools (`Artifact`, `ArtifactData`, `ArtifactComments`, `ShowArtifact`).

### Operational Impact of These Limits

- Because the live Open Artifact daemon and host MCP adapter are not connected in this session, live host-bound anchored comment creation/resolution on canonical repository boards (`docs/releases/v0.1.0/high-fidelity-wireframe`) and live Shell library queries cannot be executed directly from the agent session.
- `open-artifact-mcp.integration.mjs` proves protocol, hook, and comment-lifecycle correctness on a disposable isolated fixture, NOT live host permission or active Antigravity plugin connectivity.
- Visual acceptance of the High-Fidelity Wireframe remains gated on actual rendered Light and Dark captures, QA ledger review, and explicit owner approval. `coverageGate.status` MUST stay `"blocked"` and `stageStatus` MUST stay `"in progress"`.
