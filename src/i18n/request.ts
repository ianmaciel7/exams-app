import { cookies, headers } from "next/headers";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, routing } from "./routing";

function getBrowserLocale(acceptLanguage: string | null) {
  const candidates = acceptLanguage
    ?.split(",")
    .map((item) => {
      const [tag, ...parameters] = item.trim().split(";");
      const quality = parameters.find((parameter) =>
        parameter.startsWith("q="),
      );
      return { quality: quality ? Number(quality.slice(2)) : 1, tag };
    })
    .filter(
      ({ quality, tag }) => Number.isFinite(quality) && quality > 0 && tag,
    )
    .sort((left, right) => right.quality - left.quality);

  for (const { tag } of candidates ?? []) {
    if (hasLocale(routing.locales, tag)) return tag;
    const language = tag.split("-")[0]?.toLowerCase();
    const match = routing.locales.find(
      (locale) =>
        locale.toLowerCase() === language ||
        locale.toLowerCase().startsWith(`${language}-`),
    );
    if (match) return match;
  }
}

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  const cookieLocale = store.get(localeCookie)?.value;
  const requested =
    explicitLocale ??
    cookieLocale ??
    getBrowserLocale(requestHeaders.get("accept-language"));
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
