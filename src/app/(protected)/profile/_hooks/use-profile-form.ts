import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useActionState } from "react";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { createProfileAction } from "../_lib/actions";
import { type ProfileValues, profileFieldNames } from "../_lib/definitions";
import { useProfileAvatarDraft } from "./use-profile-avatar-draft";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

/**
 * Coordinates the loaded profile form: the form Action
 * (`useActionState`) and the avatar picked since the last Action result. It
 * also returns the `Auth` translator so the form renders its labels from it.
 */
export function useProfileForm(initialValues: ProfileValues) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { user } = useSession();
  if (!user) throw new Error("Protected components require active session");

  const { onSaved } = useProfileSaveFeedback({ activeLocale, setTheme });
  const [state, dispatch, pending] = useActionState(
    createProfileAction({ user, errorMessage: t("profileSaveError"), onSaved }),
    {
      saved: initialValues,
      values: initialValues,
      avatarFile: null,
      error: null,
      savedCount: 0,
    },
  );
  const { avatarFile, pickedAvatar, pickAvatar } = useProfileAvatarDraft({
    actionState: state,
    actionAvatar: state.avatarFile,
  });

  const formAction = (formData: FormData) => {
    // The picked file is added here rather than read from the file input, which
    // the browser clears when React resets the form after an Action.
    if (pickedAvatar) formData.set(profileFieldNames.avatar, pickedAvatar);
    dispatch(formData);
  };

  return {
    t,
    state,
    pending,
    formAction,
    avatarFile,
    pickAvatar,
  };
}
