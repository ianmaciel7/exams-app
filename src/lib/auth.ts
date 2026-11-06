import { signOut, verifyBeforeUpdateEmail } from "firebase/auth";
import {
  getActiveFirebaseAuthUser,
  getFirebaseAuthUser,
  getFirebaseUI,
} from "@/lib/firebase/client";
import { trackEvent } from "@/lib/firebase/usage";
import { getPendingSignOut, setPendingSignOut } from "@/lib/pending-sign-out";

export { getPendingSignOut } from "@/lib/pending-sign-out";

const sessionWrites = new Set<Promise<Response>>();
let sessionGeneration = 0;

/**
 * Create the server session cookie from a freshly refreshed ID token.
 * Resolves to false when the server rejects the token (for example a revoked
 * session), so callers can sign out instead of redirecting in a loop.
 */
export async function syncSessionCookie(user: {
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}): Promise<boolean> {
  if (typeof fetch !== "function") return false;
  if (getPendingSignOut()) return false;
  const generation = sessionGeneration;
  try {
    const idToken = await user.getIdToken(true);
    if (getPendingSignOut() || generation !== sessionGeneration) return false;
    const write = fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(15_000),
    });
    sessionWrites.add(write);
    try {
      return (await write).ok;
    } finally {
      sessionWrites.delete(write);
    }
  } catch {
    return false;
  }
}

async function clearSessionCookie() {
  // A late POST response must not recreate the cookie after DELETE completes.
  await Promise.allSettled([...sessionWrites]);
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
  sessionGeneration += 1;

  const pending = Promise.all([
    signOut(getFirebaseUI().get().auth).then(synchronizeSignedOutWorker),
    clearSessionCookie(),
  ]).then(() => undefined);

  setPendingSignOut(pending);
  const clearPending = () => {
    if (getPendingSignOut() === pending) setPendingSignOut(null);
  };
  void pending.then(clearPending, clearPending);
  return pending;
}

/** Send confirmation before changing the signed-in user's email address. */
export async function sendEmailChangeVerification(
  email: string,
): Promise<void> {
  const user = getFirebaseAuthUser();
  if (!user) throw new Error("Authentication session unavailable");
  await trackEvent({ type: "function_use", name: "profile.update" });
  return verifyBeforeUpdateEmail(getActiveFirebaseAuthUser(user), email);
}

/** Reload the signed-in user after a server-side profile update. */
export async function reloadFirebaseAuthUser(): Promise<void> {
  const user = getFirebaseAuthUser();
  if (!user) throw new Error("Authentication session unavailable");
  return user.reload();
}
