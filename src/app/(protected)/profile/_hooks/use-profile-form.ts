import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {
  type ProfileAction,
  type ProfileSnapshot,
  profileFieldNames,
} from "../_lib/definitions";
import { useProfileAvatarDraft } from "./use-profile-avatar-draft";
import { useProfilePreferencesSync } from "./use-profile-preferences-sync";
import {
  type ProfileClientState,
  useProfileSubmit,
} from "./use-profile-submit";

/**
 * The profile form's UI state: the injected Action through `useActionState`
 * and the avatar picked since the last Action result. The Action itself comes
 * in as a prop, so this hook knows nothing about where the data is stored.
 */
export function useProfileForm(
  action: ProfileAction,
  snapshot: ProfileSnapshot,
) {
  const t = useTranslations("Auth");
  useProfilePreferencesSync(snapshot.values);
  const initial: ProfileClientState = {
    ...snapshot,
    hasError: false,
    savedCount: 0,
    avatarFile: null,
  };
  const [state, dispatch, pending] = useActionState(
    useProfileSubmit(action),
    initial,
  );
  const { avatarFile, pickAvatar } = useProfileAvatarDraft({
    actionState: state,
    actionAvatar: state.avatarFile,
  });

  const formAction = (formData: FormData) => {
    // The pending file (picked now, or kept from a failed save) is added here
    // rather than read from the file input, which the browser clears when
    // React resets the form after an Action.
    if (avatarFile) formData.set(profileFieldNames.avatar, avatarFile);
    dispatch(formData);
  };

  return { t, state, pending, formAction, avatarFile, pickAvatar };
}
