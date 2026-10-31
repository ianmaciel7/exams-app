import "server-only";
import type * as React from "react";
import { getNonce } from "@/lib/headers";
import { ThemeProviderClient } from "./theme-provider-client";

/** Gives the next-themes pre-hydration script the request CSP nonce. */
async function ThemeProviderServer(
  props: Omit<React.ComponentProps<typeof ThemeProviderClient>, "nonce">,
) {
  const nonce = await getNonce();

  return <ThemeProviderClient {...props} nonce={nonce} />;
}

export { ThemeProviderServer };
