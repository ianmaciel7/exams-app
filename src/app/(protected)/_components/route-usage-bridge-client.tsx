"use client";

import type { ComponentProps } from "react";
import { useRouteUsageBridgeClient } from "../_hooks/use-route-usage-bridge-client";

type RouteUsageBridgeClientProps = ComponentProps<"div">;

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function RouteUsageBridgeClient(_props: RouteUsageBridgeClientProps) {
  useRouteUsageBridgeClient();
  return null;
}

export { RouteUsageBridgeClient };
