import { subscribeToSession } from "@/lib/session";

/** An optional observer: Firebase configuration errors remain the auth UI's responsibility. */
export function subscribeToWorkerSession(onChange: (uid: string | null) => void) {
  try {
    return subscribeToSession((user) => onChange(user?.uid ?? null));
  } catch (error) {
    console.error("Firebase session worker subscription failed", error);
    return () => {};
  }
}
