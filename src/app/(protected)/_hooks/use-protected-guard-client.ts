import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { recordUsage } from "@/lib/firebase/usage";
import { getSignInUrl } from "@/lib/navigation";
import { subscribeToProtectedSession } from "../_lib/subscription";

export function useProtectedGuardClient() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fail = (cause: unknown) => {
      console.error(cause);
      setActiveUserId(null);
      setIsError(true);
    };

    try {
      return subscribeToProtectedSession({
        onUnauthenticated: () => {
          setActiveUserId(null);
          const destination = window.location.pathname + window.location.search;
          router.replace(getSignInUrl(destination));
        },
        onAuthenticated: (userId) => {
          setIsError(false);
          setActiveUserId(userId);
        },
        onError: fail,
      });
    } catch (cause) {
      fail(cause);
    }
  }, [router]);

  useEffect(() => {
    if (!activeUserId) return;
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [activeUserId, pathname]);

  return {
    errorMessage: t("configurationError"),
    isError,
    isLoading: activeUserId === null && !isError,
    loadingMessage: t("loading"),
  };
}
