#!/usr/bin/env node
import {
  classifyPath,
  detectAgentType,
  findRepoRoot,
  logHookEvent,
  parseHookFilePath,
  preToolUseDecision,
  readStdin,
  repoRelativePath,
} from "./hooks-lib.mjs";

const raw = await readStdin();
const agentType = detectAgentType(raw);
const filePath = parseHookFilePath(raw);
const root = findRepoRoot();
const relative = filePath && repoRelativePath(root, filePath);
const verdict = relative && classifyPath(relative);

if (verdict) {
  logHookEvent(root, {
    hook: "guard-paths",
    action: verdict.action,
    path: relative,
  });
  process.stdout.write(
    agentType === "antigravity"
      ? JSON.stringify({ decision: verdict.action, reason: verdict.reason })
      : preToolUseDecision(verdict.action, verdict.reason)
  );
  process.exit(0);
}

if (agentType === "antigravity") {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
}
process.exit(0);
