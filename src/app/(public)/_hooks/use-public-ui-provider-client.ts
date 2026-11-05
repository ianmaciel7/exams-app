import { useLocale, useTranslations } from "next-intl";
import { useFirebaseUi } from "@/hooks/use-firebase-ui";
import { useFirebaseUiReturnNavigation } from "@/hooks/use-firebase-ui-return-navigation";
import { useFirebaseUiTranslations } from "@/hooks/use-firebase-ui-translations";

export function usePublicUiProviderClient() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { ui, isError } = useFirebaseUi();
  useFirebaseUiReturnNavigation(ui);
  useFirebaseUiTranslations(ui, locale);

  return { isError, t, ui };
}
