"use client";

import type { ComponentProps } from "react";
import { useNavigationEventsRecorderClient } from "../_hooks/use-navigation-events-recorder-client";

type NavigationEventsRecorderClientProps = ComponentProps<"div">;

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function NavigationEventsRecorderClient(
  _props: NavigationEventsRecorderClientProps,
) {
  useNavigationEventsRecorderClient();
  return null;
}

export { NavigationEventsRecorderClient };
