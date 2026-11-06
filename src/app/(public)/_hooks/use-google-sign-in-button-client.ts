import { getTranslation } from "@firebase-oss/ui-core";
import { useSignInWithProvider, useUI } from "@firebase-oss/ui-react";
import { useMemo } from "react";
import { createGoogleAuthProvider } from "@/lib/firebase/multi-factor";

export function useGoogleSignInButtonClient() {
  const ui = useUI();
  const provider = useMemo(() => createGoogleAuthProvider(), []);
  const { error, callback } = useSignInWithProvider(provider);

  return {
    callback,
    error,
    isPending: ui.state !== "idle",
    label: getTranslation(ui, "labels", "signInWithGoogle"),
    providerId: provider.providerId,
  };
}
