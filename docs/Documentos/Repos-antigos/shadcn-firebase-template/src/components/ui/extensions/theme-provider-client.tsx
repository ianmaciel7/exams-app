"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

function ThemeProviderClient({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { ThemeProviderClient };
