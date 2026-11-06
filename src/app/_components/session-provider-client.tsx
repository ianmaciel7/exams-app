"use client";

import type { PropsWithChildren } from "react";
import { useSessionProviderClient } from "@/hooks/use-session-provider-client";
import { SessionContext } from "@/lib/session-context";

type SessionProviderClientProps = PropsWithChildren;

/** Owns the single Firebase Auth subscription; descendants call `useSession`. */
function SessionProviderClient({ children }: SessionProviderClientProps) {
  const session = useSessionProviderClient();
  return <SessionContext value={session}>{children}</SessionContext>;
}

export { SessionProviderClient };
