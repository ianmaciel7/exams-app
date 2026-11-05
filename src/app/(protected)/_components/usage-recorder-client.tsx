"use client";

import type { ComponentProps } from "react";
import { useUsageRecorderClient } from "../_hooks/use-usage-recorder-client";

type UsageRecorderClientProps = ComponentProps<"div">;

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function UsageRecorderClient(_props: UsageRecorderClientProps) {
  useUsageRecorderClient();
  return null;
}

export { UsageRecorderClient };
