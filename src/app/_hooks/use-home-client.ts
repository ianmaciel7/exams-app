"use client";

import { useTranslations } from "next-intl";
import { useHomeSession } from "./use-home-session";

export function useHomeClient() {
  const t = useTranslations("Home");
  const session = useHomeSession();

  return {
    t,
    session,
    title: session.user
      ? t("welcome", { name: session.user.displayName?.trim() || t("friend") })
      : t("title"),
    description: session.user ? t("signedInDescription") : t("description"),
  };
}
