"use client";

import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { usePublicGuardClient } from "../_hooks/use-public-guard-client";

type PublicGuardClientProps = PropsWithChildren;

function PublicGuardClient({ children }: PublicGuardClientProps) {
  const state = usePublicGuardClient();
  const { t } = state;

  if (state.isError)
    return (
      <p
        role="alert"
        className="text-center text-sm font-medium text-destructive"
      >
        {t("configurationError")}
      </p>
    );
  if (state.isLoading) return <LoadingStatus />;
  if (!state.ui) return null;
  return <FirebaseUIProvider ui={state.ui}>{children}</FirebaseUIProvider>;
}

export { PublicGuardClient };
