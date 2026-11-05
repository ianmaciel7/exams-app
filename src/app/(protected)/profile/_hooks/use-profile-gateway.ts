import { useContext } from "react";
import { ProfileGatewayContext } from "../_lib/gateway-context";

/** Read the injected profile persistence port. */
export function useProfileGateway() {
  const gateway = useContext(ProfileGatewayContext);
  if (!gateway) {
    throw new Error("useProfileGateway requires ProfileGatewayProviderClient");
  }
  return gateway;
}
