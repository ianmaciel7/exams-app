import assert from "node:assert/strict";
import test from "node:test";
import { deleteApp, initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";

test("firestore rules: unauthenticated client reads are denied", async (t) => {
  try {
    const response = await fetch("http://127.0.0.1:8080", {
      signal: AbortSignal.timeout(1000),
    });
    await response.text();
  } catch {
    t.skip("Firestore emulator is not running.");
    return;
  }

  const app = initializeApp(
    {
      apiKey: "demo-api-key",
      projectId: "demo-recall",
    },
    `rules-${Date.now()}`,
  );
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);

  try {
    await assert.rejects(
      () => getDoc(doc(db, "spaces", "forbidden")),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "permission-denied",
    );
  } finally {
    await deleteApp(app);
  }
});
