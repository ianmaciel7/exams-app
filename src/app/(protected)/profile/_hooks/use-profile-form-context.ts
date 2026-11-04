import { useContext } from "react";
import { ProfileFormContext } from "../_lib/profile-form-context";

export function useProfileFormContext() {
  const context = useContext(ProfileFormContext);
  if (!context) {
    throw new Error("Profile fields require ProfileFormClient");
  }
  return context;
}
