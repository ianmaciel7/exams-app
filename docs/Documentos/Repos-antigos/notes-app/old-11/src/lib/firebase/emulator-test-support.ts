import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, connectToAuthEmulator } from "./client";
import { connectToFirestoreEmulator, db } from "./firestore";

let rulesLoaded = false;

// The emulator may have been started for a different project id or before
// firestore.rules last changed, so load the repo's rules for the project this
// client talks to. Without this the rules assertions test stale rules.
async function loadRepoRulesIntoEmulator(): Promise<void> {
  if (rulesLoaded) {
    return;
  }
  const content = await readFile(
    resolve(process.cwd(), "firestore.rules"),
    "utf8"
  );
  const response = await fetch(
    `http://127.0.0.1:8080/emulator/v1/projects/${db.app.options.projectId}:securityRules`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules: { files: [{ name: "firestore.rules", content }] },
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to load firestore.rules: ${response.status}`);
  }
  rulesLoaded = true;
}

export async function areEmulatorsReachable(): Promise<boolean> {
  const [isAuthReachable, isFirestoreReachable] = await Promise.all([
    fetch("http://127.0.0.1:9099")
      .then(() => true)
      .catch(() => false),
    fetch("http://127.0.0.1:8080")
      .then(() => true)
      .catch(() => false),
  ]);

  if (!isAuthReachable || !isFirestoreReachable) {
    return false;
  }

  connectToAuthEmulator("127.0.0.1:9099");
  connectToFirestoreEmulator("127.0.0.1", 8080);
  await loadRepoRulesIntoEmulator();
  return true;
}

export async function createEmulatorUser(prefix: string) {
  if (auth.currentUser) {
    await signOut(auth);
  }
  const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@notesapp.dev`;
  const password = "emulatorPassword123";
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return { uid: credential.user.uid, email, password };
}
