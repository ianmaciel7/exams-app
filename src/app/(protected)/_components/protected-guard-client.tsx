"use client";

import type { PropsWithChildren } from "react";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import { useProtectedGuardClient } from "../_hooks/use-protected-guard-client";

type ProtectedGuardClientProps = PropsWithChildren;

function ProtectedGuardClient({ children }: ProtectedGuardClientProps) {
  const { errorMessage, isError, isLoading, loadingMessage } =
    useProtectedGuardClient();

  if (isLoading) return <LoadingPrimitive>{loadingMessage}</LoadingPrimitive>;

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center p-6 md:p-10">
      {isError ? <p role="alert">{errorMessage}</p> : children}
    </main>
  );
}

export { ProtectedGuardClient };
