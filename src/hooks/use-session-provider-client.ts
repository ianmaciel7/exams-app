import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { signOutUser, syncSessionCookie } from "@/lib/auth";
import { getFirebaseAuthUser } from "@/lib/firebase/client";
import { loadFirebaseClient } from "@/lib/firebase-loaders";
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
    loadFirebaseClient()
      .then(({ subscribeToAuth }) => {
        if (lifetime.signal.aborted) return;
        unsubscribe = subscribeToAuth(settle);
      })
      .catch(fail);
    return () => {
      lifetime.abort();
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (session.user && typeof session.user.getIdToken === "function") {
      const user = session.user;
      void syncSessionCookie(user)
        .then((synced) => {
          const current = getFirebaseAuthUser();
          // A failed refresh may already have removed the browser user. Still
          // clear the server cookie, but never sign out a newer account.
          if (!synced && (!current || current === user)) {
            return signOutUser();
          }
        })
        .catch(console.error);
    }
  }, [session.user]);

  return session;
}
