import { useEffect, useRef, useState } from "react";
import { loadAuth, loadSession } from "@/lib/firebase-loaders";
import { type Session, watchSession } from "@/lib/watch-session";

/** The single Firebase Auth subscription behind `SessionProviderClient`. */
export function useSessionProviderClient() {
  const [session, setSession] = useState<Session>({
    isError: false,
    isLoading: true,
    user: null,
  });
  const revisionRef = useRef(0);

  useEffect(() => {
    const lifetime = new AbortController();
    const fail = (cause: unknown) => {
      console.error(cause);
      revisionRef.current++;
      if (!lifetime.signal.aborted) {
        setSession({ isError: true, isLoading: false, user: null });
      }
    };

    let unsubscribe: (() => void) | undefined;
    // Firebase loads on demand so the server-rendered home hero stays the LCP.
    Promise.all([loadSession(), loadAuth()])
      .then((modules) => {
        if (lifetime.signal.aborted) return;
        unsubscribe = watchSession(modules, {
          fail,
          revision: revisionRef,
          setSession,
          signal: lifetime.signal,
        });
      })
      .catch(fail);
    return () => {
      lifetime.abort();
      unsubscribe?.();
    };
  }, []);

  return session;
}
