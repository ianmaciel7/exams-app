import { signOut } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";

// The Auth observer may emit null before signOut has finished persisting it.
// The home screen must not expose guest navigation during that interval.
let pendingSignOut: Promise<void> | null = null;

export function getPendingSignOut() {
  return pendingSignOut;
}

/** Sign out of the shared Auth instance; retain a completion barrier for UI. */
export function signOutUser() {
  if (pendingSignOut) return pendingSignOut;

  const pending = signOut(getFirebaseUI().get().auth);
  pendingSignOut = pending;
  const clearPending = () => {
    if (pendingSignOut === pending) pendingSignOut = null;
  };
  void pending.then(clearPending, clearPending);
  return pending;
}
