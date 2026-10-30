import "server-only";

import type { PropsWithChildren } from "react";
import { verifySession } from "../_lib/dal";

type AuthGateServerProps = PropsWithChildren;

async function AuthGateServer({ children }: AuthGateServerProps) {
  await verifySession();
  return children ?? null;
}

export { AuthGateServer };
