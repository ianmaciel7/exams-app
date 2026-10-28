import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { localeCookie } from "@/i18n/routing";
import { toast } from "@/lib/toast";
import type {
  ProfileFormValues,
  ProfileValues,
  SavedProfile,
} from "../_lib/definitions";

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
    if (values.locale !== activeLocale) {
      // biome-ignore lint/suspicious/noDocumentCookie: Preserve cookie-only locale selection on browsers without Cookie Store API.
      document.cookie = `${localeCookie}=${values.locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    }
  };
  return { onSaved };
}
