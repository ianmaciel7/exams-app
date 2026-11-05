"use client";

import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { usePublicUiProviderClient } from "../_hooks/use-public-ui-provider-client";

type PublicUiProviderClientProps = PropsWithChildren;

function PublicUiProviderClient({ children }: PublicUiProviderClientProps) {
  const { ui, isError, t } = usePublicUiProviderClient();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("configurationError")}</AlertDescription>
      </Alert>
    );
  }

  if (!ui) return <LoadingStatus />;

  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}

export { PublicUiProviderClient };
