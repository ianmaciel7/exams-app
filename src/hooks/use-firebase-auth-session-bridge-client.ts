import { useEffect } from "react";
import { getFirebaseConfig } from "@/lib/firebase/config";

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
    const postConfig = (worker: ServiceWorker | null) => {
      worker?.postMessage({ type: "firebase-config", config });
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

    const onControllerChange = () =>
      postConfig(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
  }, []);
}
