import type { User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { getPendingSignOut } from "@/lib/auth";
import { subscribeToSession } from "@/lib/session";

/** A settled session with no user is a signed-out visitor, never a failure. */
export type AuthSession =
  | { isError: false; isLoading: true; user: null }
  | { isError: false; isLoading: false; user: User | null }
  | { isError: true; isLoading: false; user: null };

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

    try {
      const unsubscribe = subscribeToSession((user) => {
        const current = ++revisionRef.current;
        const next: AuthSession = { isError: false, isLoading: false, user };
        const pending = user ? null : getPendingSignOut();

        // Avoid exposing the signed-out state while Firebase is still persisting
        // sign-out. A rapid navigation could otherwise restore stale auth.
        if (pending) {
          const finish = () => {
            if (!lifetime.signal.aborted && revisionRef.current === current) {
              setSession(next);
            }
          };
          void pending.then(finish, finish);
        } else {
          setSession(next);
        }
      }, fail);
      return () => {
        lifetime.abort();
        unsubscribe();
      };
    } catch (cause) {
      fail(cause);
    }
  }, []);

  return session;
}
