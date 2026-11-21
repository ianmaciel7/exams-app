import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateHealth,
  readHealthMetrics,
  tightenFloor,
} from "./guard-code-health-lib.mjs";

const floor = {
  minScore: 72.7,
  maxComplexityFindings: 124,
  maxLargeFunctions: 46,
};

test("reads metrics from a fallow health report", () => {
  const metrics = readHealthMetrics({
    health_score: { score: 73 },
    findings: [{}, {}],
    large_functions: [{}],
  });
  assert.deepEqual(metrics, {
    score: 73,
    complexityFindings: 2,
    largeFunctions: 1,
  });
});

test("rejects a report without a score", () => {
  assert.throws(() => readHealthMetrics({}), /health_score/);
});

test("passes when metrics equal the floor", () => {
  const result = evaluateHealth(
    { score: 72.7, complexityFindings: 124, largeFunctions: 46 },
    floor
  );
  assert.deepEqual(result, { failures: [], canTighten: false });
});

test("reports every regressed metric", () => {
  const result = evaluateHealth(
    { score: 70, complexityFindings: 125, largeFunctions: 47 },
    floor
  );
  assert.deepEqual(
    result.failures.map((f) => f.metric),
    ["score", "complexityFindings", "largeFunctions"]
  );
});

test("flags improvement so the floor can be tightened", () => {
  const metrics = { score: 75, complexityFindings: 100, largeFunctions: 46 };
  assert.equal(evaluateHealth(metrics, floor).canTighten, true);
  assert.deepEqual(tightenFloor(metrics, floor), {
    minScore: 75,
    maxComplexityFindings: 100,
    maxLargeFunctions: 46,
  });
});

test("tightening never loosens the floor", () => {
  const metrics = { score: 60, complexityFindings: 200, largeFunctions: 90 };
  assert.deepEqual(tightenFloor(metrics, floor), floor);
});
