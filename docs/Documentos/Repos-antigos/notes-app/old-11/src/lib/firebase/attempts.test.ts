import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateAttemptInput } from "@/types/attempt";
import type { Card } from "@/types/card";
import { submitAttempt } from "./attempts";

const mockDoc = vi.fn((_db: unknown, ...path: string[]) => ({
  path: path.join("/"),
}));
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockCommit = vi.fn();

vi.mock("firebase/firestore", () => ({
  doc: (...args: [unknown, ...string[]]) => mockDoc(...args),
  serverTimestamp: () => "SERVER_TIMESTAMP",
  writeBatch: () => ({
    set: mockSet,
    update: mockUpdate,
    commit: mockCommit,
  }),
}));

vi.mock("@/lib/firebase/firestore", () => ({ db: { type: "mock-db" } }));

const now = new Date("2026-10-03T12:00:00Z");
const card: Card = {
  id: "c1",
  spaceId: "s1",
  schemaVersion: 4,
  questionId: "q1",
  cardIndex: 0,
  state: 0,
  due: now,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReview: null,
  stateVersion: 3,
  updatedAt: now,
};
const input: CreateAttemptInput = {
  questionId: "q1",
  cardId: "c1",
  rating: 3,
  reviewMode: "review",
  elapsedMilliseconds: 900,
  questionType: "multiple-choice",
  submittedAnswer: { type: "multiple-choice", value: ["a", "c"] },
  isCorrect: true,
};

describe("submitAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCommit.mockResolvedValue(undefined);
  });

  it("writes the attempt and card update in a single committed batch", async () => {
    const attemptId = await submitAttempt({
      userId: "u1",
      spaceId: "s1",
      card,
      input,
      now,
    });

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);

    const [attemptRef, attemptData] = mockSet.mock.calls[0];
    expect(attemptRef.path).toBe(`users/u1/spaces/s1/attempts/${attemptId}`);
    expect(attemptData).toMatchObject({
      schemaVersion: 4,
      spaceId: "s1",
      questionId: "q1",
      cardId: "c1",
      rating: 3,
      questionType: "multiple-choice",
      submittedAnswer: { type: "multiple-choice", value: ["a", "c"] },
      isCorrect: true,
      reviewedAt: "SERVER_TIMESTAMP",
      fsrsSnapshot: { state: 0, reps: 0, lapses: 0, lastReview: null },
    });

    const [cardRef, cardData] = mockUpdate.mock.calls[0];
    expect(cardRef.path).toBe("users/u1/spaces/s1/cards/c1");
    expect(cardData.stateVersion).toBe(4);
    expect(cardData.reps).toBe(1);
    expect(cardData.updatedAt).toBe("SERVER_TIMESTAMP");
  });

  it("rejects invalid input without touching Firestore", async () => {
    await expect(
      submitAttempt({
        userId: "u1",
        spaceId: "s1",
        card,
        input: { ...input, rating: 9 as never },
      })
    ).rejects.toThrow("validationFailed");
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("propagates commit failures", async () => {
    mockCommit.mockRejectedValue(new Error("offline"));
    await expect(
      submitAttempt({ userId: "u1", spaceId: "s1", card, input, now })
    ).rejects.toThrow("offline");
  });

  it("falls back to the current time when none is given", async () => {
    await submitAttempt({ userId: "u1", spaceId: "s1", card, input });
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });
});
