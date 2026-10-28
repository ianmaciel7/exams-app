import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { getFirebaseUI } from "@/lib/firebase/client";
import { getSafeReturnUrl } from "@/lib/return-url";
import { subscribeToSession } from "@/lib/session";

export function useFirebaseUiReturnNavigation(
  ui: ReturnType<typeof getFirebaseUI> | undefined,
) {
  const router = useRouter();
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
      router.replace(destination);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [ui, router]);

  return { ready };
}
