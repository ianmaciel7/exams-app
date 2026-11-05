import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { syncSessionCookie } from "@/lib/auth";
import { loadSession } from "@/lib/firebase-loaders";
import type { Session } from "@/lib/session-context";

/** The single Firebase Auth subscription behind `SessionProviderClient`. */
export function useSessionProviderClient() {
  const [session, setSession] = useState<Session>({
    isError: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const lifetime = new AbortController();
    const fail = (cause: unknown) => {
      console.error(cause);
      if (!lifetime.signal.aborted) {
        setSession({ isError: true, isLoading: false, user: null });
      }
    };

    const settle = (user: User | null) =>
      setSession({ isError: false, isLoading: false, user });

    let unsubscribe: (() => void) | undefined;
    loadSession()
      .then(({ subscribeToSession }) => {
        if (lifetime.signal.aborted) return;
        unsubscribe = subscribeToSession(settle);
      })
      .catch(fail);
    return () => {
      lifetime.abort();
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (session.user && typeof session.user.getIdToken === "function") {
      void syncSessionCookie(session.user);
    }
  }, [session.user]);

  return session;
}
