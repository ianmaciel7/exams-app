import { useContext } from "react";
import { SessionContext } from "@/lib/session-context";

export type { Session } from "@/lib/watch-session";

/** Read the global client session; never subscribe to Firebase Auth again. */
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires SessionProviderClient");
  return session;
}
