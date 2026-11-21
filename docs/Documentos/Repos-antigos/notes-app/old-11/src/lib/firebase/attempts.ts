import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { scheduleCard, snapshotCard } from "@/lib/fsrs/schedule-card";
import { validateCreateAttemptInput } from "@/lib/validators/attempt";
import type { CreateAttemptInput } from "@/types/attempt";
import type { Card } from "@/types/card";

export interface SubmitAttemptParams {
  userId: string;
  spaceId: string;
  card: Card;
  input: CreateAttemptInput;
  now?: Date;
}

/**
 * Atomically appends an immutable Attempt (`INV-11`) and advances the
 * companion Card's FSRS schedule in one `writeBatch`, so a failed write never
 * leaves a logged attempt without its schedule update or vice versa.
 */
export async function submitAttempt({
  userId,
  spaceId,
  card,
  input,
  now = new Date(),
}: SubmitAttemptParams): Promise<string> {
  const validation = validateCreateAttemptInput(input);
  if (!validation.success || !validation.data) {
    throw new Error(validation.error ?? "invalidInput");
  }

  const attemptId = crypto.randomUUID();
  const spaceRoot = ["users", userId, "spaces", spaceId] as const;
  const attemptRef = doc(db, ...spaceRoot, "attempts", attemptId);
  const cardRef = doc(db, ...spaceRoot, "cards", card.id);
  const transition = scheduleCard(card, validation.data.rating, now);

  const batch = writeBatch(db);
  batch.set(attemptRef, {
    schemaVersion: 4,
    spaceId,
    ...validation.data,
    fsrsSnapshot: snapshotCard(card),
    reviewedAt: serverTimestamp(),
  });
  batch.update(cardRef, {
    ...transition,
    stateVersion: card.stateVersion + 1,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return attemptId;
}
