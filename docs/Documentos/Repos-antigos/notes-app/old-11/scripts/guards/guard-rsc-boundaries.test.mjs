import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

test("guard-rsc-boundaries passes on current repository structure", () => {
  const output = execFileSync(
    "node",
    ["scripts/guards/guard-rsc-boundaries.mjs"],
    {
      encoding: "utf8",
    }
  );
  assert.match(output, /top-level App Router server boundaries passed/);
});
