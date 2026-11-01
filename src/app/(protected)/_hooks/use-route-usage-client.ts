import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordUsage } from "@/lib/firebase/usage";

/** Fire-and-forget: telemetry never gates or fails a protected page. */
export function useRouteUsageClient() {
  const pathname = usePathname();

  useEffect(() => {
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [pathname]);
}
