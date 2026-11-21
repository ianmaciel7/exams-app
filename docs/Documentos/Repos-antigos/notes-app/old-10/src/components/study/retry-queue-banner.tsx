"use client";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { rateAttempt } from "@/actions/recall";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  backoffMs,
  type GradeRetryItem,
  readQueue,
  writeQueue,
} from "@/lib/retry-queue";

// spec.md §2.4.3 "Network Interruption During Review Grade Submission": when
// rating a card fails (network-dependent), the client optimistically keeps
// the local grade, enqueues the mutation, and retries with exponential
// backoff + jitter in the background. `rateAttempt` is safe to retry any
// number of times (see src/lib/retry-queue.ts), so this hook does not invent
// its own idempotency key — it reuses the session+question attemptId the
// caller already has.
export function useGradeRetryQueue(spaceId: string, onSettled?: () => void) {
  const [items, setItems] = useState<GradeRetryItem[]>(() =>
    readQueue(spaceId),
  );
  // `onSettled` is a fresh closure on every parent render (StudyPanel ticks
  // its own `now` state every second). Reading it through a ref, rather than
  // depending on it directly, keeps the effect below from restarting its
  // pending backoff timer on every unrelated render.
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => writeQueue(spaceId, items), [spaceId, items]);

  useEffect(() => {
    const head = items[0];
    if (!head) return;
    const timer = setTimeout(() => {
      rateAttempt(head.spaceId, head.attemptId, head.quality)
        .then(() => {
          setItems((prev) => prev.filter((item) => item.id !== head.id));
          onSettledRef.current?.();
        })
        .catch(() => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === head.id
                ? { ...item, attempts: item.attempts + 1 }
                : item,
            ),
          );
        });
    }, backoffMs(head.attempts));
    return () => clearTimeout(timer);
  }, [items]);

  async function submitGrade(input: {
    attemptId: string;
    questionId: string;
    quality: number;
  }) {
    try {
      await rateAttempt(spaceId, input.attemptId, input.quality);
      onSettled?.();
    } catch {
      setItems((prev) => [
        ...prev,
        {
          id: `${input.attemptId}:${Date.now()}`,
          spaceId,
          attemptId: input.attemptId,
          questionId: input.questionId,
          quality: input.quality,
          attempts: 0,
          enqueuedAt: Date.now(),
        },
      ]);
    }
  }

  return { submitGrade, pending: items.length };
}

// The non-blocking amber status pill: it never intercepts interaction and
// never blocks navigation, per spec.md §2.4.3.
export function RetryQueueBanner({ pending }: { pending: number }) {
  if (pending <= 0) return null;
  return (
    <Alert
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 w-auto max-w-sm border-accent-amber/40 bg-accent-amber/10 shadow-lg"
    >
      <RefreshCw
        className="size-4 animate-spin text-accent-amber"
        aria-hidden="true"
      />
      <AlertDescription className="text-accent-amber">
        {pending} grade{pending === 1 ? "" : "s"} saving in the background —
        retrying automatically.
      </AlertDescription>
    </Alert>
  );
}
