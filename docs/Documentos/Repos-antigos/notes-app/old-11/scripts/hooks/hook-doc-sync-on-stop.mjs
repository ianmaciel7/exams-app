#!/usr/bin/env node
/**
 * hook-doc-sync-on-stop.mjs
 *
 * Stop hook that verifies documentation was updated whenever code or
 * configuration files were modified during the current agent session.
 */

import { spawnSync } from "node:child_process";
import {
  checkDocSync,
  formatFindings,
  normalizePath,
} from "../guards/guard-doc-sync-lib.mjs";
import { findRepoRoot, isStopHookActive, readStdin } from "./hooks-lib.mjs";

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
    timeout: 30_000,
  });

const status = run("git", ["status", "--porcelain"]);
if (status.error || status.status !== 0) {
  process.exit(0);
}

const files = status.stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.slice(3).trim())
  .map(normalizePath);

const envBypass =
  process.env.ALLOW_NO_DOC === "1" ||
  process.env.ALLOW_NO_DOC === "true" ||
  process.env.SKIP_DOC_SYNC === "1" ||
  process.env.SKIP_DOC_SYNC === "true";

const result = checkDocSync(files, { allowNoDoc: envBypass });
if (!result.pass) {
  process.stderr.write(`${formatFindings(result)}\n`);
  process.exit(2);
}

process.exit(0);
