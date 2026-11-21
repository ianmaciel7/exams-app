import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { withUsageGuard } from "@/lib/firebase/usage";
import { toast } from "@/lib/toast";
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
  user: User | null;
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
    const previous = savedValuesRef.current;
    if (!user || !previous) return;

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
      toast.add({
        title: t("profileSaveError"),
        type: "error",
      });
      return undefined;
    }
  };

  return { onSubmit };
}
