import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { withUsageGuard } from "@/lib/firebase/usage";
import { toast } from "@/lib/toast";
import { saveProfile } from "../_lib/data";
import type { ProfileFormValues, ProfileValues } from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/locale-sync";

type UseProfileSubmitOptions = {
  activeLocale: string;
  savedValuesRef: { current: ProfileValues | null };
  setAvatarVersion: (version: number) => void;
  setPhotoURL: (photoURL: string | null) => void;
  setTheme: (theme: ProfileValues["theme"]) => void;
  user: User;
};

export function useProfileSubmit({
  activeLocale,
  savedValuesRef,
  setAvatarVersion,
  setPhotoURL,
  setTheme,
  user,
}: UseProfileSubmitOptions) {
  const t = useTranslations("Auth");
  const { refresh } = useNavigation();
  const [saveError, setSaveError] = useState<string | null>(null);

  async function onSubmit(values: ProfileFormValues): Promise<ProfileValues | undefined> {
    setSaveError(null);
    const previous = savedValuesRef.current;
    if (!previous) return;

    try {
      const saved = await withUsageGuard(
        { type: "function_use", name: "profile.update" },
        () =>
          saveProfile({
            user,
            previous,
            values,
            avatarFile: values.avatarFile,
          }),
      );

      setPhotoURL(saved.photoURL);
      if (saved.avatarChanged) setAvatarVersion(Date.now());
      if (values.theme !== previous.theme) setTheme(values.theme);
      savedValuesRef.current = saved.values;
      toast.add({
        title: saved.emailChanged
          ? t("emailVerificationSent")
          : t("profileSaved"),
        type: "success",
      });
      syncSavedLocale(saved.values.locale, activeLocale, refresh);
      return saved.values;
    } catch (cause) {
      console.error(cause);
      setSaveError(t("profileSaveError"));
      return undefined;
    }
  }

  return { onSubmit, saveError };
}
