"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpacesErrorStatusProps = ComponentProps<"div"> & {
  isOffline: boolean;
  onRetry: () => void;
};

function SpacesErrorStatus({
  isOffline,
  onRetry,
  className,
  ...props
}: SpacesErrorStatusProps) {
  const t = useTranslations("spaces");

  return (
    <Alert
      data-slot="spaces-error-status"
      {...props}
      data-testid="spaces-error-status"
      variant="destructive"
      role="alert"
      aria-live="assertive"
      className={cn("mx-auto w-full max-w-sm", className)}
    >
      <AlertCircle />
      <AlertTitle>{t("connectionError")}</AlertTitle>
      <AlertDescription>
        {t(isOffline ? "offlineDescription" : "databaseErrorDescription")}
      </AlertDescription>
      <AlertAction>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          data-testid="spaces-error-status-retry-btn"
        >
          <RefreshCw data-icon="inline-start" />
          {t("retryConnection")}
        </Button>
      </AlertAction>
    </Alert>
  );
}

export { SpacesErrorStatus, type SpacesErrorStatusProps };
