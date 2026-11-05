import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { recordUsage } from "@/lib/firebase/usage";

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
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [pathname, uid]);
}
