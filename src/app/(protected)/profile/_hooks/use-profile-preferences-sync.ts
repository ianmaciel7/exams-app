import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { defaultLocale, isLocale } from "@/i18n/routing";
import type { ProfileValues } from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/utils";

/**
 * Apply the stored theme and locale to this browser once per mounted visit:
 * the server read only fills the fields, so a new device would otherwise keep
 * its own theme and language while the selectors show the saved ones.
 */
export function useProfilePreferencesSync({ theme, locale }: ProfileValues) {
  const activeLocale = useLocale();
  const { setTheme } = useTheme();
  const { refresh } = useNavigation();

  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    setTheme(theme);
    const current = isLocale(activeLocale) ? activeLocale : defaultLocale;
    syncSavedLocale(locale, current, refresh);
  }, [theme, locale, activeLocale, setTheme, refresh]);
}
