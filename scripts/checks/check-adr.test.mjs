import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectAdrs } from "./check-adr.mjs";

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "adr-check-"));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

const adr = (number, body = "") =>
  `# ADR ${String(number).padStart(4, "0")}: Example\n\n${body}\n`;

test("accepts sequential, indexed records without infra", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1),
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectAdrs(root), []);
});

test("accepts infra when an ADR records Terraform", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-terraform.md": adr(1, "Uses Terraform."),
    "docs/adr/README.md": "[0001](0001-configure-terraform.md)",
    "infra/main.tf": "",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectAdrs(root), []);
});

test("rejects infra without a Terraform ADR", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1, "Nothing relevant."),
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
    "infra/main.tf": "",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const problems = inspectAdrs(root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /infra\/ exists but no ADR/);
});

test("rejects an ADR missing from the index", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1),
    "docs/adr/README.md": "No entries.",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAdrs(root)[0], /missing index entry/);
});

test("rejects a gap in ADR numbers", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1),
    "docs/adr/0003-configure-three.md": adr(3),
    "docs/adr/README.md":
      "[0001](0001-configure-one.md) [0003](0003-configure-three.md)",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAdrs(root)[0], /expected ADR number 0002/);
});

test("rejects a record whose heading does not match its number", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": "# ADR 0009: Wrong\n",
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAdrs(root)[0], /missing heading/);
});

test("rejects the rules tests without an emulator ADR", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1, "Nothing relevant."),
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
    "tests/rules/firestore.test.mjs": "",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAdrs(root)[0], /tests\/rules\/ exists but no ADR/);
});

test("accepts the rules tests when an ADR names the emulator library", (t) => {
  const root = fixture({
    "docs/adr/0001-test-rules.md": adr(1, "Uses @firebase/rules-unit-testing."),
    "docs/adr/README.md": "[0001](0001-test-rules.md)",
    "tests/rules/firestore.test.mjs": "",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectAdrs(root), []);
});

test("rejects a reference to an ADR number that does not exist", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1, "See ADR 0007 for details."),
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAdrs(root)[0], /refers to ADR 0007/);
});

test("accepts a former ADR heading for a merged record", (t) => {
  const root = fixture({
    "docs/adr/0001-configure-one.md": adr(1, "### Former ADR 0007: Merged"),
    "docs/adr/README.md": "[0001](0001-configure-one.md)",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectAdrs(root), []);
});
