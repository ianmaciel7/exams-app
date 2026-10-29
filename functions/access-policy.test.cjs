const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  createAccessPolicy,
  createBeforeCreateHandler,
  createBeforeSignInHandler,
  parseEmails,
} = require("./access-policy.cjs");

class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const config = {
  allowedEmails: " User@Example.test ",
  adminEmails: "admin@example.test,second@example.test",
};

function handlers(overrides = {}) {
  const policy = createAccessPolicy({ ...config, ...overrides });
  const getPolicy = () => policy;
  return {
    create: createBeforeCreateHandler({ getPolicy, HttpsError }),
    signIn: createBeforeSignInHandler({ getPolicy, HttpsError }),
  };
}

const event = (email, emailVerified = true) => ({
  data: { email, emailVerified },
});

test("parseEmails trims, lowercases and drops blanks", () => {
  assert.deepEqual(
    [...parseEmails(" A@x.test, ,b@X.test ")],
    ["a@x.test", "b@x.test"],
  );
  assert.equal(parseEmails(undefined).size, 0);
});

test("allowed users and admins can sign up with the matching role", () => {
  const { create } = handlers();
  assert.deepEqual(create(event("user@example.test")), {
    customClaims: { role: "user" },
  });
  assert.deepEqual(create(event("ADMIN@example.test")), {
    customClaims: { role: "admin" },
  });
});

test("an admin address with an unverified email is not promoted", () => {
  const { create } = handlers();
  assert.deepEqual(create(event("admin@example.test", false)), {
    customClaims: { role: "user" },
  });
});

test("unknown addresses are refused at sign-up and sign-in", () => {
  const { create, signIn } = handlers();
  for (const handler of [create, signIn]) {
    assert.throws(() => handler(event("stranger@example.test")), {
      code: "permission-denied",
    });
    assert.throws(() => handler(event(undefined)), {
      code: "permission-denied",
    });
  }
});

test("sign-in requires a verified email", () => {
  const { signIn } = handlers();
  assert.throws(() => signIn(event("user@example.test", false)), {
    code: "permission-denied",
  });
  assert.deepEqual(signIn(event("second@example.test")), {
    customClaims: { role: "admin" },
  });
});

test("an empty allowlist refuses everyone outside the emulator", () => {
  const { create, signIn } = handlers({ allowedEmails: "", adminEmails: "" });
  assert.throws(() => create(event("user@example.test")), {
    code: "permission-denied",
  });
  assert.throws(() => signIn(event("user@example.test")), {
    code: "permission-denied",
  });
});

test("the emulator stays open only while no list is configured", () => {
  const open = handlers({ allowedEmails: "", adminEmails: "", emulator: true });
  assert.deepEqual(open.signIn(event("anyone@example.test", false)), {
    customClaims: { role: "user" },
  });
  const listed = handlers({ emulator: true });
  assert.throws(() => listed.signIn(event("stranger@example.test")), {
    code: "permission-denied",
  });
});
