const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createSetUserRoleHandler } = require("./user-roles.cjs");

class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function setup({
  callerRole = "admin",
  callerDisabled = false,
  revoked = false,
} = {}) {
  const calls = [];
  const auth = {
    verifyIdToken: async (token, checkRevoked) => {
      calls.push(["verify", token, checkRevoked]);
      if (revoked) throw new Error("auth/id-token-revoked");
      return { uid: "admin-1", role: "admin" };
    },
    getUser: async (uid) => {
      calls.push(["lookup", uid]);
      if (uid === "admin-1") {
        return {
          uid,
          disabled: callerDisabled,
          customClaims: { role: callerRole },
        };
      }
      return { uid, customClaims: { plan: "pro" } };
    },
    setCustomUserClaims: async (uid, claims) =>
      calls.push(["claims", uid, claims]),
    revokeRefreshTokens: async (uid) => calls.push(["revoke", uid]),
  };
  return { calls, handler: createSetUserRoleHandler({ auth, HttpsError }) };
}

const admin = { uid: "admin-1", token: { role: "admin" } };
const rawRequest = { headers: { authorization: "Bearer admin-token" } };

test("rejects unauthenticated callers", async () => {
  const { handler } = setup();
  await assert.rejects(handler({ data: { uid: "u1", role: "admin" } }), {
    code: "unauthenticated",
  });
});

test("rejects callers without the admin role", async () => {
  const { handler, calls } = setup();
  for (const token of [{}, { role: "user" }, { role: "ADMIN" }]) {
    await assert.rejects(
      handler({
        auth: { uid: "u2", token },
        data: { uid: "u1", role: "admin" },
      }),
      { code: "permission-denied" },
    );
  }
  assert.deepEqual(calls, []);
});

test("rejects malformed requests", async () => {
  const { handler, calls } = setup();
  for (const data of [
    null,
    [],
    { uid: "u1" },
    { uid: "", role: "admin" },
    { uid: "u1", role: "owner" },
    { uid: "u1", role: "admin", extra: true },
  ]) {
    await assert.rejects(handler({ auth: admin, rawRequest, data }), {
      code: "invalid-argument",
    });
  }
  assert.deepEqual(calls, []);
});

test("administrators cannot demote themselves", async () => {
  const { handler, calls } = setup();
  await assert.rejects(
    handler({
      auth: admin,
      rawRequest,
      data: { uid: "admin-1", role: "user" },
    }),
    { code: "failed-precondition" },
  );
  assert.deepEqual(calls, []);
});

test("rejects stale administrator tokens after server-side demotion", async () => {
  const { handler, calls } = setup({ callerRole: "user" });
  await assert.rejects(
    handler({
      auth: admin,
      rawRequest,
      data: { uid: "admin-1", role: "admin" },
    }),
    { code: "permission-denied" },
  );
  assert.deepEqual(calls, [
    ["verify", "admin-token", true],
    ["lookup", "admin-1"],
  ]);
});

test("rejects disabled administrators even with a cached admin token", async () => {
  const { handler, calls } = setup({ callerDisabled: true });
  await assert.rejects(
    handler({ auth: admin, rawRequest, data: { uid: "u1", role: "admin" } }),
    { code: "permission-denied" },
  );
  assert.deepEqual(calls, [
    ["verify", "admin-token", true],
    ["lookup", "admin-1"],
  ]);
});

test("rejects revoked admin tokens even when the current role remains admin", async () => {
  const { handler, calls } = setup({ revoked: true });
  await assert.rejects(
    handler({ auth: admin, rawRequest, data: { uid: "u1", role: "admin" } }),
    { code: "permission-denied" },
  );
  assert.deepEqual(calls, [["verify", "admin-token", true]]);
});

test("rejects missing or malformed authorization headers", async () => {
  const { handler, calls } = setup();
  await assert.rejects(
    handler({ auth: admin, data: { uid: "u1", role: "admin" } }),
    { code: "unauthenticated" },
  );
  assert.deepEqual(calls, []);
});

test("merges the role into existing claims and revokes sessions", async () => {
  const { handler, calls } = setup();
  const result = await handler({
    auth: admin,
    rawRequest,
    data: { uid: "u1", role: "admin" },
  });
  assert.deepEqual(result, { uid: "u1", role: "admin" });
  assert.deepEqual(calls, [
    ["verify", "admin-token", true],
    ["lookup", "admin-1"],
    ["lookup", "u1"],
    ["claims", "u1", { plan: "pro", role: "admin" }],
    ["revoke", "u1"],
  ]);
});
