import "server-only";
import { CSPProvider } from "@base-ui/react/csp-provider";
import type * as React from "react";
import { getNonce } from "@/lib/csp-nonce";

/** Gives Base UI inline <style> and <script> tags the request CSP nonce. */
async function CspProviderServer({
  children,
  ...props
}: Omit<React.ComponentProps<typeof CSPProvider>, "nonce">) {
  const nonce = await getNonce();

  return (
    <CSPProvider {...props} nonce={nonce}>
      {children}
    </CSPProvider>
  );
}

export { CspProviderServer };
