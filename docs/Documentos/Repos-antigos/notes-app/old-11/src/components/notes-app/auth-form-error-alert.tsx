"use client";

import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type AuthFormErrorAlertProps = Omit<
  ComponentProps<typeof Alert>,
  "children"
> & {
  message?: string;
};

function AuthFormErrorAlert({
  message,
  className,
  ...props
}: AuthFormErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert
      data-slot="auth-form-error-alert"
      {...props}
      variant="destructive"
      className={cn(className)}
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export { AuthFormErrorAlert, type AuthFormErrorAlertProps };
