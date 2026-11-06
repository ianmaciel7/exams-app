import { getTranslation } from "@firebase-oss/ui-core";
import { useSignInWithProvider, useUI } from "@firebase-oss/ui-react";
import { useMemo } from "react";
import { createGoogleAuthProvider } from "@/lib/firebase/multi-factor";

export function useGoogleSignInButtonClient() {
  const ui = useUI();
  // The provider is a subscription dependency in the Firebase UI hook.
  // Preserve its identity across renders, including non-Compiler test builds.
  const provider = useMemo(() => createGoogleAuthProvider(), []);
  const { error, callback } = useSignInWithProvider(provider);

  return {
    onSignIn: callback,
    error,
    isPending: ui.state !== "idle",
    label: getTranslation(ui, "labels", "signInWithGoogle"),
    providerId: provider.providerId,
  };
}
