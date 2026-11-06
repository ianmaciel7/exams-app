import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CspProviderServer } from "@/app/_components/csp-provider-server";
import { FirebaseAuthSessionBridgeClient } from "@/app/_components/firebase-auth-session-bridge-client";
import { IntlDocumentServer } from "@/app/_components/intl-document-server";
import { IntlProviderServer } from "@/app/_components/intl-provider-server";
import { SessionProviderClient } from "@/app/_components/session-provider-client";
import { ThemeProviderServer } from "@/app/_components/theme-provider-server";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
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
        <Suspense fallback={<LoadingStatus />}>
          <IntlProviderServer>
            <CspProviderServer>
              <FirebaseAuthSessionBridgeClient />
              <SessionProviderClient>
                <ThemeProviderServer
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <TooltipProvider>{children}</TooltipProvider>
                  <Toaster />
                </ThemeProviderServer>
              </SessionProviderClient>
            </CspProviderServer>
          </IntlProviderServer>
        </Suspense>
      </IntlDocumentServer>
    </Suspense>
  );
}
