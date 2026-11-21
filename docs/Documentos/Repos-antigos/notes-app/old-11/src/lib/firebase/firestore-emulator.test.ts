import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { describe, expect, it } from "vitest";
import { auth } from "./client";
import {
  areEmulatorsReachable,
  createEmulatorUser,
} from "./emulator-test-support";
import { db } from "./firestore";

function buildSpaceData(uid: string, spaceId: string) {
  return {
    id: spaceId,
    ownerId: uid,
    name: "Rules Space",
    description: "",
    icon: "folder",
    stateVersion: 1,
    schemaVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// Nested documents follow DER.md section 3 (schemaVersion 4).
function buildObjectData(spaceId: string, overrides = {}) {
  return {
    schemaVersion: 4,
    spaceId,
    objectTypeId: "note",
    title: "Local First Note",
    lifecycleState: "active",
    properties: {},
    stateVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function buildCardData(spaceId: string, overrides = {}) {
  return {
    schemaVersion: 4,
    spaceId,
    questionId: "question-1",
    state: 0,
    due: serverTimestamp(),
    stability: 1.5,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 0,
    stateVersion: 1,
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function buildAttemptData(spaceId: string, overrides = {}) {
  return {
    schemaVersion: 4,
    spaceId,
    questionId: "question-1",
    cardId: "card-1",
    rating: 3,
    reviewMode: "review",
    elapsedMilliseconds: 1200,
    questionType: "hotspot",
    submittedAnswer: { type: "hotspot", value: ["lb"] },
    isCorrect: true,
    fsrsSnapshot: { state: 0, reps: 0, lapses: 0 },
    reviewedAt: serverTimestamp(),
    ...overrides,
  };
}

const PERMISSION_DENIED = { code: "permission-denied" };

describe("Firebase Firestore Emulator Integration", () => {
  it("enforces user isolation while exercising CRUD and real-time subscriptions", async () => {
    if (!(await areEmulatorsReachable())) {
      return;
    }

    if (auth.currentUser) {
      await signOut(auth);
    }

    const ownerEmail = `firestore-owner-${Date.now()}@notesapp.dev`;
    const ownerPassword = "emulatorPassword123";
    const ownerCredential = await createUserWithEmailAndPassword(
      auth,
      ownerEmail,
      ownerPassword
    );
    const ownerUid = ownerCredential.user.uid;
    const testId = `integration-doc-${Date.now()}`;
    await setDoc(
      doc(db, "users", ownerUid, "spaces", "integration-space"),
      buildSpaceData(ownerUid, "integration-space")
    );
    const testDocRef = doc(
      db,
      "users",
      ownerUid,
      "spaces",
      "integration-space",
      "objects",
      testId
    );

    await setDoc(testDocRef, buildObjectData("integration-space"));

    const readSnap = await getDoc(testDocRef);
    expect(readSnap.exists()).toBe(true);
    expect(readSnap.data()?.title).toBe("Local First Note");
    expect(readSnap.data()?.lifecycleState).toBe("active");

    let latestStatus = "";
    const unsubscribe = onSnapshot(testDocRef, (snap) => {
      if (snap.exists()) {
        latestStatus = snap.data()?.lifecycleState;
      }
    });

    await updateDoc(testDocRef, {
      lifecycleState: "archived",
      stateVersion: 2,
      updatedAt: serverTimestamp(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(latestStatus).toBe("archived");
    unsubscribe();

    const colRef = collection(
      db,
      "users",
      ownerUid,
      "spaces",
      "integration-space",
      "objects"
    );
    const colSnap = await getDocs(colRef);
    expect(colSnap.docs.some((item) => item.id === testId)).toBe(true);

    await signOut(auth);
    await signInAnonymously(auth);

    await expect(getDocFromServer(testDocRef)).rejects.toMatchObject({
      code: "permission-denied",
    });

    await signOut(auth);
    await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);

    await deleteDoc(testDocRef);
    expect((await getDoc(testDocRef)).exists()).toBe(false);

    await signOut(auth);
  });

  it("enforces space document invariants and cross-user access", async () => {
    if (!(await areEmulatorsReachable())) {
      return;
    }

    const owner = await createEmulatorUser("rules-owner");
    const spaceId = `rules-space-${Date.now()}`;
    const spaceRef = doc(db, "users", owner.uid, "spaces", spaceId);

    // Valid create, then writes that violate the create invariants.
    await setDoc(spaceRef, buildSpaceData(owner.uid, spaceId));

    const forgedRef = doc(
      db,
      "users",
      owner.uid,
      "spaces",
      `${spaceId}-forged`
    );
    await expect(
      setDoc(forgedRef, {
        ...buildSpaceData(owner.uid, `${spaceId}-forged`),
        ownerId: "someone-else",
      })
    ).rejects.toMatchObject({ code: "permission-denied" });
    await expect(
      setDoc(forgedRef, {
        ...buildSpaceData(owner.uid, `${spaceId}-forged`),
        stateVersion: 5,
      })
    ).rejects.toMatchObject({ code: "permission-denied" });

    // Updates must bump stateVersion by exactly one and keep immutable fields.
    await expect(
      updateDoc(spaceRef, { name: "Skipped", stateVersion: 3 })
    ).rejects.toMatchObject({ code: "permission-denied" });
    await expect(
      updateDoc(spaceRef, { ownerId: "someone-else", stateVersion: 2 })
    ).rejects.toMatchObject({ code: "permission-denied" });
    await updateDoc(spaceRef, {
      name: "Renamed",
      stateVersion: 2,
      updatedAt: serverTimestamp(),
    });
    expect((await getDoc(spaceRef)).data()?.name).toBe("Renamed");

    // Nested content cannot be created under a space that does not exist.
    const orphanRef = doc(
      db,
      "users",
      owner.uid,
      "spaces",
      `${spaceId}-missing`,
      "objects",
      "orphan"
    );
    await expect(
      setDoc(orphanRef, buildObjectData(`${spaceId}-missing`))
    ).rejects.toMatchObject(PERMISSION_DENIED);

    // Objects: required fields, enums, spaceId and optimistic concurrency.
    const nested = (collectionId: string, id: string) =>
      doc(db, "users", owner.uid, "spaces", spaceId, collectionId, id);
    const objectRef = nested("objects", "o1");
    const badObjectRef = nested("objects", "bad");
    const { title: _omitted, ...objectWithoutTitle } = buildObjectData(spaceId);
    for (const invalid of [
      objectWithoutTitle,
      buildObjectData(spaceId, { title: "" }),
      buildObjectData(spaceId, { lifecycleState: "deleted" }),
      buildObjectData(spaceId, { spaceId: "other-space" }),
      buildObjectData(spaceId, { schemaVersion: 3 }),
      buildObjectData(spaceId, { stateVersion: 2 }),
      buildObjectData(spaceId, { properties: "not-a-map" }),
    ]) {
      await expect(setDoc(badObjectRef, invalid)).rejects.toMatchObject(
        PERMISSION_DENIED
      );
    }
    await setDoc(objectRef, buildObjectData(spaceId));
    await expect(
      updateDoc(objectRef, { title: "Skipped", stateVersion: 3 })
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      updateDoc(objectRef, { spaceId: "other-space", stateVersion: 2 })
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await updateDoc(objectRef, {
      title: "Edited",
      stateVersion: 2,
      updatedAt: serverTimestamp(),
    });

    // Relations and cards validate their documented fields.
    const relationRef = nested("relations", "r1");
    const relation = {
      schemaVersion: 4,
      spaceId,
      sourceObjectId: "o1",
      targetObjectId: "o2",
      relationType: "references",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await expect(
      setDoc(relationRef, { ...relation, relationType: "" })
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await setDoc(relationRef, relation);

    const cardRef = nested("cards", "c1");
    await expect(
      setDoc(cardRef, buildCardData(spaceId, { state: 4 }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      setDoc(cardRef, buildCardData(spaceId, { difficulty: 11 }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await setDoc(cardRef, buildCardData(spaceId));

    // Attempts are append-only (INV-11) and validate rating and mode.
    const attemptRef = nested("attempts", "a1");
    await expect(
      setDoc(attemptRef, buildAttemptData(spaceId, { rating: 5 }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      setDoc(attemptRef, buildAttemptData(spaceId, { reviewMode: "other" }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      setDoc(attemptRef, buildAttemptData(spaceId, { questionType: "essay" }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      setDoc(attemptRef, buildAttemptData(spaceId, { isCorrect: "yes" }))
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await expect(
      setDoc(
        attemptRef,
        buildAttemptData(spaceId, {
          submittedAnswer: { type: "matching", value: { l1: "r1" } },
        })
      )
    ).rejects.toMatchObject(PERMISSION_DENIED);
    await setDoc(attemptRef, buildAttemptData(spaceId));

    for (const [suffix, questionType, value] of [
      ["dropdown", "dropdown", { dd1: "cs", dd2: "csql" }],
      ["ordering", "ordering", ["step1", "step2"]],
      ["matrix", "matrix", { r1: "col_true" }],
      ["simulation", "simulation", ["gcloud run deploy app"]],
    ] as const) {
      await setDoc(
        nested("attempts", `a-${suffix}`),
        buildAttemptData(spaceId, {
          questionType,
          submittedAnswer: { type: questionType, value },
        })
      );
    }

    await expect(updateDoc(attemptRef, { rating: 1 })).rejects.toMatchObject(
      PERMISSION_DENIED
    );

    // Collections without a documented schema are not writable.
    await expect(
      setDoc(nested("scratch", "s1"), { anything: "goes" })
    ).rejects.toMatchObject(PERMISSION_DENIED);

    // A different signed-in user can neither read nor write the owner's space.
    await signOut(auth);
    await createEmulatorUser("rules-intruder");
    await expect(getDocFromServer(spaceRef)).rejects.toMatchObject({
      code: "permission-denied",
    });
    await expect(
      updateDoc(spaceRef, { name: "Hijacked", stateVersion: 3 })
    ).rejects.toMatchObject({ code: "permission-denied" });
    await expect(deleteDoc(spaceRef)).rejects.toMatchObject({
      code: "permission-denied",
    });
    await expect(getDocFromServer(objectRef)).rejects.toMatchObject(
      PERMISSION_DENIED
    );
    await expect(
      updateDoc(objectRef, { title: "Hijacked", stateVersion: 3 })
    ).rejects.toMatchObject(PERMISSION_DENIED);

    // Cleanup as the owner.
    await signOut(auth);
    await signInWithEmailAndPassword(auth, owner.email, owner.password);
    await deleteDoc(spaceRef);
    await signOut(auth);
  });
});
