import { verifyBeforeUpdateEmail } from "firebase/auth";
import { trackEvent } from "@/lib/firebase/usage";
import { getSessionUser } from "@/lib/session";
import type { ProfileGateway } from "./definitions";

function requireUser() {
  const user = getSessionUser();
  if (!user) throw new Error("Authentication session unavailable");
  return user;
}

/** The browser Firebase adapter for `ProfileGateway`. */
export const firebaseProfileGateway: ProfileGateway = {
  changeEmail: async (email) => {
    await trackEvent({ type: "function_use", name: "profile.update" });
    return verifyBeforeUpdateEmail(requireUser(), email);
  },
  // The Server Action changed the stored user; reload the browser copy.
  refreshUser: () => requireUser().reload(),
};
