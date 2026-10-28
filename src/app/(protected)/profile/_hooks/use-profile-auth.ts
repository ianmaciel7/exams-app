import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/navigation";
import { subscribeToSession } from "@/lib/session";

type AuthState = {
  error: string | null;
  isLoading: boolean;
  user: User | null;
};

export function useProfileAuth() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    error: null,
    isLoading: true,
    user: null,
  });
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    function onError(cause: Error) {
      console.error(cause);
      setAuth({
        error: t("profileLoadError"),
        isLoading: false,
        user: null,
      });
    }

    try {
      return subscribeToSession((user) => {
        setAuth({ error: null, isLoading: false, user });
        setPhotoURL(user?.photoURL ?? null);
        if (!user) router.replace(routes.signIn);
      }, onError);
    } catch (cause) {
      onError(cause instanceof Error ? cause : new Error(String(cause)));
    }
  }, [router, t]);

  return {
    authReady: !auth.isLoading,
    error: auth.error,
    photoURL,
    setPhotoURL,
    user: auth.user,
  };
}
