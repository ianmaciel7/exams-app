import { use, useEffect, useRef, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";
import type { ProfileValues } from "../_lib/definitions";
import { forgetProfile, loadProfile } from "../_lib/profile-resource";

export function useProfilePreferences(
  uid: string,
  activeLocale: Locale,
  setTheme: (theme: ThemePreference) => void,
) {
  const { refresh } = useNavigation();
  // State pins the read once mounted; until then the shared cache keeps the
  // promise stable across suspended render attempts.
  const [profile] = useState(() =>
    loadProfile({ uid, activeLocale, refresh, setTheme }),
  );
  const defaultValues = use(profile);
  const savedValuesRef = useRef<ProfileValues | null>(defaultValues);

  useEffect(() => {
    forgetProfile(uid, activeLocale);
  }, [uid, activeLocale]);

  return { defaultValues, savedValuesRef };
}
