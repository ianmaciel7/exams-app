"use client";

import { useRedirectError } from "@firebase-oss/ui-react";
import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type RedirectErrorAlertProps = ComponentProps<"div">;

function RedirectErrorAlert({ className, ...props }: RedirectErrorAlertProps) {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return (
    <Alert
      data-slot="redirect-error-alert"
      {...props}
      variant="destructive"
      className={cn(className)}
    >
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

export { RedirectErrorAlert, type RedirectErrorAlertProps };
