"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/error-capture/capture";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    captureError(error, { source: "error-boundary" });
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background font-sans p-6">
      <main className="flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full">
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("title")}</AlertTitle>
          <AlertDescription>{t("description")}</AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button
            onClick={() => reset()}
            className="w-full flex-1"
            variant="default"
            data-testid="error-boundary-retry-btn"
          >
            <RefreshCw className="mr-2 size-4" />
            {t("retry")}
          </Button>

          <Button
            variant="outline"
            className="w-full flex-1"
            nativeButton={false}
            render={<Link href="/" />}
            data-testid="error-boundary-home-btn"
          >
            <ArrowLeft className="mr-2 size-4" />
            {t("backToHome")}
          </Button>
        </div>
      </main>
    </div>
  );
}
