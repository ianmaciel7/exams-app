"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, redirectTo, router]);

  return { user, isLoading };
}
