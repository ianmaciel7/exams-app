import assert from "node:assert/strict";
import test from "node:test";
import { inspectFirebaseRules } from "./check-firebase-rules.mjs";

const valid = {
  "firestore.rules":
    "service cloud.firestore { match /databases/{d}/documents { match /users/{uid} { allow read: if request.auth != null; } } }",
  "tests/rules/firestore.test.mjs": 'doc("users/alice")',
  "storage.rules":
    "service firebase.storage { match /b/{b}/o { match /users/{uid}/avatar { allow read: if false; } } }",
  "tests/rules/storage.test.mjs": 'ref("users/alice/avatar")',
  "database.rules.json": '{"rules":{".read":false,".write":false}}',
  "tests/rules/database.test.mjs": "deny",
  ".github/workflows/ci.yml": "node --test tests/rules/",
};

test("accepts rules with emulator tests run by CI", () =>
  assert.deepEqual(inspectFirebaseRules(valid), []));

test("rejects a rules file without a test", () => {
  const files = { ...valid };
  delete files["tests/rules/storage.test.mjs"];
  assert.match(inspectFirebaseRules(files).join(), /no emulator test/);
});

test("rejects a matched path the test never names", () =>
  assert.match(
    inspectFirebaseRules({
      ...valid,
      "firestore.rules": valid["firestore.rules"].replace(
        "} } }",
        "} match /exams/{id} { allow read: if false; } } }",
      ),
    }).join(),
    /"exams" is not exercised/,
  ));

test("rejects unconditional access", () => {
  assert.match(
    inspectFirebaseRules({
      ...valid,
      "firestore.rules": valid["firestore.rules"].replace(
        "request.auth != null",
        "true",
      ),
    }).join(),
    /unconditionally/,
  );
  assert.match(
    inspectFirebaseRules({
      ...valid,
      "database.rules.json": '{"rules":{".read":true}}',
    }).join(),
    /unconditionally/,
  );
});

test("rejects CI that does not run the rules tests", () =>
  assert.match(
    inspectFirebaseRules({ ...valid, ".github/workflows/ci.yml": "" }).join(),
    /CI must run/,
  ));
