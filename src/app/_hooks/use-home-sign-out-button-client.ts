"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOutUser } from "@/lib/auth";

export function useHomeSignOutButtonClient() {
  const t = useTranslations("Home");
  const auth = useTranslations("Auth");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");

  async function handleSignOut() {
    if (state === "pending") return;
    setState("pending");
    try {
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
