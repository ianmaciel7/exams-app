"use server";

import { verifySession } from "@/lib/dal";
import { readOwnProfile, saveProfile } from "./data";
import type { ProfileActionState } from "./definitions";
import { parseProfileFormData } from "./dto";
import { isValidAvatarFile } from "./utils";

/**
 * The profile Server Action, in the `(prevState, formData)` shape
 * `useActionState` expects. It re-verifies the session itself (a Server
 * Function is a public endpoint) and reads the current profile from the
 * server, never from the client, so the user can only change their own data.
 */
export async function updateProfile(
  previous: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const { userId } = await verifySession();
  if (!userId) throw new Error("Authentication session unavailable");
  const current = await readOwnProfile();
  const { avatarFile, ...values } = parseProfileFormData(
    formData,
    current.values,
  );
  const failed = {
    values,
    photoURL: current.photoURL,
    hasError: true,
    savedCount: previous?.savedCount ?? 0,
  };
  if (avatarFile && !isValidAvatarFile(avatarFile)) return failed;

  try {
    const saved = await saveProfile({
      uid: userId,
      previous: current,
      values,
      avatarFile,
    });
    return {
      values: saved.values,
      photoURL: saved.photoURL,
      hasError: false,
      savedCount: (previous?.savedCount ?? 0) + 1,
    };
  } catch (cause) {
    console.error(cause);
    return failed;
  }
}
