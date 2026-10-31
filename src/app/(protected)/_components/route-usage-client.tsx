"use client";

import type { PropsWithChildren } from "react";
import { useRouteUsageClient } from "../_hooks/use-route-usage-client";

type RouteUsageClientProps = PropsWithChildren;

function RouteUsageClient({ children }: RouteUsageClientProps) {
  useRouteUsageClient();

  return children;
}

export { RouteUsageClient };
