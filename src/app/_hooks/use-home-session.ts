"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { loadSession } from "../_lib/firebase-loaders";

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
    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    const update = (user: User | null) => {
      if (isActive) setSession({ isError: false, isLoading: false, user });
    };
    const fail = () => {
      if (isActive) setSession({ isError: true, isLoading: false, user: null });
    };
    loadSession()
      .then(({ subscribeToSession }) => {
        if (isActive) unsubscribe = subscribeToSession(update, fail);
      })
      .catch(fail);
    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);
  return session;
}
