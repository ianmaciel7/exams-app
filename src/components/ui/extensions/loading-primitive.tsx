import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { cn } from "@/lib/utils";

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
    <LabeledSpinner
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background p-6",
        className,
      )}
      {...props}
    >
      {children ?? t("loading")}
    </LabeledSpinner>
  );
}

export { LoadingPrimitive };
