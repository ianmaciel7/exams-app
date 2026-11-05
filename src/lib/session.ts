import { onAuthStateChanged, type Unsubscribe, type User } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";

let pendingSignOut: Promise<void> | null = null;

/** Keep observers behind the shared sign-out persistence barrier. */
export function getPendingSignOut() {
  return pendingSignOut;
}

/** Register sign-out persistence and release its barrier on either outcome. */
export function setPendingSignOut(pending: Promise<void> | null) {
  pendingSignOut = pending;
  if (!pending) return;
  const clear = () => {
    if (pendingSignOut === pending) pendingSignOut = null;
  };
  void pending.then(clear, clear);
}

/**
 * Observe the active session. Throws if Firebase is misconfigured. The SDK
 * marks the observer's error and completed callbacks as deprecated and never
 * calls them, so failures surface only through the thrown error.
 *
 * Sign-out is held back until it has persisted, so a rapid navigation cannot
 * restore stale auth. A newer event supersedes a held one.
 */
export function subscribeToSession(
  onChange: (user: User | null) => void,
): Unsubscribe {
  let revision = 0;
  let active = true;
  const unsubscribe = onAuthStateChanged(getFirebaseUI().get().auth, (user) => {
    const current = ++revision;
    const pending = user ? null : getPendingSignOut();
    if (!pending) return onChange(user);

    const finish = () => {
      if (active && revision === current) onChange(user);
    };
    void pending.then(finish, finish);
  });
  return () => {
    active = false;
    unsubscribe();
  };
}

/** Return the signed-in user, or null when there is no session. */
export function getSessionUser(): User | null {
  return getFirebaseUI().get().auth.currentUser;
}

/** Synchronize the browser user after a server-side profile mutation. */
export async function reloadSessionUser(): Promise<void> {
  const user = getSessionUser();
  if (!user) throw new Error("Authentication session unavailable");
  await user.reload();
}

/** Return the active user, requiring it to match the expected uid. */
export function getActiveUser(expectedUser: User): User {
  const currentUser = getSessionUser();
  if (!currentUser || currentUser.uid !== expectedUser.uid) {
    throw new Error("Authentication session unavailable");
  }
  return currentUser;
}
