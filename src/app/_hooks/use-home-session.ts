"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

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
    // Firebase loads after hydration so it stays off the home's critical path
    // and the server-rendered hero paints as the Largest Contentful Paint.
    import("@/lib/session")
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
