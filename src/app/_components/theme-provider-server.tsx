import "server-only";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { getNonce } from "@/lib/headers";

/** Gives the next-themes pre-hydration script the request CSP nonce. */
async function ThemeProviderServer({
  children,
  ...props
}: Omit<React.ComponentProps<typeof NextThemesProvider>, "nonce">) {
  const nonce = await getNonce();

  return (
    <NextThemesProvider {...props} nonce={nonce}>
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProviderServer };
