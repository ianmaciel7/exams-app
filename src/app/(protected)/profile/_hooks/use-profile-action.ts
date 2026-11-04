import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { withUsageGuard } from "@/lib/firebase/usage";
import { saveProfile } from "../_lib/data";
import type {
  ProfileActionState,
  ProfileValues,
  SavedProfile,
} from "../_lib/definitions";
import { parseProfileFormData } from "../_lib/form-data";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

type UseProfileActionOptions = {
  activeLocale: string;
  savedValuesRef: { current: ProfileValues | null };
  setTheme: (theme: ProfileValues["theme"]) => void;
  user: User;
};

/**
 * The profile form Action, in the `(prevState, formData)` shape that
 * `useActionState` expects. It is a client function on purpose: every write
 * goes through the browser Firebase SDK (see CODING_STANDARDS "Form and Field
 * Architecture"), so there is no Server Function to call.
 */
export function useProfileAction({
  activeLocale,
  savedValuesRef,
  setTheme,
  user,
}: UseProfileActionOptions) {
  const t = useTranslations("Auth");
  const { onSaved } = useProfileSaveFeedback({
    activeLocale,
    savedValuesRef,
    setTheme,
  });

  async function submitProfile(
    state: ProfileActionState,
    formData: FormData,
  ): Promise<ProfileActionState> {
    const previous = savedValuesRef.current;
    if (!previous) return state;

    const { avatarFile, ...values } = parseProfileFormData(
      formData,
      state.values,
      state.avatarFile,
    );

    try {
      const savedProfile: SavedProfile = await withUsageGuard(
        { type: "function_use", name: "profile.update" },
        () => saveProfile({ user, previous, values, avatarFile }),
      );
      onSaved(savedProfile, values, previous);
      return {
        values: savedProfile.values,
        avatarFile: null,
        error: null,
        savedCount: state.savedCount + 1,
      };
    } catch (cause) {
      console.error(cause);
      return {
        ...state,
        values,
        avatarFile,
        error: t("profileSaveError"),
      };
    }
  }

  return { submitProfile };
}
