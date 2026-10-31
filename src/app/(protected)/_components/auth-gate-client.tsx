"use client";

import type { PropsWithChildren } from "react";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import { useAuthGateClient } from "../_hooks/use-auth-gate-client";
import { AuthenticatedUserContext } from "../_lib/authenticated-user";
import { AuthGate, AuthGateError } from "./auth-gate";

type AuthGateClientProps = PropsWithChildren;

/**
 * Presentation boundary for protected routes, not authorization: it owns the
 * session subscription and the sign-in redirect for its subtree. The uid key
 * remounts that subtree, so no state survives an account switch.
 */
function AuthGateClient({ children }: AuthGateClientProps) {
  const { errorMessage, isError, loadingMessage, onRetry, retryLabel, user } =
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

  if (!user) return <LoadingPrimitive>{loadingMessage}</LoadingPrimitive>;

  return (
    <AuthGate>
      <AuthenticatedUserContext key={user.uid} value={user}>
        {children}
      </AuthenticatedUserContext>
    </AuthGate>
  );
}

export { AuthGateClient };
