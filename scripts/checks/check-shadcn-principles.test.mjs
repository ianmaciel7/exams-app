import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { inspectPrinciples } from "./check-base-ui-principles.mjs";
import { SHADCN } from "./check-shadcn-principles.mjs";

const table = (rows) =>
  `<!-- shadcn-version: 4.23.0 -->\n| Principle | Guard |\n| --- | --- |\n${rows}\n`;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "shadcn-principles-"));
  for (const file of files) {
    mkdirSync(join(root, file, ".."), { recursive: true });
    writeFileSync(join(root, file), "");
  }
  return root;
}

test("accepts a complete shadcn matrix", () => {
  const root = fixture([".ast-grep/rules/shadcn/prefer-size-utility.yml"]);
  try {
    assert.deepEqual(
      inspectPrinciples({
        markdown: table("| Use size-* | rule:prefer-size-utility |"),
        root,
        installedVersion: "4.23.0",
        config: SHADCN,
      }),
      [],
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});

test("rejects an unlisted shadcn rule and a shadcn version drift", () => {
  const root = fixture([".ast-grep/rules/shadcn/orphan.yml"]);
  try {
    const errors = inspectPrinciples({
      markdown: table("| A | manual:reviewed by the code reviewer |"),
      root,
      installedVersion: "4.24.0",
      config: SHADCN,
    }).join("\n");
    assert.match(errors, /reviewed for shadcn 4\.23\.0 but 4\.24\.0/);
    assert.match(
      errors,
      /rule orphan is not listed in docs\/agents\/shadcn-principles\.md/,
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});
