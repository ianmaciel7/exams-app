import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";
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
    const unsubscribe = subscribeToSession((user) => {
      if (!active) return;
      if (!user) {
        setReady(true);
        return;
      }
      setReady(false);
      const destination = getSafeReturnUrl(
        new URLSearchParams(window.location.search).get("next"),
      );
      replace(destination);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [ui, replace]);

  return { ready };
}
