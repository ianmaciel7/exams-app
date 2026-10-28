import "server-only";

import type { PropsWithChildren } from "react";
import { requireProtectedAccess } from "../_lib/require-protected-access";
import { ProtectedGuardClient } from "./protected-guard-client";

type ProtectedSessionServerProps = PropsWithChildren;

async function ProtectedSessionServer({
  children,
}: ProtectedSessionServerProps) {
  await requireProtectedAccess();

  return <ProtectedGuardClient>{children}</ProtectedGuardClient>;
}

export { ProtectedSessionServer };
