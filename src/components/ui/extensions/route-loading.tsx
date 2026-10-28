import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LabeledSpinner } from "@/components/ui/extensions/labeled-spinner";
import { cn } from "@/lib/utils";

type RouteLoadingProps = ComponentProps<typeof LabeledSpinner>;

function RouteLoading({ className, label, ...props }: RouteLoadingProps) {
  const t = useTranslations("App");
  return (
    <LabeledSpinner
      label={label ?? t("loading")}
      className={cn("flex w-full p-6", className)}
      {...props}
    />
  );
}

export { RouteLoading };
