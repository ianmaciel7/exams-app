import { useContext } from "react";
import { ProfileContext } from "../_lib/profile-context";

export function useProfileContext() {
  const profile = useContext(ProfileContext);
  if (!profile) throw new Error("Profile components require ProfileContext");
  return profile;
}
