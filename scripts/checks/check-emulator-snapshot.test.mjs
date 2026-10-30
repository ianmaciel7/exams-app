import assert from "node:assert/strict";
import test from "node:test";
import { validateEmulatorSnapshot } from "./check-emulator-snapshot.mjs";

const valid = {
  scripts: {
    emulator: "firebase --project demo-test",
    "emulator:export": "firebase --project demo-test",
  },
  metadata: { auth: { path: "auth_export" } },
  accounts: {
    users: [
      {
        email: "google.user@example.test",
        displayName: "Google User",
        providerUserInfo: [{ providerId: "google.com" }],
      },
    ],
  },
  directories: new Set(["auth_export"]),
};
test("accepts an isolated emulator snapshot with fictional users", () =>
  assert.deepEqual(validateEmulatorSnapshot(valid), []));
test("rejects a production-targeted command and real-looking user", () =>
  assert.ok(
    validateEmulatorSnapshot({
      ...valid,
      scripts: { emulator: "firebase", "emulator:export": "firebase" },
      accounts: {
        users: [{ email: "person@example.com", displayName: "Person" }],
      },
    }).length,
  ));
