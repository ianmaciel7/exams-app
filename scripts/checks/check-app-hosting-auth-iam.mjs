import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const runtimeAccount = "google_service_account.app_hosting.member";
const requiredRole = "roles/firebaseauth.viewer";

export function inspectAppHostingAuthIam(root) {
  // The stack is split by domain (apis.tf, app_hosting.tf, iam.tf, ...), so read every file.
  const directory = join(root, "infra", "prod");
  if (!existsSync(directory)) return [];

  const source = readdirSync(directory)
    .filter((name) => name.endsWith(".tf"))
    .map((name) => readFileSync(join(directory, name), "utf8"))
    .join("\n");
  const binding = new RegExp(
    `resource\\s+"google_project_iam_member"\\s+"app_hosting_firebase_auth_viewer"\\s*\\{[\\s\\S]*?role\\s*=\\s*"${requiredRole}"[\\s\\S]*?member\\s*=\\s*${runtimeAccount.replaceAll(".", "\\.")}[\\s\\S]*?\\}`,
  );

  return binding.test(source)
    ? []
    : [
        `infra/prod/*.tf: App Hosting must grant ${requiredRole} to ${runtimeAccount} for revocation-aware Firebase Admin token verification`,
      ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = inspectAppHostingAuthIam(resolve("."));
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("App Hosting Firebase Auth IAM check passed.");
}
