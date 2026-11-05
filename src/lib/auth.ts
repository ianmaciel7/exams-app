import { signOut, verifyBeforeUpdateEmail } from "firebase/auth";
import { getFirebaseUI } from "@/lib/firebase/client";
import { trackEvent } from "@/lib/firebase/usage";
import {
  getActiveUser,
  getPendingSignOut,
  getSessionUser,
  setPendingSignOut,
} from "@/lib/session";

/** Record authenticated usage before sending email-change verification. */
export async function sendEmailChangeVerification(
  email: string,
): Promise<void> {
  const user = getSessionUser();
  if (!user) throw new Error("Authentication session unavailable");
  await trackEvent({ type: "function_use", name: "profile.update" });
  await verifyBeforeUpdateEmail(getActiveUser(user), email);
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
  const pendingSignOut = getPendingSignOut();
  if (pendingSignOut) return pendingSignOut;

  const pending = Promise.all([
    signOut(getFirebaseUI().get().auth).then(synchronizeSignedOutWorker),
    clearSessionCookie(),
  ]).then(() => undefined);

  setPendingSignOut(pending);
  return pending;
}
