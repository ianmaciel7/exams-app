"use client";

import type { PropsWithChildren } from "react";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import { useProtectedGuardClient } from "../_hooks/use-protected-guard-client";

type ProtectedGuardClientProps = PropsWithChildren;

function ProtectedGuardClient({ children }: ProtectedGuardClientProps) {
  const state = useProtectedGuardClient();
  const { t } = state;

  if (state.isError) {
    return (
      <main className="flex min-h-svh flex-1 items-center justify-center p-6 md:p-10">
        <p role="alert">{state.errorMessage}</p>
      </main>
    );
  }

  if (state.isLoading)
    return <LoadingPrimitive>{t("loading")}</LoadingPrimitive>;

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center p-6 md:p-10">
      {children}
    </main>
  );
}

export { ProtectedGuardClient };
