import { useTranslations } from "next-intl";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { LoadingOverlay } from "@/components/ui/extensions/loading-overlay";

/**
 * Stays mounted in the root layout while route, auth, and profile loading
 * boundaries replace each other. CSS only reveals it when loading is pending.
 */
function GlobalLoadingIndicator() {
  const t = useTranslations("App");

  return (
    <div data-slot="global-loading-indicator">
      <LoadingOverlay>
        <LabeledSpinner>{t("loading")}</LabeledSpinner>
      </LoadingOverlay>
    </div>
  );
}

export { GlobalLoadingIndicator };
