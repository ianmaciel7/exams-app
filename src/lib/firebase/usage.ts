import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase/client";
import { getSessionUser } from "@/lib/session";

export type UsageEvent =
  | { type: "screen_view"; name: string }
  | { type: "function_use"; name: "profile.update" };

/** Ask the authenticated callable to emit a native Cloud Logging event. */
export async function recordUsage(event: UsageEvent): Promise<void> {
  const user = getSessionUser();
  if (!user) throw new Error("Authentication session unavailable");
  const logUsage = httpsCallable<UsageEvent, { eventId: string }>(
    getFirebaseFunctions(),
    "recordUsage",
    { timeout: 15_000 },
  );
  await logUsage(event);
}

export async function withUsageGuard<T>(
  event: UsageEvent,
  operation: () => Promise<T>,
): Promise<T> {
  await recordUsage(event);
  return operation();
}
