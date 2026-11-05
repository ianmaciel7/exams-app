"use client";

import type { PropsWithChildren } from "react";
import type { ProfileGateway } from "../_lib/definitions";
import { firebaseProfileGateway } from "../_lib/gateway";
import { ProfileGatewayContext } from "../_lib/gateway-context";

type ProfileGatewayProviderClientProps = PropsWithChildren<{
  gateway?: ProfileGateway;
}>;

/**
 * The composition root of the profile route: the only UI module that knows the
 * Firebase adapter. Tests pass `gateway` to inject a fake.
 */
function ProfileGatewayProviderClient({
  children,
  gateway = firebaseProfileGateway,
}: ProfileGatewayProviderClientProps) {
  return (
    <ProfileGatewayContext value={gateway}>{children}</ProfileGatewayContext>
  );
}

export { ProfileGatewayProviderClient };
