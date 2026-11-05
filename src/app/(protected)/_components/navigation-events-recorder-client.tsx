"use client";

import { useNavigationEventsRecorderClient } from "../_hooks/use-navigation-events-recorder-client";

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function NavigationEventsRecorderClient() {
  useNavigationEventsRecorderClient();
  return null;
}

export { NavigationEventsRecorderClient };
