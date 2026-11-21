import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { hashApiKey } from "../src/domain/api-keys";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "demo-recall";
const app = getApps()[0] ?? initializeApp({ projectId });
const auth = getAuth(app);
const db = getFirestore(app);

export const SEED_USERS = {
  primary: {
    uid: "demo-user-1",
    email: "test@example.com",
    password: "123456",
    displayName: "Test User",
  },
  collaborator: {
    uid: "demo-user-2",
    email: "collaborator@example.com",
    password: "123456",
    displayName: "Collaborator User",
  },
};

export const SEED_SPACE_ID = "demo-space-1";
export const SEED_API_KEY = "rcl_live_0123456789abcdef0123456789abcdef";

async function upsertUser(user: typeof SEED_USERS.primary) {
  try {
    const existing = await auth.getUser(user.uid);
    if (existing) {
      await auth.updateUser(user.uid, {
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
      console.log(`Updated user: ${user.email} (${user.uid})`);
      return;
    }
  } catch {
    // User does not exist, proceed to create
  }

  try {
    const existingByEmail = await auth.getUserByEmail(user.email);
    if (existingByEmail) {
      await auth.deleteUser(existingByEmail.uid);
    }
  } catch {
    // Ignore if not found
  }

  await auth.createUser({
    uid: user.uid,
    email: user.email,
    password: user.password,
    displayName: user.displayName,
    emailVerified: true,
  });
  console.log(`Created user: ${user.email} (${user.uid})`);
}

async function seed() {
  console.log("Seeding Firebase emulator data...");
  console.log(`Auth Host: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  console.log(`Firestore Host: ${process.env.FIRESTORE_EMULATOR_HOST}`);

  // 1. Seed Users
  await upsertUser(SEED_USERS.primary);
  await upsertUser(SEED_USERS.collaborator);

  // 2. Seed Space
  const spaceRef = db.collection("spaces").doc(SEED_SPACE_ID);
  await spaceRef.set({
    name: "Study & Notes Space",
    ownerId: SEED_USERS.primary.uid,
    members: [SEED_USERS.primary.uid, SEED_USERS.collaborator.uid],
  });
  console.log(`Created space: ${SEED_SPACE_ID}`);

  // 3. Seed Objects
  const now = Date.now();

  const noteRef = db.collection("objects").doc("note-architecture");
  await noteRef.set({
    id: "note-architecture",
    spaceId: SEED_SPACE_ID,
    ownerId: SEED_USERS.primary.uid,
    version: 1,
    updatedAt: now,
    archived: false,
    reported: false,
    title: "Welcome to Recall Notes",
    kind: "note",
    format: "single-choice",
    options: [],
    answers: [],
    links: [],
    url: "",
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Welcome to Recall Notes! This is a pre-seeded note to test markdown editing, spaces, and recall flashcards.",
            },
          ],
        },
      ],
    },
    text: "Welcome to Recall Notes! This is a pre-seeded note to test markdown editing, spaces, and recall flashcards.",
  });

  const q1Ref = db.collection("objects").doc("question-auth-port");
  await q1Ref.set({
    id: "question-auth-port",
    spaceId: SEED_SPACE_ID,
    ownerId: SEED_USERS.primary.uid,
    version: 1,
    updatedAt: now,
    archived: false,
    reported: false,
    title: "What is the default port for the Firebase Auth emulator?",
    kind: "question",
    format: "single-choice",
    options: ["9099", "8080", "4000", "3000"],
    answers: ["9099"],
    links: ["note-architecture"],
    url: "",
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The Firebase Auth emulator listens on port 9099 by default.",
            },
          ],
        },
      ],
    },
    text: "The Firebase Auth emulator listens on port 9099 by default.",
  });

  const q2Ref = db.collection("objects").doc("question-spaced-repetition");
  await q2Ref.set({
    id: "question-spaced-repetition",
    spaceId: SEED_SPACE_ID,
    ownerId: SEED_USERS.primary.uid,
    version: 1,
    updatedAt: now,
    archived: false,
    reported: false,
    title: "Which spaced repetition algorithm is used by the system?",
    kind: "question",
    format: "single-choice",
    options: ["SM-2", "Leitner System", "Anki v1", "SuperMemo 18"],
    answers: ["SM-2"],
    links: ["note-architecture"],
    url: "",
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The system implements the classic SM-2 spaced repetition algorithm.",
            },
          ],
        },
      ],
    },
    text: "The system implements the classic SM-2 spaced repetition algorithm.",
  });
  console.log("Created seeded objects (note, questions)");

  // 4. Seed Study Record
  await db
    .collection("spaces")
    .doc(SEED_SPACE_ID)
    .collection("study")
    .doc(SEED_USERS.primary.uid)
    .collection("records")
    .doc("question-auth-port")
    .set({
      version: 1,
      repetitions: 2,
      interval: 6,
      ease: 2.5,
      due: now + 86400000 * 6,
      attempts: 2,
      correct: 2,
      lastQuality: 5,
    });
  console.log("Created study records");

  // 5. Seed API Key
  const apiKeyRef = db.collection("api_keys").doc("seed-default-key");
  await apiKeyRef.set({
    id: "seed-default-key",
    keyHash: hashApiKey(SEED_API_KEY),
    spaceId: SEED_SPACE_ID,
    createdBy: SEED_USERS.primary.uid,
    createdAt: new Date().toISOString(),
    revokedAt: null,
    label: "Seed Default Key",
    scopes: ["read"],
  });
  console.log(`Created pre-registered API key: ${SEED_API_KEY}`);

  console.log("Seeding completed successfully!");
}

import { fileURLToPath } from "node:url";

const isDirectRun =
  process.argv[1] &&
  (fileURLToPath(import.meta.url) === process.argv[1] ||
    process.argv[1].endsWith("seed.ts"));

if (isDirectRun) {
  seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}
