import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectQuestionTypeCoverage,
  inspectRepository,
} from "./guard-question-types-lib.mjs";

test("repository question type coverage is synchronized", () => {
  assert.deepEqual(inspectRepository(new URL("../..", import.meta.url).href), {
    failures: [],
  });
});

test("reports a type missing from a persistence surface", () => {
  const result = inspectQuestionTypeCoverage({
    questionTypes: ["single-choice", "ordering"],
    parser: ["single-choice"],
    rules: ["single-choice", "ordering"],
  });

  assert.deepEqual(result.failures, [
    { surface: "parser", missing: ["ordering"], extra: [] },
  ]);
});
