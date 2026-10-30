import { useEffect } from "react";
import { getFirebaseConfig } from "@/lib/firebase/config";
import { subscribeToSession } from "@/lib/session";

/** Registers the Firebase worker that forwards refreshed ID tokens to SSR requests. */
export function useFirebaseAuthSessionBridgeClient() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const config = {
      firebase: getFirebaseConfig(),
      authEmulatorHost:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim() ||
        undefined,
    };
    const session = { uid: undefined as string | null | undefined };
    const postSession = (worker: ServiceWorker | null) => {
      if (worker && session.uid !== undefined) {
        worker.postMessage({ type: "firebase-auth-session", uid: session.uid });
      }
    };
    const postConfig = (worker: ServiceWorker | null) => {
      worker?.postMessage({ type: "firebase-config", config });
      postSession(worker);
    };

    void navigator.serviceWorker
      .register("/firebase-auth-sw.js", { scope: "/", type: "module" })
      .then((registration) => {
        postConfig(registration.active);
        postConfig(registration.waiting);
        postConfig(registration.installing);
      })
      .catch((error: unknown) => {
        // Session SSR enhancement must not disable the client Firebase flow.
        console.error("Firebase session worker registration failed", error);
      });

    const unsubscribe = (() => {
      try {
        return subscribeToSession((user) => {
          session.uid = user?.uid ?? null;
          postSession(navigator.serviceWorker.controller);
        });
      } catch (error) {
        // Missing Firebase configuration is reported by the auth provider.
        // The optional server-session bridge must not crash the app.
        console.error("Firebase session worker subscription failed", error);
        return () => {};
      }
    })();
    const onControllerChange = () =>
      postConfig(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () => {
      unsubscribe();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);
}
