"use client";

import type { PropsWithChildren } from "react";
import { LoadingState } from "@/components/ui/extensions/loading-state";
import { useAuthGateClient } from "../_hooks/use-auth-gate-client";
import { AuthGate, AuthGateError } from "./auth-gate";

type AuthGateClientProps = PropsWithChildren;

/**
 * Presentation boundary for protected routes, not authorization: it owns the
 * session subscription and the sign-in redirect for its subtree. The uid key
 * remounts that subtree, so no state survives an account switch.
 */
function AuthGateClient({ children }: AuthGateClientProps) {
  const { errorMessage, isError, onRetry, retryLabel, user } =
    useAuthGateClient();

  if (isError)
    return (
      <AuthGate>
        <AuthGateError
          message={errorMessage}
          onRetry={onRetry}
          retryLabel={retryLabel}
        />
      </AuthGate>
    );

  if (!user) return <LoadingState boundary="protected-auth" />;

  return <AuthGate key={user.uid}>{children}</AuthGate>;
}

export { AuthGateClient };
