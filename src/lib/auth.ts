import { signOut } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";

/** Sign the current user out of Firebase Authentication. */
export function signOutUser() {
  return signOut(getFirebaseUI().get().auth);
}
