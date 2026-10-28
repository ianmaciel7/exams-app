"use client";

import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { useAuthProviderClient } from "@/hooks/use-auth-provider-client";

type AuthProviderClientProps = PropsWithChildren;

function AuthProviderClient({ children }: AuthProviderClientProps) {
  const state = useAuthProviderClient();
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
  if (state.isLoading)
    return (
      <LabeledSpinner className="w-full text-sm text-muted-foreground">
        {t("loading")}
      </LabeledSpinner>
    );
  if (!state.ui) return null;
  return <FirebaseUIProvider ui={state.ui}>{children}</FirebaseUIProvider>;
}

export { AuthProviderClient };
