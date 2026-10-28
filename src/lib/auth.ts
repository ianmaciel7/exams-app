import { signOut } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";

// Keep the guest UI blocked until both Firebase and the server-auth bridge
// have observed sign-out, avoiding a stale token on the next navigation.
let pendingSignOut: Promise<void> | null = null;

export function getPendingSignOut() {
  return pendingSignOut;
}

async function synchronizeSignedOutWorker() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    !navigator.serviceWorker.controller
  ) {
    return;
  }

  const worker = navigator.serviceWorker.controller;
  const channel = new MessageChannel();
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            "Firebase auth service worker did not acknowledge sign-out",
          ),
        );
      }, 3000);
      channel.port1.onmessage = (event: MessageEvent) => {
        if (event.data?.type !== "firebase-auth-session-ack") return;
        clearTimeout(timeout);
        resolve();
      };
      try {
        worker.postMessage({ type: "firebase-auth-session", uid: null }, [
          channel.port2,
        ]);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  } finally {
    channel.port1.close();
    channel.port2.close();
  }
}

/** Sign out from the shared Auth instance and invalidate the SSR bridge. */
export function signOutUser() {
  if (pendingSignOut) return pendingSignOut;

  const pending = signOut(getFirebaseUI().get().auth).then(
    synchronizeSignedOutWorker,
  );
  pendingSignOut = pending;
  const clearPending = () => {
    if (pendingSignOut === pending) pendingSignOut = null;
  };
  void pending.then(clearPending, clearPending);
  return pending;
}
