#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  classifyEmulatorRun,
  detectAgentType,
  findRepoRoot,
  isFirestoreRules,
  logHookEvent,
  parseHookFilePath,
  readStdin,
  repoRelativePath,
} from "./hooks-lib.mjs";

const raw = await readStdin();
const agentType = detectAgentType(raw);
const root = findRepoRoot();
const filePath = parseHookFilePath(raw);
const relative = filePath && repoRelativePath(root, filePath);

function finish(code) {
  if (agentType === "antigravity") {
    process.stdout.write(JSON.stringify({}));
  }
  process.exit(code);
}

if (!relative || !isFirestoreRules(relative)) {
  finish(0);
}

// `rtk proxy` keeps the raw output so the Vitest failure markers survive.
// The timeout stays below the hook timeout in .claude/settings.json.
const result = spawnSync(
  "rtk",
  ["proxy", "pnpm", "run", "test:firebase-emulator"],
  {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 170_000,
  }
);

const verdict = classifyEmulatorRun({
  error: result.error,
  status: result.status,
  output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
});

// Only failing tests block. A missing Java, a port clash, a timeout or a
// missing rtk means the check could not run, which is not a rules failure.
if (verdict !== "fail") {
  if (verdict === "environment") {
    logHookEvent(root, {
      hook: "firestore-rules",
      action: "skipped",
      path: relative,
    });
  }
  finish(0);
}

// Antigravity cannot block on hook output, so it always exits cleanly.
if (agentType === "antigravity") {
  finish(0);
}

process.stderr.write(
  `Firestore emulator tests failed after editing ${relative}:\n${result.stdout ?? ""}${result.stderr ?? ""}`
);
process.exit(2);
