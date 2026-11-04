import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { recordUsage } from "@/lib/firebase/usage";

export function useAuthGateClient() {
  const t = useTranslations("Auth");
  const app = useTranslations("App");
  const { replaceWithSignIn } = useNavigation();
  const session = useSession();
  const isUnauthenticated =
    !session.isLoading && !session.isError && !session.user;

  useEffect(() => {
    if (!isUnauthenticated) return;
    replaceWithSignIn(window.location.pathname + window.location.search);
  }, [isUnauthenticated, replaceWithSignIn]);

  // Fire-and-forget: telemetry never gates or fails a protected page. Keyed by
  // uid so an account switch records its own first view.
  const pathname = usePathname();
  const uid = session.user?.uid;
  useEffect(() => {
    if (!uid) return;
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [pathname, uid]);

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
