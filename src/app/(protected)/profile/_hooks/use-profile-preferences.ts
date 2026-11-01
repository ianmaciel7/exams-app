import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";
import { readProfile } from "../_lib/data";
import type { ProfileValues } from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/locale-sync";

type PreferencesState = {
  error: string | null;
  isError: boolean;
  uid: string;
  values: ProfileValues | null;
};

export function useProfilePreferences(
  uid: string,
  activeLocale: Locale,
  setTheme: (theme: ThemePreference) => void,
) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const savedValuesRef = useRef<ProfileValues | null>(null);

  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const current = preferences?.uid === uid ? preferences : null;
  const defaultValues = current?.values ?? null;
  const preferencesReady = current !== null;

  useEffect(() => {
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
