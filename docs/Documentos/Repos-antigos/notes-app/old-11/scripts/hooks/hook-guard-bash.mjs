#!/usr/bin/env node
import {
  classifyBashCommand,
  findRepoRoot,
  logHookEvent,
  preToolUseDecision,
  readStdin,
} from "./hooks-lib.mjs";

const verdict = classifyBashCommand(await readStdin());

if (verdict) {
  logHookEvent(findRepoRoot(), { hook: "guard-bash", action: verdict.action });
  process.stdout.write(preToolUseDecision(verdict.action, verdict.reason));
}
process.exit(0);
