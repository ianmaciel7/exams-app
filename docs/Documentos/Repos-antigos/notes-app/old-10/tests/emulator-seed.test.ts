import assert from "node:assert/strict";
import test from "node:test";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
const projectId = process.env.FIREBASE_PROJECT_ID ?? "demo-recall";
const app = getApps()[0] ?? initializeApp({ projectId });
const auth = getAuth(app);
const db = getFirestore(app);

import { SEED_API_KEY, SEED_SPACE_ID, SEED_USERS } from "../scripts/seed";
import { hashApiKey } from "../src/domain/api-keys";

// Only run these checks if the local Firebase emulators are running
test("emulator seed: verifies pre-registered user and space in emulators", async (t) => {
  let userRecord: Awaited<ReturnType<typeof auth.getUserByEmail>> | null = null;
  try {
    userRecord = await auth.getUserByEmail(SEED_USERS.primary.email);
  } catch (_err) {
    t.skip(
      "Firebase Auth emulator not responding or user not found, skipping emulator seed test",
    );
    return;
  }

  assert.equal(userRecord.email, SEED_USERS.primary.email);
  assert.equal(userRecord.uid, SEED_USERS.primary.uid);

  const spaceDoc = await db.collection("spaces").doc(SEED_SPACE_ID).get();
  assert.ok(spaceDoc.exists, "Seeded space should exist in Firestore");
  const spaceData = spaceDoc.data();
  assert.equal(spaceData?.ownerId, SEED_USERS.primary.uid);
  assert.ok(spaceData?.members.includes(SEED_USERS.primary.uid));

  const objectsSnap = await db
    .collection("objects")
    .where("spaceId", "==", SEED_SPACE_ID)
    .get();
  assert.ok(
    objectsSnap.docs.length >= 2,
    "Should contain seeded notes and questions",
  );

  const apiKeyDoc = await db
    .collection("api_keys")
    .doc("seed-default-key")
    .get();
  assert.ok(apiKeyDoc.exists, "Seed API key document should exist");
  assert.equal(apiKeyDoc.data()?.keyHash, hashApiKey(SEED_API_KEY));
});
