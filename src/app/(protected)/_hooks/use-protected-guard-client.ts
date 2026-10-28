import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getSignInUrl } from "@/lib/navigation";
import { subscribeToProtectedAccess } from "../_lib/protected-access-subscription";

export function useProtectedGuardClient() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
  const [readyPath, setReadyPath] = useState<string | null>(null);
  const [error, setError] = useState<
    "configurationError" | "usageLogError" | null
  >(null);

  useEffect(() => {
    setError(null);
    try {
      return subscribeToProtectedAccess({
        pathname,
        onReset: () => {
          setError(null);
          setReadyPath(null);
        },
        onUnauthenticated: () => {
          const destination = window.location.pathname + window.location.search;
          router.replace(getSignInUrl(destination));
        },
        onReady: () => setReadyPath(pathname),
        onError: () => setError("usageLogError"),
      });
    } catch (cause) {
      console.error(cause);
      setError("configurationError");
    }
  }, [router, pathname]);

  return {
    errorMessage: error ? t(error) : "",
    isError: error !== null,
    isLoading: readyPath !== pathname,
    t,
  };
}
