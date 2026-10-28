import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, routing } from "./routing";

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const store = await cookies();
  const cookieLocale = store.get(localeCookie)?.value;
  const requested = explicitLocale ?? cookieLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
