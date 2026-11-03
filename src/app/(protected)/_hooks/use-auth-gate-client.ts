import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useNavigation } from "@/hooks/use-navigation";

export function useAuthGateClient() {
  const t = useTranslations("Auth");
  const app = useTranslations("App");
  const { replaceWithSignIn } = useNavigation();
  const session = useAuthSession();
  const isUnauthenticated =
    !session.isLoading && !session.isError && !session.user;

  useEffect(() => {
    if (!isUnauthenticated) return;
    replaceWithSignIn(window.location.pathname + window.location.search);
  }, [isUnauthenticated, replaceWithSignIn]);

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
