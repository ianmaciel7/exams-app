import assert from "node:assert/strict";
import test from "node:test";
import {
  maxTabs,
  nextActiveTab,
  parseTabs,
  serializeTabs,
} from "../src/domain/tabs";

test("parseTabs: reads a cookie value into distinct ids", () => {
  assert.deepEqual(parseTabs("a,b,c"), ["a", "b", "c"]);
  assert.deepEqual(parseTabs("a,a,b"), ["a", "b"]); // duplicates collapse
  assert.deepEqual(parseTabs(undefined), []);
  assert.deepEqual(parseTabs(""), []);
});

test("parseTabs: drops anything that is not a document id", () => {
  assert.deepEqual(parseTabs("ok,../etc,also-ok"), ["ok", "also-ok"]);
  assert.deepEqual(parseTabs(`${"x".repeat(200)},fine`), ["fine"]);
});

test("parseTabs: caps the list so the cookie cannot grow unbounded", () => {
  const many = Array.from({ length: maxTabs + 5 }, (_, n) => `id${n}`);
  assert.equal(parseTabs(many.join(",")).length, maxTabs);
});

test("serializeTabs: keeps the most recent tabs when over the cap", () => {
  const many = Array.from({ length: maxTabs + 2 }, (_, n) => `id${n}`);
  const kept = serializeTabs(many).split(",");
  assert.equal(kept.length, maxTabs);
  assert.equal(kept.at(-1), many.at(-1));
});

test("nextActiveTab: selects the tab that slid into the closed slot", () => {
  assert.equal(nextActiveTab(["a", "b", "c"], "b"), "c");
  assert.equal(nextActiveTab(["a", "b", "c"], "a"), "b");
});

test("nextActiveTab: falls back to the last tab when closing the rightmost", () => {
  assert.equal(nextActiveTab(["a", "b", "c"], "c"), "b");
});

test("nextActiveTab: reports nothing left to select", () => {
  assert.equal(nextActiveTab(["a"], "a"), null);
  assert.equal(nextActiveTab(["a", "b"], "missing"), null);
});
