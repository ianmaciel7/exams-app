import { type Card as FsrsCard, fsrs, type Grade, type State } from "ts-fsrs";
import type { AttemptRating } from "@/types/attempt";
import type {
  Card,
  FirestoreTime,
  FsrsSnapshot,
  FsrsState,
} from "@/types/card";

const scheduler = fsrs();

/** ts-fsrs field names (snake_case) kept out of declared identifiers. */
const FSRS_KEYS = {
  elapsedDays: "elapsed_days",
  scheduledDays: "scheduled_days",
  learningSteps: "learning_steps",
  lastReview: "last_review",
} as const;

/** Fields of a Card advanced by a review; `stateVersion` is bumped by the caller. */
export type CardTransition = Pick<
  Card,
  | "state"
  | "due"
  | "stability"
  | "difficulty"
  | "elapsedDays"
  | "scheduledDays"
  | "reps"
  | "lapses"
  | "lastReview"
>;

export function toDate(value: FirestoreTime): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return value.toDate();
}

/** Captures the pre-review scheduling state stored on every Attempt (`INV-11`). */
export function snapshotCard(card: Card): FsrsSnapshot {
  return {
    state: card.state,
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview,
  };
}

/** Applies an FSRS v5 rating to a Card and returns the next scheduling state. */
export function scheduleCard(
  card: Card,
  rating: AttemptRating,
  now: Date
): CardTransition {
  // A New card has no memory state yet. `firestore.rules` requires
  // `difficulty` in 1..10 on every stored card, while ts-fsrs only accepts
  // zeroed memory for New cards, so stored placeholders are ignored here.
  const isNew = card.state === 0;
  const input: FsrsCard = {
    due: toDate(card.due),
    stability: isNew ? 0 : card.stability,
    difficulty: isNew ? 0 : card.difficulty,
    [FSRS_KEYS.elapsedDays]: card.elapsedDays,
    [FSRS_KEYS.scheduledDays]: card.scheduledDays,
    [FSRS_KEYS.learningSteps]: 0,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as State,
    [FSRS_KEYS.lastReview]: card.lastReview
      ? toDate(card.lastReview)
      : undefined,
  };
  const next = scheduler.next(input, now, rating as Grade).card;

  return {
    state: next.state as FsrsState,
    due: next.due,
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays: next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    lastReview: next.last_review ?? now,
  };
}
