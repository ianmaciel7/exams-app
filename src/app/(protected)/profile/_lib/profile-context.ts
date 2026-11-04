import { createContext } from "react";
import type { useProfile } from "../_hooks/use-profile";

const ProfileContext = createContext<ReturnType<typeof useProfile> | null>(
  null,
);

export { ProfileContext };
