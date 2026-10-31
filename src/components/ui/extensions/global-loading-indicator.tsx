import type { ComponentProps } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { LoadingOverlay } from "@/components/ui/extensions/loading-overlay";

/**
 * Stays mounted in the root layout while route, auth, and profile loading
 * boundaries replace each other. CSS only reveals it when loading is pending.
 */
type GlobalLoadingIndicatorProps = ComponentProps<"div"> & {
  label: string;
};

function GlobalLoadingIndicator({
  label,
  ...props
}: GlobalLoadingIndicatorProps) {

  return (
    <div {...props} data-slot="global-loading-indicator">
      <LoadingOverlay>
        <LabeledSpinner>{label}</LabeledSpinner>
      </LoadingOverlay>
    </div>
  );
}

export { GlobalLoadingIndicator };
