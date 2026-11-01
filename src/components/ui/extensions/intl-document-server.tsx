import "server-only";
import { getLocale, getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { GlobalLoadingIndicator } from "./global-loading-indicator";

async function IntlDocumentServer({
  className,
  children,
}: Pick<ComponentProps<"html">, "className" | "children">) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("App")]);
  return (
    <html lang={locale} className={className} suppressHydrationWarning>
      {/* Base UI setup: a relative body lets dialog backdrops cover the iOS 26+
      Safari viewport, and the isolated root keeps portaled popups above page
      content without z-index conflicts. */}
      <body className="relative min-h-full flex flex-col">
        <GlobalLoadingIndicator label={t("loading")} />
        <div data-slot="app-root" className="isolate flex flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

export { IntlDocumentServer };
