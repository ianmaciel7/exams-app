import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useActionState, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { profileFieldNames } from "../_lib/form-data";
import { useProfileAction } from "./use-profile-action";
import { useProfilePreferences } from "./use-profile-preferences";

export function useProfileFormClient() {
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { setTheme } = useTheme();
  const { user } = useSession();
  if (!user) throw new Error("Protected components require AuthGuardClient");

  const { defaultValues, savedValuesRef } = useProfilePreferences(
    user.uid,
    activeLocale,
    setTheme,
  );
  const { submitProfile } = useProfileAction({
    activeLocale,
    savedValuesRef,
    setTheme,
    user,
  });
  const [submission, dispatch] = useActionState(submitProfile, {
    values: defaultValues,
    avatarFile: null,
    error: null,
    savedCount: 0,
  });
  // A file picked since the last Action result; the result then owns the
  // pending upload (kept after a failed save, cleared after a saved one).
  const [pick, setPick] = useState<{
    file: File;
    after: typeof submission;
  } | null>(null);
  const pickedAvatar = pick?.after === submission ? pick.file : null;

  function formAction(formData: FormData) {
    // The picked file is added here rather than read from the file input, which
    // the browser clears when React resets the form after an Action.
    if (pickedAvatar) formData.set(profileFieldNames.avatar, pickedAvatar);
    dispatch(formData);
  }

  return {
    formAction,
    submission,
    avatar: {
      file: pickedAvatar ?? submission.avatarFile,
      pick: (file: File) => setPick({ file, after: submission }),
    },
  };
}
