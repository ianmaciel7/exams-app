#!/usr/bin/env node
import {
  classifyDelegation,
  findRepoRoot,
  logHookEvent,
  preToolUseDecision,
  readStdin,
} from "./hooks-lib.mjs";

const verdict = classifyDelegation(await readStdin());

if (verdict) {
  logHookEvent(findRepoRoot(), {
    hook: "guard-agent-delegation",
    action: verdict.action,
  });
  process.stdout.write(preToolUseDecision(verdict.action, verdict.reason));
}
process.exit(0);
