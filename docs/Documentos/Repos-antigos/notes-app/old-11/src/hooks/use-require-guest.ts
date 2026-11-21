"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export function useRequireGuest(redirectTo = "/") {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [isLoading, redirectTo, router, user]);

  return { user, isLoading };
}
