import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { recordUsage } from "@/lib/firebase/usage";
import { getSignInUrl } from "@/lib/navigation";
import { subscribeToProtectedAccess } from "../_lib/protected-access-subscription";

export function useProtectedGuardClient() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [error, setError] = useState<"configurationError" | null>(null);

  useEffect(() => {
    setError(null);
    try {
      return subscribeToProtectedAccess({
        onUnauthenticated: () => {
          setActiveUserId(null);
          const destination = window.location.pathname + window.location.search;
          router.replace(getSignInUrl(destination));
        },
        onAuthenticated: (userId) => {
          setActiveUserId(userId);
        },
        onError: (cause) => {
          console.error(cause);
          setActiveUserId(null);
          setError("configurationError");
        },
      });
    } catch (cause) {
      console.error(cause);
      setError("configurationError");
    }
  }, [router]);

  useEffect(() => {
    if (!activeUserId) return;
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [activeUserId, pathname]);

  return {
    errorMessage: error ? t(error) : "",
    isError: error !== null,
    isLoading: activeUserId === null && error === null,
    t,
  };
}
