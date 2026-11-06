import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { type AuthRoute, getSignInUrl, routes } from "@/lib/navigation";
import { getAuthNavigationUrl } from "@/lib/return-url";

/**
 * The single client-side navigation entry point. Owned modules use this hook
 * instead of `useRouter`; Biome `noRestrictedImports` enforces it.
 */
export function useNavigation() {
  const router = useRouter();
  // Effects depend on these callbacks, so their identity must not rely on
  // Compiler memoization.
  return useMemo(() => {
    const goToAuth = (path: AuthRoute) =>
      router.push(getAuthNavigationUrl(path, window.location.search));
    return {
      push: (href: string) => router.push(href),
      replace: (href: string) => router.replace(href),
      refresh: () => router.refresh(),
      back: () => router.back(),
      goToSignIn: () => goToAuth(routes.signIn),
      goToRegister: () => goToAuth(routes.register),
      goToForgotPassword: () => goToAuth(routes.forgotPassword),
      /** Replace the current entry with sign-in, returning to `destination`. */
      replaceWithSignIn: (destination?: string) =>
        router.replace(getSignInUrl(destination)),
    };
  }, [router]);
}
