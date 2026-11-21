// Rewrites Question objects stored in the legacy ExamTopics shape (ADR 0017) into
// the unified question model (ADR 0018) against the Firestore emulator. The
// conversion itself lives in src/ and is shared with the app's read path.
import { migrateLegacyQuestion } from "../../src/lib/exam/migrate-legacy-question.ts";
import {
  ADMIN_HEADERS,
  FIRESTORE_HOST,
  toRestFields,
} from "./seed-emulator-lib.mjs";

const DOCUMENTS_PREFIX = "/documents/";

export function fromRestValue(value) {
  if ("stringValue" in value) {
    return value.stringValue;
  }
  if ("integerValue" in value) {
    return Number(value.integerValue);
  }
  if ("doubleValue" in value) {
    return value.doubleValue;
  }
  if ("booleanValue" in value) {
    return value.booleanValue;
  }
  if ("timestampValue" in value) {
    return new Date(value.timestampValue);
  }
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(fromRestValue);
  }
  if ("mapValue" in value) {
    return fromRestFields(value.mapValue.fields ?? {});
  }
  return null;
}

export function fromRestFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromRestValue(value)])
  );
}

function documentPath(name) {
  return name.slice(name.indexOf(DOCUMENTS_PREFIX) + DOCUMENTS_PREFIX.length);
}

/** Every Question object in every space of every user. */
export async function listQuestionDocuments({ fetchFn, projectId }) {
  const response = await fetchFn(
    `${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "objects", allDescendants: true }],
          where: {
            fieldFilter: {
              field: { fieldPath: "objectTypeId" },
              op: "EQUAL",
              value: { stringValue: "question" },
            },
          },
        },
      }),
    }
  );
  if (!response.ok) {
    throw new Error(
      `list questions failed: ${response.status} ${await response.text()}`
    );
  }
  const rows = await response.json();
  return rows
    .filter((row) => row.document)
    .map(({ document }) => ({
      path: documentPath(document.name),
      updateTime: document.updateTime,
      data: fromRestFields(document.fields ?? {}),
    }));
}

/**
 * Splits documents into the ones to rewrite, the ones already on the new model,
 * and the ones that cannot be converted (reported, never modified).
 */
export function planMigration(documents) {
  const plan = { migrate: [], current: [], failed: [] };
  for (const document of documents) {
    const result = migrateLegacyQuestion(document.data.properties);
    if (result.ok) {
      plan.migrate.push({
        ...document,
        properties: result.properties,
        notes: result.notes,
      });
    } else if (result.reason === "notLegacy") {
      plan.current.push(document);
    } else {
      plan.failed.push({ path: document.path, reason: result.reason });
    }
  }
  return plan;
}

/** Replaces `properties` and bumps `stateVersion` only if the document is unchanged. */
export async function rewriteQuestion({ fetchFn, projectId, document, now }) {
  const params = new URLSearchParams();
  for (const field of ["properties", "stateVersion", "updatedAt"]) {
    params.append("updateMask.fieldPaths", field);
  }
  params.set("currentDocument.updateTime", document.updateTime);

  const url = `${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents/${document.path}?${params}`;
  const response = await fetchFn(url, {
    method: "PATCH",
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      fields: toRestFields({
        properties: document.properties,
        stateVersion: (document.data.stateVersion ?? 0) + 1,
        updatedAt: now,
      }),
    }),
  });
  if (!response.ok) {
    throw new Error(
      `rewrite ${document.path} failed: ${response.status} ${await response.text()}`
    );
  }
}

/** Plans (and unless `dryRun`, applies) the migration; returns a summary. */
export async function migrateQuestions({
  fetchFn = fetch,
  projectId,
  dryRun = false,
  now = new Date(),
}) {
  const documents = await listQuestionDocuments({ fetchFn, projectId });
  const plan = planMigration(documents);

  if (!dryRun) {
    for (const document of plan.migrate) {
      await rewriteQuestion({ fetchFn, projectId, document, now });
    }
  }

  return {
    dryRun,
    migrated: plan.migrate.map(({ path, properties, notes }) => ({
      path,
      type: properties.type,
      notes,
    })),
    alreadyCurrent: plan.current.length,
    failed: plan.failed,
  };
}

/** Reads `--dry-run` and `--project <id>`. */
export function parseMigrationArgs(argv, defaultProjectId) {
  const projectIndex = argv.indexOf("--project");
  return {
    dryRun: argv.includes("--dry-run"),
    projectId:
      projectIndex !== -1 && argv[projectIndex + 1]
        ? argv[projectIndex + 1]
        : defaultProjectId,
  };
}
