import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type * as React from "react";

async function IntlProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextIntlClientProvider>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} {...props}>
      {children}
    </NextIntlClientProvider>
  );
}

export { IntlProvider };
