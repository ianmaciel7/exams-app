import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  isApplicationComponentPath,
  listApplicationComponentDirs,
  listApplicationComponentFiles,
} from "./component-scope-lib.mjs";

test("treats every folder except ui and firebase as application components", () => {
  assert.equal(
    isApplicationComponentPath("src/components/notes-app/x-card.tsx"),
    true
  );
  assert.equal(
    isApplicationComponentPath("src/components/billing/plan-card.tsx"),
    true
  );
  assert.equal(
    isApplicationComponentPath("src/components/ui/button.tsx"),
    false
  );
  assert.equal(
    isApplicationComponentPath("src/components/firebase/sign-in-form.tsx"),
    false
  );
});

test("ignores non-component paths", () => {
  assert.equal(isApplicationComponentPath("src/components/x-card.tsx"), false);
  assert.equal(
    isApplicationComponentPath("src/components/notes-app/x-card.ts"),
    false
  );
  assert.equal(
    isApplicationComponentPath("src/components/notes-app/deep/x-card.tsx"),
    true
  );
  assert.equal(isApplicationComponentPath("src/app/page.tsx"), false);
});

test("lists files from application folders only", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "component-scope-"));
  try {
    for (const dir of ["ui", "firebase", "notes-app", "billing"]) {
      mkdirSync(path.join(root, "src/components", dir), { recursive: true });
      writeFileSync(path.join(root, "src/components", dir, "x-card.tsx"), "");
    }
    writeFileSync(path.join(root, "src/components/notes-app/x.ts"), "");

    const dirs = listApplicationComponentDirs(root).map((dir) =>
      path.basename(dir)
    );
    assert.deepEqual(dirs.sort(), ["billing", "notes-app"]);

    const files = listApplicationComponentFiles(root).map((file) =>
      path.relative(root, file).replaceAll("\\", "/")
    );
    assert.deepEqual(files.sort(), [
      "src/components/billing/x-card.tsx",
      "src/components/notes-app/x-card.tsx",
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("returns nothing when src/components does not exist", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "component-scope-"));
  try {
    assert.deepEqual(listApplicationComponentDirs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
