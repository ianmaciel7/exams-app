"use client";

import type { PropsWithChildren } from "react";
import { useFirebaseAuthSessionBridgeClient } from "@/hooks/use-firebase-auth-session-bridge-client";

function FirebaseAuthSessionBridgeClient({ children }: PropsWithChildren) {
  useFirebaseAuthSessionBridgeClient();
  return children;
}

export { FirebaseAuthSessionBridgeClient };
