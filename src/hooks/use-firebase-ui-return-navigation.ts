import { useEffect } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { signOutUser, syncSessionCookie } from "@/lib/auth";
import { type getFirebaseUI, subscribeToAuth } from "@/lib/firebase/client";
import { getSafeReturnUrl } from "@/lib/return-url";

export function useFirebaseUiReturnNavigation(
  ui: ReturnType<typeof getFirebaseUI> | undefined,
) {
  const { replace } = useNavigation();

  useEffect(() => {
    if (!ui) return;
    let active = true;
    const destination = () =>
      getSafeReturnUrl(new URLSearchParams(window.location.search).get("next"));
    const syncThenReplace = async (
      user: Parameters<typeof syncSessionCookie>[0],
    ) => {
      const synced = await syncSessionCookie(user);
      if (!active) return;
      if (synced) {
        replace(destination());
      } else {
        // Session cookie creation failed (for example a revoked session), so
        // clear the stale client credentials to break the redirect loop.
        await signOutUser();
      }
    };
    const unsubscribe = subscribeToAuth((user) => {
      if (!active || !user) return;
      // The server verifies the session cookie, so it must exist before the
      // protected route loads; otherwise the server redirects back to sign-in.
      void syncThenReplace(user);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [ui, replace]);
}
