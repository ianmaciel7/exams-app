"use client";

import { useNavigationEvents } from "../_hooks/use-navigation-events";

/**
 * Fire-and-forget: screen-view telemetry records page visits for signed-in users.
 * Decoupled from authorization: it never gates or delays protected content.
 */
function NavigationEvents() {
  useNavigationEvents();
  return null;
}

export { NavigationEvents };
