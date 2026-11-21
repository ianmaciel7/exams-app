#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  evaluateHealth,
  readHealthMetrics,
  tightenFloor,
} from "./guard-code-health-lib.mjs";

const floorUrl = new URL("./code-health-floor.json", import.meta.url);
const rootDir = new URL("../../", import.meta.url);
const fallowBin = new URL("node_modules/fallow/bin/fallow", rootDir);
const tighten = process.argv.includes("--tighten");

const run = spawnSync(
  process.execPath,
  [
    fileURLToPath(fallowBin),
    "health",
    "--score",
    "--complexity",
    "--format",
    "json",
    "--quiet",
    "--report-only",
  ],
  { cwd: rootDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);
if (run.error || run.status !== 0) {
  console.error(
    `guard-code-health: fallow failed: ${run.error?.message ?? run.stderr}`
  );
  process.exit(2);
}

const floor = JSON.parse(readFileSync(floorUrl, "utf8"));
const metrics = readHealthMetrics(JSON.parse(run.stdout));
const { failures, canTighten } = evaluateHealth(metrics, floor);

console.log(
  `guard-code-health: score ${metrics.score} (floor ${floor.minScore}), ` +
    `complexity findings ${metrics.complexityFindings} (max ${floor.maxComplexityFindings}), ` +
    `large functions ${metrics.largeFunctions} (max ${floor.maxLargeFunctions})`
);

if (failures.length > 0) {
  for (const f of failures) {
    console.error(
      `guard-code-health: ${f.metric} regressed: ${f.actual} vs limit ${f.limit}`
    );
  }
  console.error(
    "Refactor the new or changed code (run `pnpm exec fallow health --complexity` to locate it); do not raise the floor. See CONSTRAINTS.md."
  );
  process.exit(1);
}

if (canTighten && tighten) {
  const next = tightenFloor(metrics, floor);
  writeFileSync(floorUrl, `${JSON.stringify(next, null, 2)}\n`);
  console.log("guard-code-health: floor tightened in code-health-floor.json");
} else if (canTighten) {
  console.log(
    "guard-code-health: metrics improved; run `pnpm run check:health -- --tighten` to lock the gain."
  );
}
