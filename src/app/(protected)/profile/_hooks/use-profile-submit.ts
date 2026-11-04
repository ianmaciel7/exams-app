import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { withUsageGuard } from "@/lib/firebase/usage";
import { saveProfile } from "../_lib/data";
import type {
  ProfileFormValues,
  ProfileValues,
  SavedProfile,
} from "../_lib/definitions";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const { onSaved } = useProfileSaveFeedback({
    activeLocale,
    savedValuesRef,
    setAvatarVersion,
    setPhotoURL,
    setTheme,
  });

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
