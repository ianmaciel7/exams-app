import { useLocale } from "next-intl";
import { use } from "react";
import { useFirebaseUiReturnNavigation } from "@/hooks/use-firebase-ui-return-navigation";
import { useFirebaseUiTranslations } from "@/hooks/use-firebase-ui-translations";
import { loadFirebaseUi } from "@/lib/dynamic";

/** Suspends until the Firebase UI store is ready, then wires its behaviors. */
export function usePublicUiProviderClient() {
  const ui = use(loadFirebaseUi());
  useFirebaseUiReturnNavigation(ui);
  useFirebaseUiTranslations(ui, useLocale());
  return ui;
}
