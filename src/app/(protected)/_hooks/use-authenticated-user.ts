import { useContext } from "react";
import { AuthenticatedUserContext } from "../_lib/authenticated-user";

export function useAuthenticatedUser() {
  const user = useContext(AuthenticatedUserContext);
  if (!user) throw new Error("Protected components require AuthGateClient");
  return user;
}
