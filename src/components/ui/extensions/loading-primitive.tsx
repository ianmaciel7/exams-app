import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { LoadingOverlay } from "@/components/ui/extensions/loading-overlay";

type LoadingPrimitiveProps = ComponentProps<typeof LabeledSpinner>;

/**
 * Shared page-level loading state. It is pinned to the viewport so every
 * route `loading.tsx` and client guard paints the indicator at the same spot,
 * regardless of the parent layout's `<main>`, padding, or alignment.
 */
function LoadingPrimitive({
  className,
  children,
  ...props
}: LoadingPrimitiveProps) {
  const t = useTranslations("App");
  return (
    <div data-slot="loading-state">
      <LoadingOverlay>
        <LabeledSpinner className={className} {...props}>
          {children ?? t("loading")}
        </LabeledSpinner>
      </LoadingOverlay>
    </div>
  );
}

export { LoadingPrimitive };
