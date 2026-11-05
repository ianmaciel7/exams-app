import { useLocale, useTranslations } from "next-intl";
import { useFirebaseUi } from "@/hooks/use-firebase-ui";
import { useFirebaseUiReturnNavigation } from "@/hooks/use-firebase-ui-return-navigation";
import { useFirebaseUiTranslations } from "@/hooks/use-firebase-ui-translations";

export function usePublicGuardClient() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { ui, isError } = useFirebaseUi();
  const { ready } = useFirebaseUiReturnNavigation(ui);
  useFirebaseUiTranslations(ui, locale);

  return { isError, isLoading: !isError && (!ui || !ready), t, ui };
}
