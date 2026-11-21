#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  detectAgentType,
  findRepoRoot,
  isBiomeChecked,
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

if (!relative || !isBiomeChecked(relative)) {
  finish(0);
}

const run = (command, args) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

const problems = [];

const biome = run("rtk", [
  "pnpm",
  "exec",
  "biome",
  "check",
  "--write",
  "--no-errors-on-unmatched",
  relative,
]);
if (!biome.error && biome.status !== 0) {
  problems.push(
    `Biome found issues in ${relative} that could not be auto-fixed:\n${biome.stdout ?? ""}${biome.stderr ?? ""}`
  );
}

// Run after Biome so the guard sees the formatted file. Exit status 1 is a
// rule violation; anything else is a guard crash and must not block the edit.
const conventions = run("node", [
  "scripts/guards/guard-conventions.mjs",
  relative,
]);
if (conventions.status === 1) {
  problems.push(conventions.stderr ?? "");
}

// Antigravity cannot block on hook output, so it always exits cleanly.
if (problems.length === 0 || agentType === "antigravity") {
  finish(0);
}

process.stderr.write(problems.join("\n"));
process.exit(2);
