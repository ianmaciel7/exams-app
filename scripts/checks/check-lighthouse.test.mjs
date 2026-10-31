import assert from "node:assert/strict";
import test from "node:test";
import {
  budgetFor,
  defaultBudget,
  evaluateLighthouseReport,
  summarizeLighthouseReport,
} from "./check-lighthouse.mjs";

function report({ scores = {}, cls = 0 } = {}) {
  const categories = Object.fromEntries(
    Object.keys(defaultBudget.categories).map((id) => [
      id,
      { id, score: scores[id] ?? 1 },
    ]),
  );
  return {
    categories,
    audits: {
      "cumulative-layout-shift": { numericValue: cls, displayValue: `${cls}` },
      "largest-contentful-paint": { displayValue: "1.0 s" },
    },
  };
}

test("passes a report that meets every budget", () => {
  assert.deepEqual(evaluateLighthouseReport(report()), []);
});

test("passes scores exactly at the minimum", () => {
  assert.deepEqual(
    evaluateLighthouseReport(report({ scores: { accessibility: 0.95 } })),
    [],
  );
});

test("fails a category below its minimum", () => {
  const failures = evaluateLighthouseReport(
    report({ scores: { accessibility: 0.9 } }),
  );
  assert.equal(failures.length, 1);
  assert.match(failures[0], /accessibility scored 90, below 95/);
});

test("fails a layout shift above the Core Web Vitals threshold", () => {
  const failures = evaluateLighthouseReport(report({ cls: 0.25 }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /cumulative-layout-shift is 0.250/);
});

test("fails a report with a missing category or audit", () => {
  const failures = evaluateLighthouseReport({ categories: {}, audits: {} });
  assert.equal(
    failures.length,
    Object.keys(defaultBudget.categories).length +
      Object.keys(defaultBudget.audits).length,
  );
});

test("summarizes scores and Core Web Vitals", () => {
  assert.match(
    summarizeLighthouseReport(report()),
    /accessibility 100.*LCP 1.0 s; CLS 0/,
  );
});

test("holds the home LCP under its route ceiling", () => {
  const home = report();
  home.audits["largest-contentful-paint"].numericValue = 6000;
  const failures = evaluateLighthouseReport(home, budgetFor("/"));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /largest-contentful-paint is 6000.000, above 4000/);
});

test("keeps the shared budget for routes without overrides", () => {
  assert.deepEqual(budgetFor("/sign-in"), defaultBudget);
});
