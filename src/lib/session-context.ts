import { createContext } from "react";
import type { Session } from "@/lib/watch-session";

/** The one client session, provided by `SessionProviderClient` in the root layout. */
const SessionContext = createContext<Session | null>(null);

export { SessionContext };
