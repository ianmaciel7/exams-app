import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { syncSavedLocale } from "../_lib/locale-sync";
import { useProfileLoad } from "./use-profile-load";

/** Own the browser read for this visit, without a shared Promise cache. */
export function useProfileCardClient() {
  const session = useSession();
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { refresh } = useNavigation();
  const { setTheme } = useTheme();
  const profile = useProfileLoad(session, activeLocale);
  const initialized = useRef(false);
  const [lastUid, setLastUid] = useState(session.user?.uid);

  if (session.user?.uid !== lastUid) {
    setLastUid(session.user?.uid);
    initialized.current = false;
  }

  useEffect(() => {
    if (profile.isLoading || profile.isError || initialized.current) return;
    initialized.current = true;
    if (profile.theme) setTheme(profile.theme);
    syncSavedLocale(profile.values.locale, activeLocale, refresh);
  }, [profile, activeLocale, refresh, setTheme]);

  if (profile.isError) throw profile.error;
  return profile;
}
