import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectRelease } from "./check-release.mjs";

function fixture(version, appHosting) {
  const root = mkdtempSync(join(tmpdir(), "release-check-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ version }));
  if (appHosting !== undefined) {
    writeFileSync(join(root, "apphosting.yaml"), appHosting);
  }
  return root;
}

const yaml = (tag) =>
  `env:\n  - variable: NEXT_PUBLIC_GIT_TAG\n    value: "${tag}"\n    availability:\n      - BUILD\n`;

test("accepts a matching version and tag", (t) => {
  const root = fixture("1.2.3", yaml("v1.2.3"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectRelease(root), []);
});

test("rejects a tag that differs from the package version", (t) => {
  const root = fixture("1.2.3", yaml("v1.2.2"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectRelease(root)[0], /release tags are v<version>/);
});

test("rejects a missing tag variable", (t) => {
  const root = fixture("1.2.3", "env: []\n");
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectRelease(root)[0], /missing the NEXT_PUBLIC_GIT_TAG/);
});

test("rejects a prerelease package version", (t) => {
  const root = fixture("1.2.3-rc.1", yaml("v1.2.3-rc.1"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectRelease(root)[0], /stable Semantic Version/);
});

test("skips repositories without apphosting.yaml", (t) => {
  const root = fixture("1.2.3");
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectRelease(root), []);
});
