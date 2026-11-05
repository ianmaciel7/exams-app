"use client";

import type { ComponentProps } from "react";
import { useRouteUsageReporterClient } from "../_hooks/use-route-usage-reporter-client";

type RouteUsageReporterClientProps = ComponentProps<"div">;

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function RouteUsageReporterClient(_props: RouteUsageReporterClientProps) {
  useRouteUsageReporterClient();
  return null;
}

export { RouteUsageReporterClient };
