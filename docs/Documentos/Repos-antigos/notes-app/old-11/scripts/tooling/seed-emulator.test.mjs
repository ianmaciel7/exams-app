import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildExamSeed,
  EXAM_ID,
  googleIdpPostBody,
  parseUsers,
  SPACE_ID,
  seedEmulator,
  toRestFields,
} from "./seed-emulator-lib.mjs";

const now = new Date("2026-10-03T12:00:00Z");

describe("seed-emulator-lib", () => {
  it("converts values to Firestore REST fields", () => {
    assert.deepEqual(
      toRestFields({ a: "x", b: 1, c: 1.5, d: true, e: null, f: now, g: [1] }),
      {
        a: { stringValue: "x" },
        b: { integerValue: "1" },
        c: { doubleValue: 1.5 },
        d: { booleanValue: true },
        e: { nullValue: null },
        f: { timestampValue: now.toISOString() },
        g: { arrayValue: { values: [{ integerValue: "1" }] } },
      }
    );
  });

  it("builds a mock Google credential the widget can list", () => {
    const body = googleIdpPostBody({ email: "a@b.dev", name: "A" });
    assert.match(body, /^providerId=google\.com&id_token=/);
    const token = JSON.parse(body.split("id_token=")[1]);
    assert.equal(token.email, "a@b.dev");
    assert.equal(token.email_verified, true);
  });

  it("seeds a space, an exam, questions, and one card per question", () => {
    const docs = buildExamSeed({ uid: "u1", now });
    const paths = docs.map((doc) => doc.path);
    assert.ok(paths.includes(`users/u1/spaces/${SPACE_ID}`));
    assert.ok(paths.includes(`users/u1/spaces/${SPACE_ID}/objects/${EXAM_ID}`));

    const questions = docs.filter(
      (doc) => doc.data.objectTypeId === "question"
    );
    assert.equal(questions.length, 12);
    assert.deepEqual(
      questions.map((question) => question.data.properties.type),
      [
        "single-choice",
        "multiple-choice",
        "true-false",
        "fill-blank",
        "matching",
        "drag-and-drop",
        "hotspot",
        "case-study",
        "dropdown",
        "ordering",
        "matrix",
        "simulation",
      ]
    );
    for (const question of questions) {
      assert.equal(question.data.properties.statement, undefined);
      assert.equal(question.data.properties.format, undefined);
      assert.equal(question.data.properties.examId, EXAM_ID);
      const questionId = question.path.split("/").pop();
      assert.ok(
        paths.includes(`users/u1/spaces/${SPACE_ID}/cards/card-${questionId}`)
      );
    }
    for (const doc of docs.filter((item) => item.path.includes("/cards/"))) {
      assert.ok(doc.data.difficulty >= 1 && doc.data.difficulty <= 10);
    }
  });

  it("parses repeated --email flags and defaults to the demo user", () => {
    assert.deepEqual(
      parseUsers([]).map((user) => user.email),
      ["demo@notesapp.dev"]
    );
    assert.deepEqual(
      parseUsers(["--email", "a@b.dev", "--email", "c@d.dev"]).map(
        (user) => user.email
      ),
      ["a@b.dev", "c@d.dev"]
    );
  });

  it("links the Google user first, then writes every document under its uid", async () => {
    const calls = [];
    const fetchFn = async (url, init) => {
      calls.push({ url, method: init.method });
      return {
        ok: true,
        json: async () => ({ localId: "uid-123" }),
        text: async () => "",
      };
    };

    const results = await seedEmulator({
      fetchFn,
      projectId: "demo-notes-app",
      users: [{ email: "a@b.dev", name: "A" }],
      now,
    });

    assert.deepEqual(results, [
      {
        email: "a@b.dev",
        uid: "uid-123",
        url: `/${SPACE_ID}/exams/${EXAM_ID}`,
      },
    ]);
    assert.match(calls[0].url, /accounts:signInWithIdp/);
    const writes = calls.slice(1);
    assert.ok(writes.length > 0);
    for (const call of writes) {
      assert.equal(call.method, "PATCH");
      assert.match(call.url, /projects\/demo-notes-app\/.*users\/uid-123\//);
    }
  });

  it("fails loudly when the emulator rejects a request", async () => {
    const fetchFn = async () => ({
      ok: false,
      status: 500,
      text: async () => "boom",
    });
    await assert.rejects(
      seedEmulator({
        fetchFn,
        projectId: "p",
        users: [{ email: "a@b.dev", name: "A" }],
      }),
      /signInWithIdp\(a@b\.dev\) failed: 500 boom/
    );
  });
});
