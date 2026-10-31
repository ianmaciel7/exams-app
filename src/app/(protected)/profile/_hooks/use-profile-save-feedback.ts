import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/lib/toast";
import type {
  ProfileFormValues,
  ProfileValues,
  SavedProfile,
} from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/locale-sync";

type UseProfileSaveFeedbackOptions = {
  activeLocale: string;
  savedValuesRef: { current: ProfileValues | null };
  setAvatarVersion: (version: number) => void;
  setPhotoURL: (photoURL: string | null) => void;
  setTheme: (theme: ProfileValues["theme"]) => void;
};

export function useProfileSaveFeedback({
  activeLocale,
  savedValuesRef,
  setAvatarVersion,
  setPhotoURL,
  setTheme,
}: UseProfileSaveFeedbackOptions) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const onSaved = (
    savedProfile: SavedProfile,
    values: ProfileFormValues,
    previous: ProfileValues,
  ) => {
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
  };
  return { onSaved };
}
