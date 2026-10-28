import "server-only";
import { getLocale } from "next-intl/server";
import type { ComponentProps } from "react";

async function IntlDocumentServer({
  className,
  children,
}: Pick<ComponentProps<"html">, "className" | "children">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={className} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

export { IntlDocumentServer };
