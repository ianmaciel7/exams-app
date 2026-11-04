import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getSignInUrl } from "@/lib/navigation";

export function useAuthGateClient() {
  const t = useTranslations("Auth");
  const app = useTranslations("App");
  const router = useRouter();
  const session = useAuthSession();
  const isUnauthenticated =
    !session.isLoading && !session.isError && !session.user;

  useEffect(() => {
    if (!isUnauthenticated) return;
    const destination = window.location.pathname + window.location.search;
    router.replace(getSignInUrl(destination));
  }, [isUnauthenticated, router]);

  return {
    errorMessage: t("configurationError"),
    isError: session.isError,
    loadingMessage: t("loading"),
    // Reloading re-creates the Firebase app, which re-subscribing would not.
    onRetry: () => window.location.reload(),
    retryLabel: app("tryAgain"),
    user: session.user,
  };
}
