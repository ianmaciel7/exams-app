import { type AuthRoute, authRoutes, routes } from "@/lib/navigation";

const authPathPattern = new RegExp(`^(?:${authRoutes.join("|")})(?:/|$)`, "i");

/** Accept only application-relative destinations after authentication. */
export function getSafeReturnUrl(value: string | null | undefined): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    Array.from(value).some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  ) {
    return routes.home;
  }

  try {
    const url = new URL(value, "https://app.local");
    if (
      url.origin !== "https://app.local" ||
      authPathPattern.test(url.pathname)
    ) {
      return routes.home;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return routes.home;
  }
}

/** Preserve a validated destination when moving between authentication screens. */
export function getAuthNavigationUrl(
  pathname: AuthRoute,
  search: string,
): string {
  const destination = getSafeReturnUrl(new URLSearchParams(search).get("next"));
  return destination === routes.home
    ? pathname
    : `${pathname}?next=${encodeURIComponent(destination)}`;
}
