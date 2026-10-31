"use client";

import { useTranslations } from "next-intl";
import { useAuthSession } from "@/hooks/use-auth-session";

export function useHomeClient() {
  const t = useTranslations("Home");
  const session = useAuthSession();

  return {
    t,
    session,
    title: session.user
      ? t("welcome", { name: session.user.displayName?.trim() || t("friend") })
      : t("title"),
    description: session.user ? t("signedInDescription") : t("description"),
  };
}
