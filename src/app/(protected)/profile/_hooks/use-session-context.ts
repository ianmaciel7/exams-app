import { useContext } from "react";
import { SessionContext } from "../_lib/session";

export function useSessionContext() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("Profile components require SessionContext");
  return session;
}
