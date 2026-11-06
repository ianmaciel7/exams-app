import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Full-viewport pending state for `loading.tsx`, Suspense fallbacks and client
 * guards. Every use renders at the same fixed position, pinned to the small
 * viewport so mobile browser chrome does not shift it, so swapping one for
 * another does not move the spinner.
 */
function LoadingStatus({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const t = useTranslations("App");
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(props, {
      role: "status",
      "aria-live": "polite",
      className: cn(
        "fixed inset-x-0 top-0 z-50 flex h-svh items-center justify-center gap-2 bg-background p-6 text-sm text-muted-foreground",
        className,
      ),
      children: (
        <>
          <Spinner
            role="presentation"
            aria-hidden="true"
            aria-label={undefined}
            className="shrink-0 motion-reduce:animate-none"
          />
          <span>{t("loading")}</span>
        </>
      ),
    }),
    state: { slot: "loading-status" },
  });
}

export { LoadingStatus };
