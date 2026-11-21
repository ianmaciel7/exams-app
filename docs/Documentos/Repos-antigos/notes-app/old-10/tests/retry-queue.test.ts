import assert from "node:assert/strict";
import test from "node:test";
import { backoffMs, readQueue, writeQueue } from "../src/lib/retry-queue";

test("backoffMs: grows exponentially, capped at 30s, with jitter in [half, full]", () => {
  for (let attempts = 0; attempts < 8; attempts++) {
    const exponential = Math.min(30000, 1000 * 2 ** attempts);
    const value = backoffMs(attempts);
    assert.ok(
      value >= exponential / 2,
      `attempt ${attempts}: ${value} too low`,
    );
    assert.ok(value <= exponential, `attempt ${attempts}: ${value} too high`);
  }
});

test("backoffMs: never exceeds the 30s cap even for a large attempt count", () => {
  assert.ok(backoffMs(20) <= 30000);
});

test("backoffMs: treats a negative attempt count as zero", () => {
  assert.ok(backoffMs(-5) <= 1000);
});

test("readQueue/writeQueue: no-op outside a browser (no window global)", () => {
  // tests run under tsx via node:test, so `window` is undefined here — this
  // exercises the same fallback a server-rendered pass would hit.
  assert.deepEqual(readQueue("space-1"), []);
  writeQueue("space-1", [
    {
      id: "a",
      spaceId: "space-1",
      attemptId: "s_q",
      questionId: "q",
      quality: 4,
      attempts: 0,
      enqueuedAt: 0,
    },
  ]);
  assert.deepEqual(readQueue("space-1"), []);
});
