import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { use, useActionState, useEffect, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { profileFieldNames } from "../_lib/form-data";
import { createProfileAction } from "../_lib/profile-action";
import { forgetProfile, loadProfile } from "../_lib/profile-resource";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

/**
 * Coordinates the profile form: the suspended profile read, the form Action
 * (`useActionState`) and the avatar picked since the last Action result. It
 * also returns the `Auth` translator so the form renders its labels from it.
 */
export function useProfileForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { refresh } = useNavigation();
  const { user } = useSession();
  if (!user) throw new Error("Protected components require AuthGuardClient");

  // State pins the read once mounted; until then the shared cache keeps the
  // promise stable across suspended render attempts.
  const [profile] = useState(() =>
    loadProfile({ uid: user.uid, activeLocale, refresh, setTheme }),
  );
  const loaded = use(profile);
  useEffect(() => {
    forgetProfile(user.uid, activeLocale);
  }, [user.uid, activeLocale]);

  const { onSaved } = useProfileSaveFeedback({ activeLocale, setTheme });
  const [state, dispatch, pending] = useActionState(
    createProfileAction({ user, errorMessage: t("profileSaveError"), onSaved }),
    {
      saved: loaded,
      values: loaded,
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
