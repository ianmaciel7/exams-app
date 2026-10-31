import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FirebaseAuthSessionBridgeClient } from "@/components/ui/extensions/firebase-auth-session-bridge-client";
import { IntlDocumentServer } from "@/components/ui/extensions/intl-document-server";
import { IntlProviderServer } from "@/components/ui/extensions/intl-provider-server";
import { ThemeProviderClient } from "@/components/ui/extensions/theme-provider-client";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontClassName = `${geist.variable} ${geistMono.variable} h-full antialiased`;
  return (
    <Suspense fallback={null}>
      <IntlDocumentServer className={fontClassName}>
        <Suspense
          fallback={
            <div
              data-slot="loading-state"
              data-loading-boundary="root-provider"
            />
          }
        >
          <IntlProviderServer>
            <FirebaseAuthSessionBridgeClient />
            <ThemeProviderClient
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </ThemeProviderClient>
          </IntlProviderServer>
        </Suspense>
      </IntlDocumentServer>
    </Suspense>
  );
}
