import type { GlobalProvider } from "@ladle/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProviderClient } from "@/components/ui/extensions/theme-provider-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import messages from "@/messages/en.json";
import "./ladle.css";

// Mirrors the provider stack in src/app/layout.tsx. Ladle's own theme switch
// drives next-themes so the `.dark` class matches what the application uses.
export const Provider: GlobalProvider = ({ children, globalState }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <ThemeProviderClient
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={globalState.theme === "auto" ? undefined : globalState.theme}
    >
      <TooltipProvider>
        <div className="bg-background p-4 font-sans text-foreground">
          {children}
        </div>
      </TooltipProvider>
    </ThemeProviderClient>
  </NextIntlClientProvider>
);
