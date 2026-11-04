import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { recordUsage } from "@/lib/firebase/usage";

function useRedirectWhenUnauthenticated(isUnauthenticated: boolean) {
  const { replaceWithSignIn } = useNavigation();

  useEffect(() => {
    if (!isUnauthenticated) return;
    replaceWithSignIn(window.location.pathname + window.location.search);
  }, [isUnauthenticated, replaceWithSignIn]);
}

// Fire-and-forget: telemetry never gates or fails a protected page. Keyed by
// uid so an account switch records its own first view.
function usePageUsageRecording(uid: string | undefined) {
  const pathname = usePathname();

  useEffect(() => {
    if (!uid) return;
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  }, [pathname, uid]);
}

export function useAuthGuardClient() {
  const t = useTranslations("Auth");
  const app = useTranslations("App");
  const session = useSession();
  const isUnauthenticated =
    !session.isLoading && !session.isError && !session.user;
  useRedirectWhenUnauthenticated(isUnauthenticated);
  usePageUsageRecording(session.user?.uid);

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
