const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createUsageLogHandler } = require("./usage-logs.cjs");

class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function setup() {
  const logs = [];
  const handler = createUsageLogHandler({
    HttpsError,
    logger: { info: (message, fields) => logs.push({ message, fields }) },
  });
  return { handler, logs };
}

test("requires authenticated callers", () => {
  const { handler, logs } = setup();
  assert.throws(
    () => handler({ data: { type: "screen_view", name: "/profile" } }),
    { code: "unauthenticated" },
  );
  assert.equal(logs.length, 0);
});

test("uses verified identity and emits only approved structured fields", () => {
  const { handler, logs } = setup();
  for (const data of [
    { type: "screen_view", name: "/profile" },
    { type: "function_use", name: "profile.update" },
  ]) {
    const result = handler({
      auth: { uid: "verified-user", token: { email: "private" } },
      data,
    });
    const record = logs.at(-1).fields;
    assert.deepEqual(record, {
      event: "app_usage",
      schemaVersion: 1,
      eventId: result.eventId,
      uid: "verified-user",
      ...data,
    });
    assert.match(result.eventId, /^[0-9a-f-]{36}$/);
  }
});

test("rejects spoofed identities, unknown actions, arbitrary paths and query data", () => {
  const { handler, logs } = setup();
  for (const data of [
    null,
    undefined,
    42,
    false,
    [],
    "event",
    {},
    { type: "screen_view" },
    { name: "/profile" },
    { type: "screen_view", name: "/profile", extra: true },
    { type: "constructor", name: "x" },
    { type: ["screen_view"], name: "/profile" },
    { type: "screen_view", name: ["/profile"] },
    { type: "screen_view", name: "/profile?token=secret" },
    { type: "screen_view", name: "/unknown" },
    { type: "function_use", name: "delete-all" },
    { type: "screen_view", name: "/profile", uid: "spoofed" },
  ]) {
    assert.throws(() => handler({ auth: { uid: "verified-user" }, data }), {
      code: "invalid-argument",
    });
  }
  assert.equal(logs.length, 0);
});

test("does not acknowledge synchronous logger failure", () => {
  const handler = createUsageLogHandler({
    HttpsError,
    logger: {
      info() {
        throw new Error("logger failed");
      },
    },
  });
  assert.throws(
    () =>
      handler({
        auth: { uid: "user" },
        data: { type: "screen_view", name: "/profile" },
      }),
    /logger failed/,
  );
});
