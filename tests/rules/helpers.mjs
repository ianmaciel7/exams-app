import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  readFirebaseConfig,
  rulesPathFor,
} from "../../scripts/lib/firebase-config.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Starts a rules test environment against the emulators started by
 * `firebase emulators:exec` (the hosts come from the emulator environment).
 * The project is always a `demo-*` project, so nothing can reach production.
 */
export function createRulesEnvironment(projectId, service, target) {
  const rules = rulesPathFor(readFirebaseConfig(root), service, target);
  return initializeTestEnvironment({
    projectId,
    [service]: { rules: readFileSync(resolve(root, rules), "utf8") },
  });
}
