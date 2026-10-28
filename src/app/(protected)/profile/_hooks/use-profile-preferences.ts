import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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

export function useProfilePreferences(
  uid: string | undefined,
  activeLocale: Locale,
  setTheme: (theme: ThemePreference) => void,
) {
  const t = useTranslations("Auth");
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
        if (!active || !result) return;
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
  }, [uid, activeLocale, setTheme, t]);

  return { current, defaultValues, preferencesReady, savedValuesRef };
}
