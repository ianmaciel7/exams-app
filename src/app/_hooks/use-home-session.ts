"use client";

import type { User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { getPendingSignOut } from "@/lib/auth";
import { subscribeToSession } from "@/lib/session";

type HomeSession = {
  isError: boolean;
  isLoading: boolean;
  user: User | null;
};

export function useHomeSession() {
  const [session, setSession] = useState<HomeSession>({
    isError: false,
    isLoading: true,
    user: null,
  });
  const revisionRef = useRef(0);

  useEffect(() => {
    const lifetime = new AbortController();

    try {
      const unsubscribe = subscribeToSession(
        (user) => {
          const current = ++revisionRef.current;
          const next: HomeSession = {
            isError: false,
            isLoading: false,
            user,
          };
          const pending = user ? null : getPendingSignOut();

          // Avoid showing a guest link while Firebase is still persisting
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
        },
        () => {
          revisionRef.current++;
          if (!lifetime.signal.aborted) {
            setSession({ isError: true, isLoading: false, user: null });
          }
        },
      );
      return () => {
        lifetime.abort();
        unsubscribe();
      };
    } catch {
      setSession({ isError: true, isLoading: false, user: null });
    }
  }, []);
  return session;
}
