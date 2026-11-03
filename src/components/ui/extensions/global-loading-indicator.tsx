import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";

type GlobalLoadingIndicatorProps = ComponentProps<"div"> & {
  label: string;
};

/**
 * The only visible loading UI in the app. The root document mounts it once,
 * and `globals.css` reveals it while any `LoadingState` marker is rendered,
 * so route, auth, and profile boundaries can replace each other without the
 * spinner remounting or moving. It is pinned to the small viewport so mobile
 * browser chrome does not shift it.
 */
function GlobalLoadingIndicator({
  label,
  ...props
}: GlobalLoadingIndicatorProps) {
  return (
    <div {...props} data-slot="global-loading-indicator">
      <div
        data-slot="loading-overlay"
        className="fixed inset-0 z-50 bg-background"
      >
        <div className="absolute inset-x-0 top-0 flex h-svh items-center justify-center p-6">
          <span
            data-slot="labeled-spinner"
            role="status"
            aria-live="polite"
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Spinner
              role="presentation"
              aria-hidden="true"
              aria-label={undefined}
              className="shrink-0 motion-reduce:animate-none"
            />
            <span>{label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export { GlobalLoadingIndicator };
