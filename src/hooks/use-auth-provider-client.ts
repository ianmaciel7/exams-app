import { useLocale, useTranslations } from "next-intl";
import { useFirebaseUi } from "./use-firebase-ui";
import { useFirebaseUiReturnNavigation } from "./use-firebase-ui-return-navigation";
import { useFirebaseUiTranslations } from "./use-firebase-ui-translations";

export function useAuthProviderClient() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { ui, isError } = useFirebaseUi();
  const { ready } = useFirebaseUiReturnNavigation(ui);
  useFirebaseUiTranslations(ui, locale);

  return { isError, isLoading: !isError && (!ui || !ready), t, ui };
}
