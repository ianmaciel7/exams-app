import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fromRestFields,
  listQuestionDocuments,
  migrateQuestions,
  parseMigrationArgs,
  planMigration,
} from "./migrate-questions-lib.mjs";
import { toRestFields } from "./seed-emulator-lib.mjs";

const PROJECT = "demo";
const DOCS = `projects/${PROJECT}/databases/(default)/documents`;
const now = new Date("2026-10-03T12:00:00Z");

const legacy = {
  statement: "Which service runs containers?",
  options: [
    { id: "a", text: "Compute Engine" },
    { id: "b", text: "Cloud Run" },
  ],
  correctOptionIds: ["b"],
  examId: "exam-1",
  orderIndex: 0,
  format: "single_choice",
};
const current = {
  type: "fill-blank",
  prompt: "Cloud ____",
  correctAnswer: ["Run"],
  examId: "exam-1",
  orderIndex: 1,
};

function row(id, properties, stateVersion = 1) {
  return {
    document: {
      name: `${DOCS}/users/u1/spaces/s1/objects/${id}`,
      updateTime: `2026-10-03T10:00:0${stateVersion}Z`,
      fields: toRestFields({
        objectTypeId: "question",
        stateVersion,
        properties,
      }),
    },
  };
}

function fakeFirestore(rows, { failPatch = false } = {}) {
  const patches = [];
  const fetchFn = async (url, init) => {
    if (init.method === "POST") {
      return { ok: true, json: async () => rows, text: async () => "" };
    }
    patches.push({ url, body: JSON.parse(init.body) });
    return failPatch
      ? { ok: false, status: 409, text: async () => "stale" }
      : { ok: true, json: async () => ({}), text: async () => "" };
  };
  return { fetchFn, patches };
}

describe("migrate-questions-lib", () => {
  it("reads Firestore REST values back into plain data", () => {
    const data = {
      a: "x",
      b: 2,
      c: 1.5,
      d: true,
      e: null,
      f: [1, { g: "h" }],
      i: {},
      j: [],
    };
    assert.deepEqual(fromRestFields(toRestFields(data)), data);
    assert.equal(
      fromRestFields(toRestFields({ at: now })).at.toISOString(),
      now.toISOString()
    );
  });

  it("lists question documents with their path and update time", async () => {
    const { fetchFn } = fakeFirestore([
      { readTime: "2026-10-03T10:00:00Z" },
      row("q1", legacy),
    ]);
    const docs = await listQuestionDocuments({ fetchFn, projectId: PROJECT });
    assert.equal(docs.length, 1);
    assert.equal(docs[0].path, "users/u1/spaces/s1/objects/q1");
    assert.equal(docs[0].data.properties.statement, legacy.statement);
  });

  it("fails loudly when the list request is rejected", async () => {
    const fetchFn = async () => ({
      ok: false,
      status: 500,
      text: async () => "boom",
    });
    await assert.rejects(
      listQuestionDocuments({ fetchFn, projectId: PROJECT }),
      /list questions failed: 500 boom/
    );
  });

  it("plans legacy, current and unconvertible documents separately", () => {
    const plan = planMigration([
      { path: "p/1", data: { properties: legacy } },
      { path: "p/2", data: { properties: current } },
      {
        path: "p/3",
        data: { properties: { ...legacy, correctOptionIds: [] } },
      },
    ]);
    assert.deepEqual(
      plan.migrate.map((doc) => doc.path),
      ["p/1"]
    );
    assert.equal(plan.migrate[0].properties.type, "single-choice");
    assert.deepEqual(
      plan.current.map((doc) => doc.path),
      ["p/2"]
    );
    assert.deepEqual(plan.failed, [{ path: "p/3", reason: "noCorrectOption" }]);
  });

  it("changes nothing in a dry run", async () => {
    const { fetchFn, patches } = fakeFirestore([
      row("q1", legacy),
      row("q2", current),
    ]);
    const summary = await migrateQuestions({
      fetchFn,
      projectId: PROJECT,
      dryRun: true,
      now,
    });
    assert.equal(patches.length, 0);
    assert.equal(summary.dryRun, true);
    assert.deepEqual(summary.migrated, [
      {
        path: "users/u1/spaces/s1/objects/q1",
        type: "single-choice",
        notes: [],
      },
    ]);
    assert.equal(summary.alreadyCurrent, 1);
  });

  it("rewrites only legacy documents, guarded by their update time", async () => {
    const { fetchFn, patches } = fakeFirestore([
      row("q1", legacy, 3),
      row("q2", current),
    ]);
    await migrateQuestions({ fetchFn, projectId: PROJECT, now });

    assert.equal(patches.length, 1);
    const [{ url, body }] = patches;
    const query = new URL(url).searchParams;
    assert.deepEqual(query.getAll("updateMask.fieldPaths"), [
      "properties",
      "stateVersion",
      "updatedAt",
    ]);
    assert.equal(
      query.get("currentDocument.updateTime"),
      "2026-10-03T10:00:03Z"
    );
    const written = fromRestFields(body.fields);
    assert.equal(written.properties.type, "single-choice");
    assert.equal(written.properties.statement, undefined);
    assert.equal(written.stateVersion, 4);
  });

  it("is idempotent: a second run finds nothing to migrate", async () => {
    const { fetchFn, patches } = fakeFirestore([row("q2", current)]);
    const summary = await migrateQuestions({
      fetchFn,
      projectId: PROJECT,
      now,
    });
    assert.equal(summary.migrated.length, 0);
    assert.equal(patches.length, 0);
  });

  it("reports documents it cannot convert without touching them", async () => {
    const { fetchFn, patches } = fakeFirestore([
      row("q1", { ...legacy, correctOptionIds: ["zzz"] }),
    ]);
    const summary = await migrateQuestions({
      fetchFn,
      projectId: PROJECT,
      now,
    });
    assert.equal(patches.length, 0);
    assert.deepEqual(summary.failed, [
      {
        path: "users/u1/spaces/s1/objects/q1",
        reason: "unknownCorrectOption",
      },
    ]);
  });

  it("surfaces a rejected write, such as a document changed in between", async () => {
    const { fetchFn } = fakeFirestore([row("q1", legacy)], { failPatch: true });
    await assert.rejects(
      migrateQuestions({ fetchFn, projectId: PROJECT, now }),
      /rewrite users\/u1\/spaces\/s1\/objects\/q1 failed: 409 stale/
    );
  });

  it("parses --dry-run and --project", () => {
    assert.deepEqual(parseMigrationArgs([], "fallback"), {
      dryRun: false,
      projectId: "fallback",
    });
    assert.deepEqual(
      parseMigrationArgs(["--dry-run", "--project", "other"], "fallback"),
      { dryRun: true, projectId: "other" }
    );
  });
});
