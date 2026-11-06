"use client";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { usePublicUiProviderClient } from "../_hooks/use-public-ui-provider-client";

type PublicUiProviderClientProps = PropsWithChildren;
function PublicUiProviderClient({ children }: PublicUiProviderClientProps) {
  const ui = usePublicUiProviderClient();
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}

export { PublicUiProviderClient };
