import { createContext } from "react";
import type { useSession } from "../_hooks/use-session";

const SessionContext = createContext<ReturnType<typeof useSession> | null>(
  null,
);

export { SessionContext };
