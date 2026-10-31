import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthGateProps = ComponentProps<"main">;

function AuthGate({ className, ...props }: AuthGateProps) {
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

type AuthGateErrorProps = ComponentProps<"div"> & {
  message: string;
  onRetry: () => void;
  retryLabel: string;
};

function AuthGateError({
  className,
  message,
  onRetry,
  retryLabel,
  ...props
}: AuthGateErrorProps) {
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

export { AuthGate, AuthGateError };
