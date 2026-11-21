import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import {
  parseIndex,
  reachableScripts,
  verifyIndex,
} from "./verify-conventions-index-lib.mjs";

const scripts = {
  "check:fast": "pnpm run check:lint && pnpm run check:conventions",
  "check:lint": "biome ci src",
  "check:conventions": "node scripts/guards/guard-conventions.mjs",
  "check:orphan": "node orphan.mjs",
};

const doc = (rows) => `# Doc

## 9. Enforcement Index

| Rule | Enforcer |
| --- | --- |
${rows}

## 10. Next
`;

test("parseIndex reads rule ids and enforcers", () => {
  const rows = parseIndex(
    doc("| `no-x` | `check:conventions` |\n| `be-nice` | review-only |")
  );
  assert.deepEqual(
    rows.map((r) => [r.id, r.reviewOnly, r.scripts]),
    [
      ["no-x", false, ["check:conventions"]],
      ["be-nice", true, []],
    ]
  );
});

test("reachableScripts follows pnpm run chains", () => {
  assert.deepEqual([...reachableScripts(scripts, "check:fast")].sort(), [
    "check:conventions",
    "check:fast",
    "check:lint",
  ]);
});

test("verifyIndex accepts a consistent index", () => {
  const result = verifyIndex({
    markdown: doc(
      "| `no-x` | `check:conventions` |\n| `be-nice` | review-only |"
    ),
    scripts,
    ruleIds: ["no-x"],
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.enforced, 1);
  assert.equal(result.reviewOnly, 1);
});

test("verifyIndex rejects unknown, ungated and missing enforcers", () => {
  const result = verifyIndex({
    markdown: doc(
      "| `a` | `check:missing` |\n| `b` | `check:orphan` |\n| `c` | tbd |\n| `a` | review-only |"
    ),
    scripts,
    ruleIds: ["no-x"],
  });
  assert.equal(result.errors.length, 5);
  assert.match(result.errors.join("\n"), /check:missing.*not in package\.json/);
  assert.match(result.errors.join("\n"), /check:orphan.*does not run/);
  assert.match(result.errors.join("\n"), /`c`: enforcer must be/);
  assert.match(result.errors.join("\n"), /duplicate rule id `a`/);
  assert.match(result.errors.join("\n"), /`no-x` is missing/);
});

test("verifyIndex requires guard rules to name check:conventions", () => {
  const result = verifyIndex({
    markdown: doc("| `no-x` | review-only |"),
    scripts,
    ruleIds: ["no-x"],
  });
  assert.match(result.errors[0], /must list `check:conventions`/);
});

test("verifyIndex fails when the section is absent", () => {
  const result = verifyIndex({ markdown: "# nothing", scripts, ruleIds: [] });
  assert.match(result.errors[0], /no Enforcement Index/);
});

test("verify-conventions-index passes on the repository", () => {
  const output = execFileSync(
    "node",
    ["scripts/verify/verify-conventions-index.mjs"],
    { encoding: "utf8" }
  );
  assert.match(output, /review-only/);
});
