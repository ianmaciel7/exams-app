import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { localeCookie } from "@/i18n/routing";
import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";
import { readProfile } from "../_lib/data";
import type { ProfileValues } from "../_lib/definitions";

type PreferencesState = {
  error: string | null;
  isError: boolean;
  uid: string;
  values: ProfileValues | null;
};

function syncSavedLocale(
  savedLocale: Locale,
  activeLocale: Locale,
  refresh: () => void,
) {
  if (savedLocale === activeLocale) return false;
  // biome-ignore lint/suspicious/noDocumentCookie: Synchronize the persisted preference with cookie-only locale routing.
  document.cookie = `${localeCookie}=${savedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  refresh();
  return true;
}

export function useProfilePreferences(
  uid: string | undefined,
  activeLocale: Locale,
  setTheme: (theme: ThemePreference) => void,
) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const savedValuesRef = useRef<ProfileValues | null>(null);

  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const current = preferences?.uid === uid ? preferences : null;
  const defaultValues = current?.values ?? null;
  const preferencesReady = Boolean(uid && current);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    savedValuesRef.current = null;
    setPreferences(null);

    void readProfile(uid, activeLocale, () => active)
      .then((result) => {
        if (
          !active ||
          !result ||
          syncSavedLocale(result.values.locale, activeLocale, router.refresh)
        )
          return;
        savedValuesRef.current = result.values;
        setPreferences({
          error: null,
          isError: false,
          uid,
          values: result.values,
        });
        if (result.theme) setTheme(result.theme);
      })
      .catch((cause) => {
        console.error(cause);
        if (active)
          setPreferences({
            error: t("profileLoadError"),
            isError: true,
            uid,
            values: null,
          });
      });

    return () => {
      active = false;
    };
  }, [uid, activeLocale, router, setTheme, t]);

  return { current, defaultValues, preferencesReady, savedValuesRef };
}
