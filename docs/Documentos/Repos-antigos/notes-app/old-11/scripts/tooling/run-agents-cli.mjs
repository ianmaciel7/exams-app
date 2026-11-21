#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("run-agents-cli: pass an agents CLI subcommand");
  process.exit(2);
}

const isWin = process.platform === "win32";
const bin = isWin ? "agents.cmd" : "agents";
const direct = spawnSync(bin, args, { stdio: "inherit", shell: isWin });
if (direct.error?.code !== "ENOENT") {
  process.exit(direct.status ?? 1);
}

console.error(
  "run-agents-cli: agents CLI not found; using pinned @agents-dev/cli@0.9.1 via pnpm dlx"
);
const pnpm = isWin ? "pnpm.cmd" : "pnpm";
const fallback = spawnSync(pnpm, ["dlx", "@agents-dev/cli@0.9.1", ...args], {
  stdio: "inherit",
  shell: isWin,
});
if (fallback.error) {
  console.error(`run-agents-cli: ${fallback.error.message}`);
  process.exit(2);
}
process.exit(fallback.status ?? 1);
