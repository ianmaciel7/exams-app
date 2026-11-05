import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useActionState } from "react";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import {
  createProfileAction,
  initialProfileActionState,
} from "../_lib/actions";
import { profileFieldNames } from "../_lib/definitions";
import { useProfileAvatarDraft } from "./use-profile-avatar-draft";
import { useProfileRead } from "./use-profile-read";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

/**
 * Coordinates the profile form: the browser read (`useProfileRead`), the form
 * Action (`useActionState`) and the avatar picked since the last Action
 * result. It reports `isLoading` until the read finishes, then returns the
 * form state and the `Auth` translator the fields render from.
 */
export function useProfileForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { user } = useSession();
  const profile = useProfileRead();
  const loaded = profile.isLoading ? null : profile.values;

  const { onSaved } = useProfileSaveFeedback({ activeLocale, setTheme });
  const [submitted, dispatch, pending] = useActionState(
    createProfileAction({
      user: user ?? null,
      loaded,
      errorMessage: t("profileSaveError"),
      onSaved,
    }),
    null,
  );
  const { avatarFile, pickedAvatar, pickAvatar } = useProfileAvatarDraft({
    actionState: submitted,
    actionAvatar: submitted?.avatarFile ?? null,
  });

  if (!loaded) return { isLoading: true } as const;

  const formAction = (formData: FormData) => {
    // The picked file is added here rather than read from the file input, which
    // the browser clears when React resets the form after an Action.
    if (pickedAvatar) formData.set(profileFieldNames.avatar, pickedAvatar);
    dispatch(formData);
  };

  return {
    isLoading: false,
    t,
    state: submitted ?? initialProfileActionState(loaded),
    pending,
    formAction,
    avatarFile,
    pickAvatar,
  } as const;
}
