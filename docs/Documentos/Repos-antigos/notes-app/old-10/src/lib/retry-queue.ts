// spec.md §2.4.3 "Network Interruption During Review Grade Submission": a
// pending grade submission is queued client-side and retried with
// exponential backoff and jitter. These are the pure, framework-free pieces
// (backoff math and sessionStorage read/write) so they can be unit tested
// without a DOM. The React-facing hook lives next to the banner component
// that renders its status: src/components/study/retry-queue-banner.tsx.
//
// `rateAttempt` (src/actions/recall.ts) already keys off a deterministic
// `${session.id}_${question.id}` attemptId and overwrites the same document,
// so retrying a queued grade submission any number of times is safe — this
// queue does not need its own idempotency key.
export type GradeRetryItem = {
  id: string;
  spaceId: string;
  attemptId: string;
  questionId: string;
  quality: number;
  attempts: number;
  enqueuedAt: number;
};

const MAX_BACKOFF_MS = 30000;
const BASE_BACKOFF_MS = 1000;

// Exponential backoff, capped at 30s, with +/-50% jitter so a batch of
// simultaneously-queued retries doesn't all fire in the same tick.
export function backoffMs(attempts: number): number {
  const exponential = Math.min(
    MAX_BACKOFF_MS,
    BASE_BACKOFF_MS * 2 ** Math.max(0, attempts),
  );
  return exponential / 2 + Math.random() * (exponential / 2);
}

function storageKey(spaceId: string) {
  return `recall-retry-queue:${spaceId}`;
}

// sessionStorage (not IndexedDB) is an intentional MVP scope decision: it
// survives a reload within the tab, which covers the common "flaky network,
// not a closed browser" case, without the extra surface area of a real
// indexed store. See plan.md §8 for the full rationale.
export function readQueue(spaceId: string): GradeRetryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(spaceId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GradeRetryItem[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(spaceId: string, items: GradeRetryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0)
      window.sessionStorage.removeItem(storageKey(spaceId));
    else
      window.sessionStorage.setItem(storageKey(spaceId), JSON.stringify(items));
  } catch {
    // Private-browsing/quota-exceeded sessionStorage failures shouldn't break
    // the in-memory queue for the current tab; it just won't survive reload.
  }
}
