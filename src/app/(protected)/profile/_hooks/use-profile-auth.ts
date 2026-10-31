import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { subscribeToSession } from "@/lib/session";

type AuthState = {
  error: string | null;
  isLoading: boolean;
  user: User | null;
};

/**
 * Reads the Firebase session for the profile form. Redirecting a signed-out
 * visitor is owned by the (protected) guard, which keeps the return URL.
 */
export function useProfileAuth() {
  const t = useTranslations("Auth");
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
      }, onError);
    } catch (cause) {
      onError(cause instanceof Error ? cause : new Error(String(cause)));
    }
  }, [t]);

  return {
    authReady: !auth.isLoading,
    error: auth.error,
    photoURL,
    setPhotoURL,
    user: auth.user,
  };
}
