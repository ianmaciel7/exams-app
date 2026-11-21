import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkAdrPlanGuard,
  formatAdrPlanFindings,
} from "./guard-adr-plan-lib.mjs";

test("checkAdrPlanGuard passes when no ADR files changed", () => {
  const result = checkAdrPlanGuard(["src/app/page.tsx", "README.md"]);
  assert.equal(result.pass, true);
  assert.equal(result.reason, "no-adr-changes");
});

test("checkAdrPlanGuard passes when ADR has both Spec and Plan in changed files", () => {
  const result = checkAdrPlanGuard([
    "docs/adr/0017-lean-exam.md",
    "docs/product-specs/exam-topics-feed.md",
    "docs/exec-plans/active/0017-exam.md",
  ]);
  assert.equal(result.pass, true);
  assert.equal(result.reason, "lifecycle-verified");
});

test("checkAdrPlanGuard fails when ADR has Plan but lacks Spec", () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "adr-guard-spec-test-")
  );
  try {
    const plansDir = path.join(tempDir, "docs", "exec-plans", "active");
    fs.mkdirSync(plansDir, { recursive: true });
    fs.writeFileSync(path.join(plansDir, "0018-plan.md"), "# ADR 0018 Plan");

    const result = checkAdrPlanGuard(["docs/adr/0018-test.md"], {
      root: tempDir,
    });
    assert.equal(result.pass, false);
    assert.equal(result.reason, "missing-lifecycle-artifacts");
    assert.equal(result.missingSpecs.length, 1);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("checkAdrPlanGuard passes when bypassed with allowNoPlan", () => {
  const result = checkAdrPlanGuard(["docs/adr/0017-lean-exam.md"], {
    allowNoPlan: true,
  });
  assert.equal(result.pass, true);
  assert.equal(result.reason, "bypassed");
});

test("checkAdrPlanGuard checks disk for active plans and specs matching ADR", () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "adr-guard-disk-test-")
  );
  try {
    const plansDir = path.join(tempDir, "docs", "exec-plans", "active");
    const specsDir = path.join(tempDir, "docs", "product-specs");
    fs.mkdirSync(plansDir, { recursive: true });
    fs.mkdirSync(specsDir, { recursive: true });

    fs.writeFileSync(
      path.join(plansDir, "0018-active-plan.md"),
      "# Plan for ADR 0018"
    );
    fs.writeFileSync(
      path.join(specsDir, "0018-exam-spec.md"),
      "# Spec for ADR 0018"
    );

    const passResult = checkAdrPlanGuard(["docs/adr/0018-test.md"], {
      root: tempDir,
    });
    assert.equal(passResult.pass, true);
    assert.equal(passResult.reason, "lifecycle-verified");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("formatAdrPlanFindings formats output cleanly", () => {
  const pass = formatAdrPlanFindings({
    pass: true,
    message: "Everything fine",
  });
  assert.match(pass, /✓/);

  const fail = formatAdrPlanFindings({
    pass: false,
    missingSpecs: ["docs/adr/0017.md"],
    missingPlans: ["docs/adr/0017.md"],
  });
  assert.match(fail, /✗ Incomplete ADR lifecycle detected/);
});
