import type { User } from "firebase/auth";
import { createContext } from "react";

/** A settled session with no user is a signed-out visitor, never a failure. */
export type Session =
  | { isError: false; isLoading: true; user: null }
  | { isError: false; isLoading: false; user: User | null }
  | { isError: true; isLoading: false; user: null };

/** The one client session, provided by `SessionProviderClient` in the root layout. */
const SessionContext = createContext<Session | null>(null);

export { SessionContext };
