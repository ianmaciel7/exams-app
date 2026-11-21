import type { Timestamp } from "firebase/firestore";

export type FirestoreTime = Timestamp | Date | string;

/** FSRS v5 state: 0 = New, 1 = Learning, 2 = Review, 3 = Relearning. */
export type FsrsState = 0 | 1 | 2 | 3;

/** Full pre-review scheduling state stored on every Attempt (`INV-11`). */
export interface FsrsSnapshot {
  state: FsrsState;
  due: FirestoreTime;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  lastReview: FirestoreTime | null;
}

export interface Card extends FsrsSnapshot {
  id: string;
  spaceId: string;
  schemaVersion: number;
  questionId: string;
  cardIndex: number;
  elapsedDays: number;
  scheduledDays: number;
  stateVersion: number;
  updatedAt: FirestoreTime;
}
