import { useContext } from "react";
import { ProfileSessionContext } from "../_lib/session";

export function useProfileSessionContext() {
  const session = useContext(ProfileSessionContext);
  if (!session?.defaultValues)
    throw new Error("Profile components require ProfileSessionContext");
  return { ...session, defaultValues: session.defaultValues };
}
