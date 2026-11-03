"use client";

import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/use-session";

export function useHomeClient() {
  const t = useTranslations("Home");
  const session = useSession();

  return {
    t,
    session,
    title: session.user
      ? t("welcome", { name: session.user.displayName?.trim() || t("friend") })
      : t("title"),
    description: session.user ? t("signedInDescription") : t("description"),
  };
}
