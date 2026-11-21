import { describe, expect, it } from "vitest";
import type { Card } from "@/types/card";
import { scheduleCard, snapshotCard, toDate } from "./schedule-card";

const now = new Date("2026-10-03T12:00:00Z");

const newCard: Card = {
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
  stateVersion: 1,
  updatedAt: now,
};

describe("scheduleCard", () => {
  it("advances a new card on a Good rating", () => {
    const next = scheduleCard(newCard, 3, now);
    expect(next.reps).toBe(1);
    expect(next.lapses).toBe(0);
    expect(next.state).not.toBe(0);
    expect(next.stability).toBeGreaterThan(0);
    expect(toDate(next.lastReview as Date).getTime()).toBe(now.getTime());
    expect(toDate(next.due).getTime()).toBeGreaterThanOrEqual(now.getTime());
  });

  it("ignores placeholder memory values stored on a New card", () => {
    const placeholder = { ...newCard, stability: 0, difficulty: 5 };
    const next = scheduleCard(placeholder, 3, now);
    expect(next).toEqual(scheduleCard(newCard, 3, now));
  });

  it("counts a lapse when a review card is forgotten", () => {
    const good = scheduleCard(newCard, 4, now);
    const reviewCard: Card = { ...newCard, ...good, stateVersion: 2 };
    const later = new Date(now.getTime() + 10 * 86_400_000);
    const lapsed = scheduleCard(reviewCard, 1, later);
    expect(lapsed.lapses).toBe(reviewCard.lapses + 1);
    expect(lapsed.state).toBe(3);
  });

  it("reschedules a card whose dates are ISO strings", () => {
    const next = scheduleCard(
      { ...newCard, due: now.toISOString(), lastReview: now.toISOString() },
      3,
      now
    );
    expect(next.reps).toBe(1);
  });
});

describe("snapshotCard", () => {
  it("captures only the pre-review scheduling fields", () => {
    expect(snapshotCard(newCard)).toEqual({
      state: 0,
      due: now,
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      lastReview: null,
    });
  });
});

describe("toDate", () => {
  it("handles Date, string, and Timestamp-like values", () => {
    expect(toDate(now)).toBe(now);
    expect(toDate(now.toISOString()).getTime()).toBe(now.getTime());
    expect(toDate({ toDate: () => now } as never)).toBe(now);
  });
});
