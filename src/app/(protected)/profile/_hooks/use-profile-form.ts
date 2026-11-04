import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useActionState, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { type ProfileValues, profileFieldNames } from "../_lib/definitions";
import { createProfileAction } from "../_lib/profile-action";
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
  if (!user) throw new Error("Protected components require AuthGuardClient");

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
  // A file picked since the last Action result; the result then owns the
  // pending upload (kept after a failed save, cleared after a saved one).
  const [pick, setPick] = useState<{ file: File; after: typeof state } | null>(
    null,
  );
  const pickedAvatar = pick?.after === state ? pick.file : null;

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
    avatarFile: pickedAvatar ?? state.avatarFile,
    pickAvatar: (file: File) => setPick({ file, after: state }),
  };
}
