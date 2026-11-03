import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { withUsageGuard } from "@/lib/firebase/usage";
import { toast } from "@/lib/toast";
import { saveProfile } from "../_lib/data";
import type {
  ProfileFormValues,
  ProfileValues,
  SavedProfile,
} from "../_lib/definitions";
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
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  function onSaved(
    savedProfile: SavedProfile,
    values: ProfileFormValues,
    previous: ProfileValues,
  ) {
    setPhotoURL(savedProfile.photoURL);
    if (savedProfile.avatarChanged) setAvatarVersion(Date.now());
    if (values.theme !== previous.theme) setTheme(values.theme);
    savedValuesRef.current = savedProfile.values;
    toast.add({
      title: savedProfile.emailChanged
        ? t("emailVerificationSent")
        : t("profileSaved"),
      type: "success",
    });
    syncSavedLocale(savedProfile.values.locale, activeLocale, router.refresh);
  }

  const onSubmit = async (
    values: ProfileFormValues,
  ): Promise<ProfileValues | undefined> => {
    setSaveError(null);
    const previous = savedValuesRef.current;
    if (!previous) return;

    try {
      const savedProfile: SavedProfile = await withUsageGuard(
        { type: "function_use", name: "profile.update" },
        () =>
          saveProfile({
            user,
            previous,
            values,
            avatarFile: values.avatarFile,
          }),
      );
      onSaved(savedProfile, values, previous);
      return savedProfile.values;
    } catch (cause) {
      console.error(cause);
      setSaveError(t("profileSaveError"));
      return undefined;
    }
  };

  return { onSubmit, saveError };
}
