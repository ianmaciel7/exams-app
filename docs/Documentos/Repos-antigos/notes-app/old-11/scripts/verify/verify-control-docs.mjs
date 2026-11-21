#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const verifiers = [
  "verify-agents.js",
  "verify-architecture.js",
  "verify-context.js",
  "verify-contributing.js",
  "verify-conventions.js",
  "verify-design.js",
  "verify-intent.js",
  "verify-readme.js",
  "verify-security.js",
  "verify-testing.js",
  "verify-constraints.js",
];

const base = new URL(
  "../../.agents/skills/context-manager/scripts/",
  import.meta.url
);
const failures = [];
for (const verifier of verifiers) {
  const script = fileURLToPath(new URL(verifier, base));
  const result = spawnSync(process.execPath, [script, ".", "--quiet"], {
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) {
    failures.push(verifier);
  }
}
if (failures.length) {
  console.error(
    `control-docs: ${failures.length} verifier(s) failed: ${failures.join(", ")}`
  );
  process.exit(1);
}
console.log(`control-docs: ${verifiers.length} verifiers passed`);
