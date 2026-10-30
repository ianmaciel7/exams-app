"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    let active = true;
    let revision = 0;

    try {
      const unsubscribe = subscribeToSession(
        (user) => {
          const current = ++revision;
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
              if (active && revision === current) setSession(next);
            };
            void pending.then(finish, finish);
          } else {
            setSession(next);
          }
        },
        () => {
          revision++;
          if (active) {
            setSession({ isError: true, isLoading: false, user: null });
          }
        },
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch {
      setSession({ isError: true, isLoading: false, user: null });
    }
  }, []);
  return session;
}
