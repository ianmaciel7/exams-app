import { signOut } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";

// Keep the guest UI blocked until both Firebase and the server session cookie
// have observed sign-out, avoiding a stale session on the next navigation.
let pendingSignOut: Promise<void> | null = null;

export function getPendingSignOut() {
  return pendingSignOut;
}

export async function syncSessionCookie(user: {
  getIdToken: () => Promise<string>;
}) {
  if (typeof fetch !== "function") return;
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // Best-effort session cookie sync
  }
}

async function clearSessionCookie() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // Best-effort cookie clearing
  }
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
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      timeout = setTimeout(() => {
        reject(
          new Error(
            "Firebase auth service worker did not acknowledge sign-out",
          ),
        );
      }, 3000);
      channel.port1.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "firebase-auth-session-ack") resolve();
      };
      worker.postMessage({ type: "firebase-auth-session", uid: null }, [
        channel.port2,
      ]);
    });
  } finally {
    clearTimeout(timeout);
    channel.port1.close();
    channel.port2.close();
  }
}

/** Sign out from the shared Auth instance and invalidate the server session. */
export function signOutUser() {
  if (pendingSignOut) return pendingSignOut;

  const pending = Promise.all([
    signOut(getFirebaseUI().get().auth).then(synchronizeSignedOutWorker),
    clearSessionCookie(),
  ]).then(() => undefined);

  pendingSignOut = pending;
  const clearPending = () => {
    if (pendingSignOut === pending) pendingSignOut = null;
  };
  void pending.then(clearPending, clearPending);
  return pending;
}
