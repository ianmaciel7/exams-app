import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type LoadingOverlayProps = ComponentProps<"div">;

/**
 * Anchor the indicator to the small viewport so changes to mobile browser
 * chrome do not move it. The backdrop still fills the entire viewport.
 */
function LoadingOverlay({
  children,
  className,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      data-slot="loading-overlay"
      className="fixed inset-0 z-50 bg-background"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex h-svh items-center justify-center p-6",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export { LoadingOverlay };
