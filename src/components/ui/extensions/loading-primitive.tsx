import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { cn } from "@/lib/utils";

type LoadingPrimitiveProps = ComponentProps<typeof LabeledSpinner>;

function LoadingPrimitive({
  className,
  children,
  ...props
}: LoadingPrimitiveProps) {
  const t = useTranslations("App");
  return (
    <LabeledSpinner className={cn("flex w-full p-6", className)} {...props}>
      {children ?? t("loading")}
    </LabeledSpinner>
  );
}

export { LoadingPrimitive };
