import { httpsCallable } from "firebase/functions";
import {
  getFirebaseAuthUser,
  getFirebaseFunctions,
} from "@/lib/firebase/client";

export type UsageEvent =
  | { type: "screen_view"; name: string }
  | { type: "function_use"; name: "profile.update" };

/** Ask the authenticated callable to emit a native Cloud Logging event. */
export async function trackEvent(event: UsageEvent): Promise<void> {
  const user = getFirebaseAuthUser();
  if (!user) throw new Error("Authentication session unavailable");
  const logUsage = httpsCallable<UsageEvent, { eventId: string }>(
    getFirebaseFunctions(),
    "recordUsage",
    { timeout: 15_000 },
  );
  await logUsage(event);
}
