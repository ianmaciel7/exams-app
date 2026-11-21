import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { describe, expect, it } from "vitest";
import type { Card } from "@/types/card";
import { submitAttempt } from "./attempts";
import { auth } from "./client";
import {
  areEmulatorsReachable,
  createEmulatorUser,
} from "./emulator-test-support";
import { db } from "./firestore";

function buildCardData(spaceId: string) {
  return {
    schemaVersion: 4,
    spaceId,
    questionId: "question-1",
    cardIndex: 0,
    state: 0,
    due: serverTimestamp(),
    stability: 0,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    stateVersion: 1,
    updatedAt: serverTimestamp(),
  };
}

describe("submitAttempt against the Firestore emulator", () => {
  it("appends an attempt and advances the card in one atomic batch", async () => {
    if (!(await areEmulatorsReachable())) {
      return;
    }

    const owner = await createEmulatorUser("attempts-owner");
    const spaceId = `attempts-space-${Date.now()}`;
    const spaceRef = doc(db, "users", owner.uid, "spaces", spaceId);
    const cardRef = doc(spaceRef, "cards", "card-1");

    await setDoc(spaceRef, {
      id: spaceId,
      ownerId: owner.uid,
      name: "Attempts Space",
      description: "",
      icon: "folder",
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(cardRef, buildCardData(spaceId));

    const stored = (await getDoc(cardRef)).data();
    const card = {
      ...stored,
      id: "card-1",
      due: new Date(),
      lastReview: null,
    } as Card;

    const attemptId = await submitAttempt({
      userId: owner.uid,
      spaceId,
      card,
      input: {
        questionId: "question-1",
        cardId: "card-1",
        rating: 3,
        reviewMode: "review",
        elapsedMilliseconds: 1500,
        questionType: "matching",
        submittedAnswer: { type: "matching", value: { l1: "r1", l2: "r2" } },
        isCorrect: true,
      },
    });

    const attempt = (await getDoc(doc(spaceRef, "attempts", attemptId))).data();
    expect(attempt?.rating).toBe(3);
    expect(attempt?.questionType).toBe("matching");
    expect(attempt?.submittedAnswer).toEqual({
      type: "matching",
      value: { l1: "r1", l2: "r2" },
    });
    expect(attempt?.isCorrect).toBe(true);
    expect(attempt?.fsrsSnapshot.state).toBe(0);

    const updatedCard = (await getDoc(cardRef)).data();
    expect(updatedCard?.stateVersion).toBe(2);
    expect(updatedCard?.reps).toBe(1);
    expect(updatedCard?.state).not.toBe(0);

    // A stale card (wrong stateVersion) fails the whole batch: no orphan attempt.
    await expect(
      submitAttempt({
        userId: owner.uid,
        spaceId,
        card,
        input: {
          questionId: "question-1",
          cardId: "card-1",
          rating: 3,
          reviewMode: "review",
          elapsedMilliseconds: 1500,
          questionType: "matching",
          submittedAnswer: { type: "matching", value: { l1: "r1", l2: "r2" } },
          isCorrect: true,
        },
      })
    ).rejects.toMatchObject({ code: "permission-denied" });
    expect((await getDocs(collection(spaceRef, "attempts"))).size).toBe(1);

    await deleteDoc(cardRef);
    await deleteDoc(spaceRef);
    await signOut(auth);
  });
});
