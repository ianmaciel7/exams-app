import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { loadAuth } from "@/lib/dynamic";

export function useSignOutButtonClient() {
  const t = useTranslations("Home");
  const auth = useTranslations("Auth");
  const navigation = useNavigation();
  const [isPending, startTransition] = useTransition();
  const [isError, setIsError] = useState(false);

  function handleSignOut() {
    setIsError(false);
    startTransition(async () => {
      try {
        const { signOutUser } = await loadAuth();
        await signOutUser();
        navigation.refresh();
      } catch {
        setIsError(true);
      }
    });
  }

  return {
    t,
    auth,
    isPending,
    isError,
    handleSignOut,
  };
}
