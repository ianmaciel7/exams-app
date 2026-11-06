import { useMemo } from "react";
import { getSignInUrl, useRouter } from "@/lib/navigation";

/**
 * The single client-side navigation entry point. Owned modules use this hook
 * instead of `useRouter`; Biome `noRestrictedImports` enforces it.
 */
export function useNavigation() {
  const router = useRouter();
  // Effects depend on these callbacks, so their identity must not rely on
  // Compiler memoization.
  return useMemo(() => {
    return {
      push: (href: string) => router.push(href),
      replace: (href: string) => router.replace(href),
      refresh: () => router.refresh(),
      back: () => router.back(),
      /** Replace the current entry with sign-in, returning to `destination`. */
      replaceWithSignIn: (destination?: string) =>
        router.replace(getSignInUrl(destination)),
    };
  }, [router]);
}
