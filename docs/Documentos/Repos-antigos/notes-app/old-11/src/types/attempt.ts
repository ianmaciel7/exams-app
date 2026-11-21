import type { FirestoreTime, FsrsSnapshot } from "@/types/card";
import type { QuestionType, SubmittedAnswer } from "@/types/question";

export type AttemptRating = 1 | 2 | 3 | 4;
export type ReviewMode = "review" | "mockExam";
export type UserConfidence = "guessed" | "uncertain" | "confident";

/** Immutable practice log entry (`INV-11`). */
export interface Attempt {
  id: string;
  spaceId: string;
  schemaVersion: number;
  questionId: string;
  cardId: string;
  rating: AttemptRating;
  reviewMode: ReviewMode;
  elapsedMilliseconds: number;
  userConfidence?: UserConfidence;
  /** Absent on attempts written before ADR 0018. */
  questionType?: QuestionType;
  submittedAnswer?: SubmittedAnswer;
  isCorrect?: boolean;
  fsrsSnapshot: FsrsSnapshot;
  reviewedAt: FirestoreTime;
}

export interface CreateAttemptInput {
  questionId: string;
  cardId: string;
  rating: AttemptRating;
  reviewMode: ReviewMode;
  elapsedMilliseconds: number;
  userConfidence?: UserConfidence;
  questionType: QuestionType;
  submittedAnswer: SubmittedAnswer;
  isCorrect: boolean;
}
