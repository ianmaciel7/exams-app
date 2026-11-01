import { useEffect, useRef, useState } from "react";
import { loadAuth, loadSession } from "@/lib/firebase-loaders";
import { type AuthSession, watchSession } from "@/lib/watch-auth-session";

export type { AuthSession };

/** The Firebase session of one client surface; pass the user down, do not subscribe again. */
export function useAuthSession() {
  const [session, setSession] = useState<AuthSession>({
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
