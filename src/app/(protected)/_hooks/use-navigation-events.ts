import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { trackEvent } from "@/lib/firebase/usage";
import { usePathname } from "@/lib/navigation";

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
export function useNavigationEvents() {
  const pathname = usePathname();
  const session = useSession();
  const uid = session.user?.uid;

  useEffect(() => {
    if (!uid) return;
    void trackEvent({ type: "screen_view", name: pathname }).catch(() => {});
  }, [pathname, uid]);
}
