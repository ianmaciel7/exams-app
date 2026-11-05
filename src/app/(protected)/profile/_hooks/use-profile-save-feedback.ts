import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useNavigation } from "@/hooks/use-navigation";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { toast } from "@/lib/toast";
import type { ProfileActionState, ProfileValues } from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/utils";
import { useProfileGateway } from "./use-profile-gateway";

/** Browser side effects of a saved profile: toast, theme, locale, Auth reload. */
export function useProfileSaveFeedback() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { refresh } = useNavigation();
  const { setTheme } = useTheme();
  const gateway = useProfileGateway();

  return (saved: ProfileActionState, previous: ProfileValues) => {
    if (saved.values.theme !== previous.theme) setTheme(saved.values.theme);
    toast.add({ title: t("profileSaved"), type: "success" });
    void gateway.refreshUser();
    syncSavedLocale(saved.values.locale, activeLocale, refresh);
  };
}
