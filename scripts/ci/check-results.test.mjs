import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflow = readFileSync(
  new URL("../../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
const expression = workflow.match(/jq -e '([^']+)'/)?.[1];
assert.ok(expression, "CI result must have an executable jq predicate");
const required = [
  "static",
  "build",
  "e2e",
  "auth-emulator",
  "rules",
  "security",
];
const results = Object.fromEntries(
  [...required, "production-smoke"].map((name) => [
    name,
    { result: "success" },
  ]),
);
function accepts(input) {
  const run = spawnSync("jq", ["-e", expression], {
    input: JSON.stringify(input),
    encoding: "utf8",
  });
  assert.ifError(run.error);
  assert.ok([0, 1].includes(run.status), run.stderr);
  return run.status === 0;
}

test("the gate accepts success and an omitted optional smoke target", () => {
  assert.equal(accepts(results), true);
  assert.equal(
    accepts({ ...results, "production-smoke": { result: "skipped" } }),
    true,
  );
});

test("every required job fails closed on failure, cancellation or skipping", () => {
  for (const job of required) {
    for (const result of ["failure", "cancelled", "skipped"]) {
      assert.equal(
        accepts({ ...results, [job]: { result } }),
        false,
        `${job}: ${result}`,
      );
    }
  }
  for (const result of ["failure", "cancelled"]) {
    assert.equal(
      accepts({ ...results, "production-smoke": { result } }),
      false,
    );
  }
});
