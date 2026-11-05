import type {
  ProfileAction,
  ProfileActionState,
  ProfileValues,
} from "../_lib/definitions";
import { getPickedAvatar } from "../_lib/utils";
import { useProfileSaveFeedback } from "./use-profile-save-feedback";

/** The Action state kept in the browser: the server state plus a pending avatar. */
export type ProfileClientState = ProfileActionState & {
  avatarFile: File | null;
};

/**
 * Wraps the injected Action: sends only serializable state to it, keeps the
 * avatar picked for a failed save, and runs the browser side effects.
 */
export function useProfileSubmit(action: ProfileAction) {
  const onSaved = useProfileSaveFeedback();

  return async (
    previous: ProfileClientState | null,
    formData: FormData,
  ): Promise<ProfileClientState> => {
    const serverPrevious = previous && {
      values: previous.values,
      photoURL: previous.photoURL,
      hasError: previous.hasError,
      savedCount: previous.savedCount,
    };
    const result = await action(serverPrevious, formData);
    if (result.hasError)
      return { ...result, avatarFile: getPickedAvatar(formData) };
    onSaved(result);
    return { ...result, avatarFile: null };
  };
}
