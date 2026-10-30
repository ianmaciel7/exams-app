import "server-only";

import type { PropsWithChildren } from "react";
import { verifySession } from "../_lib/dal";
import { ProtectedGuardClient } from "./protected-guard-client";

type ProtectedSessionServerProps = PropsWithChildren;

async function ProtectedSessionServer({
  children,
}: ProtectedSessionServerProps) {
  await verifySession();

  return <ProtectedGuardClient>{children}</ProtectedGuardClient>;
}

export { ProtectedSessionServer };
