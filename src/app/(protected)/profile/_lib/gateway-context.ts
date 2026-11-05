import { createContext } from "react";
import type { ProfileGateway } from "./definitions";

/** The profile persistence port, provided by `ProfileGatewayProviderClient`. */
const ProfileGatewayContext = createContext<ProfileGateway | null>(null);

export { ProfileGatewayContext };
