"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function useHomeSignOutButtonClient() {
  const t = useTranslations("Home");
  const auth = useTranslations("Auth");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");

  async function handleSignOut() {
    if (state === "pending") return;
    setState("pending");
    try {
      // Loaded on demand, like the session, to keep Firebase out of the home
      // page's initial bundle.
      const { signOutUser } = await import("@/lib/auth");
      await signOutUser();
    } catch {
      setState("error");
    }
  }

  return {
    t,
    auth,
    state,
    handleSignOut,
  };
}
