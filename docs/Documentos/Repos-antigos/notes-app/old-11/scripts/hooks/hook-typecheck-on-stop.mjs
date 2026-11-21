#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  classifyTypecheckRun,
  findRepoRoot,
  isStopHookActive,
  readStdin,
} from "./hooks-lib.mjs";

const raw = await readStdin();
if (isStopHookActive(raw)) {
  process.exit(0);
}

const root = findRepoRoot();
const run = (command, args) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 170_000,
  });

// Skip the type check when the working tree holds no TypeScript changes.
const status = run("git", ["status", "--porcelain"]);
if (status.error || status.status !== 0) {
  process.exit(0);
}
const touchesTypeScript = status.stdout
  .split("\n")
  .some((line) => /\.(ts|tsx|mts|cts)\s*$/.test(line));
if (!touchesTypeScript) {
  process.exit(0);
}

const types = run("rtk", ["proxy", "pnpm", "run", "check:types"]);
// Only real tsc errors block; a crashed `next typegen` or a spawn error means
// the check could not run.
const verdict = classifyTypecheckRun({
  error: types.error,
  status: types.status,
  output: `${types.stdout ?? ""}${types.stderr ?? ""}`,
});
if (verdict !== "fail") {
  process.exit(0);
}

process.stderr.write(
  `check:types failed. Fix the type errors before finishing:\n${types.stdout ?? ""}${types.stderr ?? ""}`
);
process.exit(2);
