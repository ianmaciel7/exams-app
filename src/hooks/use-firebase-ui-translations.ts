import { useEffect } from "react";
import type { getFirebaseUI } from "@/lib/firebase/client";
import { parseLocale } from "@/lib/locale";

export function useFirebaseUiTranslations(
  ui: ReturnType<typeof getFirebaseUI> | undefined,
  locale: string,
) {
  useEffect(() => {
    if (ui) ui.get().setLocale(parseLocale(locale));
  }, [ui, locale]);
}
