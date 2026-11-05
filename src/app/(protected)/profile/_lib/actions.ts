"use client";

import type { User } from "firebase/auth";
import { withUsageGuard } from "@/lib/firebase/usage";
import { saveProfile } from "./data";
import type {
  ProfileActionState,
  ProfileValues,
  SavedProfile,
} from "./definitions";
import { parseProfileFormData } from "./dto";

type ProfileActionOptions = {
  /** Both are set once the form is shown; the Action only runs from the form. */
  user: User | null;
  /** Loaded values the form shows until the first submission. */
  loaded: ProfileValues | null;
  /** Message shown when saving fails. */
  errorMessage: string;
  /** Called after a successful save, for toast, theme and locale updates. */
  onSaved: (
    savedProfile: SavedProfile,
    values: ProfileValues,
    previous: ProfileValues,
  ) => void;
};

/** State before any submission: the loaded values are also the saved ones. */
export function initialProfileActionState(
  loaded: ProfileValues,
): ProfileActionState {
  return {
    saved: loaded,
    values: loaded,
    avatarFile: null,
    error: null,
    savedCount: 0,
  };
}

/**
 * The profile form Action, in the `(prevState, formData)` shape that
 * `useActionState` expects. It is a client function on purpose: every write
 * goes through the browser Firebase SDK (see CODING_STANDARDS "Form and Field
 * Architecture"), so there is no Server Function to call.
 */
export function createProfileAction({
  user,
  loaded,
  errorMessage,
  onSaved,
}: ProfileActionOptions) {
  return async function submitProfile(
    previous: ProfileActionState | null,
    formData: FormData,
  ): Promise<ProfileActionState> {
    if (!user || !loaded) throw new Error("Profile form submitted before load");
    const state = previous ?? initialProfileActionState(loaded);
    const { avatarFile, ...values } = parseProfileFormData(
      formData,
      state.values,
      state.avatarFile,
    );

    try {
      const savedProfile = await withUsageGuard(
        { type: "function_use", name: "profile.update" },
        () => saveProfile({ user, previous: state.saved, values, avatarFile }),
      );
      onSaved(savedProfile, values, state.saved);
      return {
        saved: savedProfile.values,
        values: savedProfile.values,
        avatarFile: null,
        error: null,
        savedCount: state.savedCount + 1,
      };
    } catch (cause) {
      console.error(cause);
      return { ...state, values, avatarFile, error: errorMessage };
    }
  };
}
