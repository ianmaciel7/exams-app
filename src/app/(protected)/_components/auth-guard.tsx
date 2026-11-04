import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthGuardProps = ComponentProps<"main">;

function AuthGuard({ className, ...props }: AuthGuardProps) {
  return (
    <main
      className={cn(
        "flex min-h-svh flex-1 items-center justify-center p-6 md:p-10",
        className,
      )}
      {...props}
    />
  );
}

type AuthGuardErrorProps = ComponentProps<"div"> & {
  message: string;
  onRetry: () => void;
  retryLabel: string;
};

function AuthGuardError({
  className,
  message,
  onRetry,
  retryLabel,
  ...props
}: AuthGuardErrorProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-4 text-center", className)}
      {...props}
    >
      <p role="alert">{message}</p>
      <Button onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}

export { AuthGuard, AuthGuardError };
