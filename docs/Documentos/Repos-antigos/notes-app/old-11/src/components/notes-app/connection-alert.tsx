"use client";

import { WifiOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConnectionAlert } from "@/hooks/use-connection-alert";
import { cn } from "@/lib/utils";

type ConnectionAlertProps = Omit<ComponentProps<typeof Alert>, "children">;

function ConnectionAlert({ className, ...props }: ConnectionAlertProps) {
  const t = useTranslations("connection");
  const { visible, reconnecting, handleReconnect } = useConnectionAlert();

  if (!visible) {
    return null;
  }

  return (
    <Alert
      data-slot="connection-alert"
      {...props}
      variant="destructive"
      aria-live="assertive"
      aria-atomic="true"
      className={cn("fixed inset-x-4 top-3 sm:inset-x-6", className)}
    >
      <WifiOffIcon aria-hidden="true" />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>{t("description")}</AlertDescription>
      <AlertAction>
        <Button
          size="sm"
          variant="outline"
          disabled={reconnecting}
          onClick={handleReconnect}
        >
          {reconnecting ? <Spinner data-icon="inline-start" /> : null}
          {reconnecting ? t("retrying") : t("retry")}
        </Button>
      </AlertAction>
    </Alert>
  );
}

export { ConnectionAlert, type ConnectionAlertProps };
