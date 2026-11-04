import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Full-viewport pending state for `loading.tsx`, Suspense fallbacks and client
 * guards. Every use renders at the same fixed position, pinned to the small
 * viewport so mobile browser chrome does not shift it, so swapping one for
 * another does not move the spinner.
 */
function LoadingScreen({ className, ...props }: ComponentProps<"div">) {
  const t = useTranslations("App");
  return (
    <div
      {...props}
      data-slot="loading-screen"
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-svh items-center justify-center gap-2 bg-background p-6 text-sm text-muted-foreground",
        className,
      )}
    >
      <Spinner
        role="presentation"
        aria-hidden="true"
        aria-label={undefined}
        className="shrink-0 motion-reduce:animate-none"
      />
      <span>{t("loading")}</span>
    </div>
  );
}

export { LoadingScreen };
