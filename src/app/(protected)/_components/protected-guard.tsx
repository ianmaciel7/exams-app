import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProtectedGuardProps = ComponentProps<"main">;

function ProtectedGuard({ className, ...props }: ProtectedGuardProps) {
  return (
    <main
      data-slot="protected-guard"
      className={cn(
        "flex min-h-svh flex-1 items-center justify-center p-6 md:p-10",
        className,
      )}
      {...props}
    />
  );
}

type ProtectedGuardErrorProps = ComponentProps<"div"> & {
  message: string;
  onRetry: () => void;
  retryLabel: string;
};

function ProtectedGuardError({
  className,
  message,
  onRetry,
  retryLabel,
  ...props
}: ProtectedGuardErrorProps) {
  return (
    <div
      data-slot="protected-guard-error"
      className={cn("flex flex-col items-center gap-4 text-center", className)}
      {...props}
    >
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}

export { ProtectedGuard, ProtectedGuardError };
