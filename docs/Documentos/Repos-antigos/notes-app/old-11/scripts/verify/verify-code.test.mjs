import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import {
  buildPlan,
  classifyTier,
  formatReport,
  parseConstraintGates,
  reviewChecklistGaps,
  stripPassthroughSeparator,
} from "./verify-code-lib.mjs";

const constraints = `# Constraints

## Floor (always enforced)

- nothing

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
| --- | --- | --- | --- |
| Types | Zero type errors | \`pnpm run check:types\` | task end |
| Floor | Zero findings | \`pnpm run check:floor\` | every task end |
| Coverage | At least 80% | \`pnpm run test:coverage\` | CI |
| Lighthouse | Score 0.90 | \`pnpm run lighthouse\` | relevant UI changes |
| OSV | No new vulnerabilities | OSV-Scanner differential workflow | PR |

## Measured, not yet enforced

| Metric | Current state | Direction | Measured by |
| --- | --- | --- | --- |
| Baseline | existing | reduce | \`pnpm run check:osv\` |
`;

const conventions = `# Conventions

## 9. Enforcement Index

| Rule | Enforcer |
| --- | --- |
| \`no-any\` | \`check:lint\` |
| \`strict-types\` | \`check:types\` |
| \`reuse-primitives\` | review-only |
`;

const scripts = {
  "check:types": "tsc",
  "check:floor": "node floor.mjs",
  "check:lint": "biome ci",
  "test:coverage": "vitest run --coverage",
  lighthouse: "lhci autorun",
};

const checklist = "- `reuse-primitives`: check it";

const plan = (overrides = {}) =>
  buildPlan({ constraints, conventions, scripts, checklist, ...overrides });

test("classifyTier maps the Runs at column to a tier", () => {
  assert.equal(classifyTier("task end"), "task");
  assert.equal(classifyTier("every task end"), "task");
  assert.equal(classifyTier("CI"), "ci");
  assert.equal(classifyTier("PR"), "on-demand");
  assert.equal(classifyTier("relevant UI changes"), "on-demand");
});

test("parseConstraintGates reads only the enforced table", () => {
  const gates = parseConstraintGates(constraints);
  assert.deepEqual(
    gates.map((gate) => [gate.dimension, gate.script, gate.tier]),
    [
      ["Types", "check:types", "task"],
      ["Floor", "check:floor", "task"],
      ["Coverage", "test:coverage", "ci"],
      ["Lighthouse", "lighthouse", "on-demand"],
      ["OSV", null, "on-demand"],
    ]
  );
  assert.equal(parseConstraintGates("# nothing"), null);
});

test("task scope runs task-end gates and the convention enforcers", () => {
  const result = plan();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    result.steps.map((step) => step.script),
    ["check:types", "check:floor", "check:lint"]
  );
  const types = result.steps.find((step) => step.script === "check:types");
  assert.deepEqual(types.dimensions, ["Types"]);
  assert.deepEqual(types.rules, ["strict-types"]);
  assert.deepEqual(result.reviewOnly, ["reuse-primitives"]);
  assert.deepEqual(result.skipped, []);
});

test("ci scope adds CI gates; all scope adds on-demand gates and skips", () => {
  assert.ok(
    plan({ scope: "ci" }).steps.some((s) => s.script === "test:coverage")
  );
  assert.ok(
    !plan({ scope: "ci" }).steps.some((s) => s.script === "lighthouse")
  );
  const all = plan({ scope: "all" });
  assert.ok(all.steps.some((step) => step.script === "lighthouse"));
  assert.match(all.skipped[0].reason, /no `pnpm run` command/);
});

test("--only narrows the plan and rejects unknown gates", () => {
  assert.deepEqual(
    plan({ only: ["check:lint"] }).steps.map((step) => step.script),
    ["check:lint"]
  );
  assert.match(plan({ only: ["check:nope"] }).errors[0], /check:nope/);
});

test("drift between the documents and package.json is reported", () => {
  const missing = plan({ scripts: { "check:types": "tsc" } });
  const text = missing.errors.join("\n");
  assert.match(text, /"Floor" runs `check:floor`.*not in package\.json/);
  assert.match(text, /rule `no-any` names `check:lint`/);
});

test("missing sections and unknown scopes are reported", () => {
  assert.match(
    plan({ constraints: "# nothing" }).errors.join("\n"),
    /no "Enforced with numbers" table/
  );
  assert.match(
    plan({ conventions: "# nothing" }).errors[0],
    /no Enforcement Index/
  );
  assert.match(plan({ scope: "everything" }).errors[0], /unknown scope/);
});

test("a review-only rule without a checklist entry is reported", () => {
  assert.deepEqual(reviewChecklistGaps(["a", "b"], "- `a`: x"), ["b"]);
  assert.match(
    plan({ checklist: "" }).errors[0],
    /`reuse-primitives`.*checklist/
  );
});

test("formatReport names the rules behind a failed gate", () => {
  const report = formatReport({
    plan: plan(),
    results: [
      {
        script: "check:types",
        dimensions: ["Types"],
        rules: ["strict-types"],
        pass: false,
        seconds: 1.5,
        error: "TS2322",
      },
    ],
    checklistPath: "list.md",
  });
  assert.match(report, /FAIL {2}check:types/);
  assert.match(report, /Convention rules behind this gate: strict-types/);
  assert.match(report, /TS2322/);
  assert.match(report, /reuse-primitives/);
});

test("a leading -- from pnpm run is dropped before flags are parsed", () => {
  assert.deepEqual(stripPassthroughSeparator(["--", "--list"]), ["--list"]);
  assert.deepEqual(stripPassthroughSeparator(["--list"]), ["--list"]);
  const output = execFileSync(
    "node",
    ["scripts/verify/verify-code.mjs", "--", "--list", "--scope", "ci"],
    { encoding: "utf8" }
  );
  assert.match(output, /scope: ci/);
});

test("verify-code plans cleanly against the repository documents", () => {
  const output = execFileSync(
    "node",
    ["scripts/verify/verify-code.mjs", "--list", "--json"],
    { encoding: "utf8" }
  );
  const repoPlan = JSON.parse(output);
  assert.deepEqual(repoPlan.errors, []);
  assert.ok(repoPlan.steps.some((step) => step.script === "check:conventions"));
});
