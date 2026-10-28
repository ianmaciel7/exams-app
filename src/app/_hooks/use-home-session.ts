"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
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
    try {
      return subscribeToSession(
        (user) => setSession({ isError: false, isLoading: false, user }),
        () => setSession({ isError: true, isLoading: false, user: null }),
      );
    } catch {
      setSession({ isError: true, isLoading: false, user: null });
    }
  }, []);
  return session;
}
