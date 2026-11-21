import "@fontsource-variable/inter";

import "../src/app/globals.css";

import type { GlobalProvider } from "@ladle/react";
import type { CSSProperties } from "react";

import { ThemeProvider } from "../src/components/notes-app/theme-provider";

const ladleStyles = {
  "--font-sans":
    '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
} as CSSProperties;

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const theme = globalState.theme === "auto" ? "system" : globalState.theme;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={theme}
      disableTransitionOnChange
    >
      <div
        style={ladleStyles}
        className="min-h-svh bg-background text-foreground font-sans antialiased"
      >
        {children}
      </div>
    </ThemeProvider>
  );
};
