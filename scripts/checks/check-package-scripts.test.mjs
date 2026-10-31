import assert from "node:assert/strict";
import test from "node:test";
import { inspectPackageScripts } from "./check-package-scripts.mjs";

const scripts = {
  build: "next build",
  "verify:fast": "pnpm build && pnpm exec tsc",
};

test("accepts unique scripts whose pnpm calls resolve", () =>
  assert.deepEqual(
    inspectPackageScripts(scripts, {
      "ci.yml": "run: pnpm install --frozen-lockfile\nrun: pnpm verify:fast",
    }),
    [],
  ));

test("rejects a script that aliases another one", () =>
  assert.deepEqual(
    inspectPackageScripts({ ...scripts, compile: "next build" }),
    ['"compile" duplicates "build"'],
  ));

test("rejects a workflow or script calling a missing script", () =>
  assert.deepEqual(
    inspectPackageScripts(
      { ...scripts, verify: "pnpm run gone" },
      { "ci.yml": "run: pnpm analyze:lighthouse:ci" },
    ),
    [
      'script "verify" calls missing script "pnpm gone"',
      'ci.yml calls missing script "pnpm analyze:lighthouse:ci"',
    ],
  ));
