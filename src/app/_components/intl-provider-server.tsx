import "server-only";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type * as React from "react";

async function IntlProviderServer({
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof NextIntlClientProvider>,
  "locale" | "messages"
>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider {...props} locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export { IntlProviderServer };
