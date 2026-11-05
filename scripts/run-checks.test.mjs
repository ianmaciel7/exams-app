import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { discoverChecks, runChecks } from "./run-checks.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "repository checks "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "scripts/checks"), { recursive: true });
  return {
    root,
    write: (file, text) =>
      writeFileSync(join(root, "scripts/checks", file), text),
  };
}

test("discovers new checks and tests without a package script or registry", async (t) => {
  const { root, write } = fixture(t);
  write(
    "check-new.mjs",
    'import { appendFileSync } from "node:fs"; if (process.argv[1].endsWith("check-new.mjs")) appendFileSync("order", "check\\n");',
  );
  write(
    "check-new.test.mjs",
    'import { appendFileSync } from "node:fs"; import test from "node:test"; test("regression", () => appendFileSync("order", "test\\n"));',
  );
  write("check-browser.mjs", 'export const checkMode = "manual";');
  write("check-library.mjs", 'export const checkMode = "helper";');
  write(
    "check-browser.test.mjs",
    'import test from "node:test"; test("offline browser evaluator", () => {});',
  );
  const discovered = await discoverChecks(root);
  assert.deepEqual(discovered.checks, ["scripts/checks/check-new.mjs"]);
  assert.equal(discovered.tests.length, 2);
  await runChecks(root, (command, args, options) => {
    const env = { ...process.env };
    // This child is an independent runner, not an isolated file of this test.
    delete env.NODE_TEST_CONTEXT;
    return spawnSync(command, args, { ...options, env, stdio: "pipe" });
  });
  assert.equal(readFileSync(join(root, "order"), "utf8"), "test\ncheck\n");
});

test("stops on a failed regression before running repository commands", async (t) => {
  const { root, write } = fixture(t);
  write("check-one.mjs", "");
  write("check-one.test.mjs", "");
  const commands = [];
  await assert.rejects(
    runChecks(root, (_command, args) => {
      commands.push(args);
      return { status: 1 };
    }),
    /Check command failed/,
  );
  assert.equal(commands.length, 1);
  assert.equal(commands[0][0], "--test");
});

test("rejects invalid modes and an empty discovery scope", async (t) => {
  const { root, write } = fixture(t);
  await assert.rejects(discoverChecks(root), /must not be empty/);
  write("check-invalid.mjs", 'export const checkMode = "typo";');
  await assert.rejects(discoverChecks(root), /unknown checkMode/);
});

test("propagates command failures and spawn errors", async (t) => {
  const { root, write } = fixture(t);
  write("check-one.mjs", "");
  write("check-one.test.mjs", "");
  await assert.rejects(
    runChecks(root, (_command, args) => ({
      status: args[0] === "--test" ? 0 : 2,
    })),
    /failed \(2\)/,
  );
  await assert.rejects(
    runChecks(root, () => ({ error: new Error("spawn unavailable") })),
    /spawn unavailable/,
  );
});

test("rejects a newly discovered check without its regression suite", async (t) => {
  const { root, write } = fixture(t);
  write("check-new.mjs", "");
  write("check-other.test.mjs", "");
  await assert.rejects(
    discoverChecks(root),
    /missing colocated regression suite/,
  );
});
