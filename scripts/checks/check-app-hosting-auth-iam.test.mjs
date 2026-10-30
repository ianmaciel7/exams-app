import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectAppHostingAuthIam } from "./check-app-hosting-auth-iam.mjs";

function fixture(terraform) {
  const root = mkdtempSync(join(tmpdir(), "app-hosting-auth-iam-"));
  const directory = join(root, "infra", "prod");
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "main.tf"), terraform);
  return root;
}

const validBinding = `resource "google_project_iam_member" "app_hosting_firebase_auth_viewer" {
  project = var.project_id
  role    = "roles/firebaseauth.viewer"
  member  = google_service_account.app_hosting.member
}
`;

test("accepts the least-privilege Firebase Auth viewer binding", (t) => {
  const root = fixture(validBinding);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(inspectAppHostingAuthIam(root), []);
});

test("rejects a missing Firebase Auth viewer binding", (t) => {
  const root = fixture(
    'resource "google_project_iam_member" "app_hosting_runner" {}\n',
  );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(
    inspectAppHostingAuthIam(root)[0],
    /roles\/firebaseauth\.viewer/,
  );
});

test("rejects an overbroad Firebase Auth admin binding", (t) => {
  const root = fixture(
    validBinding.replace(
      "roles/firebaseauth.viewer",
      "roles/firebaseauth.admin",
    ),
  );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.match(inspectAppHostingAuthIam(root)[0], /revocation-aware/);
});
