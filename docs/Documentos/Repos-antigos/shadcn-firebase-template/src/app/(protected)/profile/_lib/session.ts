import { createContext } from "react";
import type { useProfileSession } from "../_hooks/use-profile-session";

const ProfileSessionContext = createContext<ReturnType<
  typeof useProfileSession
> | null>(null);

export { ProfileSessionContext };
