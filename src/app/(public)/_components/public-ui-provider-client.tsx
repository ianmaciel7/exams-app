"use client";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { PublicUiProvider } from "@/components/firebase/public-ui-provider";
import { usePublicUiProviderClient } from "../_hooks/use-public-ui-provider-client";

type PublicUiProviderClientProps = PropsWithChildren;
function PublicUiProviderClient({ children }: PublicUiProviderClientProps) {
  const { ui, isError, t } = usePublicUiProviderClient();
  return (
    <PublicUiProvider
      isError={isError}
      isLoading={!ui}
      errorMessage={t("configurationError")}
    >
      {ui ? <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider> : null}
    </PublicUiProvider>
  );
}

export { PublicUiProviderClient };
