import { readFileSync } from "node:fs";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

const ruleFiles = {
  firestore: "firestore.rules",
  storage: "storage.rules",
  database: "database.rules.json",
};

/**
 * Starts a rules test environment against the emulators started by
 * `firebase emulators:exec` (the hosts come from the emulator environment).
 * The project is always a `demo-*` project, so nothing can reach production.
 */
export function createRulesEnvironment(projectId, service) {
  return initializeTestEnvironment({
    projectId,
    [service]: { rules: readFileSync(ruleFiles[service], "utf8") },
  });
}
