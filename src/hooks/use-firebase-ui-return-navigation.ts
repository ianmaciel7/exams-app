import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { syncSessionCookie } from "@/lib/auth";
import type { getFirebaseUI } from "@/lib/firebase/client";
import { getSafeReturnUrl } from "@/lib/return-url";
import { subscribeToSession } from "@/lib/session";

export function useFirebaseUiReturnNavigation(
  ui: ReturnType<typeof getFirebaseUI> | undefined,
) {
  const { replace } = useNavigation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ui) return;
    let active = true;
    const destination = () =>
      getSafeReturnUrl(new URLSearchParams(window.location.search).get("next"));
    const syncThenReplace = async (
      user: Parameters<typeof syncSessionCookie>[0],
    ) => {
      await syncSessionCookie(user);
      if (active) replace(destination());
    };
    const unsubscribe = subscribeToSession((user) => {
      if (!active) return;
      if (!user) {
        setReady(true);
        return;
      }
      setReady(false);
      // The server verifies the session cookie, so it must exist before the
      // protected route loads; otherwise the server redirects back to sign-in.
      void syncThenReplace(user);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [ui, replace]);

  return { ready };
}
