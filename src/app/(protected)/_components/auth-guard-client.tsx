"use client";

import type { PropsWithChildren } from "react";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { useAuthGuardClient } from "../_hooks/use-auth-guard-client";
import { AuthGuard, AuthGuardError } from "./auth-guard";

type AuthGuardClientProps = PropsWithChildren;

/**
 * Presentation boundary for protected routes, not authorization: it owns the
 * session subscription and the sign-in redirect for its subtree. The uid key
 * remounts that subtree, so no state survives an account switch.
 */
function AuthGuardClient({ children }: AuthGuardClientProps) {
  const { errorMessage, isError, onRetry, retryLabel, user } =
    useAuthGuardClient();

  if (isError)
    return (
      <AuthGuard>
        <AuthGuardError
          message={errorMessage}
          onRetry={onRetry}
          retryLabel={retryLabel}
        />
      </AuthGuard>
    );

  if (!user) return <LoadingStatus />;

  return <AuthGuard key={user.uid}>{children}</AuthGuard>;
}

export { AuthGuardClient };
