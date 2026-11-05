import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { syncSavedLocale } from "../_lib/utils";
import { useProfileGateway } from "./use-profile-gateway";
import { useProfileLoad } from "./use-profile-load";

/**
 * Own the browser read for this visit, without a shared Promise cache, and
 * apply the saved theme and locale once. A failed read or the 15-second
 * deadline throws to `profile/error.tsx`.
 */
export function useProfileRead() {
  const session = useSession();
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { refresh } = useNavigation();
  const { setTheme } = useTheme();
  const gateway = useProfileGateway();
  const profile = useProfileLoad(session, activeLocale, gateway);
  const uid = session.user?.uid ?? "";
  const initializedUid = useRef<string | null>(null);

  useEffect(() => {
    if (profile.isLoading || profile.isError || initializedUid.current === uid)
      return;
    initializedUid.current = uid;
    if (profile.theme) setTheme(profile.theme);
    syncSavedLocale(profile.values.locale, activeLocale, refresh);
  }, [profile, uid, activeLocale, refresh, setTheme]);

  if (profile.isError) throw profile.error;
  return profile;
}
